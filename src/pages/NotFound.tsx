
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lacos-light">
      <div className="w-20 h-20 rounded-full bg-lacos-primary text-white flex items-center justify-center text-3xl font-bold mb-4">
        404
      </div>
      <h1 className="text-3xl font-bold text-lacos-primary mb-2">Página não encontrada</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button onClick={() => navigate("/")}>
        Voltar para a página inicial
      </Button>
    </div>
  );
};

export default NotFound;
