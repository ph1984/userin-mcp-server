import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerCampaignTools(server: McpServer) {
  server.tool(
    "list_campaigns",
    "Lista todas as campanhas da empresa. Campanhas podem ser SMS, RCS, WhatsApp ou Email.",
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.get("/api/campaigns", { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_campaign",
    "Cria uma campanha de messaging (SMS, Email, RCS, WhatsApp). Define audiencia, conteudo, e canal de envio.",
    {
      name: z.string().describe("Nome da campanha"),
      type: z.enum(["sms", "email", "rcs", "whatsapp"]).describe("Canal de envio"),
      content: z.object({
        subject: z.string().optional().describe("Assunto (para email)"),
        body: z.string().describe("Corpo da mensagem"),
        templateId: z.string().optional().describe("ID do template a usar"),
      }).describe("Conteudo da campanha"),
      audience: z.object({
        segmentId: z.string().optional().describe("ID do segmento alvo"),
        listId: z.string().optional().describe("ID da lista de contatos"),
      }).optional().describe("Audiencia alvo"),
      schedule: z.object({
        sendAt: z.string().optional().describe("Data/hora para envio agendado (ISO 8601)"),
        timezone: z.string().optional().describe("Timezone (ex: America/Sao_Paulo)"),
      }).optional().describe("Agendamento"),
    },
    async ({ name, type, content, audience, schedule }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.post("/api/campaigns", {
        companyId: cid,
        name,
        type,
        content,
        audience,
        schedule,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "execute_campaign",
    "Executa (dispara) uma campanha existente. A campanha deve estar no status correto para ser executada.",
    {
      campaignId: z.string().describe("ID da campanha"),
    },
    async ({ campaignId }) => {
      const data = await platform.post(`/api/campaigns/${campaignId}/execute`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_campaign_stats",
    "Retorna estatisticas de uma campanha: enviados, entregues, abertos, clicados, erros, etc.",
    {
      campaignId: z.string().describe("ID da campanha"),
    },
    async ({ campaignId }) => {
      const data = await platform.get(`/api/campaigns/${campaignId}/stats`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
