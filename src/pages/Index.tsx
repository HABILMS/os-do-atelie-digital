
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Instagram,
  Plus
} from "lucide-react";

type StoreInfo = {
  nome_loja: string;
  logomarca: string | null;
  instagram: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor_tema: string;
  email: string | null;
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [stats, setStats] = useState({
    pedidos: 0,
    clientes: 0,
    produtos: 0,
    faturamento: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setIsAuthenticated(true);
      await Promise.all([
        fetchStoreInfo(session.user.id),
        fetchStats(session.user.id)
      ]);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar informações da loja:", error);
      }

      setStoreInfo(data);
    } catch (error) {
      console.error("Erro ao carregar informações da loja:", error);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const [pedidosResult, clientesResult, produtosResult] = await Promise.all([
        supabase.from("pedidos").select("total_pedido").eq("user_id", userId),
        supabase.from("clientes").select("id").eq("user_id", userId),
        supabase.from("produtos").select("id").eq("user_id", userId)
      ]);

      const totalFaturamento = pedidosResult.data?.reduce((sum, pedido) => sum + pedido.total_pedido, 0) || 0;

      setStats({
        pedidos: pedidosResult.data?.length || 0,
        clientes: clientesResult.data?.length || 0,
        produtos: produtosResult.data?.length || 0,
        faturamento: totalFaturamento
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lacos-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout title="DASHBOARDV1">
      <div className="space-y-6">
        {/* Cabeçalho com informações da loja */}
        <div className="bg-white rounded-xl border border-lacos-rose p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              {storeInfo?.logomarca ? (
                <img 
                  src={storeInfo.logomarca} 
                  alt={storeInfo.nome_loja}
                  className="w-16 h-16 object-contain rounded-lg border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg border">
                  <Package size={24} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold" style={{ color: storeInfo?.cor_tema || '#F87171' }}>
                {storeInfo?.nome_loja || 'Meu Ateliê de Laços'}
              </h1>
              
              <div className="mt-2 space-y-1">
                {storeInfo?.instagram && (
                  <a 
                    href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm hover:underline"
                    style={{ color: storeInfo.cor_tema || '#F87171' }}
                  >
                    <Instagram size={16} />
                    {storeInfo.instagram}
                  </a>
                )}
                
                {storeInfo?.telefone && (
                  <p className="text-sm text-muted-foreground">
                    Tel: {storeInfo.telefone}
                  </p>
                )}
                
                {storeInfo?.email && (
                  <p className="text-sm text-muted-foreground">
                    Email: {storeInfo.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/configuracoes')}
              >
                Configurar Loja
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Pedidos do Mês"
            value={stats.pedidos}
            description={stats.pedidos === 0 ? "Nenhum pedido ainda" : `${stats.pedidos} pedidos`}
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <StatsCard
            title="Clientes"
            value={stats.clientes}
            description={stats.clientes === 0 ? "Cadastre seu primeiro cliente" : `${stats.clientes} clientes`}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Produtos"
            value={stats.produtos}
            description={stats.produtos === 0 ? "Adicione seus produtos" : `${stats.produtos} produtos`}
            icon={<Package className="h-4 w-4" />}
          />
          <StatsCard
            title="Faturamento"
            value={`R$ ${stats.faturamento.toFixed(2)}`}
            description="Este mês"
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pedidos')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus size={20} />
                Novo Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Criar um novo pedido para seus clientes
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/produtos')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package size={20} />
                Gerenciar Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adicionar e editar seus produtos
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/clientes')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users size={20} />
                Cadastrar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adicionar novos clientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integração com Instagram */}
        {storeInfo?.instagram && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram size={20} />
                Instagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Instagram size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Conecte-se com seus clientes no Instagram
                </p>
                <Button variant="outline" asChild>
                  <a 
                    href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar Perfil
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pedidos recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground mb-4">
                {stats.pedidos === 0 ? "Nenhum pedido cadastrado ainda" : `Você tem ${stats.pedidos} pedidos`}
              </p>
              <Button onClick={() => navigate('/pedidos')}>
                {stats.pedidos === 0 ? "Criar Primeiro Pedido" : "Ver Todos os Pedidos"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
