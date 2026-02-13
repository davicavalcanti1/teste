import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, CheckCircle2, UploadCloud, Camera, Battery } from "lucide-react";
import { toast } from "sonner";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Schema ---
const deaSchema = z.object({
    funcionario: z.string().min(3, "Nome do funcionário é obrigatório (min 3 letras)"),
    localizacao: z.string().min(3, "Localização é obrigatória"),
    bateria_nivel: z.enum(["baixa", "media", "cheia"], {
        required_error: "Selecione o nível da bateria",
    }),
    colocou_carregar: z.enum(["sim", "nao"], {
        required_error: "Informe se colocou para carregar",
    }),
    observacoes: z.string().optional(),
});

type DEAFormValues = z.infer<typeof deaSchema>;

export default function DEAForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const form = useForm<DEAFormValues>({
        resolver: zodResolver(deaSchema),
        defaultValues: {
            funcionario: "",
            localizacao: "",
            bateria_nivel: "cheia",
            colocou_carregar: "nao",
            observacoes: ""
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error } = await (supabase as any).storage
                    .from('inspecoes-dea') // Using the bucket created in migration
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = (supabase as any).storage
                    .from('inspecoes-dea')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            }

            setUploadedUrls(prev => [...prev, ...newUrls]);
            toast.success("Foto salva com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar foto: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (values: DEAFormValues) => {
        if (uploadedUrls.length === 0) {
            toast.error("É obrigatório anexar e aguardar o salvamento de pelo menos uma foto.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Prepare Payload
            const payload = {
                funcionario: values.funcionario,
                localizacao: values.localizacao,
                bateria_porcentagem: values.bateria_nivel === 'cheia' ? 100 : values.bateria_nivel === 'media' ? 50 : 10,
                bateria_nivel: values.bateria_nivel,
                colocou_carregar: values.colocou_carregar === 'sim',
                observacoes: values.observacoes,
                fotos_urls: uploadedUrls,
                data_referencia: format(new Date(), "yyyy-MM-dd"),
                status: 'finalizado' // Direct finalization
            };

            // 2. Save to Supabase
            const { data, error } = await (supabase as any)
                .from("inspections_dea")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            console.log('Inspeção DEA salva:', data.protocolo);

            // 3. Prepare Webhook Payload
            const viewLink = `${window.location.origin}/inspecoes/dea/view/${data.protocolo}`; // Placeholder link

            const webhookPayload = {
                ...data,
                view_link: viewLink,
                formatted_message: `⚡ *Inspeção DEA - ${data.protocolo}*\n\n` +
                    `📅 *Data:* ${format(new Date(data.criado_em), 'dd/MM/yyyy HH:mm')}\n` +
                    `👤 *Responsável:* ${data.funcionario}\n` +
                    `📍 *Local:* ${data.localizacao}\n` +
                    `🔋 *Bateria:* ${values.bateria_nivel.toUpperCase()}\n` +
                    `🔌 *Carregando:* ${values.colocou_carregar === 'sim' ? 'SIM' : 'NÃO'}\n\n` +
                    (values.observacoes ? `📝 *Obs:* ${values.observacoes}\n\n` : '') +
                    `🔗 *Visualizar:* ${viewLink}`
            };

            // 4. Send Webhook
            try {
                const webhookUrl = "https://n8n.imagoradiologia.cloud/webhook/dea";
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                });
                console.log('Webhook DEA enviado.');
            } catch (whError) {
                console.error("Erro webhook DEA:", whError);
            }

            setSuccessData(data);
            toast.success("Inspeção DEA registrada!");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <PublicFormLayout title="Inspeção DEA" subtitle="Registro Concluído" colorTheme="rose">
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Inspeção Registrada!</h2>
                    <p className="text-gray-600 mb-4">Protocolo gerado com sucesso.</p>

                    <div className="bg-gray-100 p-4 rounded-lg text-center mb-6 w-full max-w-xs mx-auto">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Protocolo</p>
                        <p className="text-3xl font-mono font-bold text-gray-800 tracking-wider">
                            {successData.protocolo}
                        </p>
                    </div>

                    <Button
                        className="w-full mt-2 bg-rose-600 hover:bg-rose-700"
                        onClick={() => window.location.reload()}
                    >
                        Nova Inspeção
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Inspeção DEA" subtitle="Verificação de Bateria" colorTheme="rose">
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Funcionário */}
                        <FormField
                            control={form.control}
                            name="funcionario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Funcionário <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu nome completo" {...field} className="h-12 text-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Localização */}
                        <FormField
                            control={form.control}
                            name="localizacao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localização do DEA <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Recepção Térreo, Corredor UTI..." {...field} className="h-12 text-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Data (Exibição apenas) */}
                        <div className="space-y-2">
                            <FormLabel className="text-gray-700">Data da Inspeção</FormLabel>
                            <div className="h-12 border rounded-md px-3 flex items-center bg-gray-50 text-gray-600 font-medium">
                                {format(new Date(), "dd/MM/yyyy")}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-4" />

                        {/* Nível da Bateria */}
                        <FormField
                            control={form.control}
                            name="bateria_nivel"
                            render={({ field }) => (
                                <FormItem className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                                    <FormLabel className="flex items-center gap-2 text-rose-800 font-medium text-lg mb-3">
                                        <Battery className="h-5 w-5" />
                                        Nível da Bateria <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Button
                                                type="button"
                                                variant={field.value === "baixa" ? "default" : "outline"}
                                                className={`h-14 font-bold border-2 ${field.value === "baixa" ? "bg-red-600 hover:bg-red-700 border-red-600" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}
                                                onClick={() => field.onChange("baixa")}
                                            >
                                                BAIXA
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === "media" ? "default" : "outline"}
                                                className={`h-14 font-bold border-2 ${field.value === "media" ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" : "bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50"}`}
                                                onClick={() => field.onChange("media")}
                                            >
                                                MÉDIA
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === "cheia" ? "default" : "outline"}
                                                className={`h-14 font-bold border-2 ${field.value === "cheia" ? "bg-green-600 hover:bg-green-700 border-green-600" : "bg-white border-green-200 text-green-600 hover:bg-green-50"}`}
                                                onClick={() => field.onChange("cheia")}
                                            >
                                                CHEIA
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Colocou para carregar? */}
                        <FormField
                            control={form.control}
                            name="colocou_carregar"
                            render={({ field }) => (
                                <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <FormLabel className="flex items-center gap-2 text-blue-800 font-medium text-lg mb-3">
                                        🔌 Colocou para carregar? <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                type="button"
                                                variant={field.value === "sim" ? "default" : "outline"}
                                                className={`h-12 font-bold border-2 ${field.value === "sim" ? "bg-green-600 hover:bg-green-700 border-green-600" : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"}`}
                                                onClick={() => field.onChange("sim")}
                                            >
                                                SIM
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === "nao" ? "default" : "outline"}
                                                className={`h-12 font-bold border-2 ${field.value === "nao" ? "bg-red-600 hover:bg-red-700 border-red-600" : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"}`}
                                                onClick={() => field.onChange("nao")}
                                            >
                                                NÃO
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Observações */}
                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações Gerais</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Alguma avaria ou detalhe importante?" {...field} className="min-h-[100px] resize-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fotos */}
                        <div className="space-y-4">
                            <FormLabel>Foto do Visor da Bateria <span className="text-red-500">*</span></FormLabel>

                            {uploadedUrls.length > 0 && (
                                <Alert className="bg-green-50 border-green-200 text-green-800">
                                    <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                                    <AlertTitle>Foto Salva com Sucesso!</AlertTitle>
                                    <AlertDescription>
                                        Registro visual confirmado.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {/* Tirar Foto */}
                                <div className="border-2 border-dashed border-rose-300 rounded-lg p-6 text-center hover:bg-rose-50 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-7 w-7 text-rose-600 animate-spin" />
                                                <p className="font-medium text-rose-700 text-sm">Salvando...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-rose-100 p-3 rounded-full group-hover:bg-rose-200 transition-colors">
                                                    <Camera className="h-7 w-7 text-rose-600" />
                                                </div>
                                                <p className="font-medium text-rose-700 text-sm">Tirar Foto</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Galeria */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-7 w-7 text-rose-600 animate-spin" />
                                                <p className="font-medium text-rose-700 text-sm">Salvando...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
                                                    <UploadCloud className="h-7 w-7 text-gray-500" />
                                                </div>
                                                <p className="font-medium text-gray-700 text-sm">Galeria</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            {uploadedUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {uploadedUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                                            <img src={url} alt={`Foto ${idx + 1}`} className="object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || uploading || uploadedUrls.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    Salvando...
                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                </>
                            ) : (
                                "Finalizar Inspeção DEA"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
