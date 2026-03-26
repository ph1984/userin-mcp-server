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

## Configuracao

Adicione ao `~/.cursor/mcp.json` (Cursor) ou `claude_desktop_config.json` (Claude Desktop):

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
        "SEGMENTS_URL": "https://segment-engine-staging.fly.dev"
      }
    }
  }
}
```

So isso. O servidor faz **login automatico** ao iniciar e renova o token JWT automaticamente quando expira.

## Seguranca

- **Isolamento por empresa**: cada usuario so acessa dados da sua empresa (extraido do JWT)
- **Token auto-renova**: se um request retorna 401, re-login transparente
- **Sem secrets expostos**: credenciais internas tem defaults seguros no servidor

## Tools (90+)

### Auth
| Tool | Descricao |
|------|-----------|
| `login` | Login manual (alternativa ao auto-login) |
| `get_current_user` | Verifica sessao ativa |
| `get_platform_reference` | Guia completo — conceitos, workflows, catalogo de tools |

### Jornadas
| Tool | Descricao |
|------|-----------|
| `list_journeys` | Lista todas as journeys |
| `get_journey` | Detalhes com nodes/edges |
| `create_journey` | Cria journey (insite ou offsite) com nodes, edges e configs |
| `update_journey` | Ativa, pausa ou modifica |
| `duplicate_journey` | Clona journey |
| `trigger_journey_offsite` | Dispara para 1 usuario |
| `trigger_journey_offsite_batch` | Dispara para N usuarios de uma vez |
| `get_journey_analytics` | Metricas de execucao |
| `get_journey_funnel` | Funil por node |

### Campanhas
| Tool | Descricao |
|------|-----------|
| `list_campaigns` | Lista campanhas (SMS, Email, RCS, WhatsApp) |
| `create_campaign` | Cria campanha com audiencia e conteudo |
| `execute_campaign` | Dispara envio |
| `get_campaign_stats` | Estatisticas |

### Listas de Contatos
| Tool | Descricao |
|------|-----------|
| `list_lists` | Lista todas |
| `create_list` | Cria lista |
| `get_list` | Detalhes |
| `add_contacts_to_list` | Adiciona contatos com phone/email |
| `get_list_members` | Membros com paginacao |
| `get_list_count` | Total de membros |
| `remove_contacts_from_list` | Remove contatos |
| `delete_list` | Exclui lista |

### Perfis de Usuarios
| Tool | Descricao |
|------|-----------|
| `search_user_profiles` | Busca por nome/email/telefone |
| `get_profiles_by_tag` | Por tag (whale, vip, churned...) |
| `get_profiles_by_deposit_tier` | Por tier (none/low/medium/high/whale) |
| `get_profiles_by_intention` | Por intencao (very_low a very_high) |
| `get_high_intention_profiles` | Alta intencao sem deposito |
| `get_profiles_by_stage` | Por estagio (anonymous → registered → ftd → depositor → churned) |
| `get_inactive_profiles` | Inativos ha N dias |
| `get_profile_stats` | Totais consolidados |
| `get_tags_stats` | Todas as tags com contagens |
| `get_company_diagnostic` | Diagnostico executivo |

### Usuarios Individuais
| Tool | Descricao |
|------|-----------|
| `get_user_state` | Features calculadas + segmentos |
| `get_user_segments` | Segmentos do usuario |
| `reevaluate_user` | Forca re-avaliacao |
| `identify_user` | Atualiza perfil |
| `track_event` | Rastreia evento (deposit, click, etc) |
| `batch_ingest` | Lote de ate 10.000 itens |

### Segmentos
| Tool | Descricao |
|------|-----------|
| `list_segments` | Lista segmentos |
| `get_segment` | Detalhes + contagem |
| `get_segment_members` | Lista de userIds |
| `check_user_in_segment` | Verifica pertencimento |
| `evaluate_segment` | Debug com features custom |
| `create_blast_campaign` | Blast para segmento inteiro |

### Regras Comportamentais
| Tool | Descricao |
|------|-----------|
| `list_rules` | Lista regras |
| `create_rule` | Cria regra com conditionGroup |
| `generate_rule_ai` | Gera regra por IA a partir de linguagem natural |

### Smart Modals & Blocks
| Tool | Descricao |
|------|-----------|
| `list_smart_modals` | Lista modais |
| `create_smart_modal` | Cria modal HTML/imagem com triggers e targeting |
| `update_smart_modal` | Atualiza |
| `list_smart_blocks` | Lista blocks |
| `create_smart_block` | Cria block injetado no DOM |
| `update_smart_block` | Atualiza |

### Ontologia / Builder
| Tool | Descricao |
|------|-----------|
| `get_builder_meta` | Todos os metadados (nodes + conditions + operators) |
| `get_node_types` | Tipos de node com config schemas |
| `get_condition_types` | Tipos de condicao |
| `get_operators` | Operadores de comparacao |
| `get_ontology_fields` | Atributos de perfil para conditions |
| `get_ontology_groups` | Grupos de atributos |

### CRM
| Tool | Descricao |
|------|-----------|
| `list_contacts` | Lista com filtros |
| `create_contact` | Cria/atualiza (upsert) |
| `import_contacts` | Importa em lote |
| `get_contact_stats` | Estatisticas |

### Analytics
| Tool | Descricao |
|------|-----------|
| `query_audience_deposit` | Audiencia por deposito (24h/7d) |
| `query_active_users` | Usuarios ativos |

### Creative Studio
| Tool | Descricao |
|------|-----------|
| `list_templates` | Templates de banner |
| `get_template_info` | Detalhes + campos editaveis |
| `create_template` | Cria template Fabric.js |
| `duplicate_template` | Duplica |
| `generate_image` | Gera imagem final |
| `generate_banner_ai` | Gera template via IA |
| `create_visual_for_component` | Criativo end-to-end |
| `search_images` | Busca semantica |
| `upload_image_url` | Importa imagem de URL |
| `get_brand_guidelines` | Paleta de cores/fontes |
| `set_brand_guidelines` | Cria/atualiza brand guide |
| `analyze_brand_style` | Extrai estilo de templates |

### Integracoes
| Tool | Descricao |
|------|-----------|
| `list_integrations` | Provedores disponiveis |
| `list_credentials` | Credenciais configuradas |
| `create_credential` | Cria credencial |
| `test_credential` | Testa conectividade |

## Exemplos

### SMS para whales com A/B test

```
1. get_tags_stats()                          → ver tags e quantidades
2. get_profiles_by_tag("whale")              → listar whales
3. create_list({ name: "Whales VIP" })
4. add_contacts_to_list(listId, contacts)
5. create_journey({
     journeyType: "offsite",
     nodes: [trigger.webhook → condition.abTest → 2x action.sendSms → flow.exit],
     edges com sourceHandle: "variant-a" / "variant-b"
   })
