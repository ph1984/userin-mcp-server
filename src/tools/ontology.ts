import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";

export function registerOntologyTools(server: McpServer) {
  server.tool(
    "get_builder_meta",
    `Retorna TODOS os metadados do Journey Builder e Rule Builder direto do banco:
- condition_types: tipos de condição disponíveis (page_view, click, profile_attribute, has_tag, etc.) com labels, campos, valores padrão
- node_types: tipos de nodes do Journey Builder (trigger.ruleMatch, action.showModal, flow.delay, etc.) com config schemas
- operators: operadores de comparação (igual, maior_que, contém, etc.) com tipos compatíveis

SEMPRE consulte ANTES de criar jornadas ou regras para usar apenas tipos que existem.`,
    {},
    async () => {
      const data = await platform.get("/api/ontology/builder-meta");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_condition_types",
    "Retorna os tipos de condição disponíveis para regras e jornadas (page_view, click, profile_attribute, etc.) com labels, campos e valores padrão. Consulte ANTES de criar condições inline.",
    {},
    async () => {
      const data = await platform.get("/api/ontology/condition-types");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_node_types",
    "Retorna os tipos de nodes disponíveis no Journey Builder (triggers, conditions, actions, flow) com labels e config schemas. Consulte ANTES de criar jornadas.",
    {},
    async () => {
      const data = await platform.get("/api/ontology/node-types");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_operators",
    "Retorna os operadores de comparação disponíveis (igual, maior_que, contém, etc.) com tipos de dado compatíveis.",
    {},
    async () => {
      const data = await platform.get("/api/ontology/operators");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_ontology_fields",
    "Retorna TODOS os atributos/campos disponíveis do perfil do usuário para usar em condições de 'profile_attribute'. Cada campo tem: path (usar no campo 'atributo'), label, dataType, enumValues, group, description. SEMPRE consulte ANTES de criar condições com profile_attribute.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      grouped: z.boolean().optional().describe("Se true, retorna campos agrupados por entidade > grupo > tipo"),
    },
    async ({ companyId, grouped }) => {
      const cid = companyId || config.defaultCompanyId;
      const endpoint = grouped
        ? `/api/ontology/fields/${cid}/grouped`
        : `/api/ontology/fields/${cid}/selectable`;
      const data = await platform.get(endpoint);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_ontology_groups",
    "Lista os grupos de atributos disponíveis (behavior, deposits, preferences, etc) com contagem de campos.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.get(`/api/ontology/groups/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "seed_builder_meta",
    "Popula/atualiza os metadados do builder no banco (condition types, node types, operators). Rode uma vez ou quando adicionar novos tipos.",
    {},
    async () => {
      const data = await platform.post("/api/ontology/seed-builder-meta");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
