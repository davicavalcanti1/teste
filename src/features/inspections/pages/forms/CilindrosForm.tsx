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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, CheckCircle2, UploadCloud, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Schema ---
const cylinderSchema = z.object({
    funcionario: z.string().min(3, "Nome do funcionário é obrigatório (min 3 letras)"),
    data_referencia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),

    precisa_oxigenio: z.boolean().default(false),
    qtd_oxigenio: z.string().optional(), // We'll parse to number manually or refine schema

    precisa_ar: z.boolean().default(false),
    qtd_ar: z.string().optional(),

    observacoes: z.string().optional(),
})
    .refine((data) => {
        if (data.precisa_oxigenio && (!data.qtd_oxigenio || parseInt(data.qtd_oxigenio) <= 0)) {
            return false;
        }
        return true;
    }, { message: "Informe a quantidade de Oxigênio", path: ["qtd_oxigenio"] })
    .refine((data) => {
        if (data.precisa_ar && (!data.qtd_ar || parseInt(data.qtd_ar) <= 0)) {
            return false;
        }
        return true;
    }, { message: "Informe a quantidade de Ar Comprimido", path: ["qtd_ar"] });

type CylinderFormValues = z.infer<typeof cylinderSchema>;

export default function CilindrosForm() {
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get("date");

    // Default date is URL param or Today
    const initialDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : format(new Date(), "yyyy-MM-dd");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const form = useForm<CylinderFormValues>({
        resolver: zodResolver(cylinderSchema),
        defaultValues: {
            funcionario: "",
            data_referencia: initialDate,
            precisa_oxigenio: false, // Default nao
            qtd_oxigenio: "",
            precisa_ar: false, // Default nao
            qtd_ar: "",
            observacoes: ""
        }
    });

    const precisaOxigenio = form.watch("precisa_oxigenio");
    const precisaAr = form.watch("precisa_ar");

    // --- Actions ---
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
                    .from('inspecoes-cilindros')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = (supabase as any).storage
                    .from('inspecoes-cilindros')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            }

            setUploadedUrls(prev => [...prev, ...newUrls]);
            toast.success("Foto salva no banco com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar foto: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (values: CylinderFormValues) => {
        // Validation: Photos are mandatory
        if (uploadedUrls.length === 0) {
            toast.error("É obrigatório anexar e aguardar o salvamento de pelo menos uma foto.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. Prepare Payload (using already uploaded URLs)
            const payload = {
                funcionario: values.funcionario,
                data_referencia: values.data_referencia,
                precisa_oxigenio: values.precisa_oxigenio,
                qtd_oxigenio: values.precisa_oxigenio ? parseInt(values.qtd_oxigenio || "0") : null,
                precisa_ar: values.precisa_ar,
                qtd_ar: values.precisa_ar ? parseInt(values.qtd_ar || "0") : null,
                observacoes: values.observacoes,
                fotos_urls: uploadedUrls,
            };

            // 3. Save to Supabase
            const { data, error } = await (supabase as any)
                .from("inspecoes_cilindros")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            // 4. Webhook Trigger (Validation/Notification)
            try {
                const webhookUrl = "https://n8n.imagoradiologia.cloud/webhook/cilindro";

                // Constructing message per requirement to display or logs
                const msg = `📋 INSPEÇÃO CILINDROS\nProtocolo: ${data.protocolo}\nData: ${data.data_referencia}\nFuncionário: ${data.funcionario}\nOxigênio: ${data.precisa_oxigenio ? 'SIM' : 'NÃO'} | Qt: ${data.qtd_oxigenio || '-'}\nAr comprimido: ${data.precisa_ar ? 'SIM' : 'NÃO'} | Qt: ${data.qtd_ar || '-'}\nObs: ${data.observacoes || '-'}`;
                console.log("Mensagem gerada:", msg);

                // Send to N8N
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        formatted_message: msg
                    })
                });

                if (!response.ok) {
                    throw new Error(`N8N respondeu com erro: ${response.status}`);
                }

            } catch (webhookError: any) {
                console.error("Webhook falhou:", webhookError);
                toast.warning("Registro salvo, mas houve falha na notificação automática. " + webhookError.message);
            }

            setSuccessData(data);
            toast.success("Inspeção registrada com sucesso!");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar inspeção: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <PublicFormLayout title="Inspeção de Cilindros" subtitle="Registro Confirmado" colorTheme="purple">
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
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.location.reload()}
                    >
                        Nova Inspeção
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Inspeção de Cilindros" subtitle="Controle Diário" colorTheme="purple">
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Data Referência */}
                        <FormField
                            control={form.control}
                            name="data_referencia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Referência</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="date" {...field} className="bg-gray-100 text-gray-600 font-medium cursor-not-allowed opacity-80" readOnly disabled />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <div className="h-px bg-gray-100 my-4" />

                        {/* Section: Oxigênio */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="precisa_oxigenio"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold text-gray-700">Há necessidade de repor Oxigênio?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(val) => field.onChange(val === "sim")}
                                                defaultValue={field.value ? "sim" : "nao"}
                                                className="flex space-x-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="sim" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">
                                                        Sim
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="nao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">
                                                        Não
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {precisaOxigenio && (
                                <FormField
                                    control={form.control}
                                    name="qtd_oxigenio"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in zoom-in-95 duration-200 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                            <FormLabel className="text-purple-800 font-medium">Quantos Cilindros de Oxigênio?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Digite a quantidade..." {...field} className="bg-white border-purple-200 focus-visible:ring-purple-500 h-12 text-lg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="h-px bg-gray-100 my-4" />

                        {/* Section: Ar Comprimido */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="precisa_ar"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold text-gray-700">Há necessidade de repor Ar Comprimido?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(val) => field.onChange(val === "sim")}
                                                defaultValue={field.value ? "sim" : "nao"}
                                                className="flex space-x-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="sim" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">
                                                        Sim
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="nao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">
                                                        Não
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {precisaAr && (
                                <FormField
                                    control={form.control}
                                    name="qtd_ar"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in zoom-in-95 duration-200 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                            <FormLabel className="text-indigo-800 font-medium">Quantos Cilindros de Ar?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Digite a quantidade..." {...field} className="bg-white border-indigo-200 focus-visible:ring-indigo-500 h-12 text-lg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="h-px bg-gray-100 my-4" />

                        {/* Observation */}
                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações Gerais</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Algum vazamento, avaria ou detalhe importante?" {...field} className="min-h-[100px] resize-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Photos */}
                        <div className="space-y-4">
                            <FormLabel>Fotos do Local <span className="text-red-500">*</span></FormLabel>

                            {uploadedUrls.length > 0 && (
                                <Alert className="bg-green-50 border-green-200 text-green-800">
                                    <CheckCircle className="h-4 w-4 stroke-green-600" />
                                    <AlertTitle>Foto Salva com Sucesso!</AlertTitle>
                                    <AlertDescription>
                                        Autorização para registro concedida. Você já pode finalizar a inspeção.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                <div className="flex flex-col items-center gap-3">
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                                            <p className="font-medium text-purple-700">Salvando foto no banco...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
                                                <UploadCloud className="h-8 w-8 text-gray-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-gray-700">
                                                    {uploadedUrls.length > 0
                                                        ? "Adicionar mais fotos"
                                                        : "Toque para adicionar fotos"}
                                                </p>
                                                <p className="text-xs text-gray-400">Tire fotos dos manômetros e estoque.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Preview Grid */}
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
                            className="w-full h-14 text-lg bg-purple-700 hover:bg-purple-800 shadow-lg shadow-purple-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || uploading || uploadedUrls.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    Salvando...
                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                </>
                            ) : (
                                "Finalizar Inspeção"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </PublicFormLayout>
    );
}
