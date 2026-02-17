import { useACUnits, ACUnit } from "../../hooks/useACUnits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, CheckCircle2, AlertCircle, Snowflake } from "lucide-react";

interface ACUnitTableProps {
    onRowClick: (id: string, tipo: string) => void;
}

export function ACUnitTable({ onRowClick }: ACUnitTableProps) {
    const { data: units, isLoading } = useACUnits();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>Localização</TableHead>
                        <TableHead>Modelo / Série</TableHead>
                        <TableHead>Manutenção (4m)</TableHead>
                        <TableHead>Limpeza Imago (2m)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {units?.map((unit: ACUnit) => (
                        <TableRow key={unit.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{unit.localizacao}</span>
                                    <span className="text-[10px] text-gray-400">QR: {unit.id_qrcode}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-gray-600">
                                    <p className="font-semibold">{unit.modelo}</p>
                                    <p className="text-xs font-mono">{unit.numero_serie}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${unit.maintenance_status === 'revisado' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold ${unit.maintenance_status === 'revisado' ? 'text-green-700' : 'text-red-700'}`}>
                                            {unit.maintenance_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Última: {unit.last_maintenance_date ? format(new Date(unit.last_maintenance_date), "dd/MM/yy") : "Nunca"}
                                    </p>
                                    <p className="text-[10px] font-medium text-blue-600">
                                        Prevista: {format(unit.next_maintenance_date, "dd/MM/yy")}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${unit.cleaning_status === 'Ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold ${unit.cleaning_status === 'Ok' ? 'text-green-700' : 'text-red-700'}`}>
                                            {unit.cleaning_status === 'Ok' ? 'OK' : 'AGUARDANDO LIMPEZA'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Última: {unit.last_cleaning_imago_date ? format(new Date(unit.last_cleaning_imago_date), "dd/MM/yy") : "Nunca"}
                                    </p>
                                    <p className="text-[10px] font-medium text-blue-600">
                                        Prevista: {format(unit.next_cleaning_date, "dd/MM/yy")}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!unit.latest_inspection_id}
                                    onClick={() => unit.latest_inspection_id && onRowClick(unit.latest_inspection_id, 'ar_condicionado')}
                                    className="text-xs h-8"
                                >
                                    {unit.latest_inspection_id ? "Última Revisão" : "Sem Histórico"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!units || units.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                Nenhum ar-condicionado cadastrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
