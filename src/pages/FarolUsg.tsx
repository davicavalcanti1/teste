import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes } from "date-fns"; // Simple waiting time calc
// If date-fns functions are missing, install or use native JS

type FarolItem = {
    id: string;
    nome_paciente: string;
    exame: string;
    data_chegada: string;
    status: string;
};

export default function FarolUsg() {
    const [items, setItems] = useState<FarolItem[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
            setCurrentTime(new Date());
        }, 30000); // 30s
        return () => clearInterval(interval);
    }, []);

    // Update time every second for "live" waiting time feel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // 1s
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        const { data, error } = await supabase
            .from("farol_usg")
            .select("*")
            .order("data_chegada", { ascending: true }) // Oldest first
            .neq("status", "finalizado"); // Only active

        if (error) {
            console.error("Error fetching farol_usg:", error);
        } else {
            setItems(data as FarolItem[] || []);
        }
    };

    const calculateWaitTime = (arrival: string) => {
        const arrivalDate = new Date(arrival);
        const diff = differenceInMinutes(currentTime, arrivalDate);
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col">
            {/* Header */}
            <header className="bg-blue-900/50 border-b border-blue-800 p-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <span className="h-4 w-4 rounded-full bg-green-500 animate-pulse"></span>
                    <h1 className="text-4xl font-bold tracking-wider uppercase text-blue-100">
                        Farol de Ultrassom
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-yellow-400">
                        {format(currentTime, "HH:mm")}
                    </p>
                    <p className="text-sm text-blue-300 uppercase tracking-widest">
                        Tempo Real
                    </p>
                </div>
            </header>

            {/* Main Content - Table */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-12 gap-4 mb-4 text-sm uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 font-semibold">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Paciente</div>
                    <div className="col-span-4">Exame / Procedimento</div>
                    <div className="col-span-2 text-right">Tempo de Espera</div>
                </div>

                <div className="space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-20 text-slate-600 text-2xl">
                            Nenhum paciente aguardando no momento.
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-12 gap-4 items-center bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
                            >
                                <div className="col-span-1 text-center font-mono text-2xl text-slate-500 font-bold">
                                    {index + 1}
                                </div>
                                <div className="col-span-5 text-3xl font-bold text-white truncate">
                                    {item.nome_paciente}
                                </div>
                                <div className="col-span-4 text-xl text-blue-300 truncate">
                                    {item.exame}
                                </div>
                                <div className="col-span-2 text-right font-mono text-3xl font-bold text-yellow-400 drop-shadow-md">
                                    {calculateWaitTime(item.data_chegada)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Footer / Legend */}
            <footer className="p-4 bg-slate-900 text-center text-slate-500 text-sm">
                Atualização automática a cada 30 segundos • Sistema Imago
            </footer>
        </div>
    );
}
