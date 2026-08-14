---
description: "Contexto completo do sistema MM System. Aplicar sempre que o agente trabalhar em qualquer parte do projeto mmsystem-backend ou mmsystem-frontend."
alwaysApply: true
---

# MM System — Contexto do Projeto para o Agente

## 1. Visão Geral do Sistema

O **MM System** é uma **Plataforma Web de Gestão e Vitrine Digital** desenvolvida como projeto de estágio supervisionado (Ciência da Computação — UniFil, Londrina-PR) para a **Loja Maria Morena**, loja de moda feminina localizada em **Arapongas-PR**.

**Problema que resolve:** A loja operava com cadernos físicos para controle de estoque, condicionais e débitos de clientes. O MM System digitaliza esses processos, eliminando perda de dados e inconsistências.

**Autora:** Maria Eduarda de Sena Ruiz
**Orientador:** Matheus Vinicius Pires da Silva Garvão

---

## 2. Stack Tecnológica

| Camada      | Tecnologia                          |
|-------------|-------------------------------------|
| Backend     | Java 17 + Spring Boot 3.5.13        |
| Frontend    | React 19.2.4 (SPA)                  |
| Banco       | PostgreSQL                          |
| Auth        | JWT (JSON Web Token) + BCrypt       |
| ORM         | Spring Data JPA / Hibernate         |
| Infra       | Oracle Cloud Infrastructure (OCI) — VM Ubuntu 22.04 LTS |
| Protocolo   | HTTPS / TLS-SSL                     |
| IDE Backend | IntelliJ IDEA                       |
| IDE Frontend| VS Code                             |

### Estrutura do Backend (padrão em camadas)
```
mmsystem-backend/
└── src/main/java/com/adudasena/mmsystem/
    ├── controller/   # Endpoints REST (@RestController)
    ├── service/      # Regras de negócio (@Service)
    ├── repository/   # Acesso a dados (Spring Data JPA)
    ├── model/        # Entidades JPA (@Entity)
    └── dto/          # Objetos de transferência de dados
```

---

## 3. Módulos e Casos de Uso

### UC01 — Gerenciar Produtos
- CRUD completo de produtos da loja.
- Cada produto possui: `nome`, `descricao`, `preco`, `categoria`, `status` (`DISPONIVEL` / `INDISPONIVEL`).
- Suporte a **grade de variações**: cores (`cores_selecionadas`) e tamanhos (`tamanhos_selecionados`) são serializados como JSON em colunas TEXT.
- Upload de imagens vinculadas ao produto (`fotos` — JSON de URLs em TEXT).
- **Soft Delete:** campo `deleted_at`; produtos excluídos nunca são apagados fisicamente.
- Produtos associados a condicionais com `status = ABERTA` **não podem ser excluídos**.

### UC02 — Gerenciar Pedidos
- Registra saídas definitivas de mercadorias (vendas confirmadas).
- Realiza baixa no estoque.
- Produto vendido sai da vitrine pública.

### UC03 — Gerenciar Pagamentos
- Controle financeiro de vendas a prazo.
- Suporta pagamentos parciais (recalcula saldo devedor).
- Mantém histórico de débitos por cliente.

### UC04 — Gerenciar Condicionais ⭐ (módulo central)
- Substitui o "caderno de anotações" físico da loja.
- Registra peças que saem para **prova domiciliar** da cliente.
- Entidade: `Condicional` com status `ABERTA`, pode ter status de retorno.
- Cada condicional tem uma lista de `ItemCondicional` (produto + quantidade + cor + tamanho + status do item).
- Ao retorno da cliente: itens são convertidos em venda ou retornam ao estoque.
- Itens ficam em `status = "Em Condicional"` bloqueando estoque temporariamente.
- **Soft Delete** via `deleted_at`.
- Tabela de itens: `itens_condicional` (tabela auxiliar, mapeada com `@ElementCollection`).

### UC05 — Gerenciar Clientes
- Cadastro de consumidoras com nome e contato.
- Centraliza histórico de compras, condicionais e saldo devedor.
- Entidade: `Usuario` (usada tanto para autenticação quanto para representar clientes/consumidoras).

### Vitrine Digital (pública)
- Catálogo online sem autenticação.
- Filtros por **categoria** e **tamanho**.
- Ao escolher peças, gera mensagem automática para **WhatsApp** da loja.
- Endpoint de entrada: `POST /vitrine/pedido` → processa `VitrinePedidoDTO` e cria uma `Condicional`.
- Controller: `VitrineController` → usa `CondicionalService.processarPedidoVitrine(dto)`.

---

## 4. Regras de Negócio Críticas

