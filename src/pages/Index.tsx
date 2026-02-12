import { useNavigate } from "react-router-dom";
import { Plus, Briefcase } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl">
        {/* Empty for now as requested */}
      </div>
    </MainLayout>
  );
}
