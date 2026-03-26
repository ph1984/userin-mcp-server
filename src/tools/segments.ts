import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";

export function registerSegmentTools(server: McpServer) {
  server.tool(
    "list_segments",
    "Lista todos os segmentos disponiveis. Retorna id, nome, descricao, status e condicoes de cada segmento.",
    {},
    async () => {
      const data = await segments.get("/segments");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_segment",
    "Obtem detalhes de um segmento especifico, incluindo contagem de membros.",
    {
      segmentId: z.string().describe("ID do segmento"),
      companyId: z.string().optional().describe("ID da empresa (usa DEFAULT_COMPANY_ID se omitido)"),
    },
    async ({ segmentId, companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/segments/${segmentId}`, { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_segment_members",
    "Lista os membros (userIds) de um segmento. Suporta paginacao por shard.",
    {
      segmentId: z.string().describe("ID do segmento"),
      companyId: z.string().optional().describe("ID da empresa"),
      shard: z.number().optional().describe("Shard number (0-63) para paginacao"),
      limit: z.number().optional().describe("Limite de resultados"),
    },
    async ({ segmentId, companyId, shard, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/segments/${segmentId}/members`, {
        companyId: cid,
        shard,
        limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "check_user_in_segment",
    "Verifica se um usuario especifico pertence a um segmento.",
    {
      segmentId: z.string().describe("ID do segmento"),
      userId: z.string().describe("ID do usuario"),
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ segmentId, userId, companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/segments/${segmentId}/check/${userId}`, { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "evaluate_segment",
    "Avalia um segmento com features customizadas (debug). Util para testar se um conjunto de features entraria no segmento.",
    {
      segmentId: z.string().describe("ID do segmento"),
      features: z.record(z.unknown()).describe("Objeto de features para avaliar, ex: { deposit_sum_24h: 500, click_count_7d: 3 }"),
    },
    async ({ segmentId, features }) => {
      const data = await segments.post(`/segments/${segmentId}/evaluate`, { features });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_blast_campaign",
    "Cria uma campanha de blast para um segmento. Popula o outbox com todos os membros do segmento para envio.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      segmentId: z.string().describe("ID do segmento alvo"),
      campaignId: z.string().optional().describe("ID da campanha (gerado automaticamente se omitido)"),
    },
    async ({ companyId, segmentId, campaignId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.post("/blast/campaigns", {
        companyId: cid,
        segmentId,
        campaignId,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
