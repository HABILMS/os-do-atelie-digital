
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Phone, Image as ImageIcon } from "lucide-react";

type Configuracoes = {
  id: string;
  nome_loja: string;
  logomarca: string | null;
  instagram: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor_tema: string;
};

const ConfiguracoesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes | null>(null);
  const [nome, setNome] = useState("Meu Ateliê de Laços");
  const [instagram, setInstagram] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [corTema, setCorTema] = useState("#F87171");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      fetchConfiguracoes();
    };

    checkAuth();
  }, [navigate]);

  const fetchConfiguracoes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setConfiguracoes(data);
        setNome(data.nome_loja);
        setInstagram(data.instagram || "");
        setTelefone(data.telefone || "");
        setWhatsapp(data.whatsapp || "");
        setCorTema(data.cor_tema);
        setLogoUrl(data.logomarca || null);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações da loja.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você precisa selecionar uma imagem para fazer upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from("laceira-imagens")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("laceira-imagens")
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      
      toast({
        title: "Logo enviada com sucesso",
        description: "Sua logo foi atualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload da logo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const configData = {
        user_id: session.user.id,
        nome_loja: nome,
        logomarca: logoUrl,
        instagram,
        telefone,
        whatsapp,
        cor_tema: corTema,
      };

      let query;
      
      if (configuracoes) {
        // Atualizar configurações existentes
        query = supabase
          .from("configuracoes")
          .update(configData)
          .eq("id", configuracoes.id);
      } else {
        // Inserir novas configurações
        query = supabase
          .from("configuracoes")
          .insert([configData]);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações da sua loja foram atualizadas com sucesso.",
      });

      fetchConfiguracoes();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações da loja.",
        variant: "destructive",
      });
    }
  };

  const formatInstagram = (username: string) => {
    // Remove @ if present
    return username.startsWith('@') ? username : `@${username}`;
  };

  if (isLoading) {
    return (
      <Layout title="Configurações">
        <div className="flex items-center justify-center h-64">
          <p>Carregando configurações...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Configurações">
      <div className="space-y-6">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="geral">Informações da Loja</TabsTrigger>
            <TabsTrigger value="visual">Personalização Visual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade da Loja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Loja</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome da sua loja"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Logomarca</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogo}
                        disabled={uploading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos recomendados: PNG, JPEG, SVG. Tamanho máximo: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato e Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram size={16} />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seu_instagram"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone size={16} />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalização Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="corTema">Cor Principal</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="corTema"
                      value={corTema}
                      onChange={(e) => setCorTema(e.target.value)}
                      className="w-12 h-12 rounded-md overflow-hidden cursor-pointer"
                    />
                    <Input
                      value={corTema}
                      onChange={(e) => setCorTema(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Essa cor será usada como destaque em toda a sua loja.
                  </p>
                </div>
                
                <div className="pt-4">
                  <p className="font-medium mb-3">Preview:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      className="p-4 rounded-md flex items-center justify-center" 
                      style={{ backgroundColor: corTema, color: '#ffffff' }}
                    >
                      <p className="font-medium">Botões e Destaques</p>
                    </div>
                    <div className="border p-4 rounded-md">
                      <p className="font-medium">Nome da Loja</p>
                      <p className="text-sm" style={{ color: corTema }}>{nome}</p>
                    </div>
                    <div className="border p-4 rounded-md flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: corTema }}
                      >
                        @
                      </div>
                      <p className="text-sm">
                        {instagram ? formatInstagram(instagram) : "@seu_instagram"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSalvar}>
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracoesPage;
