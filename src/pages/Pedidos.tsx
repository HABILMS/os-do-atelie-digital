import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Plus, Search, FileText, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StoreInfo from "@/components/layout/StoreInfo";
import PedidoPDF from "@/components/pedidos/PedidoPDF";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
};

type Produto = {
  id: string;
  nome: string;
  foto: string;
  precoVenda: number;
};

type ItemPedido = {
  id: string;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
};

type Pedido = {
  id: string;
  cliente: Cliente;
  itens: ItemPedido[];
  valorTotal: number;
  valorFrete: number;
  formaPagamento: "dinheiro" | "cartao" | "pix" | "consignado";
  status: "recebido" | "pendente";
  dataCriacao: string;
};

type StoreInfo = {
  nome_loja: string;
  logomarca: string | null;
  instagram: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor_tema: string;
};

// Dados fictícios para demonstração
const clientes: Cliente[] = [
  {
    id: "cliente-1",
    nome: "Maria Silva",
    telefone: "(11) 98765-4321",
    email: "maria@exemplo.com"
  },
  {
    id: "cliente-2",
    nome: "Ana Costa",
    telefone: "(11) 91234-5678",
    email: "ana@exemplo.com"
  }
];

const produtos: Produto[] = [
  {
    id: "produto-1",
    nome: "Laço Princesa",
    foto: "/placeholder.svg",
    precoVenda: 25.90
  },
  {
    id: "produto-2",
    nome: "Laço Borboleta",
    foto: "/placeholder.svg",
    precoVenda: 18.50
  },
  {
    id: "produto-3",
    nome: "Laço Festa",
    foto: "/placeholder.svg",
    precoVenda: 32.00
  }
];

