import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerUserProfileTools(server: McpServer) {
  server.tool(
    "search_user_profiles",
    "Busca textual em perfis de usuarios (por nome, email, telefone, externalId). Retorna perfis com comportamento, depositos, intencao e tags.",
    {
      query: z.string().describe("Texto de busca (nome, email, telefone ou ID)"),
      limit: z.number().optional().describe("Limite de resultados (default: 20)"),
    },
    async ({ query, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      tag: z.string().describe("Nome da tag (ex: 'whale', 'vip', 'churned')"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ tag, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      tier: z.enum(["none", "low", "medium", "high", "whale"]).describe("Tier de deposito"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ tier, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      level: z.enum(["very_low", "low", "medium", "high", "very_high"]).describe("Nivel de intencao"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ level, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      stage: z.string().describe("Estagio: anonymous, registered, ftd, depositor, churned"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ stage, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
      days: z.number().optional().describe("Dias de inatividade minima (default: 7)"),
      limit: z.number().optional().describe("Limite (default: 50)"),
    },
    async ({ days, limit }) => {
      session.requireAuth();
      const cid = session.companyId;
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
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.get("/api/user-profiles/stats", {
        companyId: cid,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_tags_stats",
    "Retorna estatisticas de TODAS as tags: quantos usuarios em cada tag, porcentagem do total. Ideal para entender a distribuicao da base.",
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.get("/api/user-profiles/tags-stats", {
        companyId: cid,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_company_diagnostic",
    "Diagnostico completo da empresa: health score, metricas de conversao, distribuicao de usuarios, tendencias, alertas e recomendacoes. Visao executiva.",
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.get(`/api/diagnostic/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
