import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicFormLayout } from "@/layouts/PublicFormLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Droplets, Coffee, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CopaRequest() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Read URL params
    const action = searchParams.get("action");
    const waterParam = searchParams.get("water");
    const coffeeParam = searchParams.get("coffee");

    const isFinalizeMode = action === "finalize";

    // If no param is provided, show both by default ONLY in request mode
    const showWater = waterParam === "true" || (!isFinalizeMode && !waterParam && !coffeeParam);
    const showCoffee = coffeeParam === "true" || (!isFinalizeMode && !waterParam && !coffeeParam);

    // Fallback for finalize mode if somehow no param is present
    const isGenericFinalize = isFinalizeMode && !waterParam && !coffeeParam;
    const finalShowWater = showWater || isGenericFinalize;
    const finalShowCoffee = showCoffee || isGenericFinalize;
    const locationParam = searchParams.get("localizacao") || "Copa";

    // Finalize Mode State
    const [responsavelName, setResponsavelName] = useState("");

    const handleRequest = async (item: string) => {
        setIsSubmitting(true);
        try {
            // Generate Protocol
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomPart = Math.floor(1000 + Math.random() * 9000);
            const protocol = `COPA-${today}-${randomPart}`;

            // Construct a proper Finalize URL for the webhook
            const finalizeUrl = new URL(window.location.origin + window.location.pathname);
            finalizeUrl.searchParams.set("action", "finalize");
            finalizeUrl.searchParams.set("localizacao", locationParam);
            if (item === "Água") finalizeUrl.searchParams.set("water", "true");
            if (item === "Café") finalizeUrl.searchParams.set("coffee", "true");

            const gpMessage = `⚠️ *SOLICITAÇÃO DE ABASTECIMENTO*
*Protocolo:* ${protocol}
*Item:* ${item}
*Local:* ${locationParam}

Clique para finalizar quando realizar o abastecimento.`;

            // 1. Insert into Supabase
            const { error: dbError } = await supabase.from("inspections_copa" as any).insert({
                protocolo: protocol,
                localizacao: locationParam,
                item: item,
                status: 'aberto'
            });

            if (dbError) throw dbError;

            // 2. Send Webhook
            await fetch("https://n8n.imagoradiologia.cloud/webhook/Gelaguas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_type: "abrir",
                    item: item,
                    location: locationParam,
                    gp_message: gpMessage,
                    current_url: finalizeUrl.toString(), // Send the link to finalize THIS item
                    protocol: protocol
                })
            });

            setSuccessMessage(`Solicitação de ${item} em ${locationParam} enviada com sucesso! Protocolo: ${protocol}`);
            setIsSuccess(true);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao enviar solicitação",
                description: error.message || "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!responsavelName.trim()) {
            toast({
                title: "Nome obrigatório",
                description: "Por favor, digite seu nome para finalizar.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Determine active items being finalized based on URL params
            let itemsFinalized = [];
            if (showWater) itemsFinalized.push("Água");
            if (showCoffee) itemsFinalized.push("Café");

            // If somehow nothing is in URL but we are here, use default behavior or both
            if (itemsFinalized.length === 0) {
                if (finalShowWater) itemsFinalized.push("Água");
                if (finalShowCoffee) itemsFinalized.push("Café");
            }

            const itemDesc = itemsFinalized.length > 0 ? itemsFinalized.join(" e ") : "Item";

            const gpMessage = `✅ *Resolvido:* O abastecimento de *${itemDesc}* em *${locationParam}* foi realizado por *${responsavelName}*.`;

            // 1. Update Supabase (Close open requests for this location/item)
            let query = supabase.from("inspections_copa" as any)
                .update({
                    status: 'finalizado',
                    finalizado_por: responsavelName,
                    finalizado_em: new Date().toISOString()
                })
                .eq('localizacao', locationParam)
                .eq('status', 'aberto');

            if (showWater && !showCoffee) {
                query = query.eq('item', 'Água');
            } else if (showCoffee && !showWater) {
                query = query.eq('item', 'Café');
            }

            const { error: dbError } = await query;
            if (dbError) throw dbError;

            // 2. Send Webhook
            await fetch("https://n8n.imagoradiologia.cloud/webhook/Gelaguas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_type: "finalizar",
                    responsavel: responsavelName,
                    gp_message: gpMessage,
                    location: locationParam,
                    item: itemDesc
                })
            });

            setSuccessMessage("Abastecimento registrado com sucesso!");
            setIsSuccess(true);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao finalizar",
                description: error.message || "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <PublicFormLayout title="Copa" subtitle={isFinalizeMode ? "Finalização" : "Solicitação"}>
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
                    <p className="text-gray-600 mb-6">
                        {successMessage}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Voltar
                    </Button>
                </div>
            </PublicFormLayout>
        );
    }

    return (
        <PublicFormLayout title="Copa" subtitle={isFinalizeMode ? "Finalizar Abastecimento" : "Solicitar Abastecimento"}>
            <div className="p-6">

                {/* 
                  SCENARIO A: REQUEST MODE 
                  Show buttons if water=true or coffee=true
                */}
                {!isFinalizeMode && (
                    <div className="grid gap-6">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500">Localização</p>
                            <h2 className="text-xl font-bold text-gray-800">{locationParam}</h2>
                        </div>

                        {!showWater && !showCoffee && (
                            <div className="text-center text-gray-500 py-10">
                                Nenhum item selecionado na URL. (use ?water=true ou ?coffee=true)
                            </div>
                        )}

                        {showWater && (
                            <Button
                                onClick={() => handleRequest("Água")}
                                disabled={isSubmitting}
                                className="h-24 text-xl flex flex-col gap-2 bg-blue-500 hover:bg-blue-600"
                            >
                                <Droplets className="h-8 w-8" />
                                <span>Solicitar Água</span>
                            </Button>
                        )}

                        {showCoffee && (
                            <Button
                                onClick={() => handleRequest("Café")}
                                disabled={isSubmitting}
                                className="h-24 text-xl flex flex-col gap-2 bg-amber-700 hover:bg-amber-800"
                            >
                                <Coffee className="h-8 w-8" />
                                <span>Solicitar Café</span>
                            </Button>
                        )}

                        {isSubmitting && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Enviando solicitação...
                            </div>
                        )}
                    </div>
                )}

                {/* 
                  SCENARIO B: FINALIZE MODE 
                  Show form to confirm resolution
                */}
                {isFinalizeMode && (
                    <form onSubmit={handleFinalize} className="space-y-6">
                        <div className="text-center mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Finalizando Abastecimento</p>
                            <div className="mt-2 space-y-1">
                                <p className="text-gray-800"><span className="font-bold">Local:</span> {locationParam}</p>
                                <p className="text-gray-800">
                                    <span className="font-bold">Item:</span>{' '}
                                    {finalShowWater && finalShowCoffee ? "Água e Café" : finalShowWater ? "Água" : finalShowCoffee ? "Café" : "Solicitação"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Seu Nome
                            </label>
                            <Input
                                id="name"
                                placeholder="Digite seu nome..."
                                value={responsavelName}
                                onChange={(e) => setResponsavelName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Confirmando...
                                </>
                            ) : (
                                "Confirmar que já abasteci"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </PublicFormLayout>
    );
}
