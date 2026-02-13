import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useInspections, useInspectionDetails, InspectionOverview } from "@/features/inspections/hooks/useInspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
<<<<<<< HEAD
import { Loader2, Filter, AlertCircle, CheckCircle2, Snowflake, Bath, Droplets, Coffee, Battery } from "lucide-react";
=======
import { Loader2, Filter, AlertCircle, CheckCircle2, Snowflake, Bath, Droplets } from "lucide-react";
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
import { format } from "date-fns";
import { formatProblemType } from "@/lib/utils";
import { InspectionCharts } from "@/features/inspections/components/InspectionCharts";

// --- SUB-COMPONENT: DETAILS DRAWER (DIALOG) ---
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
                        {tipo?.toUpperCase().replace("_", " ")} - ID: {id?.slice(0, 8)}
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
                                    {data.fotos_urls && data.fotos_urls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Fotos:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {data.fotos_urls.map((url: string, i: number) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer">
                                                        <img src={url} className="h-20 w-20 object-cover rounded border hover:opacity-80 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {(tipo === 'dispenser' || tipo === 'banheiro') && (
                                <>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Problema Relatado:</span>
                                            <p className="font-medium text-lg">{formatProblemType(data.problema)}</p>
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

                            {tipo === 'cilindros' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <div>
                                            <p className="text-xs text-purple-700 font-medium">Oxigênio</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${data.precisa_oxigenio ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <p className="font-semibold">{data.precisa_oxigenio ? 'Reposição Necessária' : 'OK'}</p>
                                            </div>
                                            {data.precisa_oxigenio && (
                                                <p className="text-sm mt-1">Qtd: <strong>{data.qtd_oxigenio}</strong></p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-700 font-medium">Ar Comprimido</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${data.precisa_ar ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <p className="font-semibold">{data.precisa_ar ? 'Reposição Necessária' : 'OK'}</p>
                                            </div>
                                            {data.precisa_ar && (
                                                <p className="text-sm mt-1">Qtd: <strong>{data.qtd_ar}</strong></p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                                        <p className="p-3 bg-gray-50 rounded border text-sm">{data.observacoes || 'Nenhuma observação.'}</p>
                                    </div>

                                    {data.fotos_urls && data.fotos_urls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Fotos:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {data.fotos_urls.map((url: string, i: number) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer">
                                                        <img src={url} className="h-24 w-24 object-cover rounded border hover:opacity-80 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
<<<<<<< HEAD

                            {tipo === 'cafe_agua' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-800 font-medium uppercase mb-1">Item Solicitado</p>
                                        <div className="flex items-center gap-2 text-amber-900">
                                            {data.item === 'Café' ? <Coffee className="h-6 w-6" /> : <Droplets className="h-6 w-6" />}
                                            <span className="text-xl font-bold">{data.item}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Localização:</span>
                                        <p className="text-base font-medium">{data.localizacao}</p>
                                    </div>
                                </div>
                            )}

                            {tipo === 'dea' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-rose-800 font-medium uppercase mb-1">Bateria</p>
                                            <div className="flex items-center gap-2 text-rose-900">
                                                <Battery className="h-6 w-6" />
                                                <span className="text-2xl font-bold">{data.bateria_porcentagem}%</span>
                                            </div>
                                        </div>
                                        <div className="h-12 w-12 rounded-full border-4 border-rose-200 flex items-center justify-center bg-white text-xs font-bold text-rose-600">
                                            {data.bateria_porcentagem}%
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                                        <p className="p-3 bg-gray-50 rounded border text-sm">{data.observacoes || 'Nenhuma observação.'}</p>
                                    </div>

                                    {data.fotos_urls && data.fotos_urls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Evidência Fotográfica:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {data.fotos_urls.map((url: string, i: number) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer">
                                                        <img src={url} className="h-24 w-24 object-cover rounded border hover:opacity-80 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
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
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterDays, setFilterDays] = useState("30");
    const [selectedItem, setSelectedItem] = useState<{ id: string, tipo: string } | null>(null);

    // Note: filterType is now handled by Tabs logic or filtering locally
    const { data: rawInspections = [], isLoading } = useInspections({
        tipo: "todos", // Fetch all, filter locally per tab to avoid request spam
        status: filterStatus,
        days: parseInt(filterDays)
    });

    const inspections = rawInspections as InspectionOverview[];

    // Segregate Data
    const dispenserData = inspections.filter(i => i.tipo === 'dispenser');
    const banheiroData = inspections.filter(i => i.tipo === 'banheiro');
    const acData = inspections.filter(i => i.tipo === 'ar_condicionado');
<<<<<<< HEAD
    // @ts-ignore
    const cilindrosData = inspections.filter(i => i.tipo === 'cilindros');
    // @ts-ignore
    const copaData = inspections.filter(i => i.tipo === 'cafe_agua');
    // @ts-ignore
    const deaData = inspections.filter(i => i.tipo === 'dea');
=======
    // @ts-ignore - 'cilindros' might not be in the type yet if hook isn't updated, but runtime it exists
    const cilindrosData = inspections.filter(i => i.tipo === 'cilindros');
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91

    // Stats
    const stats = {
        total: inspections.length,
        open: inspections.filter(i => i.status === 'aberto').length,
        dispenser: dispenserData.length,
        banheiro: banheiroData.length,
        ac: acData.length,
        cilindros: cilindrosData.length,
<<<<<<< HEAD
        copa: copaData.length,
        dea: deaData.length,
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'ar_condicionado': return <Snowflake className="h-4 w-4 text-blue-500" />;
            case 'banheiro': return <Bath className="h-4 w-4 text-orange-500" />;
            case 'dispenser': return <Droplets className="h-4 w-4 text-cyan-500" />;
            case 'cilindros': return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
<<<<<<< HEAD
            case 'cafe_agua': return <Coffee className="h-4 w-4 text-amber-600" />;
            case 'dea': return <Battery className="h-4 w-4 text-rose-600" />;
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
            default: return <CheckCircle2 className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline" className="text-gray-500">Log</Badge>;
        if (status === 'aberto') return <Badge variant="destructive" className="animate-pulse">Aberto</Badge>;
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Finalizado</Badge>;
    };

    const renderTable = (data: any[], emptyMsg: string) => (
        <div className="bg-white rounded-lg shadow border overflow-hidden mt-4">
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
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{emptyMsg}</TableCell></TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedItem({ id: item.id, tipo: item.tipo })}>
                                <TableCell>{getIcon(item.tipo)}</TableCell>
                                <TableCell className="font-medium capitalize">{item.tipo.replace("_", " ")}</TableCell>
                                <TableCell>{item.localizacao}</TableCell>
                                <TableCell className="max-w-[300px] truncate text-muted-foreground" title={item.resumo}>{formatProblemType(item.resumo)}</TableCell>
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
    );

    return (
        <MainLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                        <CheckCircle2 className="h-8 w-8" />
                        Painel de Inspeções
                    </h1>

                    {/* Global Filters */}
                    <div className="flex gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Status: Todos</SelectItem>
                                <SelectItem value="aberto">Abertos</SelectItem>
                                <SelectItem value="finalizado">Finalizados</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDays} onValueChange={setFilterDays}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="90">90 dias</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-white border shadow-sm rounded-xl mb-4">
                        <TabsTrigger value="overview" className="py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Visão Geral</TabsTrigger>
                        <TabsTrigger value="dispenser" className="py-2.5 rounded-lg data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">Dispensers</TabsTrigger>
                        <TabsTrigger value="banheiro" className="py-2.5 rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Banheiros</TabsTrigger>
                        <TabsTrigger value="ac" className="py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Climatização</TabsTrigger>
                        <TabsTrigger value="reports" className="py-2.5 rounded-lg data-[state=active]:bg-gray-100">Relatórios</TabsTrigger>

                        {/* New Placeholders */}
                        <TabsTrigger value="cilindros" className="py-2.5 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Cilindros</TabsTrigger>
                        <TabsTrigger value="chiller" className="py-2.5 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Chiller</TabsTrigger>
                        <TabsTrigger value="dea" className="py-2.5 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">DEA</TabsTrigger>
                        <TabsTrigger value="cafe_agua" className="py-2.5 rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">Café e Água</TabsTrigger>
                    </TabsList>

                    {/* --- Visão Geral --- */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        {/* Stats Cards Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card className="md:col-span-1 border-l-4 border-l-primary">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Total Geral</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                            </Card>
                            <Card className={stats.open > 0 ? "md:col-span-1 border-red-200 bg-red-50" : "md:col-span-1"}>
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-red-600">Pendentes</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold text-red-700">{stats.open}</div></CardContent>
                            </Card>
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Ar Condicionado</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.ac}</div></CardContent>
                            </Card>
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Dispensers</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.dispenser}</div></CardContent>
                            </Card>
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Cilindros</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.cilindros}</div></CardContent>
                            </Card>
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Banheiros</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.banheiro}</div></CardContent>
                            </Card>
<<<<<<< HEAD
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">Copa (Água/Café)</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.copa}</div></CardContent>
                            </Card>
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs font-medium text-muted-foreground">DEA</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{stats.dea}</div></CardContent>
                            </Card>
=======
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                        </div>

                        <InspectionCharts data={inspections} type="geral" />
                        {renderTable(inspections, "Nenhum registro encontrado.")}
                    </TabsContent>

                    {/* --- Dispensers --- */}
                    <TabsContent value="dispenser" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-cyan-800">Dashboard de Dispensers</h2>
                            <Badge variant="outline" className="text-cyan-600 bg-cyan-50">{dispenserData.length} Registros</Badge>
                        </div>
                        <InspectionCharts data={dispenserData} type="dispenser" />
                        {renderTable(dispenserData, "Nenhuma inspeção de dispenser encontrada.")}
                    </TabsContent>

                    {/* --- Banheiros --- */}
                    <TabsContent value="banheiro" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-orange-800">Dashboard de Banheiros</h2>
                            <Badge variant="outline" className="text-orange-600 bg-orange-50">{banheiroData.length} Registros</Badge>
                        </div>
                        <InspectionCharts data={banheiroData} type="banheiro" />
                        {renderTable(banheiroData, "Nenhuma inspeção de banheiro encontrada.")}
                    </TabsContent>

                    {/* --- AC --- */}
                    <TabsContent value="ac" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-blue-800">Dashboard de Climatização</h2>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50">{acData.length} Registros</Badge>
                        </div>
                        <InspectionCharts data={acData} type="ar_condicionado" />
                        {renderTable(acData, "Nenhuma manutenção de AC encontrada.")}
                    </TabsContent>

                    {/* --- Reports Preview --- */}
                    <TabsContent value="reports" className="mt-6">
                        <div className="p-8 text-center border-2 border-dashed rounded-xl bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-700">Central de Relatórios</h3>
                            <p className="text-gray-500 mb-4">Exporte dados consolidados para análise externa.</p>
                            <Button variant="outline" onClick={() => window.print()}>Exportar PDF (Print)</Button>
                        </div>
                    </TabsContent>

                    {/* --- Cilindros --- */}
                    <TabsContent value="cilindros" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-purple-800">Dashboard de Cilindros</h2>
                            <Badge variant="outline" className="text-purple-600 bg-purple-50">{cilindrosData.length} Registros</Badge>
                        </div>
                        <InspectionCharts data={cilindrosData} type="cilindros" />
                        {renderTable(cilindrosData, "Nenhuma inspeção de cilindros encontrada.")}
                    </TabsContent>

<<<<<<< HEAD
                    {/* --- Cafe e Agua --- */}
                    <TabsContent value="cafe_agua" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-amber-800">Dashboard de Copa</h2>
                            <Badge variant="outline" className="text-amber-600 bg-amber-50">{copaData.length} Registros</Badge>
                        </div>
                        <InspectionCharts data={copaData} type="cafe_agua" />
                        {renderTable(copaData, "Nenhuma solicitação de copa encontrada.")}
                    </TabsContent>

                    {/* --- DEA --- */}
                    <TabsContent value="dea" className="mt-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-rose-800">Dashboard de DEA (Desfibrilador)</h2>
                            <Badge variant="outline" className="text-rose-600 bg-rose-50">{deaData.length} Registros</Badge>
                        </div>
                        {renderTable(deaData, "Nenhum registro de DEA encontrado.")}
                    </TabsContent>

                    {/* --- Placeholders Content --- */}
                    {['chiller'].map((key) => (
=======
                    {/* --- Placeholders Content --- */}
                    {['chiller', 'dea', 'cafe_agua'].map((key) => (
>>>>>>> cc41edc2712e5cd54dc9f3e9376e17f0ef54cf91
                        <TabsContent key={key} value={key} className="mt-6">
                            <div className="p-12 text-center border rounded-xl bg-gray-50">
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">Em Breve</h3>
                                <p className="text-gray-500">O módulo de {key.replace('_', ' ').toUpperCase()} está em desenvolvimento.</p>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

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
