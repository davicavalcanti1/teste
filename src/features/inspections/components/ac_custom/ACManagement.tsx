import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InspectionCharts } from "@/features/inspections/components/InspectionCharts";
import { ACUnitTable } from "./ACUnitTable";
import { InspectionOverview } from "@/features/inspections/hooks/useInspections";

interface ACManagementProps {
    data: InspectionOverview[];
    isLoading: boolean;
    onRowClick: (id: string, tipo: string) => void;
}

export function ACManagement({ data, isLoading, onRowClick }: ACManagementProps) {
    return (
        <Tabs defaultValue="ares" className="w-full">
            <TabsList className="bg-gray-100 p-1 rounded-lg mb-4">
                <TabsTrigger value="ares" className="data-[state=active]:bg-white shadow-sm">Ares</TabsTrigger>
                <TabsTrigger value="relatorios" className="data-[state=active]:bg-white shadow-sm">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="ares" className="mt-0">
                <ACUnitTable onRowClick={onRowClick} />
            </TabsContent>

            <TabsContent value="relatorios" className="mt-0 space-y-6">
                <InspectionCharts data={data} type="ar_condicionado" />
                {/* We can also show the generic table here if needed, but the main page already handles overview */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-medium text-gray-700 mb-2">Histórico de Manutenções</h3>
                    <p className="text-sm text-muted-foreground">O histórico completo está disponível na aba "Visão Geral" ou filtrando por tipo.</p>
                </div>
            </TabsContent>
        </Tabs>
    );
}
