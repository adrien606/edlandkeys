import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logoBelair from "@/assets/logo-belaircamp.png";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple PIN validation - you can customize this
    if (pin === "1234" || pin === "admin") {
      onLogin();
    } else {
      alert("Code d'accès incorrect");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <img 
              src={logoBelair} 
              alt="Bel Air Camp" 
              className="h-20 w-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Gestion Équipements
            </h1>
            <p className="text-muted-foreground">
              Espace de coworking - Accès réservé
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Code d'accès
              </label>
              <Input
                type="password"
                placeholder="Entrez votre code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-lg tracking-wider"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-lg py-6"
              disabled={!pin}
            >
              Accéder à l'application
            </Button>
          </form>
          
          <div className="text-center text-xs text-muted-foreground">
            Application de gestion des clés, badges et télécommandes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};