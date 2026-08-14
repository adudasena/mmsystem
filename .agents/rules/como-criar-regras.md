---
description: "Diretrizes e boas práticas para a criação de regras (Rules) e personalização do Agente."
alwaysApply: true
---

# Guia e Regras para Criação de Regras (Rules)

Este documento define o padrão oficial para criar, organizar e manter **Regras (Rules)** no Antigravity/Agente.

---

## 1. O que são Regras (Rules)?
Regras são restrições e diretrizes em Markdown que guiam o comportamento do Agente em nível de prompt. Elas garantem que o Agente siga padrões de arquitetura, estilos de código, restrições da stack e fluxos de trabalho específicos do usuário ou do projeto.

---

## 2. Escopos e Localização dos Arquivos

### 🌐 Regras Globais (Global Rules)
- **Localização:** `~/.gemini/config/AGENTS.md` (ou `~/.gemini/GEMINI.md`).
- **Escopo:** Aplicadas globalmente em **todos** os projetos e workspaces.
- **Uso:** Estilo de resposta preferido, idioma de comunicação, convenções pessoais.

### 📁 Regras de Workspace (Workspace Rules)
- **Localização:** Pasta `.agents/rules/` na raiz do projeto (ex: `.agents/rules/nome-da-regra.md`) ou `.agents/AGENTS.md`.
- **Escopo:** Restritas ao projeto atual.
- **Uso:** Padrões da stack (ex: Java/Spring Boot + React), convenções de commits, regras de arquitetura e validações de código.

---

## 3. Modos de Ativação de uma Regra

Ao criar ou editar uma regra, defina um dos seguintes modos de ativação:

1. **Always On (`alwaysApply: true`)**: A regra está sempre ativa no contexto do Agente.
2. **Model Decision**: O modelo decide autonomamente se deve carregar a regra com base na `description`.
3. **Glob (`globs: "src/**/*.java"`)**: A regra é ativada automaticamente quando o trabalho envolve arquivos que correspondem ao padrão de busca.
4. **Manual**: A regra só é carregada quando mencionada explicitamente pelo usuário no chat com `@nome-da-regra`.

---

## 4. Limites e Formatação

- **Formato:** Arquivo em formato Markdown (`.md`).
- **Tamanho Máximo:** Cada arquivo de regra deve conter no máximo **12.000 caracteres**.
- **Referências cruzadas (`@filename`)**: É possível referenciar outros arquivos usando a sintaxe `@caminho/do/arquivo.md` (resolvido de forma relativa ao arquivo de regra ou raiz do projeto).

---

## 5. Estrutura Padrão para Arquivo de Regra

Ao criar um novo arquivo em `.agents/rules/<nome-da-regra>.md`, utilize o seguinte modelo:

```markdown
---
description: "Descreva de forma clara quando e por que esta regra deve ser aplicada."
globs: "*.java, *.tsx"  # Opcional: especifique os globs se aplicável
alwaysApply: false    # Defina true se for Always On
---

# [Título da Regra]

## Contexto & Propósito
Breve explicação do porquê esta regra existe e o que ela resolve.

## Diretrizes e Restrições
- **O que fazer:** [Instrução clara e imperativa]
- **O que NÃO fazer:** [Restrição direta]

## Exemplos
### ❌ Incorreto
\`\`\`java
// Exemplo do padrão antigo ou proibido
\`\`\`

### ✅ Correto
\`\`\`java
// Exemplo alinhado com a regra
\`\`\`
```

---

## 6. Regra vs. Workflow

- **Rules (Regras):** Fornecem contexto e restrições persistentes no nível do prompt.
- **Workflows (Fluxos de Trabalho):** Sequências de passos automatizados acionados via comando `/workflow-name`.
