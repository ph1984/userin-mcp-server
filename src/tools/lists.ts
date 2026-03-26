import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";

export function registerListTools(server: McpServer) {
  server.tool(
    "list_lists",
    "Lista todas as listas de contatos da empresa. Listas sao usadas como audiencia para campanhas (SMS, Email, RCS, WhatsApp).",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.get("/api/lists", { companyId: cid });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_list",
    `Cria uma nova lista de contatos. Listas sao containers de usuarios para envio de campanhas.

FLUXO PARA CAMPANHA POR LISTA:
1. create_list({ name: "Apostadores Real Madrid" })
2. add_contacts_to_list(listId, [{ externalId: "user1", phone: "+5511..." }, ...])
3. create_campaign({ type: "sms", audience: { listId }, content: { body: "Promo!" } })
4. execute_campaign(campaignId)`,
    {
      companyId: z.string().optional().describe("ID da empresa"),
      name: z.string().describe("Nome da lista (ex: 'VIPs Dezembro', 'Apostadores Real Madrid')"),
      description: z.string().optional().describe("Descricao da lista"),
    },
    async ({ companyId, name, description }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.post("/api/lists", {
        companyId: cid,
        name,
        description,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_list",
    "Obtem detalhes de uma lista de contatos pelo ID.",
    {
      listId: z.string().describe("ID da lista"),
    },
    async ({ listId }) => {
      const data = await platform.get(`/api/lists/${listId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "add_contacts_to_list",
    `Adiciona contatos a uma lista existente. Cada contato precisa de pelo menos um identificador (externalId, phone ou email).

EXEMPLO:
contacts: [
  { externalId: "user_123", phone: "+5511999999999", name: "Joao" },
  { externalId: "user_456", phone: "+5511888888888", name: "Maria" }
]

Os contatos sao criados/atualizados no CRM automaticamente.`,
    {
      listId: z.string().describe("ID da lista"),
      contacts: z.array(z.object({
        externalId: z.string().optional().describe("ID externo do usuario"),
        phone: z.string().optional().describe("Telefone (com DDI, ex: +5511999999999)"),
        email: z.string().optional().describe("Email"),
        name: z.string().optional().describe("Nome do contato"),
      })).describe("Array de contatos a adicionar"),
    },
    async ({ listId, contacts }) => {
      const data = await platform.post(`/api/lists/${listId}/contacts`, { contacts });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_list_members",
    "Lista os membros de uma lista com paginacao.",
    {
      listId: z.string().describe("ID da lista"),
      page: z.number().optional().describe("Pagina (default: 1)"),
      limit: z.number().optional().describe("Limite por pagina (default: 50)"),
    },
    async ({ listId, page, limit }) => {
      const data = await platform.get(`/api/lists/${listId}/members`, {
        page: page || 1,
        limit: limit || 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_list_count",
    "Retorna a quantidade total de contatos em uma lista.",
    {
      listId: z.string().describe("ID da lista"),
    },
    async ({ listId }) => {
      const data = await platform.get(`/api/lists/${listId}/count`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "remove_contacts_from_list",
    "Remove contatos de uma lista.",
    {
      listId: z.string().describe("ID da lista"),
      contacts: z.array(z.string()).describe("Array de IDs de contatos a remover"),
    },
    async ({ listId, contacts }) => {
      const data = await platform.delete(`/api/lists/${listId}/contacts`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "delete_list",
    "Exclui uma lista de contatos.",
    {
      listId: z.string().describe("ID da lista"),
    },
    async ({ listId }) => {
      const data = await platform.delete(`/api/lists/${listId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
