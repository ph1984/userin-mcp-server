import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const FULL_REFERENCE = `# UserIn Platform — Guia Completo para IA

## O que e a UserIn?
Plataforma de CRM inteligente + automacao de marketing para iGaming (apostas esportivas e cassino online).
Permite criar jornadas automatizadas, segmentar usuarios em tempo real, enviar campanhas multicanal (SMS, Email, Push, RCS, WhatsApp), exibir modais/banners personalizados no site, e analisar comportamento de jogadores.

## Conceitos-Chave

### Funil de Usuarios (Stages)
- **anonymous**: visitante sem cadastro
- **registered**: cadastrou mas nao depositou
- **ftd**: fez o primeiro deposito (First Time Deposit)
- **depositor**: deposita recorrentemente
- **churned**: parou de acessar/depositar

### Tiers de Deposito
- **none**: nunca depositou
- **low**: < R$200 total
- **medium**: < R$1000 total
- **high**: < R$5000 total
- **whale**: >= R$5000 total (jogadores de alto valor)

### Tags
Tags sao atribuidas automaticamente por regras comportamentais. Exemplos comuns:
whale, vip, high_roller, churned, new_user, active_user, night_owl, mobile_user, frequent_visitor, has_intention, medium_intention, high_intention

### Jornadas (Journeys)
Fluxos visuais de automacao com nodes conectados por edges.
- **insite**: executam no site do cliente (ex: mostrar modal, injetar banner)
- **offsite**: executam fora do site (ex: enviar SMS, email)

### Campanhas
Envio em massa para listas de contatos via SMS, Email, RCS ou WhatsApp.
Diferente de jornadas — campanhas sao one-shot, jornadas sao fluxos com logica.

### Segmentos
Grupos dinamicos de usuarios baseados em features calculadas em tempo real (depositos, cliques, intencao, etc).

### Smart Modals
Popups/overlays exibidos no site do cliente com HTML customizado, imagens, CTA e animacoes.

### Smart Blocks
Componentes HTML/imagem injetados diretamente em elementos DOM do site do cliente.

### Regras Comportamentais
Condicoes que avaliam o comportamento do usuario em tempo real (pagina atual, clicks, atributos de perfil, tags) e disparam acoes.

---

## WORKFLOWS COMPLETOS

### 1. Campanha SMS para jogadores de alto valor
\`\`\`
1. get_tags_stats()                              → ver tags disponiveis
2. get_profiles_by_tag("whale")                  → listar whales
3. create_list({ name: "Whales SMS" })           → criar lista
4. add_contacts_to_list(listId, contacts)        → popular com phones
5. create_journey({
     journeyType: "offsite",
     nodes: [
       { type: "trigger.webhook", ... },
       { type: "action.sendSms", config: { message: "Ola {{name}}, bonus VIP!" } },
       { type: "flow.exit", ... }
     ], edges: [...]
   })                                             → criar jornada
6. update_journey(id, { status: "active" })       → ativar
7. trigger_journey_offsite_batch(users)            → disparar
\`\`\`

### 2. Modal de boas-vindas para novos usuarios
\`\`\`
1. create_smart_modal({ name: "Welcome", desktop: { htmlContent: "<h1>Bem-vindo!</h1>..." } })
2. create_rule({ name: "Novo Usuario", json: { conditionGroup: { operator: "AND", conditions: [{ type: "profile_attribute", atributo: "stage", operador: "igual", valor: "registered" }] } } })
3. create_journey({
     journeyType: "insite",
     nodes: [
       { type: "trigger.ruleMatch", config: { ruleId: "..." } },
       { type: "action.showModal", config: { modalId: "sm_..." } },
       { type: "flow.exit" }
     ], edges: [...]
   })
4. update_journey(id, { status: "active" })
\`\`\`

### 3. Reativacao de inativos por Email
\`\`\`
1. get_inactive_profiles({ days: 14 })           → usuarios inativos ha 14 dias
2. create_list + add_contacts_to_list             → criar lista
3. create_journey offsite com action.sendEmail     → email de reativacao
4. Ativar + disparar batch
\`\`\`

### 4. Campanha por lista (sem jornada)
\`\`\`
1. create_list({ name: "Promo Natal" })
2. add_contacts_to_list(listId, contacts)
3. create_campaign({ type: "sms", audience: { listId }, content: { body: "Promo!" } })
4. execute_campaign(campaignId)
\`\`\`

### 5. Jornada com condicao e A/B test
\`\`\`
nodes: [
  { type: "trigger.webhook" },
  { type: "condition.hasTag", config: { tagNames: ["whale"], operator: "hasAny" } },
    → yes: { type: "action.sendSms", config: { message: "VIP: bonus exclusivo!" } }
    → no:  { type: "condition.abTest", config: { variants: [A:50%, B:50%] } }
             → variant-a: SMS com oferta 1
             → variant-b: SMS com oferta 2
  { type: "flow.exit" }
]
\`\`\`

---

## TIPOS DE NODE (Journey Builder)

### Triggers (ponto de entrada — obrigatorio 1 por jornada)
- **trigger.ruleMatch**: dispara quando regra comportamental da match (insite)
- **trigger.event**: dispara em evento especifico (deposit, register, login)
- **trigger.segment**: dispara quando usuario entra em segmento
- **trigger.webhook**: dispara via API/webhook (offsite — para listas de IDs)
- **trigger.manual**: dispara via JS no site
- **trigger.fromJourney**: recebe usuarios de outra jornada

### Conditions (decisao — saidas: yes/no)
- **condition.hasTag**: verifica se usuario tem tag(s)
- **condition.userAttribute**: verifica atributo do perfil (deposits.count, intention.score, etc)
- **condition.ruleMatch**: aplica regra existente ou inline
- **condition.conditional**: avalia regra Sim/Nao
- **condition.abTest**: divide em variantes aleatorias (A/B/C/D/E)

### Actions (o que fazer)
- **action.sendSms**: envia SMS. Config: { message: "texto com {{name}}", credentialId?: "id" }
- **action.sendEmail**: envia email. Config: { subject: "...", body: "HTML", credentialId?: "id" }
- **action.showModal**: exibe Smart Modal. Config: { modalId: "sm_xxx" }
- **action.showBlock**: injeta Smart Block. Config: { blockId: "sb_xxx" }
- **action.addTag**: adiciona tag ao usuario
- **action.removeTag**: remove tag
- **action.customEvent**: dispara evento (SmartTrack, Meta, GA)
- **action.injectHtml**: injeta HTML no site
- **action.executeJs**: executa JavaScript no site

### Flow (controle de fluxo)
- **flow.delay**: aguarda tempo. Config: { duration: 2, unit: "minutes" }
- **flow.exit**: finaliza a jornada
- **flow.split**: divide em caminhos paralelos/condicionais
- **flow.goToJourney**: redireciona para outra jornada
- **flow.waitForEvent**: pausa ate evento ocorrer ou timeout

### Tracking
- **tracking.trackEvent**: registra evento customizado
- **tracking.trackConversion**: registra conversao com valor

### Variaveis Liquid (para SMS/Email)
{{name}}, {{phone}}, {{email}}, {{contact.firstName}}, {{deposits.total}}, {{site_url}}
O sistema resolve automaticamente do perfil e CRM.

---

## TOOLS DISPONIVEIS POR CATEGORIA

### Auth (2)
- login, get_current_user

### Segmentos (4)
- list_segments, get_segment, get_segment_members, check_user_in_segment

### Perfis de Usuarios (10)
- search_user_profiles, get_profiles_by_tag, get_profiles_by_deposit_tier
- get_profiles_by_intention, get_high_intention_profiles, get_profiles_by_stage
- get_inactive_profiles, get_profile_stats, get_tags_stats, get_company_diagnostic

### Jornadas (7)
- list_journeys, get_journey, create_journey, update_journey, duplicate_journey
- trigger_journey_offsite, trigger_journey_offsite_batch

### Analytics de Jornada (2)
- get_journey_analytics, get_journey_funnel

### Campanhas (4)
- list_campaigns, create_campaign, execute_campaign, get_campaign_stats

### Listas de Contatos (7)
- list_lists, create_list, get_list, add_contacts_to_list
- get_list_members, get_list_count, remove_contacts_from_list, delete_list

### Smart Modals (3)
- list_smart_modals, create_smart_modal, update_smart_modal

### Smart Blocks (3)
- list_smart_blocks, create_smart_block, update_smart_block

### Regras (4)
- list_rules, create_rule, generate_rule_ai, get_condition_types

### Builder Meta (3)
- get_builder_meta, get_node_types, get_operators

### Ontologia (2)
- get_ontology_fields, get_ontology_groups

### Contatos CRM (3)
- list_contacts, create_contact, import_contacts

### Ingestion (3)
- track_event, identify_user, batch_ingest

### Creative Studio (8)
- list_templates, get_template_info, create_template, duplicate_template
- generate_image, generate_banner_ai, search_images, list_images

### Integracoes (2)
- list_integrations, list_credentials

---

## DICAS PARA A IA

1. **Sempre comece por entender a base**: chame get_profile_stats e get_tags_stats
2. **Para jornadas**: chame get_node_types e get_builder_meta ANTES de criar
3. **Para regras**: chame get_condition_types e get_ontology_fields ANTES de criar
4. **Para modais/blocks**: chame list_smart_modals ou list_smart_blocks para ver IDs
5. **Offsite = SMS/Email fora do site**: use trigger.webhook + action.sendSms/sendEmail
6. **Insite = no site do cliente**: use trigger.ruleMatch + action.showModal/showBlock
7. **Variaveis Liquid**: use {{name}}, {{phone}} etc nos textos de SMS/Email
8. **Token auto-renova**: nao precisa se preocupar com expiracão de sessao
9. **CompanyId automatico**: todas as tools ja usam o companyId do login, nunca passe manualmente
`;

