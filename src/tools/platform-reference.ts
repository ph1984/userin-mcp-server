import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const FULL_REFERENCE = `# UserIn Platform — Guia Completo para IA

## O que e a UserIn?
Plataforma de CRM inteligente + automacao de marketing para iGaming (apostas esportivas e cassino online).
Permite criar jornadas automatizadas, segmentar usuarios em tempo real, enviar campanhas multicanal (SMS, Email, Push, RCS, WhatsApp), exibir modais/banners personalizados no site, e analisar comportamento de jogadores.

---

## 1. CONCEITOS FUNDAMENTAIS

### Funil de Usuarios (Stages)
anonymous → registered → ftd → depositor → churned
- anonymous: visitante sem cadastro
- registered: cadastrou mas nunca depositou
- ftd: fez o primeiro deposito (First Time Deposit)
- depositor: deposita recorrentemente
- churned: parou de acessar (inativo 7+ dias)

### Tiers de Deposito
none → low → medium → high → whale
- none: nunca depositou (R$0)
- low: deposito total < R$200
- medium: deposito total < R$1.000
- high: deposito total < R$5.000
- whale: deposito total >= R$5.000 (jogadores de alto valor)

### Tags
Labels automaticos atribuidos por regras comportamentais. Exemplos comuns:
whale, vip, high_roller, churned, new_user, active_user, night_owl, mobile_user, frequent_visitor, has_intention, medium_intention, high_intention, has_behavior

Use get_tags_stats() para ver TODAS as tags da empresa com contagens.

### Segmentos
Grupos dinamicos baseados em features calculadas em tempo real:
- deposit_sum_24h, deposit_sum_7d, deposit_count_24h
- click_count_24h, click_count_7d
- last_deposit_at, registered_at
- purchase_sum_30d
Segmentos avaliam automaticamente quando features mudam.

### Jornadas (Journeys) — CONCEITO CENTRAL
Fluxos visuais de automacao com nodes conectados por edges.
Dois tipos:
- **insite**: executam NO SITE do cliente (ex: mostrar modal quando usuario visita pagina)
- **offsite**: executam FORA do site (ex: enviar SMS/Email para lista de usuarios)

### Campanhas vs Jornadas
- **Campanha**: envio one-shot em massa para uma lista de contatos. Sem logica de fluxo.
- **Jornada**: fluxo com logica (condicoes, delays, A/B test, splits). Mais poderosa.
Para envio simples, use campanha. Para logica complexa, use jornada.

### Smart Modals
Popups/overlays exibidos no site do cliente. Suportam HTML customizado, imagens, CTA, animacoes, targeting por segmento, frequencia de exibicao.

### Smart Blocks
Componentes HTML/imagem injetados diretamente no DOM do site (substituindo, antes ou depois de elementos). Ideal para banners, carroseis de jogos, personalizacao.

### Regras Comportamentais
Condicoes em tempo real avaliadas no browser:
- page_view_current: pagina atual do usuario
- click: click em elemento CSS
- profile_attribute: atributo do perfil (deposits.count, intention.score)
- has_tag: usuario tem tag especifica
- access: estado de login (logged_in, has_logged, never_logged)

### CRM / Contatos
Sistema de contatos independente dos perfis comportamentais. Contatos tem externalId, phone, email, tags. Usados como audiencia para campanhas.

### Listas
Containers de contatos para envio de campanhas. Fluxo: criar lista → adicionar contatos → associar a campanha ou jornada.

---

## 2. TIPOS DE NODE (Journey Builder)

### Triggers (ponto de entrada — obrigatorio exatamente 1 por jornada)
| Tipo | Uso | Config |
|------|-----|--------|
| trigger.ruleMatch | Dispara quando regra da match (insite) | { ruleId: "id" } |
| trigger.event | Dispara em evento (deposit, register, login) | { eventType: "deposit" } |
| trigger.segment | Dispara quando usuario entra em segmento | { segmentId: "id" } |
| trigger.webhook | Dispara via API (offsite — para listas) | {} |
| trigger.manual | Dispara via JS no site | {} |
| trigger.fromJourney | Recebe de outra jornada | { sourceJourneyId: "id" } |

### Conditions (decisao — saidas: yes/no via sourceHandle)
| Tipo | Uso | Config |
|------|-----|--------|
| condition.hasTag | Verifica tags do usuario | { tagNames: ["whale"], operator: "hasAny" } |
| condition.userAttribute | Verifica atributo do perfil | { attribute: "deposits.count", operator: "greater_than", value: 5 } |
| condition.ruleMatch | Aplica regra existente ou inline | { mode: "existing", ruleId: "id" } |
| condition.conditional | Avalia Sim/Nao | { mode: "existing", ruleId: "id" } |
| condition.abTest | Divide em variantes (2-5) | { variants: [{ id: "variant-a", percentage: 50 }, { id: "variant-b", percentage: 50 }] } |

IMPORTANTE — Edges de conditions:
- condition.hasTag/userAttribute/ruleMatch/conditional: sourceHandle "yes" ou "no"
- condition.abTest: sourceHandle "variant-a", "variant-b", etc

### Actions (executam algo)
| Tipo | Uso | Config |
|------|-----|--------|
| action.sendSms | Envia SMS (offsite) | { message: "Ola {{name}}!", credentialId?: "id" } |
| action.sendEmail | Envia Email (offsite) | { subject: "...", body: "<html>", credentialId?: "id" } |
| action.showModal | Exibe Smart Modal (insite) | { modalId: "sm_xxx" } |
| action.showBlock | Injeta Smart Block (insite) | { blockId: "sb_xxx" } |
| action.addTag | Adiciona tag | { tagName: "vip" } |
| action.removeTag | Remove tag | { tagName: "churned" } |
| action.customEvent | Dispara evento (SmartTrack/Meta/GA) | { eventName: "promo_view", eventPayload: "{}" } |
| action.injectHtml | Injeta HTML no site | { html: "<div>...</div>", selector: "#banner", position: "beforeend" } |
| action.executeJs | Executa JS no site | { code: "console.log('ok')" } |

### Flow (controle)
| Tipo | Uso | Config |
|------|-----|--------|
| flow.delay | Aguarda tempo | { duration: 2, unit: "minutes" } |
| flow.exit | Finaliza jornada | { reason: "SMS enviado" } |
| flow.split | Caminhos paralelos/condicionais | { paths: [{ id: "path-1", name: "VIP" }, { id: "path-2", name: "Normal" }] } |
| flow.goToJourney | Redireciona para outra jornada | { targetJourneyId: "id" } |
| flow.waitForEvent | Pausa ate evento ou timeout | { eventType: "deposit", timeoutDuration: 24, timeoutUnit: "hours" } |

flow.split edges: sourceHandle "path-1", "path-2", etc
flow.waitForEvent edges: sourceHandle "event_received" ou "timeout"

### Tracking
| Tipo | Uso | Config |
|------|-----|--------|
| tracking.trackEvent | Registra evento customizado | { eventName: "ftd_sms_sent", eventPayload: "{}" } |
| tracking.trackConversion | Registra conversao com valor | { conversionName: "deposit", value: 100, currency: "BRL" } |

### Variaveis Liquid (para textos de SMS/Email)
{{name}}, {{phone}}, {{email}}, {{contact.firstName}}, {{deposits.total}}, {{site_url}}
O sistema resolve automaticamente do perfil do usuario e CRM.

---

## 3. WORKFLOWS COMPLETOS (passo-a-passo)

### WORKFLOW 1: SMS para whales (alto valor)
1. get_tags_stats() → ver tags disponiveis e quantidades
2. get_profiles_by_tag("whale") → listar usuarios whale com phones
3. create_list({ name: "Whales Promo" }) → criar lista de contatos
4. add_contacts_to_list(listId, [{ externalId: "user1", phone: "+5511..." }, ...]) → popular
5. create_journey({
     name: "Promo VIP Whales",
     journeyType: "offsite",
     nodes: [
       { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Webhook" } },
       { id: "sms", type: "action.sendSms", position: {x:300,y:150}, data: { label: "SMS VIP", config: { message: "{{name}}, bonus EXCLUSIVO de R$500 pra voce! Deposite agora: {{site_url}}" } } },
       { id: "end", type: "flow.exit", position: {x:300,y:300}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "sms" },
       { id: "e2", source: "sms", target: "end" }
     ]
   })
6. update_journey(journeyId, { status: "active" }) → ativar
7. trigger_journey_offsite_batch({ users: [{ externalId: "user1" }, ...] }) → disparar

### WORKFLOW 2: Jornada FTD com delay + tracking
1. create_journey({
     name: "FTD Welcome SMS",
     journeyType: "offsite",
     nodes: [
       { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "FTD Detectado" } },
       { id: "delay", type: "flow.delay", position: {x:300,y:150}, data: { label: "Aguardar 2min", config: { duration: 2, unit: "minutes" } } },
       { id: "sms", type: "action.sendSms", position: {x:300,y:300}, data: { label: "SMS Boas-Vindas", config: { message: "Parabens {{name}}! Seu 1o deposito foi confirmado. Bonus de 100% ate R$200!" } } },
       { id: "track", type: "tracking.trackEvent", position: {x:300,y:450}, data: { label: "Track", config: { eventName: "ftd_sms_sent" } } },
       { id: "end", type: "flow.exit", position: {x:300,y:600}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "delay" },
       { id: "e2", source: "delay", target: "sms" },
       { id: "e3", source: "sms", target: "track" },
       { id: "e4", source: "track", target: "end" }
     ]
   })

### WORKFLOW 3: Jornada com condicao (whale vs normal)
nodes: [
  { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Trigger" } },
  { id: "check", type: "condition.hasTag", position: {x:300,y:150}, data: { label: "E whale?", config: { tagNames: ["whale"], operator: "hasAny" } } },
  { id: "sms_vip", type: "action.sendSms", position: {x:100,y:300}, data: { label: "SMS VIP", config: { message: "{{name}}, bonus EXCLUSIVO VIP de R$1000!" } } },
  { id: "sms_normal", type: "action.sendSms", position: {x:500,y:300}, data: { label: "SMS Normal", config: { message: "{{name}}, ganhe 50% no proximo deposito!" } } },
  { id: "end", type: "flow.exit", position: {x:300,y:450}, data: { label: "Fim" } }
]
edges: [
  { id: "e1", source: "t", target: "check" },
  { id: "e2", source: "check", target: "sms_vip", sourceHandle: "yes" },
  { id: "e3", source: "check", target: "sms_normal", sourceHandle: "no" },
  { id: "e4", source: "sms_vip", target: "end" },
  { id: "e5", source: "sms_normal", target: "end" }
]

### WORKFLOW 4: A/B Test de mensagens
nodes: [
  { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Trigger" } },
  { id: "ab", type: "condition.abTest", position: {x:300,y:150}, data: { label: "A/B Test", config: { variants: [{ id: "variant-a", name: "Urgencia", percentage: 50 }, { id: "variant-b", name: "Beneficio", percentage: 50 }] } } },
  { id: "sms_a", type: "action.sendSms", position: {x:100,y:300}, data: { label: "SMS Urgencia", config: { message: "{{name}}, ULTIMAS HORAS! Bonus expira hoje!" } } },
  { id: "sms_b", type: "action.sendSms", position: {x:500,y:300}, data: { label: "SMS Beneficio", config: { message: "{{name}}, deposite agora e ganhe 200 giros gratis!" } } },
  { id: "end", type: "flow.exit", position: {x:300,y:450}, data: { label: "Fim" } }
]
edges: [
  { id: "e1", source: "t", target: "ab" },
  { id: "e2", source: "ab", target: "sms_a", sourceHandle: "variant-a" },
  { id: "e3", source: "ab", target: "sms_b", sourceHandle: "variant-b" },
  { id: "e4", source: "sms_a", target: "end" },
  { id: "e5", source: "sms_b", target: "end" }
]

### WORKFLOW 5: Modal insite para novos usuarios
1. create_smart_modal({ name: "Welcome", type: "html", desktop: { enabled: true, htmlContent: "<div style='padding:32px;text-align:center'><h1>Bem-vindo!</h1><p>Faca seu primeiro deposito e ganhe bonus!</p></div>" } })
2. create_rule({ name: "Novo Usuario Registrado", json: { conditionGroup: { operator: "AND", conditions: [{ type: "profile_attribute", atributo: "stage", operador: "igual", valor: "registered" }] } } })
3. create_journey({
     name: "Welcome Modal",
     journeyType: "insite",
     nodes: [
       { id: "t", type: "trigger.ruleMatch", position: {x:300,y:0}, data: { label: "Regra Match", config: { ruleId: "RULE_ID" } } },
       { id: "modal", type: "action.showModal", position: {x:300,y:150}, data: { label: "Mostrar Modal", config: { modalId: "MODAL_ID" } } },
       { id: "end", type: "flow.exit", position: {x:300,y:300}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "modal" },
       { id: "e2", source: "modal", target: "end" }
     ]
   })
4. update_journey(id, { status: "active" })

### WORKFLOW 6: Campanha direta por lista (sem jornada)
1. create_list({ name: "Promo Natal" })
2. add_contacts_to_list(listId, [{ externalId: "u1", phone: "+55..." }])
3. create_campaign({ name: "Natal SMS", type: "sms", audience: { listId: "LIST_ID" }, content: { body: "Feliz Natal! Deposite e ganhe 100 giros!" } })
4. execute_campaign(campaignId)

### WORKFLOW 7: Reativacao de inativos
1. get_inactive_profiles({ days: 14 }) → usuarios inativos ha 14 dias
2. create_list({ name: "Inativos 14d" }) + add_contacts_to_list
3. create_journey (offsite) com action.sendEmail → email de reativacao
4. Ativar + disparar batch

### WORKFLOW 8: Aguardar deposito (waitForEvent)
nodes: [
  { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Trigger" } },
  { id: "sms1", type: "action.sendSms", position: {x:300,y:150}, data: { label: "SMS Convite", config: { message: "{{name}}, deposite agora e ganhe bonus!" } } },
  { id: "wait", type: "flow.waitForEvent", position: {x:300,y:300}, data: { label: "Aguardar Deposito", config: { eventType: "deposit", timeoutDuration: 24, timeoutUnit: "hours" } } },
  { id: "sms_ok", type: "action.sendSms", position: {x:100,y:450}, data: { label: "SMS Parabens", config: { message: "{{name}}, parabens pelo deposito! Bonus creditado!" } } },
  { id: "sms_timeout", type: "action.sendSms", position: {x:500,y:450}, data: { label: "SMS Lembrete", config: { message: "{{name}}, seu bonus esta expirando! Deposite nas proximas 6h!" } } },
  { id: "end", type: "flow.exit", position: {x:300,y:600}, data: { label: "Fim" } }
]
edges: [
  { id: "e1", source: "t", target: "sms1" },
  { id: "e2", source: "sms1", target: "wait" },
  { id: "e3", source: "wait", target: "sms_ok", sourceHandle: "event_received" },
  { id: "e4", source: "wait", target: "sms_timeout", sourceHandle: "timeout" },
  { id: "e5", source: "sms_ok", target: "end" },
  { id: "e6", source: "sms_timeout", target: "end" }
]

---

## 4. CATALOGO DE TOOLS (90+)

### Auth (2)
- login(email, password): faz login e configura sessao (auto na inicializacao)
- get_current_user(): verifica quem esta logado

### Perfis de Usuarios (10)
- search_user_profiles(query): busca por nome/email/phone/id
- get_profiles_by_tag(tag): usuarios com tag especifica
- get_profiles_by_deposit_tier(tier): por tier (none/low/medium/high/whale)
- get_profiles_by_intention(level): por intencao (very_low/low/medium/high/very_high)
- get_profiles_by_stage(stage): por estagio (anonymous/registered/ftd/depositor/churned)
- get_high_intention_profiles(): alta intencao sem deposito (ideais pra FTD)
- get_inactive_profiles(days): inativos ha N dias (pra reativacao)
- get_profile_stats(): totais por stage/tier/intencao
- get_tags_stats(): todas as tags com contagens
- get_company_diagnostic(): visao executiva completa (funil, oportunidades, churn)

### Usuarios Individuais (3)
- get_user_state(userId): features calculadas + segmentos ativos
- get_user_segments(userId): segmentos do usuario
- reevaluate_user(userId): forca re-avaliacao de segmentos

### Segmentos (5)
- list_segments(): todos os segmentos com condicoes
- get_segment(segmentId): detalhes + contagem
- get_segment_members(segmentId): lista de userIds
- check_user_in_segment(segmentId, userId): verifica pertencimento
- evaluate_segment(segmentId, features): debug com features custom

### Jornadas (9)
- list_journeys(): todas as jornadas
- get_journey(journeyId): detalhes com nodes/edges
- create_journey(name, journeyType, nodes, edges): cria jornada completa
- update_journey(journeyId, updates): ativar/pausar/modificar
- duplicate_journey(journeyId): clonar
- trigger_journey_offsite(externalId): dispara pra 1 usuario
- trigger_journey_offsite_batch(users): dispara pra multiplos
- get_journey_analytics(journeyId): metricas de execucao
- get_journey_funnel(journeyId): funil por node

### Campanhas (4)
- list_campaigns(): todas as campanhas
- create_campaign(name, type, content, audience): cria campanha SMS/Email/RCS/WhatsApp
- execute_campaign(campaignId): dispara envio
- get_campaign_stats(campaignId): metricas de envio

### Blast (1)
- create_blast_campaign(segmentId): campanha de blast para segmento inteiro

### Listas de Contatos (8)
- list_lists(): todas as listas
- create_list(name): criar lista
- get_list(listId): detalhes
- add_contacts_to_list(listId, contacts): adicionar contatos
- get_list_members(listId): membros com paginacao
- get_list_count(listId): total de contatos
- remove_contacts_from_list(listId, contacts): remover
- delete_list(listId): excluir lista

### Smart Modals (3)
- list_smart_modals(): todos os modais
- create_smart_modal(name, desktop, mobile, triggers, targeting): criar modal
- update_smart_modal(modalId, updates): atualizar

### Smart Blocks (3)
- list_smart_blocks(): todos os blocks
- create_smart_block(name, contentType, htmlContent, targeting): criar block
- update_smart_block(blockId, updates): atualizar

### Regras Comportamentais (3)
- list_rules(): todas as regras
- create_rule(name, json): criar regra com conditionGroup
- generate_rule_ai(prompt): gerar regra por linguagem natural via IA

### Builder Meta / Ontologia (7)
- get_builder_meta(): TODOS os metadados (node types + condition types + operators)
- get_node_types(): tipos de node com config schemas
- get_condition_types(): tipos de condicao com campos
- get_operators(): operadores (igual, maior_que, contem...)
- get_ontology_fields(): atributos de perfil para conditions
- get_ontology_groups(): grupos de atributos
- seed_builder_meta(): popular/atualizar metadados

### Contatos CRM (4)
- list_contacts(search, tag, status): listar com filtros
- create_contact(externalId, name, phones, emails): criar/upsert
- import_contacts(contacts): importar em lote
- get_contact_stats(): estatisticas

### Ingestion (3)
- track_event(userId, event, properties): rastrear evento
- identify_user(userId, traits): atualizar perfil
- batch_ingest(items): lote de ate 10.000 eventos/identifies

### Analytics (2)
- query_audience_deposit(window, threshold): audiencia por deposito (24h/7d)
- query_active_users(): usuarios ativos

### Creative Studio (11)
- list_templates(): templates de banner
- get_template_info(template_id): detalhes + campos editaveis
- create_template(name, canvasJSON): criar template Fabric.js
- duplicate_template(template_id): duplicar
- generate_image(template_id, modifications): gerar imagem final
- generate_banner_ai(prompt): gerar template via IA (fallback)
- search_images(query): busca semantica de imagens
- list_images(): todas as imagens
- upload_image_url(url): importar imagem
- list_image_categories(): categorias disponiveis
- create_visual_for_component(prompt): criativo completo end-to-end

### Brand Guidelines (3)
- get_brand_guidelines(): paleta de cores/fontes
- set_brand_guidelines(name, colors, fonts): criar/atualizar
- analyze_brand_style(): extrair estilo de templates existentes

### Integracoes (4)
- list_integrations(): provedores disponiveis
- list_credentials(scope): credenciais configuradas
- create_credential(integrationId, name, credentials): criar
- test_credential(credentialId): testar

---

## 5. DICAS ESSENCIAIS PARA A IA

1. **Primeira interacao**: chame get_profile_stats() e get_tags_stats() para entender a base
2. **Antes de criar jornada**: chame get_node_types() para ver tipos validos
3. **Antes de criar regra**: chame get_condition_types() e get_ontology_fields()
4. **Para modais/blocks**: chame list_smart_modals()/list_smart_blocks() para ver IDs existentes
5. **Offsite = fora do site**: trigger.webhook + action.sendSms/sendEmail
6. **Insite = no site**: trigger.ruleMatch + action.showModal/showBlock
7. **Edges de conditions**: SEMPRE use sourceHandle "yes"/"no" para conditions, "variant-a"/"variant-b" para abTest, "path-1"/"path-2" para split, "event_received"/"timeout" para waitForEvent
8. **Variaveis Liquid**: use {{name}}, {{phone}}, {{email}}, {{site_url}} nos textos
9. **Token auto-renova**: nao se preocupe com expiracão de sessao
10. **CompanyId automatico**: NUNCA passe companyId manualmente, vem do login
11. **Para descobrir usuarios**: get_profiles_by_tag, get_profiles_by_stage, get_inactive_profiles, search_user_profiles
12. **Para campanhas por lista**: create_list → add_contacts_to_list → create_campaign → execute_campaign
13. **Para jornada offsite**: create_journey → update_journey(active) → trigger_journey_offsite_batch
14. **Posicoes dos nodes**: use x:300 centralizado, y incremental de 150 em 150
15. **flow.delay config**: { duration: NUMBER, unit: "seconds"|"minutes"|"hours"|"days"|"weeks" }
`;

