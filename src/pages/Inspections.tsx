import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useInspections } from "@/hooks/useInspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Filter, AlertCircle, CheckCircle2, Snowflake, Bath, Droplets } from "lucide-react";
import { format } from "date-fns";
import { useInspectionDetails } from "@/hooks/useInspections";

// --- SUB-COMPONENT: DETAILS DRAWER (NOW DIALOG) ---
function InspectionDetailsDrawer({ id, tipo, open, onClose }: { id: string, tipo: string, open: boolean, onClose: () => void }) {
    const { data: rawData, isLoading } = useInspectionDetails(id, tipo);
    const data = rawData as any; // Bypass TS check for now

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes da Inspeção</DialogTitle>
                    <DialogDescription>
                        {tipo.toUpperCase().replace("_", " ")} - ID: {id?.slice(0, 8)}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                ) : data ? (
                    <div className="mt-4 space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground">Localização</p>
                                <p className="font-semibold">{data.localizacao}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Criado em</p>
                                <p className="font-medium">{format(new Date(data.criado_em), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            {data.protocolo && (
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Protocolo</p>
                                    <p className="font-mono bg-white border px-2 py-1 rounded w-fit">{data.protocolo}</p>
                                </div>
                            )}
                        </div>

                        {/* Status Section (if applicable) */}
                        {data.status && (
                            <div className={`p-4 rounded-lg border ${data.status === 'aberto' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                <p className="text-sm font-bold flex items-center gap-2">
                                    {data.status === 'aberto' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                    Status: {data.status.toUpperCase()}
                                </p>
                                {data.finalizado_em && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        <p>Finalizado em: {format(new Date(data.finalizado_em), "dd/MM/yyyy HH:mm")}</p>
                                        <p>Por: {data.finalizado_por}</p>
                                        {data.observacoes_finalizacao && <p className="mt-1 italic">"{data.observacoes_finalizacao}"</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dynamic Fields based on Type */}
                        <div className="space-y-4">
                            <h3 className="font-semibold border-b pb-2">Dados do Registro</h3>

                            {tipo === 'ar_condicionado' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-muted-foreground">Origem:</span> {data.origem}</div>
                                        <div><span className="text-muted-foreground">Modelo:</span> {data.modelo || '-'}</div>
                                        <div><span className="text-muted-foreground">Série:</span> {data.numero_serie || '-'}</div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm font-medium mb-1">Checklist realizado:</p>
                                        <ul className="list-disc pl-5 text-sm text-gray-600">
                                            {Array.isArray(data.atividades) && data.atividades.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                            {(!data.atividades || data.atividades.length === 0) && <li>Nenhuma atividade registrada</li>}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {(tipo === 'dispenser' || tipo === 'banheiro') && (
                                <>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Problema Relatado:</span>
                                            <p className="font-medium text-lg">{data.problema}</p>
                                        </div>
                                        {data.descricao && (
                                            <div className="bg-gray-50 p-3 rounded text-sm">
                                                <span className="block text-muted-foreground text-xs mb-1">Descrição:</span>
                                                "{data.descricao}"
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-red-500">Erro ao carregar detalhes.</div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// --- MAIN PAGE ---
export default function Inspections() {
    const [filterType, setFilterType] = useState("todos");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterDays, setFilterDays] = useState("30");

    const [selectedItem, setSelectedItem] = useState<{ id: string, tipo: string } | null>(null);

    const { data: rawInspections = [], isLoading } = useInspections({
        tipo: filterType,
        status: filterStatus,
        days: parseInt(filterDays)
    });

    const inspections = rawInspections as any[]; // Bypass TS

    // Calculate stats
    const stats = {
        total: inspections.length,
        open: inspections.filter(i => i.status === 'aberto').length,
        ac: inspections.filter(i => i.tipo === 'ar_condicionado').length,
        dispenser: inspections.filter(i => i.tipo === 'dispenser').length,
        banheiro: inspections.filter(i => i.tipo === 'banheiro').length,
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'ar_condicionado': return <Snowflake className="h-4 w-4 text-blue-500" />;
            case 'banheiro': return <Bath className="h-4 w-4 text-orange-500" />;
            case 'dispenser': return <Droplets className="h-4 w-4 text-cyan-500" />;
            default: return <CheckCircle2 className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline" className="text-gray-500">Log</Badge>;
        if (status === 'aberto') return <Badge variant="destructive" className="animate-pulse">Aberto</Badge>;
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Finalizado</Badge>;
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-8 w-8" />
                    Painel de Inspeções
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total (Período)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                    </Card>
                    <Card className={stats.open > 0 ? "border-red-200 bg-red-50" : ""}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Chamados Abertos</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-700">{stats.open}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ar Condicionado</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.ac}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Banheiro / Dispenser</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.banheiro + stats.dispenser}</div></CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg shadow-sm border">
                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold mb-1 block">Tipo</label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="dispenser">Dispenser</SelectItem>
                                <SelectItem value="banheiro">Banheiro</SelectItem>
                                <SelectItem value="ar_condicionado">Ar Condicionado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold mb-1 block">Status</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="aberto">Abertos (Pendentes)</SelectItem>
                                <SelectItem value="finalizado">Finalizados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold mb-1 block">Período</label>
                        <Select value={filterDays} onValueChange={setFilterDays}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Últimos 7 dias</SelectItem>
                                <SelectItem value="30">Últimos 30 dias</SelectItem>
                                <SelectItem value="90">Últimos 3 meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" onClick={() => { setFilterType("todos"); setFilterStatus("todos"); }} className="mb-[2px]">
                        <Filter className="mr-2 h-4 w-4" /> Limpar
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Localização</TableHead>
                                <TableHead>Detalhe / Resumo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 inline" /></TableCell></TableRow>
                            ) : inspections.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum registro encontrado no período.</TableCell></TableRow>
                            ) : (
                                inspections.map((item) => (
                                    <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedItem({ id: item.id, tipo: item.tipo })}>
                                        <TableCell>{getIcon(item.tipo)}</TableCell>
                                        <TableCell className="font-medium capitalize">{item.tipo.replace("_", " ")}</TableCell>
                                        <TableCell>{item.localizacao}</TableCell>
                                        <TableCell className="max-w-[300px] truncate text-muted-foreground" title={item.resumo}>{item.resumo}</TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-xs text-gray-500">{format(new Date(item.criado_em), "dd/MM/yy HH:mm")}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">Detalhes</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Details Drawer */}
                {selectedItem && (
                    <InspectionDetailsDrawer
                        open={!!selectedItem}
                        id={selectedItem.id}
                        tipo={selectedItem.tipo}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </div>
        </MainLayout>
    );
}
