import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Tableau de Bord</h1>
        <p className="text-xl text-muted-foreground mb-8">Gestion de votre application</p>
        
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button 
            onClick={() => navigate("/utilisateurs")} 
            className="flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Gestion des Utilisateurs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
