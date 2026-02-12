import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { banheiroCloseSchema, BanheiroCloseForm } from "@/features/inspections/types/inspection-forms";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";

export default function BanheiroClose() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [ticketData, setTicketData] = useState<{ localizacao: string; problema: string } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const protocoloParam = searchParams.get("protocolo") || "";

    const form = useForm<BanheiroCloseForm>({
        resolver: zodResolver(banheiroCloseSchema),
        defaultValues: {
            protocolo: protocoloParam,
            funcionario: "",
            observacoes: "",
        },
    });

    useEffect(() => {
        async function fetchTicket() {
            if (!protocoloParam) {
                setIsLoading(false);
                setErrorMsg("Protocolo não informado.");
                return;
            }

            const { data, error } = await supabase
                .from("inspections_banheiro" as any)
                .select("localizacao, problema, status")
                .eq("protocolo", protocoloParam)
                .maybeSingle();

            setIsLoading(false);

            if (data) {
                const tObj = data as any;
                if (tObj.status === 'finalizado') {
                    setErrorMsg("Este chamado já foi finalizado.");
                } else {
                    setTicketData({ localizacao: tObj.localizacao, problema: tObj.problema });
                }
            }
        }

        fetchTicket();
    }, [protocoloParam]);

    const onSubmit = async (data: BanheiroCloseForm) => {
        setIsSubmitting(true);
        try {
            // 1. Call RPC
            const { data: rpcResponse, error: rpcError } = await supabase.rpc("close_banheiro_ticket" as any, {
                p_protocolo: data.protocolo,
                p_funcionario: data.funcionario,
                p_observacoes: data.observacoes
            });

            if (rpcError) throw rpcError;

            const rpcData = rpcResponse as any;

            if (rpcData && !rpcData.success) {
                throw new Error(rpcData.message || "Não foi possível finalizar.");
            }

            const closedLocation = rpcData?.localizacao || ticketData?.localizacao || "Local desconhecido";

            // 2. Send Webhook
            const gpMessage = `✅ *CHAMADO FINALIZADO (BANHEIRO)*
Protocolo: ${data.protocolo}
Finalizado por: ${data.funcionario}
Observações: ${data.observacoes || "-"}
Local: ${closedLocation}`;

            try {
                await fetch("https://n8n.imagoradiologia.cloud/webhook/banheiro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_type: "finalizar_banheiro",
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
                description: "O banheiro foi liberado com sucesso.",
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
            <PublicFormLayout title="Banheiros">
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
            </PublicFormLayout>
        );
    }

    if (errorMsg) {
        return (
            <PublicFormLayout title="Banheiros">
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
            <PublicFormLayout title="Banheiros">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Finalizado!</h2>
                    <p className="text-gray-600 mb-6">
                        Agradecemos seu empenho.
                    </p>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Finalizar Chamado" subtitle={`Banheiro - ${ticketData?.localizacao || protocoloParam}`}>
            <div className="p-6">
                {ticketData && (
                    <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-sm text-orange-800 font-medium">Chamado Aberto:</p>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-orange-900 font-bold text-lg">{ticketData.problema}</span>
                            <span className="text-xs bg-white px-2 py-1 rounded border border-orange-200 text-orange-600">{ticketData.localizacao}</span>
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
                                            <Input {...field} placeholder="Quem realizou a limpeza/reparo?" className="pl-10 h-12" />
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
                                            placeholder="Ex: Reposição de papel higiênico..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
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
