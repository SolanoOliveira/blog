---
version: "alpha"
name: "Flat Design"
description: "Blog minimalista, 2D, com foco nas postagens e na tipografia."
colors:
  primary: "#1A1A1A"
  secondary: "#4A4A4A"
  tertiary: "#0066FF"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
rounded:
  sm: 2px
  md: 4px
  lg: 8px
---

## Direção visual

Referência atualizada a partir do Flat Design fornecido pelo autor. Fundo branco, texto em carvão, texto secundário cinza e azul para ações. Tipografia do sistema, linhas simples, sem sombras, gradientes ou ilustrações decorativas. Usar até 4–6 cores sólidas e cantos discretos de 0–2 px.

## Página inicial

Abrir diretamente na lista pública de postagens. Sem hero, página de apresentação ou seção “sobre”. Cabeçalho com Solano Oliveira e acesso discreto à área do autor. Título “Postagens”, quantidade de publicações e lista cronológica. Cada item mostra data, título, resumo e foto somente quando a postagem tiver uma. Não criar capas fictícias para textos sem foto.

Essa escolha segue o pedido explícito de simplificar o blog, substituindo o hero e as seções de landing page do template geral.

## Tipografia e layout

- H1: 2.25rem, peso 700. Títulos de postagens: 1.5rem.
- Texto: 1rem, entrelinha 1.6; leitura limitada a 72 caracteres por linha aproximadamente.
- Layout centralizado com margem lateral de 24px e espaçamentos em múltiplos de 8px.
- Lista em uma coluna; miniatura lateral em telas grandes e acima do texto abaixo de 768px.
- Sem rolagem horizontal em dispositivos móveis.

## Componentes e acessibilidade

- Botões primários azuis com texto branco; hover com mudança de cor, sem sombras.
- Campos com rótulos acima e borda simples. Foco visível com contorno azul e afastamento de 2–4px.
- Ícones SVG quando necessários, sem emojis.
- Estado vazio com ícone e mensagem curta. Ação de escrever somente para administrador autenticado.
- Carregamento por bloco neutro com mudança de opacidade, sem gradiente ou spinner.
- Respeitar preferência por movimento reduzido. Transições curtas de 150–200ms.
- Não usar preto puro, imagens externas quebradas ou texto fictício nas postagens.

## Funcionalidade

Visitantes leem sem login. Apenas o administrador publica textos e fotos ou exclui postagens. A autenticação e as permissões continuam sendo verificadas no backend.
