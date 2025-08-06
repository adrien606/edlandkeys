import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings } from "lucide-react";
import logoBelair from "@/assets/logo-belaircamp.png";
import { useAuth } from "@/hooks/useAuth";

interface LoginScreenProps {
  onLogin: (appType: 'equipment' | 'inspection') => void;
  onUserManagement: () => void;
}

export const LoginScreen = ({
  onLogin,
  onUserManagement
}: LoginScreenProps) => {
  const { user, profile, userRole, isAdmin, signOut } = useAuth();

  const handleAppSelect = (appType: 'equipment' | 'inspection') => {
    onLogin(appType);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center pb-4">
          {/* Sign out button at the top */}
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>

          <div className="flex justify-center mb-4">
            <img 
              src={logoBelair} 
              alt="BEL AIR CAMP" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* User info section */}
          {user && profile && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.email
                  }
                </span>
              </div>
              <div className="flex justify-center">
                <Badge variant={isAdmin ? "destructive" : "secondary"}>
                  {isAdmin ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Choisir l'application
              </label>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  type="button" 
                  variant="default" 
                  className="w-full p-6 h-auto flex flex-col items-start gap-3 text-left" 
                  onClick={() => handleAppSelect('equipment')}
                >
                  <div className="text-lg font-semibold">Gestion Équipements</div>
                  <div className="text-sm opacity-90 leading-relaxed">
                    • Enregistrer les entreprises et contacts<br/>
                    • Distribuer clés, badges, télécommandes<br/>
                    • Valider avec photos et signature<br/>
                    • Suivi en temps réel des équipements
                  </div>
                </Button>
                
                <Button 
                  type="button" 
                  variant="default" 
                  className="w-full p-6 h-auto flex flex-col items-start gap-3 text-left" 
                  onClick={() => handleAppSelect('inspection')}
                >
                  <div className="text-lg font-semibold">États des Lieux</div>
                  <div className="text-sm opacity-90 leading-relaxed">
                    • Créer des états des lieux détaillés<br/>
                    • Photos avec commentaires par zone<br/>
                    • Signature électronique des documents<br/>
                    • Historique et comparaison des inspections
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Admin-only user management button */}
          {isAdmin && (
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={onUserManagement}
              >
                <Settings className="w-4 h-4" />
                Gestion des Utilisateurs
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};