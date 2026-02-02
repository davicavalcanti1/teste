# 📝 Plano de Implementação: Reestruturação de Ocorrências

**Objetivo:** Separar fisicamente as tabelas de ocorrências por tipo, renomear a tabela principal para uso exclusivo de Laudos e criar uma tabela para demandas gerais, enquanto eliminamos tabelas satélites.

---

## 🏗️ 1. Banco de Dados (Supabase)

### 1.1. Renomeação e Criação de Tabelas
Vamos operar com **5 Tabelas Principais** de Ocorrência:

1.  **`occurrences_laudo`** (Antiga `occurrences`)
    *   **Ação:** Renomear tabela `occurrences` para `occurrences_laudo`.
    *   **Filtro:** Manter apenas registros onde `tipo = 'revisao_laudo'` (ou compatível).
    *   **Protocolo:** Manter prefixo atual ou padronizar (ex: `LAU-`).

2.  **`generic_occurrences`** (NOVA)
    *   **Ação:** Criar tabela para "Ocorrências Não Tabeladas" (Livre, Simples).
    *   **Campos:** `id`, `tenant_id`, `protocolo`, `descricao`, `tipo_manual`, `envolvido` (JSONB), `status`.
    *   **Protocolo:** Novo prefixo (ex: `GEN-` ou `LIV-`).

3.  **`administrative_occurrences`** (Já existe - Manter)
4.  **`nursing_occurrences`** (Já existe - Manter)
5.  **`patient_occurrences`** (Já existe - Manter)

### 1.2. Novos Protocolos Numéricos (Padronização 3063)
O cliente solicitou uma padronização específica para os protocolos, abandonando o formato alphanumérico complexo em favor de um formato numérico estruturado.

**Estrutura do Protocolo:** `[3063] + [TIPO] + [SEQUENCIA]`

| Tabela / Tipo | Código Tipo | Formato Exemplo | Lógica de Geração |
| :--- | :---: | :--- | :--- |
| **Laudo** (`occurrences_laudo`) | `01` | `3063010001` | Prefixo fixo + Seq. da Tabela |
| **Administrativa** (`administrative_occurrences`) | `02` | `3063020001` | Prefixo fixo + Seq. da Tabela |
| **Enfermagem** (`nursing_occurrences`) | `03` | `3063030001` | Prefixo fixo + Seq. da Tabela |
| **Paciente** (`patient_occurrences`) | `04` | `3063040001` | Prefixo fixo + Seq. da Tabela |
| **Genérica** (`generic_occurrences`) | N/A | `GEN-2026-001` | Manter formato genérico/livre diferenciado |

> **Nota:** Os protocolos para ocorrências genéricas ("não tabeladas") não seguirão o padrão `3063`, permitindo uma distinção visual clara de que se trata de uma ocorrência fora do fluxo padrão.

### 1.3. Consolidação Vertical (Eliminação de Satélites)
Para **TODAS** as 5 tabelas acima, vamos adicionar as seguintes colunas JSONB para eliminar as tabelas extras (`status_history`, `comments`, `capas`):

*   `historico_status` (JSONB)
*   `comentarios` (JSONB)
*   `dados_capa` (JSONB)

### 1.4. Migração de Dados
1.  **Renomear** `occurrences` para `occurrences_laudo`.
2.  **Criar** `generic_occurrences`.
3.  **Mover** registros de "Livre/Simples" da antiga tabela para a nova.
4.  **Desmembrar** dados das tabelas satélites (`history`, `comments`, `capas`) e inserir nos JSONBs.
5.  **Atualizar Protocolos Antigos:** **SIM.** Re-gerar os protocolos de todas as ocorrências existentes para o novo padrão (`3063...`), ordenando por data de criação para manter a cronologia correta. Isso garante que todo o banco fique 100% padronizado.
6.  **Dropar** tabelas satélites.

---

## 💻 2. Aplicação (Frontend & Backend)

### 2.1. Tipagem (TypeScript)
*   Renomear interface `Occurrence` para `LaudoOccurrence`.
*   Criar interface `GenericOccurrence`.
*   Assegurar que cada tipo tenha sua tipagem forte.

### 2.2. Refatoração de Serviços/Hooks
*   **`useOccurrences` (Hook Geral):** Provavelmente precisará ser quebrado ou usar uma *Database View* se você ainda quiser uma lista unificada em algum lugar. Se não, teremos hooks específicos:
    *   `useLaudoOccurrences` (Aponta par `occurrences_laudo`)
    *   `useGenericOccurrences` (Aponta para `generic_occurrences`)
    *   (Outros já existem).

### 2.3. Formulários de Criação
*   **`FreeOccurrenceForm.tsx` e `SimpleOccurrenceForm.tsx`:**
    *   Alterar o destino do `supabase.insert` de `occurrences` para `generic_occurrences`.
    *   Ajustar a geração de protocolo para usar a nova função de protocolo genérico.

*   **`OccurrenceForm` (Laudo):**
    *   Alterar queries para `occurrences_laudo`.

### 2.4. Dashboards e Listagens
*   **Admin Dashboard:**
    *   Se houver uma "Visão Geral", precisaremos decidir se buscamos de 5 tabelas separadas ou se criamos uma `VIEW` no banco (recomendado) que une tudo apenas para leitura (`SELECT * FROM all_occurrences_view`).

---

## 📅 Cronograma Sugerido

1.  **DB - Migration SQL (Dia 1):** Criar script que renomeia, cria tabela nova e migra dados.
2.  **Back - Triggers/Functions (Dia 1):** Ajustar funções de protocolo (`generate_laudo_protocol`, `generate_generic_protocol`).
3.  **Front - Refatoração Laudo (Dia 2):** Ajustar `occurrence-pdf.ts`, `OccurrenceDetails`, etc. para ler de `occurrences_laudo`.
4.  **Front - Refatoração Genéricas (Dia 2):** Ajustar formulários livres para gravar na nova tabela.
5.  **Front - Limpeza (Dia 3):** Remover código morto e testar fluxos.

---

## ⚠️ Pontos de Atenção
*   **Protocolos Antigos:** Ao mover ocorrências livres para a nova tabela, manteremos os protocolos antigos ou geraremos novos? *Recomendação: Manter os antigos para não quebrar referências impressas.*
*   **PDFs:** O gerador de PDF precisará saber ler de tabelas diferentes dependendo do tipo da ocorrência.
