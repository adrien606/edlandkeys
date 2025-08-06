import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageTemplateService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplatesProps {
  onBack: () => void;
}

export function NotificationTemplates({ onBack }: NotificationTemplatesProps) {
  const [templates, setTemplates] = useState(MessageTemplateService.getTemplates());
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const current = MessageTemplateService.getTemplates();
    const changed = templates.sms !== current.sms || templates.whatsapp !== current.whatsapp;
    setHasChanges(changed);
  }, [templates]);

  const handleSave = () => {
    MessageTemplateService.saveTemplates(templates);
    setHasChanges(false);
    toast({
      title: "Templates sauvegardés",
      description: "Les modèles de messages ont été mis à jour avec succès.",
    });
  };

  const handleReset = () => {
    const defaultTemplates = MessageTemplateService.getDefaultTemplates();
    setTemplates(defaultTemplates);
    toast({
      title: "Templates réinitialisés",
      description: "Les modèles de messages ont été remis aux valeurs par défaut.",
    });
  };

  const previewSms = MessageTemplateService.formatMessage(templates.sms, "Jean Dupont");
  const previewWhatsApp = MessageTemplateService.formatMessage(templates.whatsapp, "Jean Dupont");

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Modèles de Messages</h1>
            <p className="text-muted-foreground">Personnalisez vos templates SMS et WhatsApp</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Sauvegarder</span>
          </Button>
        </div>
      </div>

      {/* Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Variables disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{"{clientName}"}</Badge>
            <span className="text-sm text-muted-foreground">- Nom complet du client</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Utilisez ces variables dans vos messages. Elles seront automatiquement remplacées par les informations du client.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template SMS */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📱</span>
                <span>Template SMS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={templates.sms}
                onChange={(e) => setTemplates(prev => ({ ...prev, sms: e.target.value }))}
                placeholder="Saisissez votre message SMS..."
                className="min-h-[120px] resize-none"
                maxLength={160}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Caractères: {templates.sms.length}/160</span>
                <span className={templates.sms.length > 160 ? "text-destructive" : ""}>
                  {templates.sms.length > 160 ? "⚠️ Trop long" : "✓ OK"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aperçu SMS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm whitespace-pre-wrap">{previewSms}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template WhatsApp */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💬</span>
                <span>Template WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={templates.whatsapp}
                onChange={(e) => setTemplates(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="Saisissez votre message WhatsApp..."
                className="min-h-[120px] resize-none"
              />
              <div className="text-xs text-muted-foreground mt-2">
                <span>Caractères: {templates.whatsapp.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                💡 Vous pouvez utiliser des emojis et des retours à la ligne pour WhatsApp
              </p>
            </CardContent>
          </Card>

          {/* Aperçu WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aperçu WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border-l-4 border-green-500">
                <p className="text-sm whitespace-pre-wrap">{previewWhatsApp}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hasChanges && (
        <Card className="mt-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="p-4">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              ⚠️ Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur "Sauvegarder".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}