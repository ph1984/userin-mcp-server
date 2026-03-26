import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";

export function registerSmartBlockTools(server: McpServer) {
  server.tool(
    "list_smart_blocks",
    "Lista todos os Smart Blocks da empresa. Smart Blocks sao componentes HTML/imagem injetados em paginas do cliente (substituindo, antes, depois de elementos DOM).",
    {
      companyId: z.string().optional().describe("ID da empresa"),
    },
    async ({ companyId }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.get(`/api/smart-blocks/company/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_smart_block",
    "Cria um Smart Block. Pode ser HTML customizado, imagem, ou personalizacao (jogos recomendados, trending, etc). Configuravel com targeting por CSS selector, paginas, segmentos e devices.",
    {
      companyId: z.string().optional().describe("ID da empresa"),
      name: z.string().describe("Nome do block"),
      description: z.string().optional().describe("Descricao"),
      contentType: z.enum(["html", "image", "personalization"]).optional().describe("Tipo de conteudo"),
      status: z.enum(["draft", "active", "paused", "archived"]).optional().describe("Status"),
      htmlContent: z.string().optional().describe("Conteudo HTML (quando contentType=html)"),
      targeting: z.object({
        selectorType: z.enum(["id", "class", "attribute", "css"]).optional().describe("Tipo do seletor CSS"),
        selectorValue: z.string().optional().describe("Valor do seletor (ex: 'banner-container')"),
        insertPosition: z.enum(["replace", "prepend", "append", "before", "after"]).optional().describe("Posicao de insercao"),
      }).optional().describe("Onde injetar o block no DOM"),
      displayRules: z.object({
        pages: z.array(z.string()).optional().describe("URLs onde exibir"),
        excludePages: z.array(z.string()).optional(),
        segments: z.array(z.string()).optional().describe("Segmentos alvo"),
        devices: z.string().optional().describe("'all', 'desktop', 'mobile'"),
      }).optional().describe("Regras de exibicao"),
      frequency: z.object({
        showOnce: z.boolean().optional(),
        maxImpressions: z.number().optional(),
        cooldownMinutes: z.number().optional(),
      }).optional(),
    },
    async ({ companyId, name, description, contentType, status, htmlContent, targeting, displayRules, frequency }) => {
      const cid = companyId || config.defaultCompanyId;
      const data = await platform.post("/api/smart-blocks", {
        companyId: cid,
        name,
        description,
        contentType: contentType || "html",
        status: status || "draft",
        htmlContent,
        targeting,
        ...displayRules,
        frequency,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "update_smart_block",
    "Atualiza um Smart Block existente (status, conteudo, targeting, etc).",
    {
      blockId: z.string().describe("ID do smart block"),
      updates: z.record(z.unknown()).describe("Campos a atualizar"),
    },
    async ({ blockId, updates }) => {
      const data = await platform.put(`/api/smart-blocks/${blockId}`, updates);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
