import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { integrations } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerIntegrationTools(server: McpServer) {
  server.tool(
    "list_integrations",
    "Lista todas as integracoes disponiveis (Smartico, SendSpeed SMS/Email, Meta Ads, etc) com seus adapters e scopes.",
    {},
    async () => {
      const data = await integrations.get("/api/integrations/providers");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "list_credentials",
    "Lista as credenciais configuradas de uma empresa. Pode filtrar por scope (ex: send_sms, send_email).",
    {
      scope: z.string().optional().describe("Filtrar por scope (ex: send_sms, send_email, sync_tags)"),
    },
    async ({ scope }) => {
      session.requireAuth();
      const cid = session.companyId;
      if (scope) {
        const data = await integrations.get(`/api/credentials/${cid}/by-scope/${scope}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      const data = await integrations.get(`/api/credentials/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_credential",
    "Cria uma nova credencial para uma integracao. Os campos de credentials variam por provider (ex: api_key, api_secret para Smartico; smtp_host, smtp_user para Email).",
    {
      integrationId: z.string().describe("ID da integracao (ex: smartico, sendspeed-sms, sendspeed-email)"),
      name: z.string().describe("Nome descritivo da credencial"),
      credentials: z.record(z.string()).describe("Campos de credencial (variam por provider). Ex: { api_key: 'xxx', brand_key: 'yyy' }"),
      scopes: z.array(z.string()).optional().describe("Scopes habilitados (ex: ['send_sms', 'send_email'])"),
    },
    async ({ integrationId, name, credentials, scopes }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await integrations.post(`/api/credentials/${cid}`, {
        integrationId,
        name,
        credentials,
        scopes,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "test_credential",
    "Testa uma credencial existente para verificar se esta funcionando. Retorna resultado do teste (sucesso/falha com mensagem).",
    {
      credentialId: z.string().describe("ID da credencial a testar"),
    },
    async ({ credentialId }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await integrations.post(`/api/credentials/${cid}/${credentialId}/test`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
