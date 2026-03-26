import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

const NODE_TYPES_DESCRIPTION = `Tipo do node. SEMPRE consulte get_node_types para ver os tipos disponiveis.

TIPOS DE NODE MAIS USADOS:
- trigger.ruleMatch: Trigger por regra comportamental (insite)
- trigger.webhook: Trigger por webhook/API (offsite — use para disparar por lista de IDs)
- action.showModal: Exibir Smart Modal no site (insite)
- action.showBlock: Exibir Smart Block no site (insite)
- action.sendSms: Enviar SMS (offsite). Config: { message: "texto com {{name}}", credentialId?: "id" }
- action.sendEmail: Enviar Email (offsite). Config: { subject: "assunto", body: "HTML com {{name}}", credentialId?: "id" }
- action.sendPush: Push notification. Config: { title: "titulo", body: "texto", url?: "link" }
- action.customEvent: Disparar evento SmartTrack/Meta/GA. Config: { eventName: "nome", eventPayload: "{}" }
- flow.delay: Aguardar tempo. Config: { delayMinutes: 60 }
- flow.split: Caminhos paralelos/condicionais
- condition.hasTag: Verificar tag do usuario
- condition.profileAttribute: Verificar atributo do perfil
- flow.end: Fim do fluxo

NUNCA use tipos que nao existem. Consulte get_node_types para lista completa.

MENSAGENS SMS/EMAIL suportam variaveis Liquid: {{name}}, {{phone}}, {{contact.firstName}}, {{deposits.total}}, etc.
O sistema busca automaticamente telefone/email do usuario no perfil e no CRM.`;

const CONFIG_DESCRIPTION = `Configuracao do node (varia por tipo). SEMPRE consulte get_builder_meta para ver config schemas de cada tipo.

EXEMPLOS DE CONFIG POR TIPO:
- action.sendSms: { message: "Ola {{name}}, aproveite 50% bonus!", credentialId: "opcional" }
- action.sendEmail: { subject: "Promo!", body: "<h1>Ola {{name}}</h1>", credentialId: "opcional" }
- action.showModal: { modalId: "id_do_modal" }
- flow.delay: { delayMinutes: 60 }
- condition.hasTag: { tagName: "whale" }

Para inline conditions, consulte get_condition_types.
Para atributos de perfil, consulte get_ontology_fields.`;

const nodeSchema = z.object({
  id: z.string().describe("ID unico do node"),
  type: z.string().describe(NODE_TYPES_DESCRIPTION),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe("Posicao visual no canvas"),
  data: z.object({
    label: z.string().optional().describe("Label do node"),
    description: z.string().optional(),
    config: z.record(z.unknown()).optional().describe(CONFIG_DESCRIPTION),
    isConfigured: z.boolean().optional(),
  }).optional(),
});

const edgeSchema = z.object({
  id: z.string().describe("ID unico da edge"),
  source: z.string().describe("ID do node de origem"),
  target: z.string().describe("ID do node de destino"),
  sourceHandle: z.string().optional().describe("Handle de saida (ex: 'yes', 'no' para conditions, 'variant-a' para abTest, 'path-1' para flow.split)"),
  targetHandle: z.string().optional(),
  animated: z.boolean().optional(),
});

const CREATE_JOURNEY_DESCRIPTION = `Cria uma journey completa. ANTES de criar, SEMPRE:
1. Chame get_builder_meta para ver tipos de nodes e condicoes validos
2. Chame get_ontology_fields se precisar de condicoes com profile_attribute
3. Chame list_smart_modals / list_smart_blocks se precisar de acoes de exibicao
4. Use APENAS tipos que existem no banco (consulte get_node_types e get_condition_types)

FLUXO OFFSITE (SMS/Email para lista de IDs):
1. Crie a journey com journeyType="offsite" e trigger.webhook
2. Adicione nodes action.sendSms ou action.sendEmail com a mensagem
3. Ative com update_journey { status: "active" }
4. Dispare para usuarios com trigger_journey_offsite_batch

EXEMPLO OFFSITE SMS:
nodes: [
  { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Webhook" } },
  { id: "sms", type: "action.sendSms", position: {x:300,y:150}, data: { label: "SMS Promo", config: { message: "Ola {{name}}, aproveite 50% bonus! Codigo: VIP50" } } },
  { id: "end", type: "flow.end", position: {x:300,y:300}, data: { label: "Fim" } }
]
edges: [
  { id: "e1", source: "t", target: "sms" },
  { id: "e2", source: "sms", target: "end" }
]

EXEMPLO INSITE (modal no site):
nodes: [
  { id: "t", type: "trigger.ruleMatch", position: {x:300,y:0}, data: { label: "Regra", config: { ruleId: "id_da_regra" } } },
  { id: "modal", type: "action.showModal", position: {x:300,y:150}, data: { label: "Modal Promo", config: { modalId: "id_do_modal" } } },
  { id: "end", type: "flow.end", position: {x:300,y:300}, data: { label: "Fim" } }
]`;

