# Kria Web

Plataforma demonstrativa para **criação rápida de sites** para micro e pequenos empreendedores e pessoa física — do modelo pronto à entrega em poucos dias.

## ✨ O que tem aqui
- **Landing page** com configurador interativo (wizard de 7 etapas) e checkout simulado (PIX/cartão/boleto).
- **Galeria de templates**, cada um com **wireframe** (esboço) e **versão final** com conteúdo fictício:
  - 💇 **Salão de Beleza** (Studio Amora) — vitrine, planos e agendamento · paleta rosé/ameixa
  - 🔥 **Restaurante** (Brasa & Sal) — apresentação, cardápio e reserva de mesa · paleta brasa/carvão
  - 🏢 **Empresarial** (Vértice) — institucional, serviços, portfólio/cases · paleta marinho/esmeralda

## 📁 Estrutura
```
kria-web/
├── index.html          # site principal + galeria + configurador
├── style.css           # estilos do site principal
├── app.js              # lógica do wizard/checkout
├── assets/             # imagens
└── templates/          # modelos (wireframe + site + thumbnails)
    ├── wf.css
    ├── site-salao.html         / wireframe-salao.html         / thumb-salao.svg
    ├── site-restaurante.html   / wireframe-restaurante.html   / thumb-restaurante.svg
    └── site-empresa.html       / wireframe-empresa.html       / thumb-empresa.svg
```

## ▶️ Como rodar
É um site estático — basta abrir `index.html` no navegador. Precisa de internet apenas para as fontes (Google Fonts) e as imagens de exemplo (placeholders).

---
Conteúdo dos templates é **fictício**, apenas para demonstração.
