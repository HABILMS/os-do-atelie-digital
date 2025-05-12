
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
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
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { User, Search, Plus, Edit } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
};

// Dados fictícios para demonstração
const clientesIniciais: Cliente[] = [];

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  
  // Formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  
  const { toast } = useToast();

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setEditando(null);
  };

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditando(cliente);
      setNome(cliente.nome);
      setTelefone(cliente.telefone);
      setEmail(cliente.email);
      setEndereco(cliente.endereco || "");
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSalvarCliente = () => {
    if (!nome || !telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editando) {
      // Atualizar cliente existente
      setClientes(clientes.map(c => 
        c.id === editando.id 
          ? { ...c, nome, telefone, email, endereco } 
          : c
      ));
      toast({
        title: "Cliente atualizado",
        description: `Os dados de ${nome} foram atualizados com sucesso.`,
      });
    } else {
      // Adicionar novo cliente
      const novoCliente: Cliente = {
        id: `cliente-${Date.now()}`,
        nome,
        telefone,
        email,
        endereco: endereco || undefined,
      };
      setClientes([...clientes, novoCliente]);
      toast({
        title: "Cliente adicionado",
        description: `${nome} foi adicionado com sucesso.`,
      });
    }

    resetForm();
    setDialogOpen(false);
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout title="Clientes">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Buscar clientes..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus size={18} className="mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente abaixo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do cliente"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço (opcional)</Label>
                  <Input
                    id="endereco"
                    placeholder="Endereço completo"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvarCliente}>
                  {editando ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {clientes.length === 0 ? (
          <EmptyState
            icon={<User size={32} />}
            title="Nenhum cliente cadastrado"
            description="Adicione seu primeiro cliente para começar a gerenciar seu negócio."
            action={{
              label: "Adicionar Cliente",
              onClick: () => handleOpenDialog(),
            }}
          />
        ) : (
          <div className="bg-white rounded-lg border border-lacos-rose overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Endereço</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.endereco || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(cliente)}
                      >
                        <Edit size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clientes;
