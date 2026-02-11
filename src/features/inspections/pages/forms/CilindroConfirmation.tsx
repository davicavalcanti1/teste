import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, Package2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface CilindroData {
    id: string;
    protocolo: string;
    data_referencia: string;
    funcionario: string;
    precisa_oxigenio: boolean;
    qtd_oxigenio: number | null;
    precisa_ar: boolean;
    qtd_ar: number | null;
    observacoes: string | null;
    status: string;
}

export default function CilindroConfirmation() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CilindroData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        async function fetchInspection() {
            if (!id) {
                setError("ID não fornecido");
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await (supabase as any)
                    .from("inspecoes_cilindros")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setData(data); // TypeScript might complain about status missing in interface if not careful, added it above

                if (data.status === 'confirmado' || data.status === 'finalizado') {
                    setConfirmed(true);
                }

            } catch (err: any) {
                console.error("Erro ao buscar inspeção:", err);
                setError("Não foi possível carregar os dados do pedido.");
            } finally {
                setLoading(false);
            }
        }

        fetchInspection();
    }, [id]);

    const handleConfirm = async () => {
        if (!id) return;
        setConfirming(true);

        try {
            // Update status to confirmed
            const { error } = await (supabase as any)
                .from("inspecoes_cilindros")
                .update({ status: 'confirmado' })
                .eq("id", id);

            if (error) throw error;

            setConfirmed(true);
            toast.success("Recebimento confirmado com sucesso!");

        } catch (err: any) {
            console.error("Erro ao confirmar:", err);
            toast.error("Erro ao confirmar: " + err.message);
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <PublicFormLayout title="Inspeção de Cilindros" colorTheme="purple">
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            </PublicFormLayout>
        );
    }

    if (error || !data) {
        return (
            <PublicFormLayout title="Inspeção de Cilindros" colorTheme="purple">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Algo deu errado</h2>
                    <p className="text-gray-600 mt-2">{error || "Pedido não encontrado"}</p>
                </div>
            </PublicFormLayout>
        );
    }

    if (confirmed) {
        return (
            <PublicFormLayout title="Pedido de Cilindros" colorTheme="purple">
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmado!</h2>
                    <p className="text-gray-600 mb-6">
                        O recebimento dos cilindros foi confirmado.
                    </p>
                    <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-100 mb-6">
                        <p className="text-xs text-uppercase text-gray-400 font-bold tracking-wider">PROTOCOLO</p>
                        <p className="font-mono text-xl text-gray-700">{data.protocolo}</p>
                    </div>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Confirmar Recebimento" subtitle={`Protocolo: ${data.protocolo}`} colorTheme="purple">
            <div className="p-6 space-y-6">

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
                    <Package2 className="shrink-0 h-5 w-5 text-purple-600 mt-1" />
                    <div>
                        <h3 className="font-semibold text-purple-900">Resumo do Pedido</h3>
                        <p className="text-purple-700 text-sm mt-1">
                            Solicitado por <strong>{data.funcionario}</strong> em {new Date(data.data_referencia).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg border bg-white shadow-sm">
                        <span className="font-medium text-gray-700">Oxigênio</span>
                        {data.precisa_oxigenio ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                Sim ({data.qtd_oxigenio} un)
                            </span>
                        ) : (
                            <span className="text-gray-400 text-sm italic">Não solicitado</span>
                        )}
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg border bg-white shadow-sm">
                        <span className="font-medium text-gray-700">Ar Comprimido</span>
                        {data.precisa_ar ? (
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                                Sim ({data.qtd_ar} un)
                            </span>
                        ) : (
                            <span className="text-gray-400 text-sm italic">Não solicitado</span>
                        )}
                    </div>

                    {data.observacoes && (
                        <div className="pt-2">
                            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Observações</p>
                            <div className="bg-gray-50 p-3 rounded-md border text-gray-700 text-sm italic">
                                "{data.observacoes}"
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                <div className="pt-2">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        Você confirma que os cilindros solicitados foram entregues ou a solicitação atendida?
                    </p>
                    <Button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/10 transition-all hover:scale-[1.02]"
                    >
                        {confirming ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Confirmando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Confirmar Pedido
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </PublicFormLayout>
    );
}