const SECTIONS: Record<string, string> = {
  workflows: `## WORKFLOWS — Como combinar tools

### SMS para whales:
get_tags_stats → get_profiles_by_tag("whale") → create_list → add_contacts_to_list → create_journey(offsite, sendSms) → update_journey(active) → trigger_journey_offsite_batch

### Modal para novos:
create_smart_modal → create_rule(stage=registered) → create_journey(insite, trigger.ruleMatch, action.showModal) → update_journey(active)

### Reativacao:
get_inactive_profiles(14) → create_list → add_contacts → create_journey(offsite, sendEmail) → ativar → disparar

### Campanha direta (sem jornada):
create_list → add_contacts → create_campaign(sms) → execute_campaign`,

  node_types: `## Node Types do Journey Builder
Triggers: trigger.ruleMatch, trigger.event, trigger.segment, trigger.webhook, trigger.manual, trigger.fromJourney
Conditions: condition.hasTag, condition.userAttribute, condition.ruleMatch, condition.conditional, condition.abTest
Actions: action.sendSms, action.sendEmail, action.showModal, action.showBlock, action.addTag, action.removeTag, action.customEvent, action.injectHtml, action.executeJs
Flow: flow.delay, flow.exit, flow.split, flow.goToJourney, flow.waitForEvent
Tracking: tracking.trackEvent, tracking.trackConversion`,

  concepts: `## Conceitos
Stages: anonymous → registered → ftd → depositor → churned
Tiers: none < low < medium < high < whale
Journey insite: reage a comportamento no site (modais, blocks)
Journey offsite: envia mensagens fora do site (SMS, Email) via webhook trigger
Campanhas: envio one-shot para listas (sem logica de fluxo)
Segmentos: grupos dinamicos por features em tempo real
Tags: labels automaticos baseados em comportamento
Smart Modals: popups no site
Smart Blocks: componentes injetados no DOM`,

  tools: `## Tools por Categoria
Auth: login, get_current_user
Segments: list_segments, get_segment, get_segment_members, check_user_in_segment
Profiles: search_user_profiles, get_profiles_by_tag, get_profiles_by_deposit_tier, get_profiles_by_intention, get_high_intention_profiles, get_profiles_by_stage, get_inactive_profiles, get_profile_stats, get_tags_stats, get_company_diagnostic
Journeys: list_journeys, get_journey, create_journey, update_journey, duplicate_journey, trigger_journey_offsite, trigger_journey_offsite_batch, get_journey_analytics, get_journey_funnel
Campaigns: list_campaigns, create_campaign, execute_campaign, get_campaign_stats
Lists: list_lists, create_list, get_list, add_contacts_to_list, get_list_members, get_list_count, remove_contacts_from_list, delete_list
Modals: list_smart_modals, create_smart_modal, update_smart_modal
Blocks: list_smart_blocks, create_smart_block, update_smart_block
Rules: list_rules, create_rule, generate_rule_ai, get_condition_types
Builder: get_builder_meta, get_node_types, get_operators
Ontology: get_ontology_fields, get_ontology_groups
Contacts: list_contacts, create_contact, import_contacts
Ingestion: track_event, identify_user, batch_ingest
Creative: list_templates, get_template_info, create_template, duplicate_template, generate_image, generate_banner_ai, search_images, list_images
Integrations: list_integrations, list_credentials`,
};

export function registerPlatformReferenceTools(server: McpServer) {
  server.tool(
    "get_platform_reference",
    `Consulta a referencia completa e atualizada da plataforma UserIn. Retorna dados estruturados sobre TUDO: conceitos (stages, tiers, tags), tipos de node de jornada, workflows completos passo-a-passo (SMS para whales, modal para novos, reativacao, campanha direta), catalogo de tools por categoria, e dicas para a IA.

Use SEMPRE que precisar saber capacidades exatas antes de criar algo. Se for sua primeira interacao, chame esta tool para entender a plataforma.

Secoes disponiveis: workflows, node_types, concepts, tools. Se omitido, retorna TUDO.`,
    {
      section: z.string().optional().describe("Secao especifica: workflows, node_types, concepts, tools. Se omitido, retorna TUDO."),
    },
    async ({ section }) => {
      const text = section && SECTIONS[section]
        ? SECTIONS[section]
        : FULL_REFERENCE;
      return { content: [{ type: "text", text }] };
    }
  );
}
