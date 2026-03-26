# UserIn MCP Server

MCP Server para operacoes completas da plataforma **UserIn** — CRM inteligente, segmentacao comportamental e automacao de marketing para iGaming.

Compativel com **Cursor**, **Claude Desktop**, **Windsurf**, e qualquer cliente MCP via stdio.

## O que e possivel fazer?

- **Jornadas visuais** — criar, ativar e disparar fluxos de automacao (insite no site, offsite via SMS/Email)
- **Campanhas multicanal** — SMS, Email, RCS, WhatsApp para listas de contatos
- **Segmentacao inteligente** — segmentos em tempo real, perfis por stage/tier/tag/intencao
- **Smart Modals & Blocks** — popups e componentes injetados no site do cliente
- **Regras comportamentais** — condicoes em tempo real (pagina, click, atributo, tag)
- **Creative Studio** — templates de banner, geracao de imagens via IA
- **CRM** — contatos, listas, importacao em lote
- **Analytics** — diagnostico da empresa, funil, metricas de jornada

## Instalacao

```bash
git clone https://github.com/ph1984/userin-mcp-server.git
cd userin-mcp-server
npm install
npm run build
```

## Configuracao no Cursor / Claude Desktop

Adicione ao arquivo `~/.cursor/mcp.json` (ou `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "userin": {
      "command": "node",
      "args": ["/caminho/para/userin-mcp-server/dist/index.js"],
      "env": {
        "USERIN_EMAIL": "seu_email@empresa.com",
        "USERIN_PASSWORD": "sua_senha",
        "PLATFORM_URL": "https://platform-api-stg-userin-ai.fly.dev",
        "SEGMENTS_URL": "https://segment-engine-staging.fly.dev",
        "AI_JOURNEY_URL": "http://localhost:8090",
        "INTEGRATIONS_URL": "http://localhost:3066",
        "INGESTION_URL": "http://localhost:3077",
        "CREATEFLOW_URL": "http://localhost:4000",
        "FLOWIMAGER_URL": "http://localhost:4001",
        "INTERNAL_SECRET": "userin-internal-2024",
        "API_SECRET": "userinsight_secret_key_2023",
        "JWT_SECRET": "userinsight_secret_key_2024"
      }
    }
  }
}
```

O servidor faz **login automatico** ao iniciar usando `USERIN_EMAIL` e `USERIN_PASSWORD`. O token JWT e renovado automaticamente quando expira.

## Autenticacao & Seguranca

- **Login automatico**: ao iniciar, o servidor faz login com as credenciais do `.env` e extrai `companyId` do JWT
- **Token auto-renova**: se um request retorna 401, o servidor faz re-login transparente e retenta
- **Isolamento por empresa**: cada usuario so acessa dados da sua empresa (companyId vem do JWT)
- **Sem companyId manual**: todas as tools usam o companyId do login automaticamente

## Tools Disponiveis (90+)

### Auth (2)
| Tool | Descricao |
|------|-----------|
| `login` | Login manual (alternativa ao auto-login) |
| `get_current_user` | Verifica sessao ativa |

### Referencia (1)
| Tool | Descricao |
|------|-----------|
| `get_platform_reference` | Guia completo da plataforma — conceitos, workflows, catalogo de tools, dicas |

### Jornadas (9)
| Tool | Descricao |
|------|-----------|
| `list_journeys` | Lista todas as journeys |
| `get_journey` | Detalhes com nodes/edges |
| `create_journey` | Cria journey completa (insite ou offsite) |
| `update_journey` | Ativa/pausa/modifica |
| `duplicate_journey` | Clona journey |
| `trigger_journey_offsite` | Dispara para 1 usuario |
| `trigger_journey_offsite_batch` | Dispara para N usuarios |
| `get_journey_analytics` | Metricas de execucao |
| `get_journey_funnel` | Funil por node |

### Campanhas (4)
| Tool | Descricao |
|------|-----------|
| `list_campaigns` | Lista campanhas (SMS, Email, RCS, WhatsApp) |
| `create_campaign` | Cria campanha com audiencia e conteudo |
| `execute_campaign` | Dispara envio |
| `get_campaign_stats` | Estatisticas de envio |

### Listas de Contatos (8)
| Tool | Descricao |
|------|-----------|
| `list_lists` | Lista todas as listas |
| `create_list` | Cria lista |
| `get_list` | Detalhes |
| `add_contacts_to_list` | Adiciona contatos |
| `get_list_members` | Membros com paginacao |
| `get_list_count` | Total de membros |
| `remove_contacts_from_list` | Remove contatos |
| `delete_list` | Exclui lista |

### Perfis de Usuarios (10)
| Tool | Descricao |
|------|-----------|
| `search_user_profiles` | Busca por nome/email/telefone |
| `get_profiles_by_tag` | Usuarios com tag (whale, vip, churned...) |
| `get_profiles_by_deposit_tier` | Por tier (none/low/medium/high/whale) |
| `get_profiles_by_intention` | Por intencao (very_low a very_high) |
| `get_high_intention_profiles` | Alta intencao sem deposito (ideais para FTD) |
| `get_profiles_by_stage` | Por estagio (anonymous/registered/ftd/depositor/churned) |
| `get_inactive_profiles` | Inativos ha N dias (para reativacao) |
| `get_profile_stats` | Totais por stage/tier/intencao |
| `get_tags_stats` | Todas as tags com contagens |
| `get_company_diagnostic` | Diagnostico executivo (funil, oportunidades, churn) |

### Usuarios Individuais (3)
| Tool | Descricao |
|------|-----------|
| `get_user_state` | Features calculadas + segmentos |
| `get_user_segments` | Segmentos do usuario |
| `reevaluate_user` | Forca re-avaliacao |

### Segmentos (5)
| Tool | Descricao |
|------|-----------|
| `list_segments` | Lista segmentos com condicoes |
| `get_segment` | Detalhes + contagem |
| `get_segment_members` | Lista de userIds |
| `check_user_in_segment` | Verifica pertencimento |
| `evaluate_segment` | Debug com features custom |
| `create_blast_campaign` | Blast para segmento inteiro |

### Regras Comportamentais (3)
| Tool | Descricao |
|------|-----------|
| `list_rules` | Lista regras |
| `create_rule` | Cria regra com conditionGroup |
| `generate_rule_ai` | Gera regra por IA a partir de linguagem natural |

### Smart Modals (3)
| Tool | Descricao |
|------|-----------|
| `list_smart_modals` | Lista modais |
| `create_smart_modal` | Cria modal HTML/imagem com triggers e targeting |
| `update_smart_modal` | Atualiza modal |

### Smart Blocks (3)
| Tool | Descricao |
|------|-----------|
| `list_smart_blocks` | Lista blocks |
| `create_smart_block` | Cria block injetado no DOM |
| `update_smart_block` | Atualiza block |

### Builder Meta / Ontologia (7)
| Tool | Descricao |
|------|-----------|
| `get_builder_meta` | Todos os metadados (nodes + conditions + operators) |
| `get_node_types` | Tipos de node com config schemas |
| `get_condition_types` | Tipos de condicao |
| `get_operators` | Operadores de comparacao |
| `get_ontology_fields` | Atributos de perfil para conditions |
| `get_ontology_groups` | Grupos de atributos |
| `seed_builder_meta` | Popular metadados |

### CRM / Contatos (4)
| Tool | Descricao |
|------|-----------|
| `list_contacts` | Lista com filtros |
| `create_contact` | Cria/atualiza (upsert) |
| `import_contacts` | Importa em lote |
| `get_contact_stats` | Estatisticas |

### Ingestion (3)
| Tool | Descricao |
|------|-----------|
| `track_event` | Rastreia evento (deposit, click, etc) |
| `identify_user` | Atualiza perfil |
| `batch_ingest` | Lote de ate 10.000 itens |

### Analytics (2)
| Tool | Descricao |
|------|-----------|
| `query_audience_deposit` | Audiencia por deposito (24h/7d) |
| `query_active_users` | Usuarios ativos |

### Creative Studio (11)
| Tool | Descricao |
|------|-----------|
| `list_templates` | Templates de banner |
| `get_template_info` | Detalhes + campos editaveis |
| `create_template` | Cria template Fabric.js |
| `duplicate_template` | Duplica template |
| `generate_image` | Gera imagem final de template |
| `generate_banner_ai` | Gera template via IA (fallback) |
| `create_visual_for_component` | Criativo completo end-to-end |
| `search_images` | Busca semantica de imagens |
| `list_images` | Todas as imagens |
| `upload_image_url` | Importa imagem de URL |
| `list_image_categories` | Categorias disponiveis |

### Brand Guidelines (3)
| Tool | Descricao |
|------|-----------|
| `get_brand_guidelines` | Paleta de cores/fontes |
| `set_brand_guidelines` | Cria/atualiza brand guide |
| `analyze_brand_style` | Extrai estilo de templates |

### Integracoes (4)
| Tool | Descricao |
|------|-----------|
| `list_integrations` | Provedores disponiveis |
| `list_credentials` | Credenciais configuradas |
| `create_credential` | Cria credencial |
| `test_credential` | Testa conectividade |

## Exemplos de Uso

### Exemplo 1: SMS para whales com A/B test

```
1. get_tags_stats()                          → ver whales disponiveis
2. get_profiles_by_tag("whale")              → listar whales
3. create_list({ name: "Whales VIP" })       → criar lista
4. add_contacts_to_list(listId, contacts)    → popular com phones
5. create_journey({
     name: "Promo VIP A/B",
     journeyType: "offsite",
     nodes: [
       { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Trigger" } },
       { id: "ab", type: "condition.abTest", position: {x:300,y:150}, data: {
           label: "A/B", config: { variants: [
             { id: "variant-a", name: "Urgencia", percentage: 50 },
             { id: "variant-b", name: "Beneficio", percentage: 50 }
           ]}
       }},
       { id: "sms_a", type: "action.sendSms", position: {x:100,y:300}, data: {
           label: "Urgencia", config: { message: "{{name}}, ULTIMAS HORAS! Bonus VIP expira hoje!" }
       }},
       { id: "sms_b", type: "action.sendSms", position: {x:500,y:300}, data: {
           label: "Beneficio", config: { message: "{{name}}, ganhe 500 giros gratis no seu slot favorito!" }
       }},
       { id: "end", type: "flow.exit", position: {x:300,y:450}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "ab" },
       { id: "e2", source: "ab", target: "sms_a", sourceHandle: "variant-a" },
       { id: "e3", source: "ab", target: "sms_b", sourceHandle: "variant-b" },
       { id: "e4", source: "sms_a", target: "end" },
       { id: "e5", source: "sms_b", target: "end" }
     ]
   })
6. update_journey(journeyId, { status: "active" })
7. trigger_journey_offsite_batch({ users: [...], event: "promo_vip" })
```

### Exemplo 2: Jornada com condicao whale + waitForEvent

```
nodes: [
  { id: "t", type: "trigger.webhook", ... },
  { id: "check", type: "condition.hasTag", config: { tagNames: ["whale"], operator: "hasAny" } },
  { id: "sms_vip", type: "action.sendSms", config: { message: "{{name}}, bonus R$1000 VIP!" } },
  { id: "sms_normal", type: "action.sendSms", config: { message: "{{name}}, bonus R$100!" } },
  { id: "wait", type: "flow.waitForEvent", config: { eventType: "deposit", timeoutDuration: 24, timeoutUnit: "hours" } },
  { id: "sms_ok", type: "action.sendSms", config: { message: "Parabens {{name}}!" } },
  { id: "sms_lembrete", type: "action.sendSms", config: { message: "{{name}}, seu bonus expira!" } },
  { id: "end", type: "flow.exit" }
]
edges: [
  { source: "t", target: "check" },
  { source: "check", target: "sms_vip", sourceHandle: "yes" },
  { source: "check", target: "sms_normal", sourceHandle: "no" },
  { source: "sms_vip", target: "wait" },
  { source: "sms_normal", target: "wait" },
  { source: "wait", target: "sms_ok", sourceHandle: "event_received" },
  { source: "wait", target: "sms_lembrete", sourceHandle: "timeout" },
  { source: "sms_ok", target: "end" },
  { source: "sms_lembrete", target: "end" }
]
```

### Exemplo 3: Modal insite para novos usuarios

```
1. create_smart_modal({ name: "Welcome", desktop: { htmlContent: "<h1>Bem-vindo!</h1>" } })
2. create_rule({ name: "Novo", json: { conditionGroup: { operator: "AND", conditions: [
     { type: "profile_attribute", atributo: "stage", operador: "igual", valor: "registered" }
   ]}}})
3. create_journey({ journeyType: "insite", nodes: [
     { type: "trigger.ruleMatch", config: { ruleId: "RULE_ID" } },
     { type: "action.showModal", config: { modalId: "MODAL_ID" } },
     { type: "flow.exit" }
   ], edges: [...] })
4. update_journey(id, { status: "active" })
```

## Arquitetura

```
┌──────────────┐    stdio    ┌──────────────────┐
│   Cursor /   │◄───────────►│   MCP Server     │
│ Claude / IDE │             │   (Node.js)      │
└──────────────┘             └────────┬─────────┘
                                      │ HTTP + JWT
                    ┌─────────────────┼──────────────────┐
                    │                 │                   │
              ┌─────▼─────┐   ┌──────▼──────┐   ┌───────▼─────┐
              │  Platform  │   │  Segments   │   │ Integrations│
              │  Backend   │   │   Engine    │   │   Service   │
              └─────┬──────┘   └──────┬──────┘   └─────────────┘
                    │                 │
              ┌─────▼─────┐   ┌──────▼──────┐
              │  MongoDB   │   │ ClickHouse  │
              │  + Redis   │   │ (analytics) │
              └────────────┘   └─────────────┘
```

## Desenvolvimento

```bash
# Dev com hot reload
npm run dev

# Build
npm run build

# Rodar
npm start
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `USERIN_EMAIL` | Email para auto-login | Sim |
| `USERIN_PASSWORD` | Senha para auto-login | Sim |
| `PLATFORM_URL` | URL do backend | Sim |
| `SEGMENTS_URL` | URL do segment engine | Sim |
| `AI_JOURNEY_URL` | URL do AI journey service | Nao |
| `INTEGRATIONS_URL` | URL do servico de integracoes | Nao |
| `INGESTION_URL` | URL do servico de ingestao | Nao |
| `CREATEFLOW_URL` | URL do Creative Studio API | Nao |
| `FLOWIMAGER_URL` | URL do banco de imagens | Nao |
| `INTERNAL_SECRET` | Secret para servicos internos | Sim |
| `API_SECRET` | API secret do backend | Sim |
| `JWT_SECRET` | Secret para JWT | Sim |

## License

MIT
