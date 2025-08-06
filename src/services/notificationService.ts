// Service pour la gestion des templates de messages
export class MessageTemplateService {
  private static readonly STORAGE_KEY = 'notification_templates';

  static getDefaultTemplates() {
    return {
      sms: "Bonjour {clientName}, votre colis est arrivé et vous attend à la réception. Merci de venir le récupérer aux heures d'ouverture.",
      whatsapp: "🏠 Bonjour {clientName} !\n\n📦 Votre colis est arrivé et vous attend à la réception.\n\n⏰ Merci de venir le récupérer aux heures d'ouverture.\n\nBonne journée ! 😊"
    };
  }

  static getTemplates() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultTemplates();
    } catch {
      return this.getDefaultTemplates();
    }
  }

  static saveTemplates(templates: { sms: string; whatsapp: string }) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des templates:', error);
    }
  }

  static formatMessage(template: string, clientName: string): string {
    return template.replace(/{clientName}/g, clientName);
  }
}

// Service SMS
export class SMSService {
  static sendSMS(phoneNumber: string, message: string): boolean {
    try {
      // Nettoyer le numéro de téléphone
      const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\+33/, '0');
      
      // Créer l'URL SMS
      const smsUrl = `sms:${cleanNumber}?body=${encodeURIComponent(message)}`;
      
      // Ouvrir l'application SMS native
      window.open(smsUrl, '_self');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de l\'app SMS:', error);
      
      // Fallback: copier le message dans le presse-papiers
      try {
        navigator.clipboard.writeText(`${phoneNumber}: ${message}`);
        alert('L\'application SMS n\'a pas pu s\'ouvrir. Le message a été copié dans le presse-papiers.');
      } catch (clipboardError) {
        alert('Impossible d\'ouvrir l\'application SMS. Veuillez envoyer manuellement le message.');
      }
      
      return false;
    }
  }
}

// Service WhatsApp
export class WhatsAppService {
  static sendWhatsApp(phoneNumber: string, message: string): boolean {
    try {
      // Convertir le numéro français au format international
      const cleanNumber = phoneNumber.replace(/\s+/g, '');
      let formattedNumber = cleanNumber;
      
      // Si le numéro commence par 0, le remplacer par +33
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+33' + formattedNumber.substring(1);
      }
      // Si le numéro ne commence pas par +, ajouter +33
      else if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+33' + formattedNumber;
      }
      
      // Enlever le + pour l'URL WhatsApp
      const whatsappNumber = formattedNumber.replace('+', '');
      
      // Créer l'URL WhatsApp Web
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Ouvrir WhatsApp Web dans un nouvel onglet
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
      
      // Fallback: copier le message dans le presse-papiers
      try {
        navigator.clipboard.writeText(`${phoneNumber}: ${message}`);
        alert('WhatsApp n\'a pas pu s\'ouvrir. Le message a été copié dans le presse-papiers.');
      } catch (clipboardError) {
        alert('Impossible d\'ouvrir WhatsApp. Veuillez envoyer manuellement le message.');
      }
      
      return false;
    }
  }
}