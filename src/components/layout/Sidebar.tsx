
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile"; 
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  LogOut,
  Settings 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Sidebar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMobile();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("authenticated");
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível sair da sua conta.",
        variant: "destructive",
      });
    }
  };
  
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
      active: location.pathname === "/"
    },
    {
      name: "Clientes",
      icon: <Users size={20} />,
      path: "/clientes",
      active: location.pathname === "/clientes"
    },
    {
      name: "Produtos",
      icon: <Package size={20} />,
      path: "/produtos",
      active: location.pathname === "/produtos"
    },
    {
      name: "Pedidos",
      icon: <ShoppingBag size={20} />,
      path: "/pedidos",
      active: location.pathname === "/pedidos"
    },
    {
      name: "Configurações",
      icon: <Settings size={20} />,
      path: "/configuracoes",
      active: location.pathname === "/configuracoes"
    }
  ];

  if (isMobile || !isAuthenticated) {
    return null;
  }

  return (
    <aside 
      className={`bg-white border-r border-border transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <Link to="/" className="font-bold text-xl text-lacos-primary">
            {collapsed ? "ML" : "Meu Laços"}
          </Link>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={item.active ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${item.active ? "bg-lacos-primary text-white" : ""}`}
              >
                {item.icon}
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Ações do Usuário */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-gray-800"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>

          <Separator className="my-2" />
          
          {/* Botão de colapsar */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start mt-1" 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? ">" : "<"}
            {!collapsed && <span className="ml-2">Recolher menu</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
