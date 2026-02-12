import { z } from "zod";

// ==============================================================================
// 1. DISPENSER SCHEMAS
// ==============================================================================

export const dispenserOpenSchema = z.object({
    localizacao: z.string().min(1, "Localização é obrigatória"),
    status_problema: z.enum(["faltando_insumo", "quebrado", "sujo", "outro"], {
        required_error: "Selecione o status do dispenser",
    }),
    descricao: z.string().optional(),
});

export type DispenserOpenForm = z.infer<typeof dispenserOpenSchema>;

export const dispenserCloseSchema = z.object({
    protocolo: z.string().min(1),
    funcionario: z.string().min(2, "Identifique-se"),
    observacoes: z.string().optional(),
});

export type DispenserCloseForm = z.infer<typeof dispenserCloseSchema>;

// ==============================================================================
// 2. BANHEIRO SCHEMAS
// ==============================================================================

export const banheiroOpenSchema = z.object({
    localizacao: z.string().min(1),
    problema: z.enum(["faltando_insumo", "quebrado", "sujo", "outro"], {
        required_error: "Selecione o problema principal",
    }),
    // Sub-option for 'faltando_insumo'
    tipo_insumo: z.enum(["sabonete", "papel_higienico", "papel_toalha"]).optional(),

    // Description used for 'quebrado' or general notes. 
    // User wants to remove the explicit "O que precisa ser feito" field, but needs input for "Tem algo quebrado?".
    // We can reuse 'descricao' for this purpose.
    descricao: z.string().optional(),

    // New field for Full Trash Cans
    lixeira_cheia: z.boolean().default(false),
});

export type BanheiroOpenForm = z.infer<typeof banheiroOpenSchema>;

export const banheiroCloseSchema = dispenserCloseSchema; // Same fields
export type BanheiroCloseForm = z.infer<typeof banheiroCloseSchema>;

// ==============================================================================
// 3. AR CONDICIONADO SCHEMAS
// ==============================================================================

export const acSchema = z.object({
    localizacao: z.string().min(1, "Sala é obrigatória"),
    origem: z.enum(["imago", "terceirizado", "dreno"]),
    modelo: z.string().optional(),
    numero_serie: z.string().optional(),

    // Maintenance Type (Preventive vs Corrective)
    tipo_manutencao: z.enum(["preventiva", "corretiva"]).optional(),

    // Checklist dynamic based on origin?
    limpeza_filtro: z.boolean().default(false),
    limpeza_carenagem: z.boolean().default(false),
    teste_funcionamento: z.boolean().default(false),

    observacoes: z.string().optional(),
});

export type ACForm = z.infer<typeof acSchema>;


// ==============================================================================
// 4. SERVIÇOS TERCEIRIZADOS SCHEMAS
// ==============================================================================

export const serviceSchema = z.object({
    localizacao: z.string().min(1),
    empresa_prestador: z.string().min(2, "Nome da empresa/prestador"),
    responsavel_tecnico: z.string().optional(),
    data_servico: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"), // ISO string or YYYY-MM-DD
    tipo_servico: z.string().min(2, "Tipo de serviço (ex: Desentupimento)"),
    descricao_servico: z.string().min(5, "Descreva o serviço realizado"),
    custo: z.coerce.number().min(0).optional(),
    observacoes: z.string().optional(),
});

export type ServiceForm = z.infer<typeof serviceSchema>;
