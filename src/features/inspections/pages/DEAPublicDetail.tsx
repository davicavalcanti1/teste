import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Loader2, AlertCircle, Battery } from "lucide-react";
import { format } from "date-fns";

export default function DEAPublicDetail() {
    const { protocol } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetails() {
            if (!protocol) return;
            try {
                const { data: inspection, error } = await (supabase as any)
                    .from("inspections_dea")
                    .select("*")
                    .eq("protocolo", protocol)
                    .single();

                if (error) throw error;
                setData(inspection);
            } catch (err: any) {
                console.error(err);
                setError("Inspeção não encontrada ou erro de conexão.");
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [protocol]);

    if (loading) {
        return (
            <PublicFormLayout title="Detalhes da Inspeção" subtitle="Carregando..." colorTheme="rose">
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>
            </PublicFormLayout>
        );
    }

    if (error || !data) {
        return (
            <PublicFormLayout title="Erro" subtitle="Não Encontrado" colorTheme="rose">
                <div className="flex flex-col items-center p-8 text-center text-red-500">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="font-semibold">{error || "Registro não localizado."}</p>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title={`DEA - ${data.protocolo}`} subtitle="Detalhes da Verificação" colorTheme="rose">
            <div className="p-6 space-y-6">

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100/50">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Data</p>
                        <p className="font-medium text-gray-800">{format(new Date(data.criado_em), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Responsável</p>
                        <p className="font-medium text-gray-800">{data.funcionario}</p>
                    </div>
                </div>

                <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-3">
                        <Battery className="h-8 w-8 text-rose-600" />
                    </div>
                    <p className="text-sm text-rose-800 font-medium uppercase mb-1">Carga da Bateria</p>
                    <p className="text-4xl font-bold text-rose-900">{data.bateria_porcentagem}%</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-2">Localização</p>
                    <p className="p-3 bg-gray-100 rounded-lg font-medium">{data.localizacao}</p>
                </div>

                {data.observacoes && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Observações</p>
                        <p className="p-3 bg-gray-50 rounded-lg text-sm italic border">{data.observacoes}</p>
                    </div>
                )}

                {data.fotos_urls && data.fotos_urls.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Registro Fotográfico</p>
                        <div className="grid grid-cols-2 gap-2">
                            {data.fotos_urls.map((url: string, idx: number) => (
                                <a key={idx} href={url} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border hover:opacity-90">
                                    <img src={url} alt={`Evidência ${idx + 1}`} className="object-cover w-full h-full" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </PublicFormLayout>
    );
}
