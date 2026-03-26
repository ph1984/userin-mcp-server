import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { segments } from "../http-client.js";
import { config } from "../config.js";

export function registerContactTools(server: McpServer) {
  server.tool(
    "list_contacts",
    "Lista contatos do CRM com filtros opcionais (nome, email, telefone, tag, status). Suporta paginacao.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      search: z.string().optional().describe("Busca por nome, email ou telefone"),
      tag: z.string().optional().describe("Filtrar por tag"),
      status: z.enum(["active", "inactive"]).optional().describe("Filtrar por status"),
      page: z.number().optional().describe("Pagina (default: 1)"),
      limit: z.number().optional().describe("Itens por pagina (default: 20)"),
    },
    async ({ companyId, search, tag, status, page, limit }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get("/api/contacts", {
        companyId: cid,
        search,
        tag,
        status,
        page,
        limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_contact",
    "Cria ou atualiza (upsert) um contato no CRM. Usa externalId + companyId como chave unica.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      externalId: z.string().describe("ID externo do contato (chave unica com companyId)"),
      name: z.string().optional().describe("Nome do contato"),
      emails: z.array(z.string()).optional().describe("Lista de emails"),
      phones: z.array(z.string()).optional().describe("Lista de telefones"),
      tags: z.array(z.string()).optional().describe("Tags do contato"),
      meta: z.record(z.unknown()).optional().describe("Metadados customizados"),
      source: z.string().optional().describe("Origem do contato (ex: csv_import, api, webhook)"),
    },
    async ({ companyId, externalId, name, emails, phones, tags, meta, source }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.post("/api/contacts/upsert", {
        companyId: cid,
        externalId,
        name,
        emails,
        phones,
        tags,
        meta,
        source: source || "mcp",
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_contact_stats",
    "Retorna estatisticas de contatos de uma empresa: total, ativos, inativos, por source, etc.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.get(`/api/contacts/stats/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "import_contacts",
    "Importa multiplos contatos de uma vez via JSON array. Cada contato deve ter pelo menos externalId.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      contacts: z.array(z.object({
        externalId: z.string(),
        name: z.string().optional(),
        emails: z.array(z.string()).optional(),
        phones: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        meta: z.record(z.unknown()).optional(),
      })).describe("Array de contatos a importar"),
    },
    async ({ companyId, contacts }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await segments.post("/api/contacts/import/direct", {
        companyId: cid,
        contacts,
        source: "mcp_import",
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
