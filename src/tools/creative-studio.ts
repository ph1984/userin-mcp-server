import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createflow, flowimager } from "../http-client.js";
import { session } from "../session.js";

export function registerCreativeStudioTools(server: McpServer) {

  // ================================================================
  // TEMPLATES (via CreateFlow API)
  // ================================================================

  server.tool(
    "list_templates",
    "Lista todos os templates de banner/criativo disponíveis. Retorna nome, id, dimensões, quantidade de layers e campos editáveis (paramKeys) de cada template.",
    {},
    async () => {
      const data = await createflow.get("/api/templates");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_template_info",
    "Obtém informações detalhadas de um template, incluindo todos os campos editáveis (paramKeys) e seus valores atuais. Use antes de generate_image para saber o que pode ser modificado.",
    {
      template_id: z.string().describe("ID do template"),
    },
    async ({ template_id }) => {
      const data = await createflow.get(`/api/templates/${template_id}/info`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "create_template",
    "Cria um novo template de banner a partir de um canvasJSON Fabric.js v6. PREFERIDO sobre generate_banner_ai — você (a IA) deve criar o JSON diretamente pois produz resultados MUITO melhores. Consulte get_brand_guidelines primeiro para usar cores/fontes corretas. Formato: {\"version\":\"6.0.0\",\"background\":\"#hex\",\"objects\":[...]}. Tipos: textbox (text,fontSize,fontFamily,fontWeight,fill,textAlign,lineHeight), rect (fill,rx,ry,width,height,opacity,stroke), circle (radius,fill,opacity), image (src,width,height). Todo objeto precisa de _customData:{id,name,type,customizable,paramKey}. Objetos customizáveis (titulo, subtitulo, cta) devem ter customizable:true e paramKey único. Ordem: fundo primeiro, texto por último. Use cantos arredondados (rx/ry), sombras (rect com rgba baixo offset), cores do brand guide, e mínimo 15 objetos para visual profissional.",
    {
      name: z.string().describe("Nome do template"),
      description: z.string().optional().describe("Descrição"),
      width: z.number().default(1080).describe("Largura em px"),
      height: z.number().default(1080).describe("Altura em px"),
      canvasJSON: z.any().describe("Objeto canvasJSON Fabric.js v6"),
      tags: z.array(z.string()).optional().describe("Tags do template"),
      category: z.string().optional().describe("Categoria"),
    },
    async ({ name, description, width, height, canvasJSON, tags, category }) => {
      const data = await createflow.post("/api/templates", { name, description, width, height, canvasJSON, tags, category });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "generate_banner_ai",
    "FALLBACK: Gera template via GPT-4o-mini. ATENÇÃO: Produz resultados visuais BÁSICOS. Prefira create_template onde VOCÊ (a IA do MCP) cria o Fabric.js JSON diretamente — o resultado é MUITO superior. Use generate_banner_ai apenas como último recurso quando não souber criar o layout manualmente.",
    {
      prompt: z.string().describe("Descrição do banner desejado em linguagem natural. Ex: 'Banner VIP cassino com cashback 15% estilo dark premium'"),
      width: z.number().default(1200).describe("Largura em px"),
      height: z.number().default(630).describe("Altura em px"),
    },
    async ({ prompt, width, height }) => {
      const data = await createflow.post("/api/ai/generate-banner", { prompt, width, height });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "generate_image",
    "Gera a imagem final a partir de um template com modificações opcionais. As modifications são um mapa chave-valor onde as chaves são os paramKeys do template. Para textos: valor é o novo texto. Para imagens: valor é a URL da imagem. Retorna a URL pública da imagem gerada. Use esta URL em create_smart_modal (campo imageUrl) ou create_smart_block.",
    {
      template_id: z.string().describe("ID do template"),
      modifications: z.record(z.string()).optional().describe("Mapa paramKey → novo valor. Ex: { titulo: 'Cashback VIP', cta_texto: 'Ativar Agora' }"),
      format: z.enum(["png", "jpg"]).default("png").describe("Formato da imagem"),
    },
    async ({ template_id, modifications, format }) => {
      const data = await createflow.post(`/api/templates/${template_id}/generate`, { modifications, format });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "duplicate_template",
    "Duplica um template existente. Cria uma cópia que pode ser modificada independentemente.",
    {
      template_id: z.string().describe("ID do template a duplicar"),
    },
    async ({ template_id }) => {
      const data = await createflow.post(`/api/templates/${template_id}/duplicate`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ================================================================
  // IMAGENS (via FlowImager API)
  // ================================================================

  server.tool(
    "search_images",
    "Busca semântica de imagens no banco de imagens (FlowImager/Weaviate). Use linguagem natural: 'jogador de futebol', 'logo cassino', 'fundo dourado'. Retorna URLs que podem ser usadas em templates (paramKey de imagem) ou diretamente em modais/blocks. Aceita filtro por categoria.",
    {
      query: z.string().describe("Texto de busca semântica"),
      limit: z.number().default(10).describe("Limite de resultados"),
      include_global: z.boolean().default(true).describe("Incluir imagens globais além das da empresa"),
      category: z.string().optional().describe("Filtrar por categoria (ex: banner, logo, foto)"),
    },
    async ({ query, limit, include_global, category }) => {
      const params: Record<string, string | number | boolean> = { q: query, limit, includeGlobal: include_global };
      if (category) params.category = category;
      const data = await flowimager.get("/api/images/search", params);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "list_images",
    "Lista todas as imagens disponíveis no banco de imagens, opcionalmente filtrado por empresa.",
    {
      limit: z.number().default(50).describe("Limite de resultados"),
    },
    async ({ limit }) => {
      const data = await flowimager.get("/api/images", { limit });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "upload_image_url",
    "Importa uma imagem de uma URL para o banco de imagens (FlowImager). A imagem é baixada, processada e indexada para busca semântica. Preencha nome, descrição e tags para melhorar a busca.",
    {
      url: z.string().describe("URL pública da imagem"),
      name: z.string().optional().describe("Nome descritivo"),
      description: z.string().optional().describe("Descrição detalhada para busca semântica"),
      category: z.string().optional().describe("Categoria (ex: banner, logo, foto)"),
      tags: z.array(z.string()).optional().describe("Tags para indexação"),
    },
    async ({ url, name, description, category, tags }) => {
      const data = await flowimager.post("/api/images/upload-url", { url, name, description, category, tags });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "list_image_categories",
    "Lista todas as categorias de imagens disponíveis para a empresa. Útil para filtrar buscas por categoria.",
    {},
    async () => {
      const data = await flowimager.get("/api/images/categories");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ================================================================
  // BRAND GUIDELINES (via CreateFlow API)
  // ================================================================

  server.tool(
    "get_brand_guidelines",
    "Obtém as diretrizes visuais (brand guidelines) da empresa: paleta de cores (primária, secundária, destaque, fundo, texto), fontes (título, corpo, destaque), regras de estilo e layout patterns. SEMPRE chame esta tool antes de criar templates ou gerar banners via IA para manter consistência visual.",
    {
      brand_id: z.string().optional().describe("ID de um brand guide específico. Se omitido, retorna todos (o default vem primeiro)."),
    },
    async ({ brand_id }) => {
      const path = brand_id ? `/api/brand-guides/${brand_id}` : "/api/brand-guides";
      const data = await createflow.get(path);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "set_brand_guidelines",
    "Cria ou atualiza as diretrizes visuais (brand guide) da empresa. Define cores, fontes e regras que a IA seguirá ao gerar criativos.",
    {
      name: z.string().describe("Nome do brand guide (ex: 'Estilo Cassino Premium')"),
      colors: z.object({
        primary: z.string().describe("Cor primária (hex)"),
        secondary: z.string().describe("Cor secundária (hex)"),
        background: z.string().describe("Cor de fundo (hex)"),
        text: z.string().describe("Cor do texto (hex)"),
        accent: z.string().describe("Cor de destaque (hex)"),
      }).describe("Paleta de cores"),
      fonts: z.object({
        title: z.string().describe("Fonte do título"),
        body: z.string().describe("Fonte do corpo"),
        accent: z.string().optional().describe("Fonte de destaque"),
      }).describe("Fontes"),
      rules: z.array(z.string()).optional().describe("Regras de estilo (ex: 'Sempre usar gradiente no fundo', 'CTA em caixa alta')"),
      layout_patterns: z.array(z.string()).optional().describe("Padrões de layout"),
      is_default: z.boolean().default(true).describe("Definir como brand guide padrão"),
      brand_id: z.string().optional().describe("ID para atualizar um existente. Se omitido, cria novo."),
    },
    async ({ name, colors, fonts, rules, layout_patterns, is_default, brand_id }) => {
      const payload = { name, colors, fonts, rules, layoutPatterns: layout_patterns, isDefault: is_default };
      const data = brand_id
        ? await createflow.put(`/api/brand-guides/${brand_id}`, payload)
        : await createflow.post("/api/brand-guides", payload);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "analyze_brand_style",
    "Analisa templates existentes para extrair automaticamente a identidade visual (cores, fontes, padrões de estilo). Retorna um brand guide sugerido baseado no que já foi criado.",
    {
      template_ids: z.array(z.string()).optional().describe("IDs dos templates a analisar. Se omitido, analisa todos."),
    },
    async ({ template_ids }) => {
      const data = await createflow.post("/api/brand-guides/analyze", { template_ids });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ================================================================
  // ORQUESTRAÇÃO — Tool de alto nível
  // ================================================================

  server.tool(
    "create_visual_for_component",
    "Tool de alto nível que cria um criativo visual completo pronto para usar em Smart Modal, Smart Block ou Campaign. Fluxo automático: 1) Busca brand guidelines, 2) Busca template existente ou gera novo via IA, 3) Aplica textos/imagens, 4) Gera imagem final, 5) Retorna URL. Use o resultado imageUrl diretamente em create_smart_modal ou create_smart_block. IMPORTANTE: Para criativos de alta qualidade, prefira chamar create_template diretamente com o Fabric.js JSON que VOCÊ cria (a IA do MCP produz designs muito superiores ao GPT-4o-mini do generate_banner_ai).",
    {
      prompt: z.string().describe("Descrição do criativo desejado. Ex: 'Banner de cashback 15% para VIPs, estilo cassino premium dark com dourado'"),
      title: z.string().optional().describe("Texto do título no banner"),
      subtitle: z.string().optional().describe("Texto do subtítulo"),
      cta_text: z.string().optional().describe("Texto do botão CTA"),
      width: z.number().default(800).describe("Largura da imagem"),
      height: z.number().default(600).describe("Altura da imagem"),
      template_id: z.string().optional().describe("ID de template existente para reutilizar (se omitido, gera novo via IA)"),
      format: z.enum(["png", "jpg"]).default("png").describe("Formato da imagem"),
    },
    async ({ prompt, title, subtitle, cta_text, width, height, template_id, format }) => {
      const steps: string[] = [];

      // 1. Buscar brand guidelines
      let brandInfo = "";
      try {
        const brands = await createflow.get("/api/brand-guides") as any;
        const guideList = brands?.guides || brands?.data || (Array.isArray(brands) ? brands : []);
        const defaultGuide = guideList.find((g: any) => g.isDefault) || guideList[0];
        if (defaultGuide) {
          brandInfo = `Cores: primária ${defaultGuide.colors?.primary}, secundária ${defaultGuide.colors?.secondary}, destaque ${defaultGuide.colors?.accent}. Fontes: ${defaultGuide.fonts?.title}/${defaultGuide.fonts?.body}. Regras: ${(defaultGuide.rules || []).join('; ')}`;
          steps.push(`Brand guide encontrado: "${defaultGuide.name}"`);
        }
      } catch {
        steps.push("Nenhum brand guide configurado, usando estilo livre");
      }

      let finalTemplateId = template_id;

      // 2. Se não tem template, gerar via IA
      if (!finalTemplateId) {
        const fullPrompt = brandInfo
          ? `${prompt}. Seguir identidade visual: ${brandInfo}`
          : prompt;

        steps.push(`Gerando template via IA: "${prompt}"`);
        const generated = await createflow.post("/api/ai/generate-banner", {
          prompt: fullPrompt,
          width,
          height,
        }) as any;

        finalTemplateId = generated?.template?._id || generated?.template?.id || generated?._id || generated?.id;
        if (!finalTemplateId) {
          return { content: [{ type: "text", text: JSON.stringify({ error: "Falha ao gerar template", steps, raw: generated }, null, 2) }] };
        }
        steps.push(`Template criado: ${finalTemplateId}`);
      } else {
        steps.push(`Usando template existente: ${finalTemplateId}`);
      }

      // 3. Montar modificações
      const modifications: Record<string, string> = {};
      if (title) modifications["titulo"] = title;
      if (subtitle) modifications["subtitulo"] = subtitle;
      if (cta_text) modifications["cta_texto"] = cta_text;

      // 4. Gerar imagem final
      steps.push(`Gerando imagem ${width}x${height} formato ${format}`);
      const image = await createflow.post(`/api/templates/${finalTemplateId}/generate`, {
        modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
        format,
      }) as any;

      const imageUrl = image?.url || image?.imageUrl || image?.data?.url;
      steps.push(`Imagem gerada: ${imageUrl}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            imageUrl,
            templateId: finalTemplateId,
            steps,
            usage: "Use imageUrl em create_smart_modal({ type: 'image', desktop: { imageUrl } }) ou create_smart_block({ contentType: 'image', image: { url: imageUrl } })",
          }, null, 2),
        }],
      };
    }
  );
}
