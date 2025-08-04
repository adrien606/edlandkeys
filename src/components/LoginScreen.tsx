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
                  className="w-full p-4 h-auto flex flex-col items-center gap-2" 
                  onClick={() => handleAppSelect('equipment')}
                >
                  <div className="text-lg font-semibold">Gestion Équipements</div>
                  <div className="text-sm opacity-80">Clés, badges, télécommandes</div>
                </Button>
                
                <Button 
                  type="button" 
                  variant="default" 
                  className="w-full p-4 h-auto flex flex-col items-center gap-2" 
                  onClick={() => handleAppSelect('inspection')}
                >
                  <div className="text-lg font-semibold">États des Lieux</div>
                  <div className="text-sm opacity-80">Entrée et sortie</div>
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

          {/* Sign out button */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};