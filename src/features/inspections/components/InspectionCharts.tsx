import { useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InspectionOverview } from "@/features/inspections/hooks/useInspections";
import { format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatProblemType } from "@/lib/utils";

interface InspectionChartsProps {
    data: InspectionOverview[];
<<<<<<< HEAD
    type: "geral" | "dispenser" | "banheiro" | "ar_condicionado" | "cilindros" | "cafe_agua";
=======
    type: "geral" | "dispenser" | "banheiro" | "ar_condicionado" | "cilindros";
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function InspectionCharts({ data, type }: InspectionChartsProps) {

    // 1. Prepare Data for Daily Volume Chart
    const dailyData = useMemo(() => {
        const counts: Record<string, number> = {};

        // Sort logic to ensure we cover the range or at least show existing days
        data.forEach(item => {
            const dateKey = format(parseISO(item.criado_em), "dd/MM", { locale: ptBR });
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => {
                // Simple sort by string date dd/MM works for same month, but risky across months. 
                // Better to rely on the hook's DESC sort, so we just reverse here if needed or let Recharts handle it.
                // Let's just return as is mapped, assuming keys order (not guaranteed in JS object).
                // A better approach:
                return 0;
            })
            // Force consistent order if possible, but for MVP object.entries is "okay" usually.
            // Let's sort manually to be safe.
            .sort((a, b) => {
                const [d1, m1] = a.date.split('/').map(Number);
                const [d2, m2] = b.date.split('/').map(Number);
                return (m1 * 31 + d1) - (m2 * 31 + d2);
            });
    }, [data]);

    // 2. Prepare Data for Problems/Summary Pie Chart
    const problemData = useMemo(() => {
        const counts: Record<string, number> = {};

        data.forEach(item => {
            // Use resumo field which contains the problem or origin info
            // For AC: "Origem - Modelo"
            // For Banheiro/Dispenser: "Problema"
            let key = formatProblemType(item.resumo) || "Não especificado";

            // Clean up AC specific strings if needed
            if (type === 'ar_condicionado') {
                // Maybe just group by Origin for cleaner chart?
                // item.resumo looks like "imago - Samsung"
                const origin = key.split(' - ')[0];
                key = origin;
            }

            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Descending
    }, [data, type]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Chart 1: Daily Volume */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Volume Diário</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="count" name="Inspeções" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chart 2: Problems Distribution */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        {type === 'ar_condicionado' ? "Por Origem (Equipe)" :
<<<<<<< HEAD
                            type === 'cilindros' ? "Status" :
                                type === 'cafe_agua' ? "Item Solicitado" :
                                    type === 'dea' ? "Nível de Bateria" : "Tipos de Problema"}
=======
                            type === 'cilindros' ? "Status" : "Tipos de Problema"}
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full flex justify-center">
                        {problemData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={problemData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {problemData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
