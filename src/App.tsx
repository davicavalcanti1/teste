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
import Ocorrencias from "./pages/Ocorrencias";
import OccurrenceDetail from "./pages/OccurrenceDetail";
import Kanbans from "./pages/Kanbans";
import Analise from "./pages/Analise";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NovaOcorrencia from "./pages/NovaOcorrencia";
import NovaOcorrenciaWizard from "./pages/NovaOcorrenciaWizard";
import NovaOcorrenciaForm from "./pages/NovaOcorrenciaForm";

import Perfil from "./pages/Perfil";
import OccurrenceBook from "./pages/OccurrenceBook";
import PublicPatientOccurrence from "./pages/PatientOccurrence";
import SimpleOccurrenceForm from "./pages/SimpleOccurrenceForm";
import FreeOccurrenceForm from "./pages/FreeOccurrenceForm";

import PublicRevisaoLaudo from "./pages/PublicRevisaoLaudo";
import NotFound from "./pages/NotFound";
import AdminTypeSelection from "./pages/admin-occurrence/AdminTypeSelection";
import AdminSubtypeSelection from "./pages/admin-occurrence/AdminSubtypeSelection";
import AdminOccurrenceForm from "./pages/admin-occurrence/AdminOccurrenceForm";
import AdminOccurrenceDetail from "./pages/AdminOccurrenceDetail";
import AdminKanban from "./pages/AdminKanban";
import NursingSubtypeSelection from "./pages/nursing-occurrence/NursingSubtypeSelection";
import Instructions from "./pages/Instructions";
import PublicImageGallery from "./pages/PublicImageGallery";
import DispenserOpen from "./pages/forms/dispenser/DispenserOpen";
import DispenserClose from "./pages/forms/dispenser/DispenserClose";
import BanheiroOpen from "./pages/forms/banheiro/BanheiroOpen";
import BanheiroClose from "./pages/forms/banheiro/BanheiroClose";
import ACForm from "./pages/forms/ac/ACForm";
import Inspections from "./pages/Inspections";

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

            {/* Protected routes - all users */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/ocorrencias" element={
              <ProtectedRoute allowedRoles={['admin', 'user', 'rh', 'enfermagem']}>
                <Ocorrencias />
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
                <Analise />
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

            {/* AC Forms */}
            <Route path="/formularios/ar-condicionado/imago" element={<ACForm variant="imago" />} />
            <Route path="/formularios/ar-condicionado/terceirizado" element={<ACForm variant="terceirizado" />} />
            <Route path="/formularios/ar-condicionado/dreno" element={<ACForm variant="dreno" />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
