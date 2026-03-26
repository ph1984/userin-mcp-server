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

const server = new McpServer({
  name: "userin",
  version: "1.3.0",
  description: "MCP Server para operacoes completas da plataforma UserIn.",
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
console.error("[userin-mcp] Server v1.3.0 ready");
