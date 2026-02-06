import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InspectionOverview = {
    id: string;
    tipo: 'dispenser' | 'banheiro' | 'ar_condicionado' | 'cilindros' | 'servico_terceirizado';
    localizacao: string;
    status?: 'aberto' | 'finalizado';
    criado_em: string;
    finalizado_em?: string;
    resumo: string;
};

export function useInspections(filters?: {
    tipo?: string;
    status?: string;
    days?: number
}) {
    return useQuery({
        queryKey: ["inspections", filters],
        queryFn: async () => {
            let query = supabase
                .from("inspections_overview" as any) // Using the View
                .select("*")
                .order("criado_em", { ascending: false });

            if (filters?.tipo && filters.tipo !== "todos") {
                query = query.eq("tipo", filters.tipo);
            }

            if (filters?.status && filters.status !== "todos") {
                query = query.eq("status", filters.status);
            }

            if (filters?.days) {
                const date = new Date();
                date.setDate(date.getDate() - filters.days);
                query = query.gte("criado_em", date.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching inspections:", error);
                throw error;
            }

            return data as unknown as InspectionOverview[];
        },
    });
}

export function useInspectionDetails(id: string, tipo: string) {
    return useQuery({
        queryKey: ["inspection_details", id, tipo],
        queryFn: async () => {
            let tableName = "";

            switch (tipo) {
                case "dispenser": tableName = "inspections_dispenser"; break;
                case "banheiro": tableName = "inspections_banheiro"; break;
                case "ar_condicionado": tableName = "inspections_ac"; break;
                case "cilindros": tableName = "inspecoes_cilindros"; break;
                default: throw new Error("Tipo desconhecido");
            }

            const { data, error } = await supabase
                .from(tableName as any)
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id && !!tipo
    });
}