export function registerJourneyTools(server: McpServer) {
  server.tool(
    "list_journeys",
    "Lista todas as journeys da empresa. Journeys sao fluxos de automacao visual com triggers, condicoes e acoes. Retorna id, nome, status, tipo (insite/offsite), e contagem de nodes.",
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.get("/api/journeys", { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_journey",
    "Obtem detalhes completos de uma journey, incluindo nodes, edges, configuracoes e status. Use para entender o fluxo antes de modificar.",
    {
      journeyId: z.string().describe("ID da journey"),
    },
    async ({ journeyId }) => {
      const data = await platform.get(`/api/journeys/${journeyId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_journey",
    CREATE_JOURNEY_DESCRIPTION,
    {
      name: z.string().describe("Nome da journey"),
      description: z.string().optional().describe("Descricao"),
      journeyType: z.enum(["insite", "offsite"]).optional().describe("Tipo: insite (no site, triggers por regras) ou offsite (SMS/email, triggers por webhook/API)"),
      status: z.enum(["draft", "active", "paused", "archived"]).optional().describe("Status (default: draft). Use 'active' se quiser ativar imediatamente."),
      nodes: z.array(nodeSchema).describe("Array de nodes da journey"),
      edges: z.array(edgeSchema).describe("Array de edges conectando nodes"),
    },
    async ({ name, description, journeyType, status, nodes, edges }) => {
      const data = await platform.post("/api/journeys", {
        name,
        description,
        journeyType: journeyType || "insite",
        status: status || "draft",
        nodes,
        edges,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "update_journey",
    "Atualiza uma journey existente. Use para ativar ({ status: 'active' }), pausar ({ status: 'paused' }), ou modificar nodes/edges.",
    {
      journeyId: z.string().describe("ID da journey"),
      updates: z.record(z.unknown()).describe("Campos a atualizar. Ex: { status: 'active' } ou { nodes: [...], edges: [...] }"),
    },
    async ({ journeyId, updates }) => {
      const data = await platform.put(`/api/journeys/${journeyId}`, updates);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "duplicate_journey",
    "Duplica uma journey existente. Cria uma copia com status 'draft'.",
    {
      journeyId: z.string().describe("ID da journey a duplicar"),
    },
    async ({ journeyId }) => {
      const data = await platform.post(`/api/journeys/${journeyId}/duplicate`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "trigger_journey_offsite",
    `Dispara jornadas OffSite para UM usuario especifico. O sistema avalia todas as jornadas offsite ativas da empresa e executa as que se aplicam ao usuario.

Use apos criar e ativar uma jornada offsite. O usuario e identificado por externalId (ID do jogador/cliente) ou visitorId (ID do browser).

Retorna: quantas jornadas foram avaliadas, quais dispararam, quais foram puladas, e tempo de execucao.`,
    {
      externalId: z.string().optional().describe("ID externo do usuario (ID do jogador na plataforma do cliente)"),
      visitorId: z.string().optional().describe("ID do visitante/browser (alternativa ao externalId)"),
      event: z.string().optional().describe("Nome do evento que disparou (ex: 'real_madrid_bet', 'promo_vip'). Default: 'webhook'"),
    },
    async ({ externalId, visitorId, event }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.post("/api/journeys/offsite/trigger", {
        companyId: cid,
        externalId,
        visitorId,
        event: event || "webhook",
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "trigger_journey_offsite_batch",
    `Dispara jornadas OffSite para MULTIPLOS usuarios de uma vez. Ideal para:
- Enviar SMS/email para lista de IDs (ex: quem apostou no Real Madrid)
- Campanhas segmentadas por lista externa
- Ativacoes em lote

Cada usuario e processado individualmente — o sistema avalia todas as jornadas offsite ativas e executa as aplicaveis.

FLUXO COMPLETO:
1. Obtenha lista de external_ids (ex: query ClickHouse, lista externa, segmento)
2. Crie e ative uma jornada offsite com action.sendSms ou action.sendEmail
3. Chame esta tool com os IDs

Retorna: total processado, quantos com sucesso, e resultados individuais.`,
    {
      users: z.array(z.object({
        externalId: z.string().optional().describe("ID externo do usuario"),
        visitorId: z.string().optional().describe("ID do visitante (alternativa)"),
      })).describe("Array de usuarios para disparar. Cada um precisa de externalId ou visitorId."),
      event: z.string().optional().describe("Nome do evento (ex: 'promo_real_madrid'). Default: 'batch'"),
    },
    async ({ users, event }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.post("/api/journeys/offsite/trigger-batch", {
        companyId: cid,
        users,
        event: event || "batch",
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_journey_analytics",
    "Retorna analytics completos de uma journey: total de execucoes, completadas, taxa de sucesso, duracao media, e metricas por node.",
    {
      journeyId: z.string().describe("ID da journey"),
    },
    async ({ journeyId }) => {
      const data = await platform.get(`/api/journeys/${journeyId}/analytics`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_journey_funnel",
    "Retorna o funil da journey: quantos usuarios passaram por cada node, taxas de conversao entre etapas, e pontos de abandono.",
    {
      journeyId: z.string().describe("ID da journey"),
    },
    async ({ journeyId }) => {
      const data = await platform.get(`/api/journeys/${journeyId}/analytics/funnel`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
