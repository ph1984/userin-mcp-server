import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerUserTools(server: McpServer) {
  server.tool(
    "get_user_state",
    "Retorna o estado completo de um usuario: todas as features calculadas (deposit_sum_24h, click_count_7d, etc) e segmentos ativos. Essencial para diagnostico.",
    {
      userId: z.string().describe("ID do usuario"),
    },
    async ({ userId }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.get(`/users/${userId}`, { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_user_segments",
    "Lista todos os segmentos aos quais um usuario pertence.",
    {
      userId: z.string().describe("ID do usuario"),
    },
    async ({ userId }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.get(`/users/${userId}/segments`, { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "reevaluate_user",
    "Forca a re-avaliacao de todos os segmentos para um usuario. Util apos mudancas manuais em features.",
    {
      userId: z.string().describe("ID do usuario"),
    },
    async ({ userId }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await segments.post(`/users/${userId}/reevaluate`, { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
