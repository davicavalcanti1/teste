import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { banheiroOpenSchema, BanheiroOpenForm } from "@/features/inspections/types/inspection-forms";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
<<<<<<< HEAD
import { Switch } from "@/components/ui/switch";
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
import { Loader2, CheckCircle } from "lucide-react";

export default function BanheiroOpen() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const localizacaoParam = searchParams.get("localizacao") || "";

    const form = useForm<BanheiroOpenForm>({
        resolver: zodResolver(banheiroOpenSchema),
        defaultValues: {
            localizacao: localizacaoParam,
            problema: undefined,
            descricao: "",
<<<<<<< HEAD
            lixeira_cheia: false,
        },
    });

    const watchProblema = form.watch("problema");

=======
        },
    });

>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
    useEffect(() => {
        if (localizacaoParam) {
            form.setValue("localizacao", localizacaoParam);
        }
    }, [localizacaoParam, form]);

    const onSubmit = async (data: BanheiroOpenForm) => {
        setIsSubmitting(true);
        try {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomPart = Math.floor(1000 + Math.random() * 9000);
            const protocol = `WC-${today}-${randomPart}`;

<<<<<<< HEAD
            // Prepare Description based on selection
            let finalDescription = data.descricao || "";
            if (data.problema === 'faltando_insumo' && data.tipo_insumo) {
                const insumoLabels: Record<string, string> = {
                    sabonete: "Sabonete",
                    papel_higienico: "Papel Higiênico",
                    papel_toalha: "Papel Toalha"
                };
                finalDescription = `Repor: ${insumoLabels[data.tipo_insumo] || data.tipo_insumo}`;
            }

            // Append Trash Can status
            if (data.lixeira_cheia) {
                finalDescription = finalDescription
                    ? `${finalDescription} | Lixeiras Cheias`
                    : "Lixeiras Cheias";
            }

=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
            // Save to Supabase (Banheiro Table)
            const { error } = await supabase.from("inspections_banheiro" as any).insert({
                protocolo: protocol,
                localizacao: data.localizacao,
                problema: data.problema,
<<<<<<< HEAD
                descricao: finalDescription,
=======
                descricao: data.descricao,
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                status: "aberto"
            });

            if (error) throw error;

            // Webhook Logic
            const origin = window.location.origin;
            const linkFinalizar = `${origin}/formularios/banheiro/finalizar?protocolo=${protocol}`;

            const gpMessage = `🚻 *CHAMADO ABERTO (BANHEIRO)*
Protocolo: ${protocol}
Local: ${data.localizacao}
Problema: ${data.problema}
<<<<<<< HEAD
Descrição: ${finalDescription}
=======
Descrição: ${data.descricao}
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91

Clique no link para finalizar o chamado:
${linkFinalizar}`;

            try {
<<<<<<< HEAD
                // Change webhook URL for Banheiro //nunca mudar sem me consultar especificamente  
                await fetch("https://n8n.imagoradiologia.cloud/webhook/banheiro", { //nunca mudar sem me consultar especificamente 
=======
                // Change webhook URL for Banheiro
                await fetch("https://n8n.imagoradiologia.cloud/webhook/banheiro", {
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
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
                title: "Chamado Aberto!",
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
            <PublicFormLayout title="Banheiros" subtitle="Abrir Chamado">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chamado Aberto!</h2>
                    <p className="text-gray-600 mb-6">
                        A equipe foi notificada com sucesso.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Novo Chamado
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Banheiros" subtitle="Abrir Chamado">
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
<<<<<<< HEAD
                            name="lixeira_cheia"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Lixeiras Cheias?
                                        </FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            (Lixo comum, Lixo contaminado, Lixeiro de batas)
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                            name="problema"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qual é o problema?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Selecione o problema" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
<<<<<<< HEAD
                                            <SelectItem value="faltando_insumo">Faltando Insumo</SelectItem>
                                            <SelectItem value="sujo">Banheiro Sujo</SelectItem>
                                            <SelectItem value="quebrado">Tem algo quebrado?</SelectItem>
=======
                                            <SelectItem value="faltando_insumo">Faltando Papel/Sabonete</SelectItem>
                                            <SelectItem value="sujo">Banheiro Sujo</SelectItem>
                                            <SelectItem value="quebrado">Vaso/Pia Quebrada</SelectItem>
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                                            <SelectItem value="outro">Outro Problema</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

<<<<<<< HEAD
                        {/* Insumos Options - Show only if 'faltando_insumo' */}
                        {watchProblema === 'faltando_insumo' && (
                            <FormField
                                control={form.control}
                                name="tipo_insumo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>O que precisa repor?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder="Selecione o item" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sabonete">Sabonete</SelectItem>
                                                <SelectItem value="papel_higienico">Papel Higiênico</SelectItem>
                                                <SelectItem value="papel_toalha">Papel Toalha</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Description field - Show only if 'quebrado' or 'outro' */}
                        {(watchProblema === 'quebrado' || watchProblema === 'outro') && (
                            <FormField
                                control={form.control}
                                name="descricao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {watchProblema === 'quebrado' ? "O que está quebrado?" : "Descreva o problema"}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva com detalhes..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
=======
                        <FormField
                            control={form.control}
                            name="descricao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>O que precisa ser feito?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva com detalhes..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Abrir Chamado"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
