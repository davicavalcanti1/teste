import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { acSchema, ACForm as ACFormType } from "@/features/inspections/types/inspection-forms";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Snowflake, UploadCloud, X, Camera } from "lucide-react";

interface ACFormProps {
    variant: "imago" | "terceirizado" | "dreno";
}

export default function ACForm({ variant }: ACFormProps) {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);

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
<<<<<<< HEAD
            tipo_manutencao: "preventiva",
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
            observacoes: "",
        },
    });

    useEffect(() => {
        if (sala) form.setValue("localizacao", sala);
        if (modelo) form.setValue("modelo", modelo);
        if (serie) form.setValue("numero_serie", serie);
        form.setValue("origem", variant);
    }, [sala, modelo, serie, variant, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ACFormType) => {
        // Validation for Mandatory Photos
        if ((variant === 'terceirizado' || variant === 'dreno') && files.length === 0) {
            toast({
                title: "Fotos obrigatórias",
                description: "Por favor, anexe pelo menos uma foto do serviço.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const uploadedUrls: string[] = [];

            // 1. Upload Images
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('inspection-images')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error("Upload error:", uploadError);
                        // If bucket doesn't exist, we might fail here. 
                        // We will continue but warn user or just skip image.
                        // For now, let's throw to stop process.
                        throw new Error(`Erro ao enviar imagem: ${uploadError.message}. Verifique se o bucket 'inspection-images' existe.`);
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('inspection-images')
                        .getPublicUrl(filePath);

                    uploadedUrls.push(publicUrlData.publicUrl);
                    setUploadProgress(Math.round(((i + 1) / files.length) * 100));
                }
            }

            // 2. Build activity log
            const atividades = [];
            if (data.limpeza_filtro) atividades.push("Limpeza de Filtro");
            if (data.limpeza_carenagem) atividades.push("Limpeza de Carenagem");
            if (data.teste_funcionamento) atividades.push("Teste de Funcionamento/Gás");
<<<<<<< HEAD

            // Variants
            if (variant === 'dreno') atividades.push("Limpeza de Dreno");
            if (variant === 'terceirizado') atividades.push("Serviço Terceirizado");

            // Add Maintenance Type
            if ((variant === 'terceirizado' || variant === 'dreno') && data.tipo_manutencao) {
                atividades.push(`Tipo: ${data.tipo_manutencao === 'preventiva' ? 'Preventiva' : 'Corretiva'}`);
            }

=======
            if (variant === 'dreno') atividades.push("Limpeza de Dreno");
            if (variant === 'terceirizado') atividades.push("Serviço Terceirizado");

>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
            // 3. Save to Supabase
            const { error } = await supabase.from("inspections_ac" as any).insert({
                localizacao: data.localizacao,
                origem: variant,
                modelo: data.modelo,
                numero_serie: data.numero_serie,
                atividades: atividades,
                observacoes: data.observacoes,
                fotos_urls: uploadedUrls
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
            <PublicFormLayout title={getTitle()}>
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
        <PublicFormLayout title={getTitle()} subtitle={sala}>
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Read-only fields */}
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

<<<<<<< HEAD
                        {/* Maintenance Type - For Dreno and Terceirizado */}
                        {(variant === 'dreno' || variant === 'terceirizado') && (
                            <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                                <h3 className="font-semibold text-sm text-gray-700">Tipo de Manutenção *</h3>
                                <FormField
                                    control={form.control}
                                    name="tipo_manutencao"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${field.value === 'preventiva' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                                        <input
                                                            type="radio"
                                                            className="sr-only"
                                                            value="preventiva"
                                                            checked={field.value === 'preventiva'}
                                                            onChange={() => field.onChange('preventiva')}
                                                        />
                                                        <span className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${field.value === 'preventiva' ? 'border-blue-500' : 'border-gray-300'}`}>
                                                            {field.value === 'preventiva' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                                        </span>
                                                        <span className="font-medium">Preventiva</span>
                                                    </label>
                                                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${field.value === 'corretiva' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                                        <input
                                                            type="radio"
                                                            className="sr-only"
                                                            value="corretiva"
                                                            checked={field.value === 'corretiva'}
                                                            onChange={() => field.onChange('corretiva')}
                                                        />
                                                        <span className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${field.value === 'corretiva' ? 'border-blue-500' : 'border-gray-300'}`}>
                                                            {field.value === 'corretiva' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                                        </span>
                                                        <span className="font-medium">Corretiva</span>
                                                    </label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                        {/* Checklist Section - ONLY for Imago */}
                        {variant === 'imago' && (
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
                                {/* Teste de funcionamento removido conforme pedido */}
                            </div>
                        )}

                        {/* Observations / Text Field */}
                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {(variant === 'terceirizado' || variant === 'dreno') ? "Descrição do Serviço Realizado" : "Observações"}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhe o que foi feito..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image Upload Section */}
                        <div className="space-y-3">
                            <FormLabel className="flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Fotos do Serviço
                                {(variant === 'terceirizado' || variant === 'dreno') && <span className="text-red-500 font-bold ml-1">* Obrigatório</span>}
                            </FormLabel>

                            <div className="flex flex-wrap gap-4">
                                {files.map((file, index) => (
                                    <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-100">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover opacity-80" />
                                        <button type="button" onClick={() => removeFile(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 bg-white">
                                    <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500">Adicionar</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">Tire fotos do antes e depois se possível.</p>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {uploadProgress > 0 ? `Enviando ${uploadProgress}%` : "Salvando..."}
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