const pedidosIniciais: Pedido[] = [];

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Formulário
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorFrete, setValorFrete] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<"dinheiro" | "cartao" | "pix" | "consignado">("pix");
  
  const [pedidoDetalhes, setPedidoDetalhes] = useState<Pedido | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const resetForm = () => {
    setClienteSelecionado("");
    setItensPedido([]);
    setProdutoSelecionado("");
    setQuantidade(1);
    setValorFrete(0);
    setFormaPagamento("pix");
  };

  const handleAdicionarItem = () => {
    const produto = produtos.find(p => p.id === produtoSelecionado);
    
    if (!produto) {
      toast({
        title: "Erro ao adicionar produto",
        description: "Selecione um produto válido.",
        variant: "destructive",
      });
      return;
    }

    const itemExistente = itensPedido.find(item => item.produto.id === produtoSelecionado);
    
    if (itemExistente) {
      // Atualizar quantidade se o item já existe
      setItensPedido(itensPedido.map(item =>
        item.produto.id === produtoSelecionado
          ? { ...item, quantidade: item.quantidade + quantidade }
          : item
      ));
    } else {
      // Adicionar novo item
      const novoItem: ItemPedido = {
        id: `item-${Date.now()}`,
        produto,
        quantidade,
        precoUnitario: produto.precoVenda
      };
      
      setItensPedido([...itensPedido, novoItem]);
    }
    
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const removerItem = (id: string) => {
    setItensPedido(itensPedido.filter(item => item.id !== id));
  };

  const calcularTotalItens = () => {
    return itensPedido.reduce((total, item) => {
      return total + (item.quantidade * item.precoUnitario);
    }, 0);
  };

  const calcularTotalPedido = () => {
    return calcularTotalItens() + valorFrete;
  };

  const handleSalvarPedido = () => {
    if (!clienteSelecionado || itensPedido.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Cliente e pelo menos um produto são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const cliente = clientes.find(c => c.id === clienteSelecionado);
    
    if (!cliente) {
      toast({
        title: "Erro ao criar pedido",
        description: "Cliente inválido.",
        variant: "destructive",
      });
      return;
    }

    const novoPedido: Pedido = {
      id: `pedido-${Date.now()}`,
      cliente,
      itens: itensPedido,
      valorTotal: calcularTotalPedido(),
      valorFrete,
      formaPagamento,
      status: formaPagamento === "consignado" ? "pendente" : "recebido",
      dataCriacao: new Date().toISOString()
    };

    setPedidos([...pedidos, novoPedido]);
    
    toast({
      title: "Pedido criado",
      description: `Pedido #${novoPedido.id.split('-')[1]} criado com sucesso.`,
    });

    resetForm();
    setDialogOpen(false);
  };

  const abrirDetalhesPedido = (pedido: Pedido) => {
    setPedidoDetalhes(pedido);
    setShowDetalhes(true);
  };

  const alternarStatusPagamento = (pedido: Pedido) => {
    setPedidos(pedidos.map(p => 
      p.id === pedido.id
        ? { ...p, status: p.status === "pendente" ? "recebido" : "pendente" }
        : p
    ));
    
    toast({
      title: "Status atualizado",
      description: `Pagamento marcado como ${pedido.status === "pendente" ? "recebido" : "pendente"}.`,
    });
  };

  const handleGerarPDF = useReactToPrint({
    content: () => pdfRef.current,
    documentTitle: `Pedido-${pedidoDetalhes?.id.split('-')[1] || ''}`,
    onAfterPrint: () => {
      toast({
        title: "PDF gerado com sucesso",
        description: "O seu pedido foi exportado para PDF."
      });
    },
    onPrintError: () => {
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF do pedido.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        const { data, error } = await supabase
          .from("configuracoes")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao carregar informações da loja:", error);
        }

        setStoreInfo(data);
      } catch (error) {
        console.error("Erro ao carregar informações da loja:", error);
      }
    };

    fetchStoreInfo();
  }, []);

  const pedidosFiltrados = pedidos.filter(pedido => 
    pedido.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    pedido.id.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout title="Pedidos" showStoreInfo={true}>
      {!showDetalhes ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Buscar pedidos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Novo Pedido</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do pedido abaixo.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select
                      value={clienteSelecionado}
                      onValueChange={setClienteSelecionado}
                    >
                      <SelectTrigger id="cliente">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Produtos</Label>
                      {itensPedido.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Total: {calcularTotalItens().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      )}
                    </div>

                    {itensPedido.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {itensPedido.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.produto.foto} 
                                alt={item.produto.nome}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.produto.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantidade} × {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerItem(item.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Adicionar Produto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="produto">Produto</Label>
                            <Select
                              value={produtoSelecionado}
                              onValueChange={setProdutoSelecionado}
                            >
                              <SelectTrigger id="produto">
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {produtos.map((produto) => (
                                  <SelectItem key={produto.id} value={produto.id}>
                                    {produto.nome} - {produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quantidade">Quantidade</Label>
                            <Input
                              id="quantidade"
                              type="number"
                              min={1}
                              value={quantidade}
                              onChange={(e) => setQuantidade(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>&nbsp;</Label>
                            <Button 
                              className="w-full mt-2"
                              onClick={handleAdicionarItem}
                              disabled={!produtoSelecionado || quantidade < 1}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="frete">Valor do Frete (R$)</Label>
                      <Input
                        id="frete"
                        type="number"
                        min={0}
                        step={0.01}
                        value={valorFrete}
                        onChange={(e) => setValorFrete(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <Select
                        value={formaPagamento}
                        onValueChange={(value) => setFormaPagamento(value as any)}
                      >
                        <SelectTrigger id="formaPagamento">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                          <SelectItem value="pix">Pix</SelectItem>
                          <SelectItem value="consignado">Consignado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal:</span>
                      <span>{calcularTotalItens().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Frete:</span>
                      <span>{valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-lacos-primary">{calcularTotalPedido().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarPedido}>
                    Criar Pedido
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {pedidos.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={32} />}
              title="Nenhum pedido cadastrado"
              description="Adicione seu primeiro pedido para começar a gerenciar suas vendas."
              action={{
                label: "Adicionar Pedido",
                onClick: () => setDialogOpen(true),
              }}
            />
          ) : (
            <div className="bg-white rounded-lg border border-lacos-rose overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">
                        #{pedido.id.split('-')[1]}
                      </TableCell>
                      <TableCell>{pedido.cliente.nome}</TableCell>
                      <TableCell>{new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell>
                        {pedido.formaPagamento === "dinheiro" && "Dinheiro"}
                        {pedido.formaPagamento === "cartao" && "Cartão"}
                        {pedido.formaPagamento === "pix" && "Pix"}
                        {pedido.formaPagamento === "consignado" && "Consignado"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={pedido.status === "recebido" ? "outline" : "default"}
                          className={
                            pedido.status === "recebido" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        >
                          {pedido.status === "recebido" ? "Recebido" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirDetalhesPedido(pedido)}
                          >
                            Detalhes
                          </Button>
                          {pedido.status === "pendente" && (
                            <Button
                              size="sm"
                              onClick={() => alternarStatusPagamento(pedido)}
                            >
                              <DollarSign size={16} className="mr-1" />
                              Receber
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        <>
          {pedidoDetalhes && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline"
                  onClick={() => setShowDetalhes(false)}
                >
                  Voltar
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGerarPDF}
                  >
                    <FileText size={18} className="mr-2" />
                    Gerar PDF
                  </Button>

                  {pedidoDetalhes.status === "pendente" && (
                    <Button
                      onClick={() => {
                        alternarStatusPagamento(pedidoDetalhes);
                        setPedidoDetalhes({
                          ...pedidoDetalhes,
                          status: "recebido"
                        });
                      }}
                    >
                      <DollarSign size={18} className="mr-2" />
                      Marcar como Recebido
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-lacos-rose p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-lacos-primary">Pedido #{pedidoDetalhes.id.split('-')[1]}</h2>
                    <p className="text-muted-foreground">
                      {new Date(pedidoDetalhes.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      pedidoDetalhes.status === "recebido" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {pedidoDetalhes.status === "recebido" ? "Pago" : "Pendente"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Dados do Cliente</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <p className="font-medium">{pedidoDetalhes.cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{pedidoDetalhes.cliente.telefone}</p>
                      <p className="text-sm text-muted-foreground">{pedidoDetalhes.cliente.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Informações do Pedido</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <div className="flex justify-between">
                        <span>Forma de Pagamento:</span>
                        <span className="font-medium">
                          {pedidoDetalhes.formaPagamento === "dinheiro" && "Dinheiro"}
                          {pedidoDetalhes.formaPagamento === "cartao" && "Cartão"}
                          {pedidoDetalhes.formaPagamento === "pix" && "Pix"}
                          {pedidoDetalhes.formaPagamento === "consignado" && "Consignado"}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Total:</span>
                        <span className="font-medium">
                          {pedidoDetalhes.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Itens do Pedido</h3>
                  <div className="bg-gray-50 rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd.</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidoDetalhes.itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="flex items-center gap-3">
                              <img 
                                src={item.produto.foto} 
                                alt={item.produto.nome}
                                className="w-10 h-10 object-cover rounded"
                              />
                              {item.produto.nome}
                            </TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                            <TableCell className="text-right">
                              {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>
                      {(pedidoDetalhes.valorTotal - pedidoDetalhes.valorFrete).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Frete:</span>
                    <span>{pedidoDetalhes.valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-lacos-primary">
                      {pedidoDetalhes.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Versão PDF para impressão (invisível) */}
              <div className="hidden">
                <PedidoPDF ref={pdfRef} pedido={pedidoDetalhes} storeInfo={storeInfo} />
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Pedidos;
