import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";

export function registerUserProfileTools(server: McpServer) {
  server.tool(
    "search_user_profiles",
    "Busca textual em perfis de usuarios (por nome, email, telefone, externalId). Retorna perfis com comportamento, depositos, intencao e tags.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      query: z.string().describe("Texto de busca (nome, email, telefone ou ID)"),
      limit: z.number().optional().describe("Limite de resultados (default: 20)"),
    },
    async ({ companyId, query, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/search", {
        companyId: cid,
        q: query,
        limit: limit || 20,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profiles_by_tag",
    `Busca usuarios que possuem uma tag especifica. Tags sao atribuidas automaticamente por regras comportamentais.
Exemplos de tags: whale, high_roller, vip, churned, night_owl, mobile_user, frequent_visitor.
Use tags_stats primeiro para ver quais tags existem e quantos usuarios cada uma tem.`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      tag: z.string().describe("Nome da tag (ex: 'whale', 'vip', 'churned')"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, tag, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/api/user-profiles/by-tag/${tag}`, {
        companyId: cid,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profiles_by_deposit_tier",
    `Busca usuarios por tier de deposito. Tiers: none (nunca depositou), low (< R$200), medium (< R$1000), high (< R$5000), whale (>= R$5000).
Ideal para segmentar audiencias por valor.`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      tier: z.enum(["none", "low", "medium", "high", "whale"]).describe("Tier de deposito"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, tier, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/by-deposits", {
        companyId: cid,
        tier,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profiles_by_intention",
    `Busca usuarios por nivel de intencao de compra/deposito. Niveis: very_low, low, medium, high, very_high.
Ideal para encontrar usuarios prontos para converter.`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      level: z.enum(["very_low", "low", "medium", "high", "very_high"]).describe("Nivel de intencao"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, level, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/by-intention", {
        companyId: cid,
        level,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_high_intention_profiles",
    "Retorna usuarios com alta intencao que ainda NAO depositaram. Sao os usuarios mais propensos a converter — ideais para campanhas de primeiro deposito.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/high-intention", {
        companyId: cid,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profiles_by_stage",
    `Busca usuarios por estagio no funil. Estagios: anonymous (visitante), registered (cadastrado), ftd (primeiro deposito), depositor (recorrente), churned (inativo).`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      stage: z.string().describe("Estagio: anonymous, registered, ftd, depositor, churned"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, stage, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/by-stage", {
        companyId: cid,
        stage,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_inactive_profiles",
    "Retorna usuarios inativos (que pararam de acessar o site). Uteis para campanhas de reativacao/reengajamento.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      days: z.number().optional().describe("Dias de inatividade minima (default: 7)"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ companyId, days, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/inactive", {
        companyId: cid,
        days: days || 7,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profile_stats",
    "Retorna estatisticas consolidadas dos perfis da empresa: total por stage, por tier, por intencao, media de sessoes, depositos, etc. Visao executiva rapida.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/stats", {
        companyId: cid,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_tags_stats",
    "Retorna estatisticas de TODAS as tags: quantos usuarios em cada tag, porcentagem do total. Ideal para entender a distribuicao da base.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/user-profiles/tags-stats", {
        companyId: cid,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_company_diagnostic",
    "Diagnostico completo da empresa: health score, metricas de conversao, distribuicao de usuarios, tendencias, alertas e recomendacoes. Visao executiva.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/api/diagnostic/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
