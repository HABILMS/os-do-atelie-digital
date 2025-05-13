
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, ShoppingBag, DollarSign, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ instagram: string | null } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        
        // Carregar informações da loja
        const { data, error } = await supabase
          .from("configuracoes")
          .select("instagram")
          .eq("user_id", session.user.id)
          .single();
          
        if (!error) {
          setStoreInfo(data);
        }
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    checkAuth();
    
    // Configurar listerner para mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate("/login");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleInstagramButtonClick = () => {
    if (!storeInfo?.instagram) {
      navigate("/configuracoes");
      toast({
        title: "Instagram não configurado",
        description: "Adicione seu Instagram nas configurações da loja.",
      });
      return;
    }
    
    const instagramUser = storeInfo.instagram.replace('@', '');
    window.open(`https://instagram.com/${instagramUser}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lacos-light">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center text-lacos-primary">
              Meu Ateliê de Laços
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-muted-foreground">
              Para acessar o painel, por favor faça login.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/cadastro")}
            >
              Criar Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout title="Dashboard" showStoreInfo={false}>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total de Clientes" 
            value="24" 
            icon={<User size={24} />} 
          />
          <StatsCard 
            title="Total de Produtos" 
            value="48" 
            icon={<Package size={24} />}
          />
          <StatsCard 
            title="Pedidos do Mês" 
            value="18" 
            icon={<ShoppingBag size={24} />} 
            trend={{ value: 12, positive: true }}
          />
          <StatsCard 
            title="Total a Receber" 
            value="R$ 1.250,00" 
            icon={<DollarSign size={24} />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os dados serão exibidos aqui quando houver pedidos registrados.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram size={20} />
                Instagram Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {storeInfo?.instagram ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    Conectado a <span className="font-medium">{storeInfo.instagram}</span>
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleInstagramButtonClick}
                  >
                    <Instagram size={18} className="mr-2" />
                    Ver Instagram
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>Dica: Para uma integração mais completa com visualização do feed, considere adicionar o widget oficial do Instagram em uma atualização futura.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure seu Instagram nas configurações da loja para visualizar o seu feed aqui.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/configuracoes")}
                  >
                    Configurar Instagram
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os dados serão exibidos aqui quando houver clientes registrados.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status dos Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os dados serão exibidos aqui quando houver pedidos registrados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
