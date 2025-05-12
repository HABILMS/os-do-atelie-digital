
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Home, 
  Package, 
  ShoppingBag,
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
};

const NavItem = ({ to, icon: Icon, label, isCollapsed, isActive }: NavItemProps) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-4 py-2 px-3 h-auto",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        <Icon size={20} />
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 sticky top-0 left-0",
        isCollapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center h-16 px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 font-display font-bold text-lg text-lacos-primary">
            <div className="w-8 h-8 rounded-full bg-lacos-primary flex items-center justify-center text-white">
              ML
            </div>
            <span>Meu Ateliê</span>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-lacos-primary flex items-center justify-center text-white font-bold">
            ML
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />
      
      <div className="flex-1 py-4 px-2 flex flex-col gap-1">
        <NavItem 
          to="/" 
          icon={Home} 
          label="Dashboard" 
          isCollapsed={isCollapsed} 
          isActive={isActive("/")} 
        />
        <NavItem 
          to="/clientes" 
          icon={User} 
          label="Clientes" 
          isCollapsed={isCollapsed} 
          isActive={isActive("/clientes")} 
        />
        <NavItem 
          to="/produtos" 
          icon={Package} 
          label="Produtos" 
          isCollapsed={isCollapsed} 
          isActive={isActive("/produtos")} 
        />
        <NavItem 
          to="/pedidos" 
          icon={ShoppingBag} 
          label="Pedidos" 
          isCollapsed={isCollapsed} 
          isActive={isActive("/pedidos")} 
        />
      </div>

      <Separator className="bg-sidebar-border" />
      
      <div className="py-4 px-2 flex flex-col gap-1">
        <NavItem 
          to="/configuracoes" 
          icon={Settings} 
          label="Configurações" 
          isCollapsed={isCollapsed} 
          isActive={isActive("/configuracoes")} 
        />
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="self-end mb-4 mx-2"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </Button>
    </div>
  );
}
