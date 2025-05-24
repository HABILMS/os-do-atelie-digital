
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Instagram, Phone, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ConfiguracaoData = {
  nome_loja: string;
  logomarca: string | null;
  instagram: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor_tema: string;
};

const Configuracoes = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoData>({
    nome_loja: "Meu Ateliê de Laços",
    logomarca: null,
    instagram: "",
    telefone: "",
    whatsapp: "",
    cor_tema: "#F87171"
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    await carregarConfiguracoes(session.user.id);
  };

  const carregarConfiguracoes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar configurações:", error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações.",
          variant: "destructive",
        });
      } else if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${session.user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('laceira-imagens')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload da imagem.",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('laceira-imagens')
        .getPublicUrl(uploadData.path);

      setConfig(prev => ({ ...prev, logomarca: publicUrl }));

      toast({
        title: "Logo carregada",
        description: "Logo foi carregada com sucesso.",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Erro inesperado no upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSalvar = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      const configData = {
        ...config,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("configuracoes")
        .upsert(configData, { onConflict: 'user_id' });

      if (error) {
        console.error("Erro ao salvar configurações:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Erro inesperado ao salvar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <Layout title="Configurações">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lacos-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Configurações">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store size={20} />
              Informações da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome_loja">Nome da Loja</Label>
              <Input
                id="nome_loja"
                value={config.nome_loja}
                onChange={(e) => setConfig(prev => ({ ...prev, nome_loja: e.target.value }))}
                placeholder="Digite o nome da sua loja"
              />
            </div>

            <div>
              <Label>Logomarca</Label>
              <div className="space-y-2">
                {config.logomarca && (
                  <div className="flex items-center justify-center w-32 h-32 border rounded-lg bg-gray-50">
                    <img 
                      src={config.logomarca} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploadingLogo}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploadingLogo}
                    className="w-full sm:w-auto"
                  >
                    <Upload size={16} className="mr-2" />
                    {uploadingLogo ? "Enviando..." : "Carregar Logo"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cor_tema">Cor do Tema</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="cor_tema"
                  value={config.cor_tema}
                  onChange={(e) => setConfig(prev => ({ ...prev, cor_tema: e.target.value }))}
                  className="w-12 h-10 border rounded"
                />
                <Input
                  value={config.cor_tema}
                  onChange={(e) => setConfig(prev => ({ ...prev, cor_tema: e.target.value }))}
                  placeholder="#F87171"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram size={20} />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={config.instagram || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="@meuatelie"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone size={20} />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={config.telefone || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={config.whatsapp || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSalvar} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <Save size={18} className="mr-2" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </Layout>
  );
};

export default Configuracoes;
