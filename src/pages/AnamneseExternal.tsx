import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { FilePlus2, HardHat, ShieldCheck, ChevronLeft } from "lucide-react";

export default function AnamneseExternal() {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);

    const handleNavigate = (url: string) => {
        setCurrentUrl(url);
    };

    const handleBack = () => {
        setCurrentUrl(null);
    };

    return (
        <MainLayout>
            <div className="w-full h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-border bg-card relative flex flex-col">
                {currentUrl ? (
                    <>
                        <div className="p-2 border-b border-border bg-background flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="gap-2 text-muted-foreground hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                        </div>
                        <iframe
                            src={currentUrl}
                            title="Anamnese Externa"
                            className="w-full h-full border-none flex-1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in-95 duration-500">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Portal de Anamnese</h1>
                        <p className="text-muted-foreground mb-12 text-lg">Selecione uma opção para acessar o sistema externo</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                            <Button
                                onClick={() => handleNavigate("https://anamnese.imagoradiologia.cloud/")}
                                className="h-48 text-xl flex flex-col gap-4 bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                            >
                                <div className="p-4 rounded-full bg-white/20">
                                    <FilePlus2 className="h-12 w-12" />
                                </div>
                                <span>Nova Anamnese</span>
                            </Button>

                            <Button
                                onClick={() => handleNavigate("https://anamnese.imagoradiologia.cloud/tecnico")}
                                className="h-48 text-xl flex flex-col gap-4 bg-emerald-600 hover:bg-emerald-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                            >
                                <div className="p-4 rounded-full bg-white/20">
                                    <HardHat className="h-12 w-12" />
                                </div>
                                <span>Área do Técnico</span>
                            </Button>

                            <Button
                                onClick={() => handleNavigate("https://anamnese.imagoradiologia.cloud/admin")}
                                className="h-48 text-xl flex flex-col gap-4 bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                            >
                                <div className="p-4 rounded-full bg-white/20">
                                    <ShieldCheck className="h-12 w-12" />
                                </div>
                                <span>Área do Administrador</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
