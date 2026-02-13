import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// 1. INTERFACE DOS DADOS
interface InspecaoCilindro {
    id: string;
    protocolo: string;
    data_referencia: string;
    funcionario: string;
    qtd_oxigenio_grande: number | null;
    qtd_oxigenio_pequeno: number | null;
    qtd_ar: number | null;
    observacoes: string;
    confirmation_token: string;
    confirmation_token_expires_at: string;
    confirmado_em: string | null;
    confirmado_por: string | null;
}

export default function CilindroConfirmacao() {
    const { token } = useParams();
    const navigate = useNavigate();

    // 2. ESTADOS DO COMPONENTE
    const [loading, setLoading] = useState(true);
    const [inspecao, setInspecao] = useState<InspecaoCilindro | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [confirmando, setConfirmando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    // 1. AO CARREGAR (useEffect)
    useEffect(() => {
        async function validarToken() {
            if (!token) {
                setErro("Link inválido");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let data, error;

                // Check if token is a UUID (assuming ID) or a specialized token
                // Prioritize finding by confirmation_token, but also allow finding by ID
                const response = await (supabase as any)
                    .from('inspecoes_cilindros')
                    .select('*')
                    .or(`confirmation_token.eq.${token},id.eq.${token}`)
                    .single();

                data = response.data;
                error = response.error;

                if (error || !data) {
                    setErro('Pedido não encontrado ou link inválido.');
                    return;
                }

                // Verificar se já foi confirmado
                if (data.confirmado_em) {
                    setErro('Este pedido já foi confirmado anteriormente');
                    return;
                }

                // If using token, check expiration
                // Check expiration if it exists
                if (data.confirmation_token_expires_at) {
                    const agora = new Date();
                    const expiracao = new Date(data.confirmation_token_expires_at);

                    if (agora > expiracao) {
                        setErro('Este link de confirmação expirou');
                        return;
                    }
                }

                // Válido
                setInspecao(data);

            } catch (error) {
                console.error('Erro ao validar:', error);
                setErro('Erro ao processar solicitação');
            } finally {
                setLoading(false);
            }
        }

        validarToken();
    }, [token]);

    // 2. FUNÇÃO DE CONFIRMAÇÃO
    async function confirmarPedido() {
        if (!inspecao) return;

        try {
            setConfirmando(true);

            // 1. Atualizar no Supabase
            const agora = new Date().toISOString();
            const { error: updateError } = await (supabase as any)
                .from('inspecoes_cilindros')
                .update({
                    confirmado_em: agora,
                    confirmado_por: 'Lidiane'
                })
                .eq('id', inspecao.id);

            if (updateError) {
                throw new Error('Erro ao confirmar no banco de dados');
            }

            // 2. Notificar o n8n
            const webhookPayload = {
                protocolo: inspecao.protocolo,
                confirmado_por: 'Lidiane',
                confirmado_em: agora,
                cilindros_pedido: {
                    oxigenio_grande: inspecao.qtd_oxigenio_grande || 0,
                    oxigenio_pequeno: inspecao.qtd_oxigenio_pequeno || 0,
                    ar_comprimido: inspecao.qtd_ar || 0
                },
                funcionario: inspecao.funcionario,
                data_referencia: inspecao.data_referencia,
                observacoes: inspecao.observacoes
            };

            try {
                const response = await fetch('https://n8n.imagoradiologia.cloud/webhook/cilindro-confirmado', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(webhookPayload)
                });

                if (!response.ok) {
                    console.error('Erro ao notificar n8n, mas confirmação foi salva');
                }
            } catch (webhookError) {
                console.error('Falha ao chamar webhook', webhookError);
            }

            // 3. Mostrar sucesso
            setSucesso(true);
            toast.success("Pedido confirmado com sucesso!");

        } catch (error) {
            console.error('Erro ao confirmar:', error);
            setErro('Erro ao confirmar pedido. Tente novamente.');
            toast.error("Erro ao confirmar.");
        } finally {
            setConfirmando(false);
        }
    }

    // 3. RENDERIZAÇÃO (JSX)
    // LOADING
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Validando solicitação...</p>
                </div>
            </div>
        );
    }

    // ERRO
    if (erro) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border-l-4 border-red-500">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
                    <p className="text-gray-600 mb-6">{erro}</p>
                    <Button variant="outline" onClick={() => navigate('/')}>Voltar ao Início</Button>
                </div>
            </div>
        );
    }

    // SUCESSO
    if (sucesso) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
                    <div className="text-5xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Confirmado!</h1>
                    <p className="text-gray-600 mb-6">
                        O pedido de cilindros foi confirmado com sucesso.<br />
                        Uma notificação foi enviada para o grupo.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
                        <span className="text-gray-500">Protocolo:</span> <span className="font-mono font-bold">{inspecao?.protocolo}</span>
                    </div>
                </div>
            </div>
        );
    }

    // TELA DE CONFIRMAÇÃO
    if (!inspecao) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        🔔 Confirmação de Pedido
                    </h1>
                    <p className="text-gray-500">Inspeção de Cilindros</p>
                </div>

                {/* Informações da Inspeção */}
                <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Protocolo</p>
                            <p className="font-semibold text-gray-800 font-mono text-base">{inspecao.protocolo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Data Ref.</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(inspecao.data_referencia + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-blue-100 mt-2">
                            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Funcionário Solicitante</p>
                            <p className="font-semibold text-gray-800 text-lg">{inspecao.funcionario}</p>
                        </div>
                    </div>
                </div>

                {/* Cilindros Solicitados */}
                <div className="mb-8">
                    <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        📦 Cilindros Solicitados
                    </h2>
                    <div className="space-y-2">
                        {inspecao.qtd_oxigenio_grande && inspecao.qtd_oxigenio_grande > 0 ? (
                            <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                <span className="font-medium text-gray-700">Oxigênio Grande</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {inspecao.qtd_oxigenio_grande} un
                                </span>
                            </div>
                        ) : null}

                        {inspecao.qtd_oxigenio_pequeno && inspecao.qtd_oxigenio_pequeno > 0 ? (
                            <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                <span className="font-medium text-gray-700">Oxigênio Pequeno</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {inspecao.qtd_oxigenio_pequeno} un
                                </span>
                            </div>
                        ) : null}

                        {inspecao.qtd_ar && inspecao.qtd_ar > 0 ? (
                            <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                <span className="font-medium text-gray-700">Ar Comprimido</span>
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                    {inspecao.qtd_ar} un
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Observações */}
                {inspecao.observacoes && (
                    <div className="mb-8">
                        <h2 className="font-semibold text-gray-800 mb-2">📝 Observações</h2>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-700 italic">
                            "{inspecao.observacoes}"
                        </div>
                    </div>
                )}

                {/* Botão de Confirmação */}
                <Button
                    onClick={confirmarPedido}
                    disabled={confirmando}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg shadow-lg shadow-green-900/10"
                >
                    {confirmando ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Confirmando...
                        </>
                    ) : (
                        '✅ Confirmar Pedido'
                    )}
                </Button>

                <p className="text-xs text-gray-400 text-center mt-4">
                    Ao confirmar, uma notificação será enviada para o grupo do WhatsApp.
                </p>
            </div>
        </div>
    );
}
