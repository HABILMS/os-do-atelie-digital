
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram } from "lucide-react";

type StoreInfo = {
  nome_loja: string;
  logomarca: string | null;
  instagram: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor_tema: string;
};

interface StoreInfoProps {
  minimal?: boolean;
}

export default function StoreInfo({ minimal = false }: StoreInfoProps) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  if (loading) {
    return null;
  }

  if (!storeInfo) {
    return minimal ? null : (
      <div className="text-center p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          Configure as informações da sua loja em Configurações
        </p>
      </div>
    );
  }

  // Versão minimal (apenas para cabeçalhos, etc)
  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        {storeInfo.logomarca && (
          <img 
            src={storeInfo.logomarca} 
            alt={storeInfo.nome_loja}
            className="h-8 w-auto object-contain"
          />
        )}
        {storeInfo.instagram && (
          <a 
            href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm hover:underline"
          >
            <Instagram size={14} />
            {storeInfo.instagram}
          </a>
        )}
      </div>
    );
  }

  // Versão completa para exibição em pedidos, etc.
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-white">
      <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
        {storeInfo.logomarca ? (
          <img 
            src={storeInfo.logomarca} 
            alt={storeInfo.nome_loja}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
            <span className="text-2xl font-bold text-gray-400">Logo</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold" style={{ color: storeInfo.cor_tema }}>
          {storeInfo.nome_loja}
        </h2>
        
        <div className="mt-2 space-y-1">
          {storeInfo.instagram && (
            <a 
              href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: storeInfo.cor_tema }}
            >
              <Instagram size={16} />
              {storeInfo.instagram}
            </a>
          )}
          
          {storeInfo.telefone && (
            <p className="text-sm text-muted-foreground">
              Tel: {storeInfo.telefone}
            </p>
          )}
          
          {storeInfo.whatsapp && (
            <p className="text-sm text-muted-foreground">
              WhatsApp: {storeInfo.whatsapp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
