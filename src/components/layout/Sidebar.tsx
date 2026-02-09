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
    MoreVertical
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
        { href: "/kanbans", label: "Kanbans", icon: Columns3, adminOnly: false },
        { href: "/inspecoes", label: "Inspeções", icon: CheckCircle2, adminOnly: false },
        { href: "/analise", label: "Análise", icon: SlidersHorizontal, adminOnly: true },
        { href: "/relatorios", label: "Dashboard", icon: BarChart3, adminOnly: false },
        { href: "/livro", label: "Livro", icon: BookOpen, adminOnly: false },
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
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-border/50 bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-xl transition-all duration-300 z-50">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-border/40">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <img
                            src={imagoLogo}
                            alt="Imago"
                            className="w-full h-full object-contain p-1"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                            Imago
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Controle Operacional
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <div className="text-xs font-semibold text-muted-foreground/50 mb-4 px-2 uppercase tracking-wider">
                    Menu Principal
                </div>

                {navLinks.map((link) => {
                    const isActive = location.pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm" // Active state
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground" // Inactive state
                            )}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                            )}

                            <link.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
            <div className="p-4 border-t border-border/40 bg-muted/50">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-background/80 hover:shadow-sm transition-all duration-200 group outline-none">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col items-start flex-1 overflow-hidden">
                                <span className="text-sm font-semibold truncate w-full text-left text-foreground/90">
                                    {profile?.full_name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate w-full text-left">
                                    {tenant?.name || role}
                                </span>
                            </div>

                            <MoreVertical className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
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
