import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search,
  Package,
  Image as ImageIcon,
  X,
  Upload,
  Edit 
} from "lucide-react";

type Material = {
  id: string;
  nome: string;
  quantidade: number;
  custoUnitario: number;
};

type Produto = {
  id: string;
  nome: string;
  colecao: string;
  foto: string;
  materiais: Material[];
  custoTotal: number;
  margemLucro: number;
  precoSugerido: number;
  precoVenda: number;
};

// Dados fictícios para demonstração
const produtosIniciais: Produto[] = [];

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState<"lista" | "galeria">("galeria");
  
  // Estado para o formulário
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [nome, setNome] = useState("");
  const [colecao, setColecao] = useState("");
  const [foto, setFoto] = useState("");
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [novoMaterial, setNovoMaterial] = useState<Material>({
    id: "",
    nome: "",
    quantidade: 1,
    custoUnitario: 0
  });
  const [margemLucro, setMargemLucro] = useState(50);
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();

  const resetForm = () => {
    setNome("");
    setColecao("");
    setFoto("");
    setMateriais([]);
    setMargemLucro(50);
    setEditando(null);
  };

  const handleUploadFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você precisa selecionar uma imagem para fazer upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `produto-${Date.now()}.${fileExt}`;
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

      setFoto(data.publicUrl);
      
      toast({
        title: "Imagem enviada com sucesso",
        description: "A foto do produto foi atualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNovoMaterial = () => {
    if (!novoMaterial.nome || novoMaterial.custoUnitario <= 0) {
      toast({
        title: "Erro ao adicionar material",
        description: "Nome e custo unitário são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setMateriais([
      ...materiais,
      { 
        ...novoMaterial,
        id: `material-${Date.now()}`
      }
    ]);
    
    setNovoMaterial({
      id: "",
      nome: "",
      quantidade: 1,
      custoUnitario: 0
    });
  };

  const removerMaterial = (id: string) => {
    setMateriais(materiais.filter(m => m.id !== id));
  };

  const calcularCustoTotal = () => {
    return materiais.reduce((total, material) => {
      return total + (material.quantidade * material.custoUnitario);
    }, 0);
  };

  const calcularPrecoSugerido = () => {
    const custoTotal = calcularCustoTotal();
    return custoTotal * (1 + margemLucro / 100);
  };

  const handleSalvarProduto = () => {
    if (!nome || materiais.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do produto e pelo menos um material são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const custoTotal = calcularCustoTotal();
    const precoSugerido = calcularPrecoSugerido();

    if (editando) {
      // Atualizar produto existente
      setProdutos(produtos.map(p => 
        p.id === editando.id 
          ? { 
              ...p, 
              nome, 
              colecao, 
              foto, 
              materiais, 
              custoTotal,
              margemLucro,
              precoSugerido,
              precoVenda: precoSugerido
            } 
          : p
      ));
      toast({
        title: "Produto atualizado",
        description: `${nome} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo produto
      const novoProduto: Produto = {
        id: `produto-${Date.now()}`,
        nome,
        colecao,
        foto: foto || "/placeholder.svg",
        materiais,
        custoTotal,
        margemLucro,
        precoSugerido,
        precoVenda: precoSugerido
      };
      setProdutos([...produtos, novoProduto]);
      toast({
        title: "Produto adicionado",
        description: `${nome} foi adicionado com sucesso.`,
      });
    }

    resetForm();
    setShowForm(false);
  };

  const handleEditarProduto = (produto: Produto) => {
    setEditando(produto);
    setNome(produto.nome);
    setColecao(produto.colecao);
    setFoto(produto.foto);
    setMateriais([...produto.materiais]);
    setMargemLucro(produto.margemLucro);
    setShowForm(true);
  };

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
    produto.colecao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout title="Produtos">
      {!showForm ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Tabs value={visualizacao} onValueChange={(v) => setVisualizacao(v as "lista" | "galeria")}>
                <TabsList>
                  <TabsTrigger value="lista">Lista</TabsTrigger>
                  <TabsTrigger value="galeria">Galeria</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus size={18} className="mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          {produtos.length === 0 ? (
            <EmptyState
              icon={<Package size={32} />}
              title="Nenhum produto cadastrado"
              description="Adicione seu primeiro produto para começar a gerenciar seu catálogo de laços."
              action={{
                label: "Adicionar Produto",
                onClick: () => { resetForm(); setShowForm(true); },
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosFiltrados.map((produto) => (
                <Card key={produto.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={produto.foto || "/placeholder.svg"} 
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => handleEditarProduto(produto)}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        {produto.nome}
                        <p className="text-sm text-muted-foreground font-normal">
                          {produto.colecao}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-lacos-primary">
                          {produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Custo: {produto.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="form-container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">
              {editando ? "Editar Produto" : "Novo Produto"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              <X size={18} className="mr-2" />
              Cancelar
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Laço</Label>
                <Input
                  id="nome"
                  placeholder="Nome do produto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colecao">Coleção</Label>
                <Input
                  id="colecao"
                  placeholder="Nome da coleção"
                  value={colecao}
                  onChange={(e) => setColecao(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto do Produto</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-32 h-32 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      type="button"
                      onClick={() => document.getElementById('foto-upload')?.click()}
                      disabled={uploading}
                      className="w-full sm:w-auto"
                    >
                      <Upload size={16} className="mr-2" />
                      {uploading ? "Enviando..." : "Escolher imagem"}
                    </Button>
                    <Input
                      id="foto-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFoto}
                      disabled={uploading}
                      className="hidden"
                    />
                  </div>
                  <Input
                    placeholder="ou insira a URL da imagem"
                    value={foto}
                    onChange={(e) => setFoto(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tamanho recomendado: 500x500 pixels. Formatos: JPG, PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Materiais</Label>
                <p className="text-sm text-muted-foreground">
                  Custo Total: {calcularCustoTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              {materiais.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {materiais.map((material) => (
                    <div key={material.id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                      <div>
                        <p className="font-medium">{material.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.quantidade} × {material.custoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {(material.quantidade * material.custoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerMaterial(material.id)}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adicionar Material</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeMaterial">Nome do Material</Label>
                      <Input
                        id="nomeMaterial"
                        placeholder="Ex: Fita de cetim"
                        value={novoMaterial.nome}
                        onChange={(e) => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        min={1}
                        placeholder="1"
                        value={novoMaterial.quantidade}
                        onChange={(e) => setNovoMaterial({ ...novoMaterial, quantidade: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custoUnitario">Custo Unitário (R$)</Label>
                      <Input
                        id="custoUnitario"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        value={novoMaterial.custoUnitario}
                        onChange={(e) => setNovoMaterial({ ...novoMaterial, custoUnitario: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleNovoMaterial}>
                    Adicionar Material
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-4">
              <Label>Precificação</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="margemLucro"
                      type="number"
                      min={0}
                      max={100}
                      value={margemLucro}
                      onChange={(e) => setMargemLucro(Number(e.target.value))}
                    />
                    <span className="text-2xl">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda Sugerido</Label>
                  <div className="px-4 py-2 border rounded-md bg-gray-50">
                    <span className="text-lg font-medium">
                      {calcularPrecoSugerido().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Baseado no custo total + margem de lucro de {margemLucro}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarProduto}>
                {editando ? "Atualizar" : "Salvar"} Produto
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Produtos;
