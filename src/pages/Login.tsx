
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, signInWithDefaultAdmin } from "@/utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já está logado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login efetuado com sucesso!",
        description: "Bem-vindo ao Meu Ateliê de Laços.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await signInWithDefaultAdmin();
      
      toast({
        title: "Login de administrador efetuado!",
        description: "Bem-vindo, Admin.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Erro no login de admin:", error);
      toast({
        title: "Erro ao fazer login de administrador",
        description: error.message || "Erro ao criar/acessar conta de administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lacos-light p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lacos-primary text-white text-xl font-bold mb-4">
            ML
          </div>
          <h1 className="text-2xl font-bold text-lacos-primary">Meu Ateliê de Laços</h1>
          <p className="text-sm text-gray-500 mt-2">Gerencie seu negócio de laços artesanais</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/registro" className="text-xs text-lacos-primary hover:underline">
                    Não tem conta? Cadastre-se
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Acesso rápido de demonstração:</strong>
                </p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillAdminCredentials}
                    className="w-full"
                  >
                    Preencher credenciais de admin
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAdminLogin}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                  >
                    Login direto como Admin
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Email: admin@admin.com | Senha: 123
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Ainda não possui uma conta?{" "}
                <Link to="/registro" className="text-lacos-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
