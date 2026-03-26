import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";

export function registerAnalyticsTools(server: McpServer) {
  server.tool(
    "query_audience_deposit",
    "Consulta audiencia de usuarios por volume de deposito em janela de tempo (24h ou 7d). Usa ClickHouse para performance em milhoes de registros.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      window: z.enum(["24h", "7d"]).describe("Janela de tempo: 24h ou 7d"),
      threshold: z.number().optional().describe("Valor minimo de deposito (default: 100)"),
      limit: z.number().optional().describe("Limite de resultados (default: 10000)"),
      offset: z.number().optional().describe("Offset para paginacao"),
    },
    async ({ companyId, window, threshold, limit, offset }) => {
      const cid = companyId || config.defaultCompanyId;
      const path = window === "24h" ? "/audience/deposit-24h" : "/audience/deposit-7d";
      const data = await segments.get(path, {
        companyId: cid,
        threshold,
        limit,
        offset,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "query_active_users",
    "Consulta usuarios ativos em um periodo. Usa ClickHouse para queries de alta performance.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      limit: z.number().optional().describe("Limite de resultados"),
    },
    async ({ companyId, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/audience/active-users", {
        companyId: cid,
        limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
