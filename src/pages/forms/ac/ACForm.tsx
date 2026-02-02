import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { acSchema, ACForm as ACFormType } from "@/types/inspection-forms";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Snowflake } from "lucide-react";

interface ACFormProps {
    variant: "imago" | "terceirizado" | "dreno";
}

export default function ACForm({ variant }: ACFormProps) {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Pre-fill from URL
    const sala = searchParams.get("sala") || "";
    const modelo = searchParams.get("modelo") || "";
    const serie = searchParams.get("numero_serie") || "";

    const form = useForm<ACFormType>({
        resolver: zodResolver(acSchema),
        defaultValues: {
            localizacao: sala,
            origem: variant,
            modelo: modelo,
            numero_serie: serie,
            limpeza_filtro: false,
            limpeza_carenagem: false,
            teste_funcionamento: false,
            observacoes: "",
        },
    });

    useEffect(() => {
        if (sala) form.setValue("localizacao", sala);
        if (modelo) form.setValue("modelo", modelo);
        if (serie) form.setValue("numero_serie", serie);
        // Force variant as origin
        form.setValue("origem", variant);
    }, [sala, modelo, serie, variant, form]);

    const onSubmit = async (data: ACFormType) => {
        setIsSubmitting(true);
        try {

            // Build activity log
            const atividades = [];
            if (data.limpeza_filtro) atividades.push("Limpeza de Filtro");
            if (data.limpeza_carenagem) atividades.push("Limpeza de Carenagem");
            if (data.teste_funcionamento) atividades.push("Teste de Funcionamento/Gás");
            if (variant === 'dreno') atividades.push("Limpeza de Dreno");

            // Save to Supabase (AC Table)
            // Cast to any to bypass missing type definitions locally
            const { error } = await supabase.from("inspections_ac" as any).insert({
                localizacao: data.localizacao,
                origem: variant,
                modelo: data.modelo,
                numero_serie: data.numero_serie,
                atividades: atividades, // Save as JSON array
                observacoes: data.observacoes,
                // fotos_urls: [] // TODO: Add file upload logic if needed later
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: "Registro Salvo!",
                description: "Manutenção de ar-condicionado registrada.",
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTitle = () => {
        switch (variant) {
            case "imago": return "AC - Funcionário Imago";
            case "terceirizado": return "AC - Terceirizado";
            case "dreno": return "AC - Limpeza de Dreno";
            default: return "Ar Condicionado";
        }
    };

    if (isSuccess) {
        return (
            <PublicFormLayout title={getTitle()} colorTheme="blue">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrado!</h2>
                    <p className="text-gray-600 mb-6">
                        A manutenção foi salva no histórico.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Novo Registro
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title={getTitle()} subtitle={sala} colorTheme="blue">
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="localizacao"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Sala / Local</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-100" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-100 text-xs" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numero_serie"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº Série</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-100 text-xs" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                <Snowflake className="h-4 w-4" />
                                Checklist Realizado
                            </h3>

                            <FormField
                                control={form.control}
                                name="limpeza_filtro"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Limpeza do Filtro</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="limpeza_carenagem"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Limpeza Carenagem</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="teste_funcionamento"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Teste de Gás/Funcionamento</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {variant === 'dreno' && (
                                <div className="flex flex-row items-start space-x-3 space-y-0 opacity-50">
                                    <Checkbox checked disabled />
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Limpeza de Dreno (Obrigatório)</FormLabel>
                                    </div>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Alguma anomalia?"
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
                                        Salvando...
                                    </>
                                ) : (
                                    "Registrar Manutenção"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
