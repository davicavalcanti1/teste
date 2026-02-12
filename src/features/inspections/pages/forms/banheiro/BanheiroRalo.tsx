
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { banheiroOpenSchema } from "@/features/inspections/types/inspection-forms"; // Reusing schema if compatible or creating new partial
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Droplets } from "lucide-react";
import { z } from "zod";

// Dedicated schema since we don't need 'problema' selection
const raloSchema = z.object({
    localizacao: z.string().min(1, "Localização é obrigatória"),
    descricao: z.string().optional(),
});

type RaloFormValues = z.infer<typeof raloSchema>;

export default function BanheiroRalo() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const localizacaoParam = searchParams.get("localizacao") || "";

    const form = useForm<RaloFormValues>({
        resolver: zodResolver(raloSchema),
        defaultValues: {
            localizacao: localizacaoParam,
            descricao: "",
        },
    });

    useEffect(() => {
        if (localizacaoParam) {
            form.setValue("localizacao", localizacaoParam);
        }
    }, [localizacaoParam, form]);

    const onSubmit = async (data: RaloFormValues) => {
        setIsSubmitting(true);
        try {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomPart = Math.floor(1000 + Math.random() * 9000);
            const protocol = `RALO-${today}-${randomPart}`;

            // Save to Supabase (Banheiro Table)
            const { error } = await supabase.from("inspections_banheiro" as any).insert({
                protocolo: protocol,
                localizacao: data.localizacao,
                problema: "Limpeza de Ralo/Sifão", // Fixed type
                descricao: data.descricao || "Solicitação de limpeza de ralo/sifão.",
                status: "aberto"
            });

            if (error) throw error;

            // Webhook Logic
            const origin = window.location.origin;
            const linkFinalizar = `${origin}/formularios/banheiro/finalizar?protocolo=${protocol}`;

            const gpMessage = `🚿 *CHAMADO ABERTO (RALO/SIFÃO)*
Protocolo: ${protocol}
Local: ${data.localizacao}
Serviço: Limpeza de Ralo/Sifão
Obs: ${data.descricao || '-'}

Clique no link para finalizar o chamado:
${linkFinalizar}`;

            try {
                await fetch("https://n8n.imagoradiologia.cloud/webhook/banheiro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_type: "abrir_banheiro",
                        protocol: protocol,
                        gp_message: gpMessage
                    })
                });
            } catch (webhookErr) {
                console.error("Webhook failed", webhookErr);
            }

            setIsSuccess(true);
            toast({
                title: "Solicitação Enviada!",
                description: `Protocolo: ${protocol}`,
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao abrir chamado",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <PublicFormLayout title="Manutenção" subtitle="Limpeza de Ralo">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h2>
                    <p className="text-gray-600 mb-6">
                        A equipe de limpeza foi notificada.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Nova Solicitação
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Manutenção" subtitle="Limpeza de Ralo">
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 mb-4">
                            <Droplets className="h-6 w-6" />
                            <div>
                                <h3 className="font-semibold text-sm">Limpeza de Ralo/Sifão</h3>
                                <p className="text-xs opacity-90">Este formulário abre um chamado específico para limpeza.</p>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="localizacao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localização</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input {...field} readOnly={!!localizacaoParam} className={localizacaoParam ? "bg-gray-100" : ""} />
                                            {!localizacaoParam && <span className="text-xs text-muted-foreground absolute right-2 top-3">Manual</span>}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descricao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Alguma observação específica?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Solicitar Limpeza"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
