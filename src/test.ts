/**
 * Script de teste para validar que o MCP server inicia corretamente
 * e todos os tools estao registrados.
 *
 * Executa: npx tsx src/test.ts
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { registerSegmentTools } from "./tools/segments.ts";
import { registerUserTools } from "./tools/users.ts";
import { registerRuleTools } from "./tools/rules.ts";
import { registerSmartModalTools } from "./tools/smart-modals.ts";
import { registerSmartBlockTools } from "./tools/smart-blocks.ts";
import { registerJourneyTools } from "./tools/journeys.ts";
import { registerCampaignTools } from "./tools/campaigns.ts";
import { registerContactTools } from "./tools/contacts.ts";
import { registerIntegrationTools } from "./tools/integrations.ts";
import { registerIngestionTools } from "./tools/ingestion.ts";
import { registerAnalyticsTools } from "./tools/analytics.ts";
import { registerOntologyTools } from "./tools/ontology.ts";

async function runTests() {
  console.log("=== Userin MCP Server - Teste de Inicializacao ===\n");

  const server = new McpServer({
    name: "userin-test",
    version: "1.0.0",
  });

  console.log("1. Registrando tools...");
  registerOntologyTools(server);
  registerSegmentTools(server);
  registerUserTools(server);
  registerRuleTools(server);
  registerSmartModalTools(server);
  registerSmartBlockTools(server);
  registerJourneyTools(server);
  registerCampaignTools(server);
  registerContactTools(server);
  registerIntegrationTools(server);
  registerIngestionTools(server);
  registerAnalyticsTools(server);
  console.log("   OK - Todos os tools registrados sem erros\n");

  console.log("2. Conectando via InMemoryTransport...");
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({ name: "test-client", version: "1.0.0" });

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  console.log("   OK - Conexao estabelecida\n");

  console.log("3. Listando tools disponíveis...");
  const result = await client.listTools();
  const tools = result.tools;

  console.log(`   Total de tools: ${tools.length}\n`);

  const toolsByDomain: Record<string, string[]> = {};
  for (const tool of tools) {
    const prefix = tool.name.split("_")[0];
    const domain = {
      list: tool.name.includes("segment") ? "segments" :
            tool.name.includes("modal") ? "smart-modals" :
            tool.name.includes("block") ? "smart-blocks" :
            tool.name.includes("journey") ? "journeys" :
            tool.name.includes("campaign") ? "campaigns" :
            tool.name.includes("contact") ? "contacts" :
            tool.name.includes("integration") || tool.name.includes("credential") ? "integrations" :
            tool.name.includes("rule") || tool.name.includes("generate_rule") ? "rules" :
            tool.name.includes("user") || tool.name.includes("reevaluate") ? "users" :
            tool.name.includes("track") || tool.name.includes("identify") || tool.name.includes("batch") ? "ingestion" :
            tool.name.includes("audience") || tool.name.includes("active") || tool.name.includes("query") ? "analytics" :
            "other",
    }[prefix] || guessToolDomain(tool.name);

    if (!toolsByDomain[domain]) toolsByDomain[domain] = [];
    toolsByDomain[domain].push(tool.name);
  }

  for (const [domain, domainTools] of Object.entries(toolsByDomain).sort()) {
    console.log(`   ${domain}: ${domainTools.length} tools`);
    for (const t of domainTools) {
      console.log(`     - ${t}`);
    }
  }

  console.log("\n4. Verificando schemas dos tools...");
  let schemasOk = 0;
  let schemasError = 0;
  for (const tool of tools) {
    if (tool.inputSchema && typeof tool.inputSchema === "object") {
      schemasOk++;
    } else {
      schemasError++;
      console.log(`   ERRO: ${tool.name} sem inputSchema valido`);
    }
  }
  console.log(`   OK - ${schemasOk} schemas validos, ${schemasError} com erro\n`);

  await client.close();
  await server.close();

  console.log("=== RESULTADO ===");
  if (schemasError === 0 && tools.length >= 35) {
    console.log(`SUCESSO - ${tools.length} tools registrados e validados`);
  } else if (tools.length < 35) {
    console.log(`AVISO - Apenas ${tools.length} tools registrados (esperado >= 35)`);
  } else {
    console.log(`FALHA - ${schemasError} tools com schema invalido`);
  }

  process.exit(schemasError > 0 ? 1 : 0);
}

function guessToolDomain(name: string): string {
  if (name.includes("segment") || name.includes("blast")) return "segments";
  if (name.includes("user") || name.includes("reevaluate")) return "users";
  if (name.includes("rule") || name.includes("generate")) return "rules";
  if (name.includes("modal") || name.includes("html")) return "smart-modals";
  if (name.includes("block")) return "smart-blocks";
  if (name.includes("journey")) return "journeys";
  if (name.includes("campaign")) return "campaigns";
  if (name.includes("contact") || name.includes("import")) return "contacts";
  if (name.includes("integration") || name.includes("credential")) return "integrations";
  if (name.includes("track") || name.includes("identify") || name.includes("batch")) return "ingestion";
  if (name.includes("audience") || name.includes("active") || name.includes("query")) return "analytics";
  if (name.includes("ontology") || name.includes("schema") || name.includes("tags")) return "ontology";
  return "other";
}

runTests().catch((err) => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
