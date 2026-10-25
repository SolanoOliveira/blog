---
version: "alpha"
name: "Blog Pastel"
description: "Blog minimalista em tons pastéis, cantos arredondados e temas claro e escuro."
colors:
  primary: "#303B3B"
  secondary: "#596666"
  tertiary: "#D6E8DF"
  neutral: "#FBF9F6"
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
  sm: 10px
  md: 16px
  lg: 24px
---

## Direção visual

Referência atualizada pelo pedido mais recente do autor: manter a estrutura simples, com tons pastéis e cantos mais arredondados. Tema claro em creme, branco e verde-sálvia suave; texto escuro para preservar contraste. Tema escuro em carvão azulado, superfícies suaves e detalhes em verde pastel. Sem sombras ou gradientes.

Botões e campos com raio de 16px; cartões e estados vazios com 24px; controle de tema circular. O botão no cabeçalho permite alternar claro/escuro. A preferência é salva no navegador e aplicada antes da inicialização do Angular. Na primeira visita, respeitar a preferência do sistema. O controle deve continuar funcionando quando o armazenamento local estiver indisponível.

## Página inicial

Abrir diretamente na lista pública de postagens. Sem hero, página de apresentação ou seção “sobre”. Cabeçalho com Solano Oliveira, sem link público para a área do autor. Login acessível pelo endereço `/?autor=1`, sempre protegido por senha. Título “Postagens”, quantidade de publicações e lista cronológica. Cada item mostra data, título, resumo e foto somente quando a postagem tiver uma. Não criar capas fictícias para textos sem foto.

Essa escolha segue o pedido explícito de simplificar o blog, substituindo o hero e as seções de landing page do template geral.

## Tipografia e layout

- H1: 2.25rem, peso 700. Títulos de postagens: 1.5rem.
- Texto: 1rem, entrelinha 1.6; leitura limitada a 72 caracteres por linha aproximadamente.
- Layout centralizado com margem lateral de 24px e espaçamentos em múltiplos de 8px.
- Lista em uma coluna; miniatura lateral em telas grandes e acima do texto abaixo de 768px.
- Sem rolagem horizontal em dispositivos móveis.

## Componentes e acessibilidade

- Botões primários em verde pastel com texto escuro; hover com mudança de cor, sem sombras.
- Campos com rótulos acima e borda simples. Foco visível com contorno contrastante e afastamento de 2–4px.
- Ícones SVG quando necessários, sem emojis.
- Estado vazio com ícone e mensagem curta. Ação de escrever somente para administrador autenticado.
- Carregamento por bloco neutro com mudança de opacidade, sem gradiente ou spinner.
- Respeitar preferência por movimento reduzido. Transições curtas de 150–200ms.
- Não usar preto puro, imagens externas quebradas ou texto fictício nas postagens.

## Funcionalidade

Visitantes leem sem login. Apenas o administrador publica textos e fotos ou exclui postagens. A autenticação e as permissões continuam sendo verificadas no backend.
