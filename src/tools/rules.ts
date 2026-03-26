import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform, aiJourney } from "../http-client.js";
import { config } from "../config.js";

export function registerRuleTools(server: McpServer) {
  server.tool(
    "list_rules",
    "Lista todas as regras comportamentais da empresa. Regras definem quando componentes (modals, cards, blocks) sao exibidos ao usuario.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.get("/api/rules", { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_rule",
    `Cria uma regra comportamental. ANTES de criar, SEMPRE:
1. Chame get_journey_builder_schema para ver tipos de condicoes validos
2. Chame get_ontology_fields se precisar de condicoes com atributos de perfil

Tipos de condicao validos para conditions[].type:
- page_view_current: Pagina atual (campo: url, operador: igual/contém)
- page_view_visited: Pagina visitada na sessao
- page_view_last: Ultima pagina
- click: Click em elemento (campo: metadata.clickData.class/id/text/tag)
- profile_attribute: Atributo de perfil (atributo: path da ontologia, ex: deposits.count)
- has_tag: Tem tag (valor: nome da tag)
- access: Estado de login (valor: logged_in/has_logged/never_logged)

Operadores: igual, diferente, maior_que, menor_que, maior_ou_igual, menor_ou_igual, contém, não_contém, existe, não_existe, começa_com, termina_com`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      name: z.string().describe("Nome da regra"),
      description: z.string().optional().describe("Descricao da regra"),
      type: z.enum(["Comportamental", "Plano", "Gerada por IA"]).optional().describe("Tipo da regra"),
      json: z.object({
        conditionGroup: z.object({
          operator: z.enum(["AND", "OR"]).describe("Operador logico do grupo"),
          conditions: z.array(z.unknown()).describe("Array de condicoes. Cada condicao: { type: 'page_view_current'|'click'|'profile_attribute'|'has_tag'|'access', campo/atributo: '...', operador: 'igual'|'contém'|..., valor: ... }"),
        }).describe("Grupo de condicoes raiz"),
      }).describe("Estrutura JSON da regra com conditionGroup"),
      action_js: z.string().optional().describe("Codigo JavaScript a executar quando a regra dispara"),
      action_components: z.array(z.string()).optional().describe("IDs dos componentes (modals, cards) a exibir"),
    },
    async ({ companyId, name, description, type, json, action_js, action_components }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.post("/api/rules", {
        company_id: cid,
        name,
        description,
        type: type || "Comportamental",
        json,
        action_js,
        action_components,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "generate_rule_ai",
    "Gera uma regra comportamental automaticamente usando IA a partir de uma descricao em linguagem natural. O sistema usa Knowledge Graph para validar atributos e operadores. Exemplo: 'Quando o usuario depositar mais de R$500 e estiver na pagina de cassino'.",
    {
      prompt: z.string().min(1).max(1000).describe("Descricao em linguagem natural do comportamento desejado"),
      companyId: z.string().optional().describe("ID da empresa"),
      available_cards: z.array(z.string()).optional().describe("IDs dos cards/componentes disponiveis para a regra"),
      language: z.enum(["PT", "EN"]).optional().describe("Idioma (default: PT)"),
    },
    async ({ prompt, companyId, available_cards, language }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await aiJourney.post("/api/v1/generate/rule", {
        prompt,
        company_id: cid,
        available_cards: available_cards || [],
        language: language || "PT",
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
