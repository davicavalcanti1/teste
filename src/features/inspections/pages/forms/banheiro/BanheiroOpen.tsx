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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
            lixeira_cheia: false,
            lixeira_comum: false,
            lixeira_contaminante: false,
            lixeira_batas: false,
        },
    });

    const watchProblema = form.watch("problema");
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

            // Append Trash Can status with Types
            if (data.lixeira_cheia) {
                const tiposLixeira = [];
                if (data.lixeira_comum) tiposLixeira.push("Comum");
                if (data.lixeira_contaminante) tiposLixeira.push("Contaminante");
                if (data.lixeira_batas) tiposLixeira.push("Batas");

                const lixeiraDesc = tiposLixeira.length > 0
                    ? `Lixeiras Cheias (${tiposLixeira.join(", ")})`
                    : "Lixeiras Cheias";

                finalDescription = finalDescription
                    ? `${finalDescription} | ${lixeiraDesc}`
                    : lixeiraDesc;
            }
            // Save to Supabase (Banheiro Table)
            const { error } = await supabase.from("inspections_banheiro" as any).insert({
                protocolo: protocol,
                localizacao: data.localizacao,
                problema: data.problema,
                descricao: finalDescription,
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
Descrição: ${finalDescription}

Clique no link para finalizar o chamado:
${linkFinalizar}`;

            try {
                // Change webhook URL for Banheiro //nunca mudar sem me consultar especificamente  
                await fetch("https://n8n.imagoradiologia.cloud/webhook/banheiro", { //nunca mudar sem me consultar especificamente
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
                            name="lixeira_cheia"
                            render={({ field }) => (
                                <FormItem className="flex flex-col space-y-4 rounded-lg border p-4">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Lixeiras Cheias?
                                            </FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Marque se houver lixeiras para recolher
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </div>

                                    {/* Checkboxes for Trash Types */}
                                    {field.value && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                                            <FormField
                                                control={form.control}
                                                name="lixeira_comum"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-gray-50/50">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="font-normal cursor-pointer text-gray-700">
                                                                Lixo Comum
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lixeira_contaminante"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-orange-50/50 border-orange-100">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="font-normal cursor-pointer text-orange-900">
                                                                Contaminante
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lixeira_batas"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-blue-50/50 border-blue-100">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="font-normal cursor-pointer text-blue-900">
                                                                Batas
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
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
                                            <SelectItem value="faltando_insumo">Faltando Insumo</SelectItem>
                                            <SelectItem value="sujo">Banheiro Sujo</SelectItem>
                                            <SelectItem value="quebrado">Tem algo quebrado?</SelectItem>
                                            <SelectItem value="outro">Outro Problema</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