1. **Acesso à vitrine** é público (sem autenticação).
2. **Operações administrativas** exigem perfil `Administrador (SA_Proprietária)` com JWT válido.
3. Produtos com condicionais `ABERTA` **não podem ser excluídos**.
4. **Soft Delete** é obrigatório para `Produto` e `Condicional` — nunca deletar fisicamente com `DELETE` no banco.
5. A cláusula `@Where(clause = "deleted_at IS NULL")` no `Condicional` filtra automaticamente registros deletados em qualquer query JPA.
6. Cores e tamanhos dos produtos são armazenados como JSON serializado em campos TEXT e desserializados no evento `@PostLoad`.
7. O campo `valorTotal` da `Condicional` começa em `BigDecimal.ZERO` e é calculado pela service ao adicionar itens.

---

## 5. Entidades Principais (modelo de dados)

### `Produto` → tabela `produtos`
| Campo              | Tipo         | Descrição                               |
|--------------------|--------------|-----------------------------------------|
| `id`               | Long (PK)    | Identificador                           |
| `nome`             | String       | Nome do produto                         |
| `descricao`        | TEXT         | Descrição                               |
| `preco`            | BigDecimal   | Preço unitário                          |
| `categoria`        | String       | Categoria da peça                       |
| `cores_selecionadas`| TEXT (JSON) | Lista de cores serializadas             |
| `tamanhos_selecionados`| TEXT (JSON)| Lista de tamanhos serializados        |
| `estoque_detalhado`| TEXT (JSON)  | Estoque por variação cor/tamanho        |
| `fotos`            | TEXT (JSON)  | URLs das imagens                        |
| `status`           | String       | `DISPONIVEL` ou `INDISPONIVEL`          |
| `deleted_at`       | LocalDateTime| Soft delete                             |

### `Condicional` → tabela `condicionais`
| Campo        | Tipo         | Descrição                               |
|--------------|--------------|-----------------------------------------|
| `id`         | Long (PK)    | Identificador                           |
| `usuario`    | FK → Usuario | Cliente que levou as peças              |
| `data_saida` | LocalDate    | Data de retirada das peças              |
| `data_retorno`| LocalDate   | Data prevista de devolução              |
| `status`     | String       | `ABERTA` por padrão                     |
| `valor_total`| BigDecimal   | Soma dos itens                          |
| `deleted_at` | LocalDateTime| Soft delete                             |
| `itens`      | List\<ItemCondicional\> | Peças nessa condicional        |

### `ItemCondicional` → tabela `itens_condicional` (Embeddable)
| Campo              | Tipo     | Descrição                      |
|--------------------|----------|--------------------------------|
| `produto`          | FK → Produto | Produto selecionado        |
| `quantidade`       | Integer  | Quantidade de peças            |
| `cor_escolhida`    | String   | Cor selecionada pela cliente   |
| `tamanho_escolhido`| String   | Tamanho selecionado            |
| `status_item`      | String   | Status individual do item      |

### `Usuario` → tabela `usuarios`
- Representa tanto a proprietária (admin) quanto as clientes.
- Armazena credenciais (senha com BCrypt) e dados de contato.

---

## 6. Arquitetura de API

- **Padrão:** RESTful com JSON.
- **CORS:** Todos os controllers têm `@CrossOrigin(origins = "*", allowedHeaders = "*")`.
- **Base path backend:** `http://localhost:{porta}/`
- Endpoints conhecidos:
  - `GET/POST/PUT/DELETE /produtos` → `ProdutoController`
  - `GET/POST/PUT/DELETE /condicionais` → `CondicionalController`
  - `GET/POST/PUT/DELETE /usuarios` → `UsuarioController`
  - `POST /vitrine/pedido` → `VitrineController`

---

## 7. Requisitos Não Funcionais (FURPS+)

- **Disponibilidade:** 24/7 com backup diário às 03:00h via `pg_dump`.
- **Desempenho:** Suporta ~20 conexões simultâneas com resposta < 2 segundos.
- **Segurança:** HTTPS/TLS, JWT para admin, BCrypt para senhas.
- **Compatibilidade:** Chrome 80+, Firefox 74+, Edge 80+, Safari 14+. Sem suporte ao IE.
- **Acessibilidade:** Fontes legíveis em mobile, alto contraste, botões com área de toque expandida (público 60+).
- **Licenças:** 100% open source.
- **LGPD:** Dados de clientes não são compartilhados com terceiros.

---

## 8. Padrões de Código a Seguir

- Sempre usar **Soft Delete** (`deletedAt = LocalDateTime.now()`) — nunca `repository.delete()` para `Produto` e `Condicional`.
- Toda lógica de negócio fica na camada `@Service`.
- Controllers são finos: recebem requisição, chamam service, retornam `ResponseEntity`.
- Usar `@Transactional` em operações que alteram múltiplas entidades.
- DTOs para entrada/saída da API quando a entidade tem campos sensíveis ou complexos.
- Serialização de listas (cores, tamanhos) como JSON em TEXT via `ObjectMapper`.