6. update_journey(id, { status: "active" })
7. trigger_journey_offsite_batch({ users: [...] })
```

### Jornada condicional whale + waitForEvent

```
trigger.webhook
  → condition.hasTag("whale")
    → [yes] SMS VIP (R$1000 bonus)
    → [no]  SMS normal (R$100 bonus)
  → flow.waitForEvent("deposit", timeout: 24h)
    → [event_received] SMS parabens
    → [timeout] SMS lembrete
  → flow.exit
```

### Modal insite para novos registros

```
1. create_smart_modal({ name: "Welcome" })
2. create_rule({ profile_attribute: stage = registered })
3. create_journey({ journeyType: "insite", trigger.ruleMatch → action.showModal → flow.exit })
4. update_journey({ status: "active" })
```

### Campanha direta por lista

```
1. create_list({ name: "Apostadores Real Madrid" })
2. add_contacts_to_list(listId, [{ externalId: "u1", phone: "+5511..." }])
3. create_campaign({ type: "sms", audience: { listId }, content: { body: "Promo!" } })
4. execute_campaign(campaignId)
```

## Arquitetura

```
┌──────────────┐    stdio    ┌──────────────────┐
│   Cursor /   │◄───────────►│   MCP Server     │
│ Claude / IDE │             │   (Node.js)      │
└──────────────┘             └────────┬─────────┘
                                      │ HTTP + JWT auto
                              ┌───────┴───────┐
                        ┌─────▼─────┐   ┌─────▼─────┐
                        │  Platform  │   │  Segments  │
                        │  Backend   │   │  Engine    │
                        └─────┬──────┘   └─────┬─────┘
                              │                 │
                        ┌─────▼─────┐   ┌──────▼─────┐
                        │  MongoDB   │   │ ClickHouse │
                        │  + Redis   │   │            │
                        └────────────┘   └────────────┘
```

## Desenvolvimento

```bash
npm run dev     # hot reload
npm run build   # build
npm start       # rodar
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|----------|-----------|:-----------:|
| `USERIN_EMAIL` | Email para login | Sim |
| `USERIN_PASSWORD` | Senha | Sim |
| `PLATFORM_URL` | URL do backend | Sim |
| `SEGMENTS_URL` | URL do segment engine | Sim |

## License

MIT
