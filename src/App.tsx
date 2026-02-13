import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
// Shared pages
import AnamneseExternal from "./pages/AnamneseExternal";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import Instructions from "./pages/Instructions";
import Employees from "./pages/Employees";

// Occurrence pages
import OcorrenciasMenu from "./features/occurrences/pages/OcorrenciasMenu";
import AnaliseHistorico from "./pages/Analise";
import Ocorrencias from "./features/occurrences/pages/Ocorrencias";
import OccurrenceDetail from "./features/occurrences/pages/OccurrenceDetail";
import OccurrenceBook from "./features/occurrences/pages/OccurrenceBook";
import Kanbans from "./features/occurrences/pages/Kanbans";
import NovaOcorrencia from "./features/occurrences/pages/NovaOcorrencia";
import NovaOcorrenciaWizard from "./features/occurrences/pages/NovaOcorrenciaWizard";
import NovaOcorrenciaForm from "./features/occurrences/pages/NovaOcorrenciaForm";
import PublicPatientOccurrence from "./features/occurrences/pages/PatientOccurrence";
import SimpleOccurrenceForm from "./features/occurrences/pages/SimpleOccurrenceForm";
import FreeOccurrenceForm from "./features/occurrences/pages/FreeOccurrenceForm";
import PublicRevisaoLaudo from "./features/occurrences/pages/PublicRevisaoLaudo";
import PublicImageGallery from "./features/occurrences/pages/PublicImageGallery";
import AdminTypeSelection from "./features/occurrences/pages/admin/AdminTypeSelection";
import AdminSubtypeSelection from "./features/occurrences/pages/admin/AdminSubtypeSelection";
import AdminOccurrenceForm from "./features/occurrences/pages/admin/AdminOccurrenceForm";
import AdminOccurrenceDetail from "./features/occurrences/pages/AdminOccurrenceDetail";
import AdminKanban from "./features/occurrences/pages/AdminKanban";
import NursingSubtypeSelection from "./features/occurrences/pages/nursing/NursingSubtypeSelection";

