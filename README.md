# UserIn MCP Server

MCP Server para operacoes completas da plataforma **UserIn** — journeys, campanhas, segmentacao, perfis de usuario, regras comportamentais, criativos e mais.

Compativel com **Cursor**, **Claude Desktop**, **Windsurf**, e qualquer cliente MCP via stdio.

## Instalacao Rapida

```bash
# Clone
git clone https://github.com/ph1984/userin-mcp-server.git
cd userin-mcp-server

# Instale e builde
npm install
npm run build

# Configure
cp .env.example .env
# Edite .env com suas credenciais
```

## Configuracao no Cursor

Adicione ao arquivo `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "userin": {
      "command": "node",
      "args": ["G:/userin-mcp-server/dist/index.js"],
      "env": {
        "PLATFORM_URL": "https://api.upstore.ai",
        "SEGMENTS_URL": "http://localhost:3055",
        "INTEGRATIONS_URL": "http://localhost:3066",
        "INGESTION_URL": "http://localhost:3077",
        "AI_JOURNEY_URL": "http://localhost:8090",
        "PLATFORM_JWT_TOKEN": "seu_jwt_aqui",
        "DEFAULT_COMPANY_ID": "seu_company_id",
        "INTERNAL_SECRET": "userin-internal-2024",
        "API_SECRET": "userinsight_secret_key_2023"
      }
    }
  }
}
```

> **Dica**: Para servicos em Contabo, crie SSH tunnels:
> ```bash
> ssh -L 3055:127.0.0.1:3055 -L 3066:127.0.0.1:3066 -L 3077:127.0.0.1:3077 -L 8090:127.0.0.1:8090 user@CONTABO_IP
> ```

## Tools Disponiveis (80+)

### Journeys (9 tools)
| Tool | Descricao |
|------|-----------|
| `list_journeys` | Lista todas as journeys da empresa |
| `get_journey` | Detalhes completos de uma journey |
| `create_journey` | Cria journey com nodes e edges |
| `update_journey` | Atualiza/ativa/pausa journey |
| `duplicate_journey` | Duplica journey existente |
| `trigger_journey_offsite` | Dispara offsite para 1 usuario |
| `trigger_journey_offsite_batch` | Dispara offsite para N usuarios |
| `get_journey_analytics` | Analytics da journey |
| `get_journey_funnel` | Funil de conversao da journey |

### Campanhas (4 tools)
| Tool | Descricao |
|------|-----------|
| `list_campaigns` | Lista campanhas (SMS, Email, RCS, WhatsApp) |
| `create_campaign` | Cria campanha com audiencia e conteudo |
| `execute_campaign` | Dispara campanha |
| `get_campaign_stats` | Estatisticas de envio |

### Listas de Contatos (7 tools)
| Tool | Descricao |
|------|-----------|
| `list_lists` | Lista todas as listas |
| `create_list` | Cria lista de contatos |
| `get_list` | Detalhes de uma lista |
| `add_contacts_to_list` | Adiciona contatos |
| `get_list_members` | Lista membros |
| `get_list_count` | Contagem de membros |
| `delete_list` | Remove lista |

### Perfis de Usuario (10 tools)
| Tool | Descricao |
|------|-----------|
| `search_user_profiles` | Busca por nome/email/telefone |
| `get_profiles_by_tag` | Usuarios com tag especifica (whale, vip...) |
| `get_profiles_by_deposit_tier` | Por tier de deposito |
| `get_profiles_by_intention` | Por nivel de intencao |
| `get_high_intention_profiles` | Alta intencao sem deposito |
| `get_profiles_by_stage` | Por estagio do funil |
| `get_inactive_profiles` | Inativos (para reativacao) |
| `get_profile_stats` | Estatisticas consolidadas |
| `get_tags_stats` | Distribuicao de tags |
| `get_company_diagnostic` | Diagnostico executivo |

### Segmentos (5+ tools)
| Tool | Descricao |
|------|-----------|
| `list_segments` | Lista segmentos |
| `get_segment` | Detalhes de segmento |
| `get_segment_members` | Membros de segmento |
| `check_user_in_segment` | Verifica se usuario esta no segmento |
| `evaluate_segment` | Avalia segmento com features customizadas |

### Regras Comportamentais (4+ tools)
| Tool | Descricao |
|------|-----------|
| `list_rules` | Lista regras |
| `create_rule` | Cria regra com condicoes |
| `generate_rule_ai` | Gera regra por IA a partir de texto |
| ... | |

### Smart Modals & Blocks (6+ tools)
| Tool | Descricao |
|------|-----------|
| `list_smart_modals` | Lista modals |
| `create_smart_modal` | Cria modal HTML/imagem |
| `list_smart_blocks` | Lista blocks |
| `create_smart_block` | Cria block injetado no DOM |
| ... | |

### CRM / Contatos (5+ tools)
| Tool | Descricao |
|------|-----------|
| `list_contacts` | Lista contatos CRM |
| `create_contact` | Cria/atualiza contato |
| `import_contacts` | Importa em lote |
| `get_contact_stats` | Estatisticas CRM |
| ... | |

### Integracoes & Credenciais (5+ tools)
| Tool | Descricao |
|------|-----------|
| `list_integrations` | Integracoes disponiveis |
| `list_credentials` | Credenciais configuradas |
| `create_credential` | Cria credencial |
| `test_credential` | Testa conectividade |
| ... | |

### Ontologia / Builder (4+ tools)
| Tool | Descricao |
|------|-----------|
| `get_ontology_fields` | Campos de perfil disponiveis |
| `get_builder_meta` | Metadados do journey builder |
| `get_node_types` | Tipos de nodes disponiveis |
| `get_condition_types` | Tipos de condicoes |

