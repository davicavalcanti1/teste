import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { dispenserCloseSchema, DispenserCloseForm } from "@/features/inspections/types/inspection-forms";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";

export default function DispenserClose() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data loaded from protocol
    const [ticketData, setTicketData] = useState<{ localizacao: string; problema: string } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const protocoloParam = searchParams.get("protocolo") || "";

    const form = useForm<DispenserCloseForm>({
        resolver: zodResolver(dispenserCloseSchema),
        defaultValues: {
            protocolo: protocoloParam,
            funcionario: "",
            observacoes: "",
        },
    });

    // Fetch ticket details on load
    useEffect(() => {
        async function fetchTicket() {
            if (!protocoloParam) {
                setIsLoading(false);
                setErrorMsg("Protocolo não informado.");
                return;
            }

            // We use the strict View Policy or create a specific function if RLS blocks standard select.
            // Since we defined RLS "Public view by protocol" (or similar secure logic), let's try direct select first.
            // In our migration, we used a specific RPC for closing, but to VIEW we might need a workaround if RLS blocks public.
            // Let's assume for now we can read if we have the protocol, or just blindly close. 
            // Better UX: Show location.

            const { data, error } = await supabase
                .from("inspections_dispenser" as any)
                .select("localizacao, problema, status")
                .eq("protocolo", protocoloParam)
                .maybeSingle();

            setIsLoading(false);

            if (error) {
                console.error("Error fetching", error);
                // If RLS blocks, we might not get data. That's okay, we can still try to close blindly.
            }

            if (data) {
                // Cast data to any to access properties
                const tObj = data as any;
                if (tObj.status === 'finalizado') {
                    setErrorMsg("Este chamado já foi finalizado.");
                } else {
                    setTicketData({ localizacao: tObj.localizacao, problema: tObj.problema });
                }
            } else {
                // If no data found, it might be invalid protocol OR RLS hidden.
                // We'll let the user try to submit anyway, the RPC will validate.
            }
        }

        fetchTicket();
    }, [protocoloParam]);

    const onSubmit = async (data: DispenserCloseForm) => {
        setIsSubmitting(true);
        try {
            // 1. Call RPC to close securely
            // Cast rpc name to any
            const { data: rpcResponse, error: rpcError } = await supabase.rpc("close_dispenser_ticket" as any, {
                p_protocolo: data.protocolo,
                p_funcionario: data.funcionario,
                p_observacoes: data.observacoes
            });

            if (rpcError) throw rpcError;

            const rpcData = rpcResponse as any;

            // Check if RPC returned success
            if (rpcData && !rpcData.success) {
                throw new Error(rpcData.message || "Não foi possível finalizar.");
            }

            const closedLocation = rpcData?.localizacao || ticketData?.localizacao || "Local desconhecido";

            // 2. Send Webhook
            const gpMessage = `✅ *CHAMADO FINALIZADO (DISPENSER DE ÁLCOOL)*
Protocolo: ${data.protocolo}
Finalizado por: ${data.funcionario}
Observações: ${data.observacoes || "-"}
Local: ${closedLocation}`;

            try {
                await fetch("https://n8n.imagoradiologia.cloud/webhook/Tickets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_type: "finalizar",
                        protocol: data.protocolo,
                        gp_message: gpMessage
                    })
                });
            } catch (webhookErr) {
                console.error("Webhook failed", webhookErr);
            }

            setIsSuccess(true);
            toast({
                title: "Chamado Finalizado!",
                description: "O registro foi atualizado com sucesso.",
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao finalizar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <PublicFormLayout title="Dispenser" colorTheme="blue">
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </PublicFormLayout>
        );
    }

    if (errorMsg) {
        return (
            <PublicFormLayout title="Dispenser" colorTheme="blue">
                <div className="p-8 text-center flex flex-col items-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Atenção</h2>
                    <p className="text-gray-600">{errorMsg}</p>
                </div>
            </PublicFormLayout>
        );
    }

    if (isSuccess) {
        return (
            <PublicFormLayout title="Dispenser" colorTheme="blue">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Finalizado!</h2>
                    <p className="text-gray-600 mb-6">
                        Obrigado pela colaboração.
                    </p>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Finalizar Chamado" subtitle={`Dispenser - ${ticketData?.localizacao || protocoloParam}`} colorTheme="blue">
            <div className="p-6">
                {ticketData && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium">Chamado Aberto:</p>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-blue-900 font-bold text-lg">{ticketData.problema}</span>
                            <span className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-600">{ticketData.localizacao}</span>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="funcionario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seu Nome (Funcionário)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input {...field} placeholder="Quem está resolvendo?" className="pl-10 h-12" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>O que foi feito? (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Troquei o refil, limpeza realizada..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Finalizando...
                                    </>
                                ) : (
                                    "Concluir Atendimento"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
