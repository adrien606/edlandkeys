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
  const handleAppSelect = (appType: 'equipment' | 'inspection') => {
    onLogin(appType);
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 bg-blue-100">
      <Card className="w-full max-w-md mx-auto shadow-xl bg-indigo-950">
        
        
        <CardContent className="space-y-6 bg-indigo-950">
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Choisir l'application
              </label>
              <div className="grid grid-cols-1 gap-3">
                <Button type="button" variant="default" className="w-full p-4 h-auto flex flex-col items-center gap-2" onClick={() => handleAppSelect('equipment')}>
                  <div className="text-lg font-semibold">Gestion Équipements</div>
                  <div className="text-sm opacity-80">Clés, badges, télécommandes</div>
                </Button>
                
                <Button type="button" variant="default" className="w-full p-4 h-auto flex flex-col items-center gap-2" onClick={() => handleAppSelect('inspection')}>
                  <div className="text-lg font-semibold">États des Lieux</div>
                  <div className="text-sm opacity-80">Entrée et sortie</div>
                </Button>
              </div>
            </div>
          </div>

          
          
        </CardContent>
      </Card>
    </div>;
};