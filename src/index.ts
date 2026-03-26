import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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
  version: "1.2.0",
  description: "MCP Server para operacoes completas da plataforma UserIn. Faca login primeiro com a tool 'login'.",
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

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[userin-mcp] Server v1.2.0 started — use login(email, password) to authenticate");
