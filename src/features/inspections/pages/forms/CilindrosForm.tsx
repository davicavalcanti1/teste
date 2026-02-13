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
import { Loader2, CheckCircle2, UploadCloud, CheckCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatarMensagemInspecao } from "../../utils/cylinderMessageFormatter";

// --- Schema ---
const cylinderSchema = z.object({
    funcionario: z.string().min(3, "Nome do funcionário é obrigatório (min 3 letras)"),
    data_referencia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),

    // Oxigênio Grande (Anterior "Oxigênio")
    precisa_oxigenio_grande: z.boolean().default(false),
    qtd_oxigenio_grande: z.string().optional(),

    // Oxigênio Pequeno (Novo)
    precisa_oxigenio_pequeno: z.boolean().default(false),
    qtd_oxigenio_pequeno: z.string().optional(),

    // Ar Comprimido (Mantido)
    precisa_ar: z.boolean().default(false),
    qtd_ar: z.string().optional(),

    observacoes: z.string().optional(),
})
    .refine((data) => {
        if (data.precisa_oxigenio_grande && (!data.qtd_oxigenio_grande || parseInt(data.qtd_oxigenio_grande) <= 0)) {
            return false;
        }
        return true;
    }, { message: "Informe a quantidade de Oxigênio Grande", path: ["qtd_oxigenio_grande"] })
    .refine((data) => {
        if (data.precisa_oxigenio_pequeno && (!data.qtd_oxigenio_pequeno || parseInt(data.qtd_oxigenio_pequeno) <= 0)) {
            return false;
        }
        return true;
    }, { message: "Informe a quantidade de Oxigênio Pequeno", path: ["qtd_oxigenio_pequeno"] })
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
            precisa_oxigenio_grande: false,
            qtd_oxigenio_grande: "",
            precisa_oxigenio_pequeno: false,
            qtd_oxigenio_pequeno: "",
            precisa_ar: false,
            qtd_ar: "",
            observacoes: ""
        }
    });

    const precisaOxigenioGrande = form.watch("precisa_oxigenio_grande");
    const precisaOxigenioPequeno = form.watch("precisa_oxigenio_pequeno");
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

                // Novos campos
                precisa_oxigenio_grande: values.precisa_oxigenio_grande,
                qtd_oxigenio_grande: values.precisa_oxigenio_grande ? parseInt(values.qtd_oxigenio_grande || "0") : null,
                precisa_oxigenio_pequeno: values.precisa_oxigenio_pequeno,
                qtd_oxigenio_pequeno: values.precisa_oxigenio_pequeno ? parseInt(values.qtd_oxigenio_pequeno || "0") : null,

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

            console.log('Inspeção salva:', data.protocolo);

            // --- ETAPA 3: LÓGICA DE DETECÇÃO E TOKEN ---

            // 3.1 Detectar se há pedido
            const temPedido = (
                (data.qtd_oxigenio_grande && data.qtd_oxigenio_grande > 0) ||
                (data.qtd_oxigenio_pequeno && data.qtd_oxigenio_pequeno > 0) ||
                (data.qtd_ar && data.qtd_ar > 0)
            );

            console.log('Requer confirmação:', temPedido);

            let token = null;
            let confirmationUrl = null;

            // 3.2 Se houver pedido, gerar token
            if (temPedido) {
                try {
                    token = crypto.randomUUID();
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 48); // 48 horas

                    console.log('Token gerado:', token);
                    console.log('Expira em:', expiresAt);

                    // Atualizar registro com token
                    const { error: updateError } = await (supabase as any)
                        .from('inspecoes_cilindros')
                        .update({
                            confirmation_token: token,
                            confirmation_token_expires_at: expiresAt.toISOString()
                        })
                        .eq('id', data.id);

                    if (updateError) {
                        console.error('Erro ao salvar token:', updateError);
                    } else {
                        // URL de confirmação (apenas se salvou token com sucesso)
                        // URL de confirmação (dinâmica baseada na origem atual)
                        confirmationUrl = `${window.location.origin}/inspecoes/cilindros/confirmar/${token}`;
                    }

                } catch (tokenError) {
                    console.error('Erro no processo de confirmação:', tokenError);
                }
            }

            // 3.3 Montar Payload Webhook
            const cilindrosPedido = {
                oxigenio_grande: data.qtd_oxigenio_grande || 0,
                oxigenio_pequeno: data.qtd_oxigenio_pequeno || 0,
                ar_comprimido: data.qtd_ar || 0
            };

            const webhookPayload = {
                ...data,
                requer_confirmacao: temPedido,
                confirmation_url: confirmationUrl,
                cilindros_pedido: cilindrosPedido,
                destinatario_gestora: "558388263800",
                nome_gestora: "Lidiane"
            };

            // --- ETAPA 5: FORMATAÇÃO DE MENSAGEM ---
            const mensagens = formatarMensagemInspecao(webhookPayload);

            let finalPayload;

            if (temPedido) {
                // COM PEDIDO
                finalPayload = {
                    ...webhookPayload,
                    formatted_message_gestora: (mensagens as any).mensagem_gestora,
                    formatted_message_grupo: (mensagens as any).mensagem_grupo,
                    group_jid: "120363025674048776@g.us",
                    tipo_envio: "pedido_confirmacao"
                };
            } else {
                // SEM PEDIDO
                finalPayload = {
                    ...webhookPayload,
                    formatted_message: mensagens, // string única
                    group_jid: "120363025674048776@g.us",
                    tipo_envio: "inspecao_normal"
                };
            }

            // 3.4 Enviar para Webhook
            try {
                const webhookUrl = "https://n8n.imagoradiologia.cloud/webhook/cilindro";

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(finalPayload)
                });

                if (!response.ok) {
                    console.error('Erro ao enviar webhook:', await response.text());
                } else {
                    console.log('Webhook enviado com sucesso!');
                }

            } catch (webhookError: any) {
                console.error("Webhook falhou:", webhookError);
                // Não exibir toast de erro aqui para não assustar usuário se o banco já salvou
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

                        {/* Section: Oxigênio Grande */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="precisa_oxigenio_grande"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold text-gray-700">Há necessidade de repor Oxigênio Grande?</FormLabel>
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
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Sim</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="nao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Não</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {precisaOxigenioGrande && (
                                <FormField
                                    control={form.control}
                                    name="qtd_oxigenio_grande"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in zoom-in-95 duration-200 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                            <FormLabel className="text-purple-800 font-medium">Quantos Cilindros Grandes?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Digite a quantidade..." {...field} className="bg-white border-purple-200 focus-visible:ring-purple-500 h-12 text-lg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Section: Oxigênio Pequeno (NOVO) */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="precisa_oxigenio_pequeno"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold text-gray-700">Há necessidade de repor Oxigênio Pequeno?</FormLabel>
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
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Sim</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="nao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Não</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {precisaOxigenioPequeno && (
                                <FormField
                                    control={form.control}
                                    name="qtd_oxigenio_pequeno"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in zoom-in-95 duration-200 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                            <FormLabel className="text-purple-800 font-medium">Quantos Cilindros Pequenos?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Quantidade de cilindros pequenos" {...field} className="bg-white border-purple-200 focus-visible:ring-purple-500 h-12 text-lg" />
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
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Sim</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-1/2 justify-center cursor-pointer hover:bg-gray-50 bg-white">
                                                    <FormControl>
                                                        <RadioGroupItem value="nao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer text-gray-700">Não</FormLabel>
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

                            <div className="grid grid-cols-2 gap-3">
                                {/* Tirar Foto (abre câmera diretamente) */}
                                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:bg-purple-50 transition-colors cursor-pointer relative group">
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
                                                <Loader2 className="h-7 w-7 text-purple-600 animate-spin" />
                                                <p className="font-medium text-purple-700 text-sm">Salvando...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                                                    <Camera className="h-7 w-7 text-purple-600" />
                                                </div>
                                                <p className="font-medium text-purple-700 text-sm">Tirar Foto</p>
                                                <p className="text-xs text-gray-400">Abrir câmera</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Selecionar da Galeria */}
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
                                                <Loader2 className="h-7 w-7 text-purple-600 animate-spin" />
                                                <p className="font-medium text-purple-700 text-sm">Salvando...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors">
                                                    <UploadCloud className="h-7 w-7 text-gray-500" />
                                                </div>
                                                <p className="font-medium text-gray-700 text-sm">Galeria</p>
                                                <p className="text-xs text-gray-400">Selecionar fotos</p>
                                            </>
                                        )}
                                    </div>
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
