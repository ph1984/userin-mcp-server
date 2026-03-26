import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { performLogin } from "./tools/auth.js";

import { registerAuthTools } from "./tools/auth.js";
import { registerSegmentTools } from "./tools/segments.js";
import { registerUserTools } from "./tools/users.js";
import { registerRuleTools } from "./tools/rules.js";
import { registerSmartModalTools } from "./tools/smart-modals.js";
import { registerSmartBlockTools } from "./tools/smart-blocks.js";
import { registerJourneyTools } from "./tools/journeys.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerIntegrationTools } from "./tools/integrations.js";
import { registerIngestionTools } from "./tools/ingestion.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerOntologyTools } from "./tools/ontology.js";
import { registerCreativeStudioTools } from "./tools/creative-studio.js";
import { registerListTools } from "./tools/lists.js";
import { registerUserProfileTools } from "./tools/user-profiles.js";
import { registerPlatformReferenceTools } from "./tools/platform-reference.js";

const server = new McpServer({
  name: "userin",
  version: "1.4.0",
  description: `MCP Server da plataforma UserIn — plataforma de CRM inteligente, segmentacao comportamental e automacao de marketing para iGaming (apostas esportivas e cassino).

CAPACIDADES PRINCIPAIS:
- Journeys: fluxos visuais de automacao (insite no site do cliente, ou offsite via SMS/Email)
- Campanhas: envio em massa de SMS, Email, RCS, WhatsApp para listas de contatos
- Segmentacao: segmentos comportamentais em tempo real (depositos, cliques, intencao, tags)
- Perfis: busca e analise de usuarios por stage (anonymous→registered→ftd→depositor→churned), tier de deposito, intencao, tags
- Smart Modals/Blocks: componentes visuais injetados no site do cliente
- Regras comportamentais: condicoes que disparam acoes (ex: usuario na pagina X + depositou Y)
- Creative Studio: templates de banner, geracao de imagens
- CRM: contatos, listas, campanhas multicanal

FLUXO TIPICO — Campanha SMS segmentada:
1. get_profile_stats → entender a base
2. get_profiles_by_tag("whale") ou get_profiles_by_stage("registered") → encontrar audiencia
3. create_list → criar lista de contatos
4. add_contacts_to_list → popular a lista
5. create_journey (offsite, trigger.webhook, action.sendSms) → criar jornada com mensagem
6. update_journey({ status: "active" }) → ativar
7. trigger_journey_offsite_batch → disparar para os usuarios

DICA: Chame get_platform_reference para ver o guia completo de tools e workflows.`,
});

registerAuthTools(server);
registerOntologyTools(server);
registerSegmentTools(server);
registerUserTools(server);
registerUserProfileTools(server);
registerRuleTools(server);
registerSmartModalTools(server);
registerSmartBlockTools(server);
registerJourneyTools(server);
registerCampaignTools(server);
registerListTools(server);
registerContactTools(server);
registerIntegrationTools(server);
registerIngestionTools(server);
registerAnalyticsTools(server);
registerCreativeStudioTools(server);
registerPlatformReferenceTools(server);

import { session } from "./session.js";

if (config.credentials.email && config.credentials.password) {
  session.setCredentials(config.credentials.email, config.credentials.password);
  performLogin(config.credentials.email, config.credentials.password)
    .then((msg) => console.error(`[userin-mcp] Auto-login OK: ${msg}`))
    .catch((err) => console.error(`[userin-mcp] Auto-login falhou: ${err.message}. Use a tool 'login' manualmente.`));
} else {
  console.error("[userin-mcp] USERIN_EMAIL/USERIN_PASSWORD nao configurados. Use a tool 'login' para autenticar.");
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[userin-mcp] Server v1.4.0 ready");
