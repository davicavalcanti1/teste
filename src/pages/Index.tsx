import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Coffee,
  Battery,
  ArrowRight,
  Gauge,
  Rocket,
  Bot,
  LineChart,
  Sparkles
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-500">

        {/* Hero Section */}
        <section className="relative rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8 md:p-12 text-white shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">
          {/* Decorative circles/blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-100 backdrop-blur-md border border-blue-400/30 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Nova Versão Disponível
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Imago 2.0
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed mb-8 max-w-2xl">
              Bem-vindo à evolução da nossa plataforma de controle operacional.
              Uma interface moderna, novos módulos de inspeção e ferramentas desenhadas para transformar sua rotina.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 hover:text-blue-950 font-bold rounded-full px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => navigate('/inspecoes')}
              >
                Ver Inspeções <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-400 text-blue-100 hover:bg-blue-800/50 hover:text-white rounded-full px-8 backdrop-blur-sm"
                onClick={() => navigate('/funcionarios')}
              >
                Funcionários
              </Button>
            </div>
          </div>
        </section>

        {/* New Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Cilindros */}
          <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-default">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors duration-300">
                <Gauge className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle className="text-xl">Cilindros</CardTitle>
              <CardDescription>Controle & Segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Novo módulo para inspeção rigorosa de cilindros, com rastreabilidade digital e confirmação por QR Code.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Funcionários */}
          <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-default">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors duration-300">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
              <CardTitle className="text-xl">Funcionários</CardTitle>
              <CardDescription>Gestão de Equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Área dedicada para administração de colaboradores, facilitando o acesso a dados cadastrais e função.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Copa */}
          <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-default">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors duration-300">
                <Coffee className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Copa</CardTitle>
              <CardDescription>Água & Café</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sistema simplificado para solicitações de reposição de suprimentos de copa e bem-estar.
              </p>
            </CardContent>
          </Card>

          {/* Card 4: DEA */}
          <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-default">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors duration-300">
                <Battery className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="text-xl">DEA</CardTitle>
              <CardDescription>Equipamentos Vitais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Monitoramento crítico da bateria e status dos Desfibriladores Externos Automáticos da unidade.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Future Steps Section */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Rocket className="h-6 w-6 text-blue-600" />
                O Futuro da Inovação Imago
              </h2>
              <p className="text-slate-600 mt-2 text-lg">Próximos passos para uma operação cada vez mais inteligente.</p>
            </div>
            <Badge variant="outline" className="px-4 py-1.5 border-blue-200 text-blue-700 bg-blue-50/50 rounded-full text-sm font-semibold">
              Roadmap 2026
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Automação Inteligente</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ampliação das integrações sistêmicas (Webhooks/API) para eliminar tarefas repetitivas e garantir fluxo de dados em tempo real.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Manutenção Preditiva</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Análise de dados históricos para antecipar necessidades de manutenção antes que se tornem problemas críticos.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 border border-violet-200">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Experiência Premium</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Foco total em UI/UX, criando interfaces intuitivas, rápidas e visualmente impactantes para todos os colaboradores.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
