# MEMORY — Kria Web

Contexto persistente do projeto. Atualizar sempre que decisão/fato novo aparecer.

## Projeto
- **Kria Web** — plataforma demo pra criação rápida de sites (micro/pequeno empreendedor + PF).
- Site estático. Abrir `index.html` no navegador. Internet só pra Google Fonts + placeholders.
- Idioma padrão das respostas: **português**.

## Estrutura
- `index.html` — site principal + galeria + configurador (wizard 7 etapas).
- `style.css` — estilos do site principal.
- `app.js` — lógica wizard/checkout (PIX/cartão/boleto, simulado).
- `assets/` — imagens.
- `templates/` — modelos (wireframe + site + thumbnails):
  - Salão de Beleza (Studio Amora) · paleta rosé/ameixa
  - Restaurante (Brasa & Sal) · paleta brasa/carvão
  - Empresarial (Vértice) · paleta marinho/esmeralda
- Conteúdo dos templates é fictício (só demo).

## Memória automática
- Plugin **claude-mem** ativo: captura Read/Edit/Bash como observações, salva em `~/.claude-mem`, injeta contexto relevante em sessões futuras (a partir da 2ª sessão no projeto).
- Buscar memória de sessões passadas: skill `claude-mem:mem-search`.
- Carregar repo inteiro na memória de uma vez: `/learn-codebase` (~5 min, opcional).

## Decisões / Notas
<!-- Adicionar aqui fatos novos, decisões de design, convenções. -->