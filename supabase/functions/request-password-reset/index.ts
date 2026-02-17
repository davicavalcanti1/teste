import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { email } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const resendApiKey = Deno.env.get("RESEND_API_KEY");

        if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
            console.error("Missing environment variables");
            return new Response(JSON.stringify({ error: "Configuração do servidor incompleta" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const resend = new Resend(resendApiKey);

        // Generate recovery link
        const SITE_URL = "https://gestao.imagoradiologia.cloud";
        const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${SITE_URL}/reset-password`,
            },
        });

        if (resetError) {
            console.error("Error generating reset link:", resetError);
            return new Response(JSON.stringify({ error: "Erro ao gerar link de recuperação", details: resetError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let resetLink = data.properties.action_link;

        // Safety check to ensure the domain is correct
        if (resetLink && !resetLink.includes("gestao.imagoradiologia.cloud")) {
            resetLink = resetLink.replace("ocorrencias.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
            resetLink = resetLink.replace("gesto.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
            resetLink = resetLink.replace("teste.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
        }

        // Send email via Resend
        const { error: emailError } = await resend.emails.send({
            from: "IMAGO Sistema <noreply@imagoradiologia.cloud>",
            to: [email],
            subject: "Redefinição de Senha - Sistema Imago",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Redefinição de Senha</title>
        </head>
        <body style="font-family: sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #325C93; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Ocorrências Imago</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333;">Recuperação de Acesso</h2>
              <p style="color: #555; line-height: 1.6;">Você solicitou a redefinição de sua senha. Clique no botão abaixo para prosseguir:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #325C93; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
              </div>
              <p style="color: #888; font-size: 14px;">Se você não solicitou esta alteração, pode ignorar este e-mail.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #aaa; font-size: 12px;">Se o botão não funcionar, copie este link: <br> ${resetLink}</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        if (emailError) {
            console.error("Email error:", emailError);
            return new Response(JSON.stringify({ error: "Erro ao enviar e-mail", details: emailError.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, message: "E-mail de recuperação enviado com sucesso." }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Global error:", error);
        return new Response(JSON.stringify({ error: "Erro interno no servidor", details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