### Ingestao de Dados (3+ tools)
| Tool | Descricao |
|------|-----------|
| `track_event` | Rastreia evento de usuario |
| `identify_user` | Atualiza perfil |
| `batch_ingest` | Ingestao em lote |

### Creative Studio (5+ tools)
| Tool | Descricao |
|------|-----------|
| `list_templates` | Lista templates visuais |
| `create_template` | Cria template Fabric.js |
| `generate_image` | Gera imagem final |
| `search_images` | Busca semantica de imagens |
| ... | |

## Fluxos Completos

### Fluxo 1: Campanha SMS para lista externa de IDs

```
1. create_list({ name: "Apostadores Real Madrid" })
2. add_contacts_to_list(listId, [
     { externalId: "user1", phone: "+5511999999999", name: "Joao" },
     { externalId: "user2", phone: "+5511888888888", name: "Maria" }
   ])
3. create_campaign({
     type: "sms",
     name: "Promo Real Madrid",
     content: { body: "Ola {{name}}, jogo do Real Madrid hoje! Deposite R$50 e ganhe R$50 free bet!" },
     audience: { listId: "id_da_lista" }
   })
4. execute_campaign(campaignId)
```

### Fluxo 2: Journey OffSite com SMS para IDs especificos

```
1. create_journey({
     name: "SMS Bonus Real Madrid",
     journeyType: "offsite",
     nodes: [
       { id: "t", type: "trigger.webhook", position: {x:300,y:0}, data: { label: "Webhook" } },
       { id: "sms", type: "action.sendSms", position: {x:300,y:150}, data: {
           label: "SMS Promo",
           config: { message: "{{name}}, aproveite: deposite R$100 e ganhe 50% bonus! Codigo: REALMADRID" }
         }
       },
       { id: "end", type: "flow.end", position: {x:300,y:300}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "sms" },
       { id: "e2", source: "sms", target: "end" }
     ]
   })
2. update_journey(journeyId, { status: "active" })
3. trigger_journey_offsite_batch({
     users: [
       { externalId: "user1" },
       { externalId: "user2" },
       { externalId: "user3" }
     ],
     event: "promo_real_madrid"
   })
```

### Fluxo 3: Journey InSite com Modal

```
1. create_rule({ ... })         // regra comportamental
2. create_smart_modal({ ... })  // modal visual
3. create_journey({
     name: "Modal Promo Deposit",
     journeyType: "insite",
     nodes: [
       { id: "t", type: "trigger.ruleMatch", position: {x:300,y:0}, data: {
           label: "Regra Ativa", config: { ruleId: "id_da_regra" }
         }
       },
       { id: "modal", type: "action.showModal", position: {x:300,y:150}, data: {
           label: "Modal Promo", config: { modalId: "id_do_modal" }
         }
       },
       { id: "end", type: "flow.end", position: {x:300,y:300}, data: { label: "Fim" } }
     ],
     edges: [
       { id: "e1", source: "t", target: "modal" },
       { id: "e2", source: "modal", target: "end" }
     ]
   })
4. update_journey(journeyId, { status: "active" })
```

### Fluxo 4: Identificar audiencia e criar campanha segmentada

```
1. get_profiles_by_tag("whale")         // encontrar whales
2. get_profile_stats()                   // visao geral
3. get_high_intention_profiles()         // alta intencao sem deposito
4. create_list({ name: "Whales Ativos" })
5. add_contacts_to_list(listId, contacts)
6. create_campaign({ ... })
7. execute_campaign(campaignId)
```

## Arquitetura

```
┌──────────────┐    stdio    ┌──────────────────┐
│   Cursor /   │◄───────────►│   MCP Server     │
│ Claude / IDE │             │   (Node.js)      │
└──────────────┘             └────────┬─────────┘
                                      │ HTTP
                    ┌─────────────────┼─────────────────┐
                    │                 │                  │
              ┌─────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
              │  Platform  │   │  Segments   │   │ Integrations│
              │  Backend   │   │   Engine    │   │   Service   │
              │  (API)     │   │             │   │             │
              └────────────┘   └─────────────┘   └─────────────┘
                    │
              ┌─────▼─────┐
              │  MongoDB   │
              │  + Redis   │
              └────────────┘
```

## Desenvolvimento

```bash
# Rodar em dev com hot reload
npm run dev

# Build producao
npm run build

# Rodar build
npm start
```

## Variaveis de Ambiente

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `PLATFORM_URL` | URL do backend principal | `https://api.upstore.ai` |
| `SEGMENTS_URL` | URL do segment engine | `http://localhost:3055` |
| `AI_JOURNEY_URL` | URL do AI journey service | `http://localhost:8090` |
| `INTEGRATIONS_URL` | URL do servico de integracoes | `http://localhost:3066` |
| `INGESTION_URL` | URL do servico de ingestao | `http://localhost:3077` |
| `CREATEFLOW_URL` | URL do CreateFlow | `http://localhost:4000` |
| `FLOWIMAGER_URL` | URL do FlowImager | `http://localhost:4001` |
| `PLATFORM_JWT_TOKEN` | JWT para autenticacao no backend | - |
| `DEFAULT_COMPANY_ID` | Company ID padrao | - |
| `INTERNAL_SECRET` | Secret para servicos internos | `userin-internal-2024` |
| `API_SECRET` | API secret do backend | `userinsight_secret_key_2023` |
| `JWT_SECRET` | Secret para JWT | `userinsight_secret_key_2024` |
| `INGESTION_API_KEY` | API key do servico de ingestao | - |

## License

MIT
