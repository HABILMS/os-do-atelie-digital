
import Layout from "@/components/layout/Layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, ShoppingBag, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificaremos a autenticação posteriormente quando integrarmos com Supabase
    const checkAuth = async () => {
      // Mock authentication check
      const auth = localStorage.getItem("authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      } else {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

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
    <Layout title="Dashboard">
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
              <CardTitle>Produtos Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os dados serão exibidos aqui quando houver produtos registrados.
              </p>
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
