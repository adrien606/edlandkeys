import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InspectionEmailRequest {
  to: string;
  clientName: string;
  typeLabel: string;
  inspectionDate: string;
  buildingCode: string;
  htmlContent: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, clientName, typeLabel, inspectionDate, buildingCode, htmlContent, fileName }: InspectionEmailRequest = await req.json();

    const htmlBuffer = new TextEncoder().encode(htmlContent);
    const base64Content = btoa(String.fromCharCode(...htmlBuffer));

    const buildingInfo = buildingCode ? `<p><strong>Bâtiment :</strong> ${buildingCode}</p>` : '';

    const emailResponse = await resend.emails.send({
      from: "BEL AIR CAMP <onboarding@resend.dev>",
      to: [to],
      subject: `${typeLabel} - ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="color: #333; margin: 0;">BEL AIR CAMP</h1>
            <p style="color: #666; margin: 5px 0;">SIREN : 821797073</p>
          </div>
          
          <h2 style="color: #333;">${typeLabel}</h2>
          
          <p>Bonjour,</p>
          
          <p>Veuillez trouver ci-joint l'état des lieux concernant <strong>${clientName}</strong>.</p>
          
          <p><strong>Date :</strong> ${inspectionDate}</p>
          ${buildingInfo}
          
          <p>Ce document contient :</p>
          <ul>
            <li>L'état détaillé de chaque zone inspectée</li>
            <li>Les observations et commentaires</li>
            <li>Les photos associées</li>
            <li>Les signatures de validation</li>
          </ul>
          
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p><strong>BEL AIR CAMP</strong><br>
            SIREN : 821797073</p>
            <p>Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: base64Content,
        },
      ],
    });

    console.log("Inspection email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-inspection-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
