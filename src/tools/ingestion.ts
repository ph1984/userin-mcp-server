import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ingestion } from "../http-client.js";

export function registerIngestionTools(server: McpServer) {
  server.tool(
    "track_event",
    "Rastreia um evento para um usuario (deposito, click, compra, registro, page_view, etc). O evento e processado e pode disparar re-avaliacao de segmentos. Use sync=true para resposta sincrona.",
    {
      userId: z.string().describe("ID do usuario"),
      event: z.string().describe("Nome do evento (ex: deposit, click, purchase, register, page_view)"),
      properties: z.record(z.unknown()).optional().describe("Propriedades do evento. Ex: { amount: 500, currency: 'BRL', page: '/casino' }"),
      timestamp: z.string().optional().describe("Timestamp ISO 8601 (default: agora)"),
      sync: z.boolean().optional().describe("Se true, aguarda processamento sincrono"),
    },
    async ({ userId, event, properties, timestamp, sync }) => {
      const data = await ingestion.post(`/ingest/track${sync ? "?sync=true" : ""}`, {
        userId,
        event,
        properties,
        timestamp,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "identify_user",
    "Atualiza campos do perfil de um usuario por dot-path. Ex: atualizar email, nome, preferencias. Use sync=true para resposta sincrona.",
    {
      userId: z.string().describe("ID do usuario"),
      traits: z.record(z.unknown()).describe("Campos do perfil a atualizar. Ex: { email: 'joao@email.com', 'profile.name': 'Joao', 'preferences.language': 'pt-BR' }"),
      sync: z.boolean().optional().describe("Se true, aguarda processamento sincrono"),
    },
    async ({ userId, traits, sync }) => {
      const data = await ingestion.post(`/ingest/identify${sync ? "?sync=true" : ""}`, {
        userId,
        traits,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "batch_ingest",
    "Ingestao em lote de ate 10.000 itens (eventos e/ou identificacoes de perfil).",
    {
      items: z.array(z.object({
        type: z.enum(["track", "identify"]).describe("Tipo: track (evento) ou identify (perfil)"),
        userId: z.string(),
        event: z.string().optional().describe("Nome do evento (para type=track)"),
        properties: z.record(z.unknown()).optional().describe("Propriedades do evento"),
        traits: z.record(z.unknown()).optional().describe("Campos do perfil (para type=identify)"),
      })).describe("Array de itens a ingerir (max 10000)"),
    },
    async ({ items }) => {
      const data = await ingestion.post("/ingest/batch", { items });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
