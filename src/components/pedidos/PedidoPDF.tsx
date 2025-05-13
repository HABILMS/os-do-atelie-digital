
import React, { forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
};

interface PedidoPDFProps {
  pedido: Pedido;
  storeInfo?: StoreInfo | null;
}

const PedidoPDF = forwardRef<HTMLDivElement, PedidoPDFProps>(
  ({ pedido, storeInfo }, ref) => {
    const formatarData = (dataString: string) => {
      const data = new Date(dataString);
      return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const formatarFormaPagamento = (forma: string) => {
      switch (forma) {
        case "dinheiro":
          return "Dinheiro";
        case "cartao":
          return "Cartão";
        case "pix":
          return "Pix";
        case "consignado":
          return "Consignado";
        default:
          return forma;
      }
    };

    return (
      <div 
        ref={ref} 
        className="bg-white p-8 max-w-[800px] mx-auto"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Cabeçalho */}
        <div className="flex flex-col items-center mb-8 border-b pb-4">
          {storeInfo?.logomarca && (
            <img 
              src={storeInfo.logomarca} 
              alt={storeInfo?.nome_loja || "Logo"} 
              className="h-16 mb-2"
            />
          )}
          <h1 className="text-2xl font-bold text-center">
            {storeInfo?.nome_loja || "Meu Ateliê de Laços"}
          </h1>
          
          {storeInfo?.instagram && (
            <p className="text-sm text-gray-600">Instagram: {storeInfo.instagram}</p>
          )}
          
          {storeInfo?.telefone && (
            <p className="text-sm text-gray-600">Telefone: {storeInfo.telefone}</p>
          )}
          
          {storeInfo?.whatsapp && (
            <p className="text-sm text-gray-600">WhatsApp: {storeInfo.whatsapp}</p>
          )}
        </div>
        
        {/* Detalhes do Pedido */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Pedido #{pedido.id.split('-')[1]}</h2>
          <p className="text-gray-600">Data: {formatarData(pedido.dataCriacao)}</p>
          <p className="text-gray-600">
            Status: 
            <span className={pedido.status === "recebido" ? "text-green-600" : "text-amber-600"}>
              {" "}{pedido.status === "recebido" ? "Pago" : "Pendente"}
            </span>
          </p>
          <p className="text-gray-600">
            Forma de pagamento: {formatarFormaPagamento(pedido.formaPagamento)}
          </p>
        </div>
        
        {/* Dados do Cliente */}
        <div className="mb-6">
          <h3 className="text-md font-bold mb-2">Cliente:</h3>
          <p>{pedido.cliente.nome}</p>
          {pedido.cliente.telefone && (
            <p className="text-gray-600">Telefone: {pedido.cliente.telefone}</p>
          )}
          {pedido.cliente.email && (
            <p className="text-gray-600">Email: {pedido.cliente.email}</p>
          )}
        </div>
        
        {/* Tabela de Itens */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border">Produto</th>
              <th className="text-center p-2 border">Qtd</th>
              <th className="text-right p-2 border">Valor Unit.</th>
              <th className="text-right p-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2 border">{item.produto.nome}</td>
                <td className="text-center p-2 border">{item.quantidade}</td>
                <td className="text-right p-2 border">
                  {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="text-right p-2 border font-medium">
                  {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Resumo do Pedido */}
        <div className="ml-auto w-64 space-y-1 mb-8">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {(pedido.valorTotal - pedido.valorFrete).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Frete:</span>
            <span>
              {pedido.valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>
              {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
        
        {/* Rodapé */}
        <div className="text-center text-gray-500 text-sm mt-16 pt-4 border-t">
          <p>
            Obrigado por escolher {storeInfo?.nome_loja || "Meu Ateliê de Laços"}!
          </p>
          <p className="mt-1">
            {storeInfo?.instagram && `Instagram: ${storeInfo.instagram}`}
          </p>
        </div>
      </div>
    );
  }
);

PedidoPDF.displayName = "PedidoPDF";

export default PedidoPDF;
