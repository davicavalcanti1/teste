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
        const { email, password, full_name } = await req.json();

        if (!email || !password || !full_name) {
            return new Response(JSON.stringify({ error: "Dados incompletos" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const resendApiKey = Deno.env.get("RESEND_API_KEY");

        if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
            return new Response(JSON.stringify({ error: "Configuração do servidor incompleta" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const resend = new Resend(resendApiKey);

        // 1. Create User
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name },
            email_confirm: false, // We want to send our own confirmation link
        });

        if (createError) {
            return new Response(JSON.stringify({ error: createError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Generate Confirmation Link
        const SITE_URL = "https://gestao.imagoradiologia.cloud";
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: "signup",
            email,
            options: {
                redirectTo: `${SITE_URL}/auth`,
            },
        });

        if (linkError) {
            return new Response(JSON.stringify({ error: "Erro ao gerar link de confirmação" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let confirmationLink = linkData.properties.action_link;
        // Domain safety check
        if (confirmationLink && !confirmationLink.includes("gestao.imagoradiologia.cloud")) {
            confirmationLink = confirmationLink.replace("ocorrencias.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
            confirmationLink = confirmationLink.replace("gesto.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
            confirmationLink = confirmationLink.replace("teste.imagoradiologia.cloud", "gestao.imagoradiologia.cloud");
        }

        // 3. Send Email
        await resend.emails.send({
            from: "IMAGO Sistema <noreply@imagoradiologia.cloud>",
            to: [email],
            subject: "Confirme seu cadastro - Sistema Imago",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #325C93;">Bem-vindo ao Sistema Imago!</h2>
          <p>Olá, ${full_name}. Obrigado por solicitar acesso.</p>
          <p>Para confirmar seu e-mail e ativar sua solicitação, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #325C93; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmar meu E-mail</a>
          </div>
          <p style="font-size: 12px; color: #777;">Sua conta passará por uma análise de aprovação após a confirmação do e-mail.</p>
        </div>
      `,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