const SECTIONS: Record<string, string> = {
  workflows: FULL_REFERENCE.split("## 3. WORKFLOWS")[1]?.split("## 4.")[0] || "",
  node_types: FULL_REFERENCE.split("## 2. TIPOS DE NODE")[1]?.split("## 3.")[0] || "",
  concepts: FULL_REFERENCE.split("## 1. CONCEITOS")[1]?.split("## 2.")[0] || "",
  tools: FULL_REFERENCE.split("## 4. CATALOGO DE TOOLS")[1]?.split("## 5.")[0] || "",
  tips: FULL_REFERENCE.split("## 5. DICAS")[1] || "",
};

export function registerPlatformReferenceTools(server: McpServer) {
  server.tool(
    "get_platform_reference",
    `Consulta a referencia completa e atualizada da plataforma UserIn. Retorna dados estruturados sobre TUDO: conceitos (stages, tiers, tags, jornadas vs campanhas), tipos de node de jornada (com configs e sourceHandles), 8 workflows completos passo-a-passo com JSONs prontos (SMS para whales, FTD, condicao whale/normal, A/B test, modal insite, campanha direta, reativacao, waitForEvent), catalogo de 90+ tools por categoria, e 15 dicas essenciais.

Use SEMPRE que precisar saber capacidades exatas antes de criar algo. Se for sua primeira interacao com a plataforma, chame esta tool.

Secoes disponiveis: workflows, node_types, concepts, tools, tips. Se omitido, retorna TUDO (recomendado na primeira vez).`,
    {
      section: z.string().optional().describe("Secao: workflows, node_types, concepts, tools, tips. Se omitido, retorna TUDO."),
    },
    async ({ section }) => {
      const text = section && SECTIONS[section]
        ? SECTIONS[section]
        : FULL_REFERENCE;
      return { content: [{ type: "text", text }] };
    }
  );
}
