import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { platform } from "../http-client.js";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerSmartModalTools(server: McpServer) {
  server.tool(
    "list_smart_modals",
    "Lista todos os Smart Modals da empresa. Smart Modals sao popups/overlays exibidos no site do cliente com HTML/imagem, CTA, animacoes e regras de exibicao.",
    {},
    async () => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.get(`/api/smart-modals/company/${cid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_smart_modal",
    "Cria um Smart Modal completo. Pode ser do tipo 'html' (conteudo HTML customizado) ou 'image' (imagem com CTA). Inclui configuracao de desktop/mobile, triggers, targeting por segmento, frequencia e animacao de entrada.",
    {
      name: z.string().describe("Nome do modal"),
      description: z.string().optional().describe("Descricao"),
      type: z.enum(["html", "image"]).optional().describe("Tipo: html ou image (default: html)"),
      status: z.enum(["draft", "active", "paused", "archived"]).optional().describe("Status (default: draft)"),
      desktop: z.object({
        enabled: z.boolean().optional(),
        htmlContent: z.string().optional().describe("Conteudo HTML para desktop"),
        imageUrl: z.string().optional().describe("URL da imagem para desktop"),
        cta: z.object({
          enabled: z.boolean().optional(),
          text: z.string().optional(),
          action: z.unknown().optional(),
        }).optional(),
        overlay: z.object({
          enabled: z.boolean().optional(),
          color: z.string().optional().describe("Cor do overlay, ex: rgba(0,0,0,0.7)"),
          closeOnClick: z.boolean().optional(),
        }).optional(),
      }).optional().describe("Configuracao desktop"),
      mobile: z.object({
        enabled: z.boolean().optional(),
        htmlContent: z.string().optional(),
        imageUrl: z.string().optional(),
      }).optional().describe("Configuracao mobile"),
      triggers: z.object({
        event: z.enum(["manual", "page_view", "exit_intent", "time_on_page", "scroll_depth", "click_element", "custom_event"]).optional(),
        delay: z.number().optional().describe("Delay em ms antes de exibir"),
        value: z.string().optional().describe("Valor do trigger (ex: seletor CSS para click_element)"),
      }).optional().describe("Quando exibir o modal"),
      targeting: z.object({
        pages: z.array(z.string()).optional().describe("URLs onde exibir"),
        excludePages: z.array(z.string()).optional().describe("URLs onde NAO exibir"),
        segments: z.array(z.string()).optional().describe("IDs de segmentos alvo"),
        newVisitorsOnly: z.boolean().optional(),
        returningVisitorsOnly: z.boolean().optional(),
      }).optional().describe("Para quem exibir"),
      frequency: z.object({
        maxImpressions: z.number().optional().describe("Maximo de impressoes totais por usuario"),
        cooldownHours: z.number().optional().describe("Horas de cooldown entre exibicoes"),
        maxImpressionsPerSession: z.number().optional().describe("Maximo por sessao"),
      }).optional().describe("Frequencia de exibicao"),
      entranceAnimation: z.object({
        type: z.string().optional().describe("Tipo: fade, slideUp, slideDown, scale, bounce"),
        duration: z.number().optional().describe("Duracao em ms"),
        easing: z.string().optional(),
      }).optional().describe("Animacao de entrada"),
    },
    async ({ name, description, type, status, desktop, mobile, triggers, targeting, frequency, entranceAnimation }) => {
      session.requireAuth();
      const cid = session.companyId;
      const data = await platform.post("/api/smart-modals", {
        companyId: cid,
        name,
        description,
        type: type || "html",
        status: status || "draft",
        desktop,
        mobile,
        triggers,
        targeting,
        frequency,
        entranceAnimation,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "update_smart_modal",
    "Atualiza um Smart Modal existente. Pode alterar status (draft/active/paused), conteudo HTML, targeting, triggers, etc.",
    {
      modalId: z.string().describe("ID do modal (ex: sm_abc123)"),
      updates: z.record(z.unknown()).describe("Campos a atualizar. Ex: { status: 'active', 'desktop.htmlContent': '<div>...</div>' }"),
    },
    async ({ modalId, updates }) => {
      const data = await platform.put(`/api/smart-modals/${modalId}`, updates);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // generate_modal_html removido — substituído por create_visual_for_component no Creative Studio
  // que gera imagens profissionais via templates Fabric.js + brand guidelines
}
