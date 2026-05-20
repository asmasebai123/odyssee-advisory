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
      ? `<div style="background: #f7f9fa; padding: 15px; border: 1px solid #e3e8ec; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #2C3E5C;"><strong>Voici vos accès de connexion :</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #555;"><strong>Identifiant (Email) :</strong> ${to}</p>
          <p style="margin: 0; font-size: 13px; color: #555;"><strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
         </div>`
      : "";

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Ouverture de votre dossier - Odyssée Advisory`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2C3E5C; border-bottom: 2px solid #B8965A; padding-bottom: 10px;">Odyssée Advisory</h2>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Nous avons le plaisir de vous informer que votre dossier d'investissement immobilier <strong>"${dossierTitle}"</strong> a été officiellement ouvert dans notre cabinet.</p>
          ${credsHtml}
          <p>Vous pouvez dès à présent vous connecter à votre espace sécurisé pour suivre son avancement et échanger avec votre avocat conseil.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://odyssee-advisory.com/login" style="background-color: #B8965A; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 3px; display: inline-block;">Accéder à mon Espace</a>
          </div>
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            Cet email est envoyé automatiquement, merci de ne pas y répondre directement. Pour toute question, veuillez utiliser la messagerie sécurisée de votre espace client.
          </p>
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
