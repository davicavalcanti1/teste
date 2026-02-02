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
    descricao: z.string().min(3, "Descreva o que precisa ser feito"),
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
