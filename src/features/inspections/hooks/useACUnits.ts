import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, isBefore, parseISO } from "date-fns";

export type ACUnit = {
    id: string;
    id_qrcode: number;
    numero_serie: string;
    modelo: string;
    localizacao: string;
    last_maintenance_date?: string;
    last_cleaning_imago_date?: string;
    maintenance_status: "revisado" | "esperando manutenção";
    cleaning_status: "Ok" | "aguardando limpeza";
    next_maintenance_date: Date;
    next_cleaning_date: Date;
    latest_inspection_id?: string;
};

export function useACUnits() {
    return useQuery({
        queryKey: ["ac_units_status"],
        queryFn: async () => {
            // 1. Fetch all AC Units
            const { data: units, error: unitsError } = await supabase
                .from("ac_units" as any)
                .select("*")
                .order("localizacao");

            if (unitsError) throw unitsError;

            // 2. Fetch all AC Inspections to calculate status
            const { data: inspections, error: inspectionsError } = await supabase
                .from("inspections_ac" as any)
                .select("id, numero_serie, criado_em, origem")
                .order("criado_em", { ascending: false });

            if (inspectionsError) throw inspectionsError;

            // 3. Process data
            return (units as any[]).map((unit) => {
                const unitInspections = inspections?.filter(i => i.numero_serie === unit.numero_serie) || [];

                const lastMaintenance = unitInspections[0]; // Ordered by created_at desc
                const lastCleaningImago = unitInspections.find(i => i.origem === 'imago');

                const maintenanceDate = lastMaintenance ? parseISO(lastMaintenance.criado_em) : null;
                const cleaningDate = lastCleaningImago ? parseISO(lastCleaningImago.criado_em) : null;

                const nextMaintenance = maintenanceDate ? addMonths(maintenanceDate, 4) : new Date(0);
                const nextCleaning = cleaningDate ? addMonths(cleaningDate, 2) : new Date(0);

                const now = new Date();

                return {
                    ...unit,
                    last_maintenance_date: lastMaintenance?.criado_em,
                    last_cleaning_imago_date: lastCleaningImago?.criado_em,
                    maintenance_status: (maintenanceDate && isBefore(now, nextMaintenance)) ? "revisado" : "esperando manutenção",
                    cleaning_status: (cleaningDate && isBefore(now, nextCleaning)) ? "Ok" : "aguardando limpeza",
                    next_maintenance_date: nextMaintenance,
                    next_cleaning_date: nextCleaning,
                    latest_inspection_id: lastMaintenance?.id
                } as ACUnit;
            });
        }
    });
}
