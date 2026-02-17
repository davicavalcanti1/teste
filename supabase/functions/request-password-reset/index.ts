import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
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

        // Force the correct domain regardless of Supabase settings
        if (resetLink) {
            // This regex replaces any subdomain of imagoradiologia.cloud with 'gestao'
            resetLink = resetLink.replace(/https:\/\/[^.]+\.imagoradiologia\.cloud/, "https://gestao.imagoradiologia.cloud");
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha - Imago</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(50,92,147,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #325C93 0%, #4a7ab8 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">Ocorrências Imago</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Excelência em Diagnóstico</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 35px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Recuperação de Acesso</h2>
              
              <p style="color: #475569; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                Olá! Recebemos uma solicitação para redefinir a senha da sua conta no sistema. Se foi você, clique no botão abaixo para prosseguir:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #325C93 0%, #4a7ab8 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(50,92,147,0.25); transition: transform 0.2s;">
                  Redefinir Minha Senha
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 25px 0 0 0; background: #f1f5f9; padding: 15px; border-radius: 8px;">
                <strong>Segurança:</strong> Por motivos de segurança, este link é válido por apenas 24 horas. Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.
              </p>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 35px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center; line-height: 1.6;">
                Se o botão não funcionar, copie e cole o link abaixo:<br>
                <a href="${resetLink}" style="color: #325C93; word-break: break-all; text-decoration: none;">${resetLink}</a>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} IMAGO Sistema. Todos os direitos reservados.
              </p>
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
