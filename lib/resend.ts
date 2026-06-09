import { Resend } from "resend";

/**
 * Server-side Resend client used by API routes for transactional email.
 */
export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export const FROM_EMAIL = "Odyssée Advisory <no-reply@odyssee-advisory.com>";

export async function sendDossierCreatedEmail(to: string, clientName: string, dossierTitle: string, tempPassword?: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("your_resend_api_key")) return { success: false, message: "No API Key" };
  try {
    const credsHtml = tempPassword 
      ? `<div style="background-color: #FAF8F5; border-left: 4px solid #B8965A; padding: 20px 24px; border-radius: 6px; margin: 28px 0;">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #1E293B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Vos accès de connexion sécurisés :</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; width: 140px;"><strong>Identifiant (Email) :</strong></td>
              <td style="padding: 6px 0; color: #1E293B; font-family: monospace; font-weight: 700;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;"><strong>Mot de passe temporaire :</strong></td>
              <td style="padding: 6px 0; color: #B8965A; font-family: monospace; font-weight: 700; letter-spacing: 0.05em;">${tempPassword}</td>
            </tr>
          </table>
          <p style="margin: 14px 0 0 0; font-size: 11.5px; color: #94A3B8; font-style: italic; line-height: 1.4;">
            * Par mesure de sécurité, nous vous conseillons vivement de modifier ce mot de passe temporaire dès votre première connexion.
          </p>
         </div>`
      : "";

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Ouverture de votre dossier - Odyssée Advisory`,
      html: `
        <div style="background-color: #F8FAFC; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025); overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #1E293B; padding: 32px; text-align: center; border-bottom: 3px solid #B8965A;">
              <span style="font-size: 22px; font-weight: 800; letter-spacing: 0.15em; color: #FFFFFF; text-transform: uppercase;">
                ODYSSÉE <span style="color: #B8965A;">ADVISORY</span>
              </span>
              <p style="font-size: 11px; color: #94A3B8; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600;">Cabinet d'avocats & Conseil</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px; line-height: 1.6; color: #334155; font-size: 15px;">
              <p style="margin-top: 0; font-size: 16px; color: #1E293B;">Bonjour <strong>${clientName}</strong>,</p>
              
              <p>Nous avons le plaisir de vous informer que votre dossier d'investissement immobilier <strong>"${dossierTitle}"</strong> a été officiellement ouvert au sein de notre cabinet.</p>
              
              ${credsHtml}
              
              <p>Votre espace privé vous permettra de suivre en temps réel l'avancement de vos démarches, d'accéder aux pièces juridiques de votre dossier, et d'échanger directement avec votre avocat via notre messagerie sécurisée.</p>
              
              <div style="margin: 36px 0; text-align: center;">
                <a href="https://odyssee-advisory.com/login" style="background-color: #B8965A; color: #FFFFFF; padding: 14px 28px; text-decoration: none; font-weight: 700; border-radius: 6px; display: inline-block; font-size: 14px; letter-spacing: 0.05em; box-shadow: 0 4px 10px rgba(184, 150, 90, 0.25);">
                  Accéder à mon Espace Privé
                </a>
              </div>
              
              <p style="margin-bottom: 0;">
                Restant à votre entière disposition,<br/>
                <span style="color: #1E293B; font-weight: 600;">L'équipe Odyssée Advisory</span>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11.5px; color: #64748B; line-height: 1.5;">
              Cet email est envoyé automatiquement par notre plateforme sécurisée. Merci de ne pas y répondre directement.<br/>
              Pour toute question ou assistance, veuillez écrire à notre secrétariat.<br/>
              <span style="display: block; margin-top: 12px; font-weight: 600; color: #94A3B8;">© ${new Date().getFullYear()} Odyssée Advisory. Tous droits réservés.</span>
            </div>
            
          </div>
        </div>
      `
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending dossier created email:", err);
    return { success: false, error: err.message };
  }
}

export async function sendDossierStatusChangedEmail(to: string, clientName: string, dossierTitle: string, newStatusLabel: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("your_resend_api_key")) return { success: false, message: "No API Key" };
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Mise à jour de votre dossier - Odyssée Advisory`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2C3E5C; border-bottom: 2px solid #B8965A; padding-bottom: 10px;">Odyssée Advisory</h2>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Le statut de votre dossier d'acquisition <strong>"${dossierTitle}"</strong> a été mis à jour par votre conseiller conseil.</p>
          <p>Nouvel état du dossier : <strong style="color: #B8965A; text-transform: uppercase;">${newStatusLabel}</strong></p>
          <p>Connectez-vous à votre espace privé pour visualiser la nouvelle étape franchie et les actions planifiées.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://odyssee-advisory.com/login" style="background-color: #B8965A; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 3px; display: inline-block;">Voir mon Dossier</a>
          </div>
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            Cet email est envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      `
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending status email:", err);
    return { success: false, error: err.message };
  }
}

export async function sendDocumentRequestedEmail(to: string, clientName: string, documentName: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("your_resend_api_key")) return { success: false, message: "No API Key" };
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Action Requise : Nouvelle pièce demandée - Odyssée Advisory`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2C3E5C; border-bottom: 2px solid #B8965A; padding-bottom: 10px;">Odyssée Advisory</h2>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Pour faire avancer votre dossier, votre avocat conseil a formulé une demande de pièce justificative :</p>
          <p style="background: #FBF6EC; padding: 15px; border-left: 4px solid #B8965A; font-size: 15px; font-weight: bold; color: #2C3E5C;">
            Document requis : ${documentName}
          </p>
          <p>Merci de bien vouloir téléverser cette pièce dans l'espace "Documents" sécurisé de votre tableau de bord dès que possible.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://odyssee-advisory.com/login" style="background-color: #B8965A; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 3px; display: inline-block;">Déposer le Document</a>
          </div>
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            Cet email est envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      `
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending doc request email:", err);
    return { success: false, error: err.message };
  }
}

export async function sendDocumentUploadedEmail(toAvocat: string, clientName: string, dossierTitle: string, documentName: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("your_resend_api_key")) return { success: false, message: "No API Key" };
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toAvocat],
      subject: `Nouveau document déposé par le client - Odyssée Advisory`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2C3E5C; border-bottom: 2px solid #B8965A; padding-bottom: 10px;">Odyssée Advisory</h2>
          <p>Bonjour,</p>
          <p>Le client <strong>${clientName}</strong> a téléversé un nouveau document pour son dossier <strong>"${dossierTitle}"</strong>.</p>
          <p style="background: #FBF6EC; padding: 15px; border-left: 4px solid #B8965A; font-size: 15px; font-weight: bold; color: #2C3E5C;">
            Document déposé : ${documentName}
          </p>
          <p>Vous pouvez consulter ce document directement sur le tableau de bord du cabinet.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://odyssee-advisory.com/fr/admin" style="background-color: #B8965A; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 3px; display: inline-block;">Accéder au Tableau de Bord Cabinet</a>
          </div>
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            Cet email est envoyé automatiquement à l'équipe Odyssée Advisory.
          </p>
        </div>
      `
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending doc uploaded email:", err);
    return { success: false, error: err.message };
  }
}
