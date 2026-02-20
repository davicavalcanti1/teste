import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    Home,
    FileText,
    Columns3,
    BarChart3,
    Settings,
    User,
    LogOut,
    ChevronRight,
    SlidersHorizontal,
    BookOpen,
    CheckCircle2,
    MoreVertical,
    ClipboardList,
    Gauge
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import imagoLogo from "@/assets/imago-logo-transparent.png";

export function Sidebar() {
    const location = useLocation();
    const { toast } = useToast();
    const { profile, tenant, isAdmin, role, signOut } = useAuth();

    // Get user initials
    const userInitials = profile?.full_name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    const navLinks = [
        { href: "/", label: "Início", icon: Home, adminOnly: false },
        { href: "/ocorrencias", label: "Ocorrências", icon: FileText, adminOnly: false },
        { href: "/inspecoes", label: "Inspeções", icon: CheckCircle2, adminOnly: true },
        { href: "/analise", label: "Anamnese", icon: ClipboardList, adminOnly: true },
        { href: "/livro", label: "Livro", icon: BookOpen, adminOnly: false },
        { href: "/ultrassom", label: "Farol USG", icon: Gauge, adminOnly: false },
        { href: "/funcionarios", label: "Funcionários", icon: User, allowedRoles: ['admin', 'rh'] },
    ].filter(link => {
        if (link.adminOnly && !isAdmin) return false;

        if (role === 'rh') {
            if (link.href === '/analise') return false;
        }

        if (role === 'enfermagem') {
            if (link.href === '/analise') return false;
        }

        if (role === 'user') {
            if (link.href === '/livro') return false;
            if (link.href === '/analise') return false;
            if (link.href === '/inspecoes') return false;
        }

        if ((link as any).allowedRoles && (!role || !(link as any).allowedRoles.includes(role))) return false;

        return true;
    });

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-blue-100 bg-blue-50/95 backdrop-blur-xl shadow-xl transition-all duration-300 z-50">
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center px-6 border-b border-blue-100/50">
                <Link to="/" className="flex items-center justify-center w-full">
                    <img
                        src={imagoLogo}
                        alt="Imago"
                        className="h-16 w-auto object-contain transition-transform hover:scale-105"
                    />
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <div className="text-xs font-semibold text-blue-900/50 mb-4 px-2 uppercase tracking-wider">
                    Menu Principal
                </div>

                {navLinks.map((link) => {
                    const isActive = location.pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-visible hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:z-10",
                                isActive
                                    ? "bg-blue-100 text-blue-700 shadow-md ring-1 ring-blue-200" // Active state
                                    : "text-blue-600/80 hover:bg-white hover:text-blue-900" // Inactive state
                            )}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-r-full" />
                            )}

                            <link.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-blue-700" : "text-blue-500/70 group-hover:text-blue-700"
                            )} />

                            <span className="relative z-10">{link.label}</span>

                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-blue-100/50 bg-blue-100/30">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/50 hover:shadow-sm transition-all duration-200 group outline-none">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-colors">
                                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col items-start flex-1 overflow-hidden">
                                <span className="text-sm font-semibold truncate w-full text-left text-blue-900">
                                    {profile?.full_name}
                                </span>
                                <span className="text-xs text-blue-600/80 truncate w-full text-left">
                                    {tenant?.name || role}
                                </span>
                            </div>

                            <MoreVertical className="h-5 w-5 text-blue-400 group-hover:text-blue-700 transition-colors" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 mb-2" side="right">
                        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                            Minha Conta
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/perfil" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </Link>
                        </DropdownMenuItem>

                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link to="/configuracoes" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configurações</span>
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive cursor-pointer bg-red-50/50 hover:bg-red-100/50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