// Inspection pages
import Inspections from "./features/inspections/pages/Inspections";
import DispenserOpen from "./features/inspections/pages/forms/dispenser/DispenserOpen";
import DispenserClose from "./features/inspections/pages/forms/dispenser/DispenserClose";
import BanheiroOpen from "./features/inspections/pages/forms/banheiro/BanheiroOpen";
import BanheiroClose from "./features/inspections/pages/forms/banheiro/BanheiroClose";
import BanheiroRalo from "./features/inspections/pages/forms/banheiro/BanheiroRalo";
import CopaRequest from "./features/inspections/pages/forms/copa/CopaRequest";
import ACForm from "./features/inspections/pages/forms/ac/ACForm";
import CilindrosForm from "./features/inspections/pages/forms/CilindrosForm";
import CilindroConfirmacao from "./features/inspections/pages/CilindroConfirmacao";
import DEAForm from "./features/inspections/pages/forms/DEAForm";
import DEAPublicDetail from "./features/inspections/pages/DEAPublicDetail";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/paciente" element={<PublicPatientOccurrence />} />

            {/* Cylinder Confirmation - Public Route (Moved to top for priority) */}
            <Route path="/inspecoes/cilindros/confirmar/:token" element={<CilindroConfirmacao />} />


            {/* Protected routes - all users */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <OcorrenciasMenu />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/historico" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <AnaliseHistorico />
              </ProtectedRoute>
            } />

            {/* Generic ID route moved to bottom */}

            {/* Admin Occurrence Detail */}
            <Route path="/ocorrencias/admin/:id" element={
              <ProtectedRoute>
                <AdminOccurrenceDetail />
              </ProtectedRoute>
            } />

            {/* Admin Kanban */}
            <Route path="/ocorrencias/kanban" element={
              <ProtectedRoute>
                <AdminKanban />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/nova" element={
              <ProtectedRoute>
                <NovaOcorrenciaWizard />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/nova/:tipo" element={
              <ProtectedRoute>
                <NovaOcorrencia />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/nova/:tipo/:subtipo" element={
              <ProtectedRoute>
                <NovaOcorrenciaForm />
              </ProtectedRoute>
            } />


            <Route path="/ocorrencias/nova/simples" element={
              <ProtectedRoute>
                <SimpleOccurrenceForm />
              </ProtectedRoute>
            } />

            <Route path="/ocorrencias/nova-livre" element={
              <ProtectedRoute>
                <FreeOccurrenceForm />
              </ProtectedRoute>
            } />

            {/* Ocorrências Administrativas */}
            <Route path="/ocorrencias/nova/administrativa" element={
              <ProtectedRoute>
                <AdminTypeSelection />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/nova/administrativa/:typeId" element={
              <ProtectedRoute>
                <AdminSubtypeSelection />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias/nova/administrativa/:typeId/:subtypeId" element={
              <ProtectedRoute>
                <AdminOccurrenceForm />
              </ProtectedRoute>
            } />

            {/* Ocorrências Enfermagem */}
            <Route path="/ocorrencias/nova/enfermagem" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <NursingSubtypeSelection />
              </ProtectedRoute>
            } />
            <Route path="/kanbans" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <Kanbans />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />

            {/* Protected routes - admin only */}
            <Route path="/analise" element={
              <ProtectedRoute requireAdmin>
                <AnamneseExternal />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute allowedRoles={['admin', 'rh', 'enfermagem']}>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/livro" element={
              <ProtectedRoute allowedRoles={['admin', 'rh', 'enfermagem']}>
                <OccurrenceBook />
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute requireAdmin>
                <Configuracoes />
              </ProtectedRoute>
            } />

            {/* Inspections Dashboard (Admin/Nursing) */}
            <Route path="/inspecoes" element={
              <ProtectedRoute allowedRoles={['admin', 'enfermagem', 'rh']}>
                <Inspections />
              </ProtectedRoute>
            } />

            {/* Employees Management (Admin/RH) */}
            <Route path="/funcionarios" element={
              <ProtectedRoute allowedRoles={['admin', 'rh']}>
                <Employees />
              </ProtectedRoute>
            } />
            {/* Generic Details Route - Must be last in /ocorrencias list */}
            <Route path="/ocorrencias/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <OccurrenceDetail />
              </ProtectedRoute>
            } />

            {/* Public routes for doctors (no auth required) */}
            <Route path="/public/revisao-laudo/:token" element={<PublicRevisaoLaudo />} />
            <Route path="/public/imagens/:token" element={<PublicImageGallery />} />
            <Route path="/instrucoes" element={<Instructions />} />

            {/* Public Inspection Forms */}
            <Route path="/formularios/dispenser/abrir" element={<DispenserOpen />} />
            <Route path="/formularios/dispenser/finalizar" element={<DispenserClose />} />
            <Route path="/formularios/banheiro/abrir" element={<BanheiroOpen />} />
            <Route path="/formularios/banheiro/finalizar" element={<BanheiroClose />} />
            <Route path="/formularios/banheiro/ralo" element={<BanheiroRalo />} />
            <Route path="/formularios/copa" element={<CopaRequest />} />


            {/* AC Forms */}
            <Route path="/formularios/ar-condicionado/imago" element={<ACForm variant="imago" />} />
            <Route path="/formularios/ar-condicionado/terceirizado" element={<ACForm variant="terceirizado" />} />
            <Route path="/formularios/ar-condicionado/dreno" element={<ACForm variant="dreno" />} />

            {/* Cylinder New Form */}
            <Route path="/inspecoes/cilindros" element={<CilindrosForm />} />

            {/* DEA Forms */}
            <Route path="/inspecoes/dea" element={<DEAForm />} />
            <Route path="/inspecoes/dea/view/:protocol" element={<DEAPublicDetail />} />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
