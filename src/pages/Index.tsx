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
        <section className="relative rounded-lg bg-primary p-8 md:p-16 text-white shadow-xl overflow-hidden min-h-[400px] flex flex-col justify-center">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center rounded bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-md border border-white/20 mb-6 uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-success mr-2 animate-pulse"></span>
              Plataforma Operacional
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Imago 2.0
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed mb-8 max-w-2xl">
              Bem-vindo à evolução do controle operacional. Uma interface moderna e ferramentas robustas desenhadas para a excelência na saúde.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold rounded px-8 shadow-lg transition-all"
                onClick={() => navigate('/inspecoes')}
              >
                Painel de Inspeções <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded px-8 backdrop-blur-sm"
                onClick={() => navigate('/funcionarios')}
              >
                Gerenciar Equipe
              </Button>
            </div>
          </div>
        </section>

        {/* New Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Cilindros */}
          <Card className="group relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="absolute top-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded bg-primary/5 flex items-center justify-center mb-4 transition-colors duration-300">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Cilindros</CardTitle>
              <CardDescription>Protocolo de Inspeção</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Novo módulo para inspeção rigorosa de cilindros, com rastreabilidade digital e confirmação por QR Code.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Funcionários */}
          <Card className="group relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="absolute top-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded bg-primary/5 flex items-center justify-center mb-4 transition-colors duration-300">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Equipe</CardTitle>
              <CardDescription>Gestão Profissional</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Área dedicada para administração de colaboradores, facilitando o acesso a dados cadastrais e função.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Copa */}
          <Card className="group relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="absolute top-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded bg-primary/5 flex items-center justify-center mb-4 transition-colors duration-300">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Amenidades</CardTitle>
              <CardDescription>Suprimentos e Copa</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sistema simplificado para solicitações de reposição de suprimentos de copa e bem-estar.
              </p>
            </CardContent>
          </Card>

          {/* Card 4: DEA */}
          <Card className="group relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="absolute top-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardHeader>
              <div className="h-12 w-12 rounded bg-primary/5 flex items-center justify-center mb-4 transition-colors duration-300">
                <Battery className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">DEA</CardTitle>
              <CardDescription>Manutenção de Equipamentos</CardDescription>
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
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 rounded-full text-sm font-semibold">
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
