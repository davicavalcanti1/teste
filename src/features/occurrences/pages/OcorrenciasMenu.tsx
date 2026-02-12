import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OcorrenciasMenu() {
    const navigate = useNavigate();
    const { role } = useAuth();

    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-8 animate-in fade-in zoom-in-95 duration-500">
                <h1 className="text-3xl font-bold text-foreground mb-2">Central de Ocorrências</h1>
                <p className="text-muted-foreground mb-12 text-lg">Selecione uma opção para gerenciar ocorrências</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {/* Nova Ocorrência */}
                    <Button
                        onClick={() => navigate("/ocorrencias/nova")}
                        className="h-48 text-xl flex flex-col gap-4 bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="p-4 rounded-full bg-white/20">
                            <PlusCircle className="h-12 w-12" />
                        </div>
                        <span>Nova Ocorrência</span>
                        <span className="text-sm font-normal text-white/70">Registrar nova solicitação</span>
                    </Button>

                    {/* Dashboard */}
                    <Button
                        onClick={() => navigate("/ocorrencias/dashboard")}
                        className="h-48 text-xl flex flex-col gap-4 bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="p-4 rounded-full bg-white/20">
                            <BarChart3 className="h-12 w-12" />
                        </div>
                        <span>Dashboard</span>
                        <span className="text-sm font-normal text-white/70">Visualizar gráficos e métricas</span>
                    </Button>

                    {/* Histórico */}
                    <Button
                        onClick={() => navigate("/ocorrencias/historico")}
                        className="h-48 text-xl flex flex-col gap-4 bg-emerald-600 hover:bg-emerald-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="p-4 rounded-full bg-white/20">
                            <History className="h-12 w-12" />
                        </div>
                        <span>Histórico</span>
                        <span className="text-sm font-normal text-white/70">Consultar registros anteriores</span>
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
