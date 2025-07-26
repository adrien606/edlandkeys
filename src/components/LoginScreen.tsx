import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logoBelair from "@/assets/logo-belaircamp.png";
interface LoginScreenProps {
  onLogin: (appType: 'equipment' | 'inspection') => void;
}
export const LoginScreen = ({
  onLogin
}: LoginScreenProps) => {
  const [selectedApp, setSelectedApp] = useState<'equipment' | 'inspection'>('equipment');
  const [pin, setPin] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple PIN validation - you can customize this
    if (pin === "1234" || pin === "admin") {
      onLogin(selectedApp);
    } else {
      alert("Code d'accès incorrect");
      setPin("");
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 bg-amber-300">
      <Card className="w-full max-w-md mx-auto shadow-xl bg-indigo-950">
        <CardHeader className="text-center space-y-6 pb-8 bg-indigo-950">
          <div className="flex justify-center">
            <img src={logoBelair} alt="Bel Air Camp" className="h-20 w-auto" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Gestion Équipements
            </h1>
            <p className="text-yellow-300">
              Espace de coworking - Accès réservé
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 bg-indigo-950">
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Choisir l'application
              </label>
              <div className="grid grid-cols-1 gap-3">
                <Button type="button" variant={selectedApp === 'equipment' ? 'default' : 'outline'} className="w-full p-4 h-auto flex flex-col items-center gap-2" onClick={() => setSelectedApp('equipment')}>
                  <div className="text-lg font-semibold">Gestion Équipements</div>
                  <div className="text-sm opacity-80">Clés, badges, télécommandes</div>
                </Button>
                
                <Button type="button" variant={selectedApp === 'inspection' ? 'default' : 'outline'} className="w-full p-4 h-auto flex flex-col items-center gap-2" onClick={() => setSelectedApp('inspection')}>
                  <div className="text-lg font-semibold">États des Lieux</div>
                  <div className="text-sm opacity-80">Entrée et sortie</div>
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Code d'accès
              </label>
              <Input type="password" placeholder="Entrez votre code" value={pin} onChange={e => setPin(e.target.value)} className="text-center text-lg tracking-wider" autoFocus />
            </div>
            
            <Button type="submit" className="w-full text-lg py-6" disabled={!pin}>
              Accéder à l'application
            </Button>
          </form>
          
          <div className="text-center text-xs text-muted-foreground">
            Application de gestion des clés, badges et télécommandes
          </div>
        </CardContent>
      </Card>
    </div>;
};