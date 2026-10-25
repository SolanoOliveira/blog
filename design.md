---
version: "alpha"
name: "Solano — cores e traços"
description: "Blog minimalista com paleta do autor, temas contrastantes e ícones desenhados à mão."
colors:
  teal: "#087E8B"
  coral: "#FF5A5F"
  charcoal: "#3C3C3C"
  amber: "#FFBC42"
  lilac: "#E2C2FF"
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

Paleta solicitada pelo autor: teal nas ações do modo claro; coral nos detalhes e traços; carvão como base escura; amarelo nos destaques e botões do modo escuro; lilás em ícones e links do modo escuro. Preservar os valores exatos da paleta nos elementos de destaque, usando neutros de apoio para leitura.

O tema claro tem fundo quase branco `#FFFDFA`, superfícies brancas e texto carvão. O escuro tem fundo `#1E1C21`, superfícies carvão `#3C3C3C` e texto claro. Os temas devem ser visualmente distintos, incluindo formulários, prévia, código e leitura de postagens.

Botões e campos com raio de 16px; cartões e estados vazios com 24px. Controle deslizante no topo, com sol e lua em traços próprios de caneta. Indicador amarelo para claro e lilás para escuro, com deslocamento suave. Rótulo acessível indica a ação e aria-pressed informa se o modo escuro está ativo. Preferência salva no navegador e aplicada antes da inicialização do Angular; na primeira visita seguir o sistema. Continuar funcionando sem armazenamento local.

Ícones SVG originais com traços levemente irregulares, como desenhos de caneta: sol, lua, documento, imagem, olho, caneta e setas. Sem emojis, dependências de fontes de ícones ou filtros artificiais sobre os textos. Sem gradientes ou sombras pesadas; o botão e o painel flutuantes usam uma sombra discreta, conforme a referência do autor.

## Página inicial

Abrir diretamente na lista pública de postagens. Sem hero ou apresentação na lista. Topo reduzido ao controle de tema, sem repetir nome e título. Não mostrar o link da área do autor. Login acessível pelo endereço `/?autor=1`, sempre protegido por senha. Título “Postagens” e lista cronológica, sem contador ou ilustração no estado vazio. Cada item mostra data, título, resumo e foto somente quando a postagem tiver uma. Não criar capas fictícias para textos sem foto.

Essa escolha segue o pedido explícito de simplificar o blog, substituindo o hero e as seções de landing page do template geral.

## Menu flutuante e página do autor

Botão hambúrguer circular fixo no canto superior esquerdo, seguindo a referência visual. Ao abrir, o ícone se transforma em X e um pequeno painel aparece abaixo com animação de opacidade e deslocamento. O painel contém somente “Postagens” e “Sobre o autor”, com ícones desenhados à mão. O tema e os controles administrativos ficam fora dessas duas opções.

“Sobre o autor” abre uma página separada em `?pagina=sobre`, com o nome Solano Oliveira e uma apresentação breve. Não inventar biografia, profissão, retrato ou links sociais. O menu deve fechar ao navegar, clicar fora ou pressionar Escape. Gerenciar foco de teclado e impedir interação com os links quando fechado. Respeitar movimento reduzido e áreas seguras de celulares.

## Tipografia e layout

- H1: 2.25rem, peso 700. Títulos de postagens: 1.5rem.
- Texto: 1rem, entrelinha 1.6; leitura limitada a 72 caracteres por linha aproximadamente.
- Layout centralizado com margem lateral de 24px e espaçamentos em múltiplos de 8px.
- Lista em uma coluna; miniatura lateral em telas grandes e acima do texto abaixo de 768px.
- Sem rolagem horizontal em dispositivos móveis.

## Componentes e acessibilidade

- Botões primários teal com texto branco no claro e amarelos com texto carvão no escuro; hover com mudança de cor, sem sombras.
- Campos com rótulos acima e borda simples. Foco visível com contorno contrastante e afastamento de 2–4px.
- Ícones SVG quando necessários, sem emojis.
- Estado vazio com ícone e mensagem curta. Ação de escrever somente para administrador autenticado.
- Carregamento por bloco neutro com mudança de opacidade, sem gradiente ou spinner.
- Respeitar preferência por movimento reduzido. Transições curtas de 150–200ms.
- Não usar preto puro, imagens externas quebradas ou texto fictício nas postagens.

## Funcionalidade

Visitantes leem sem login. Apenas o administrador publica, edita e exclui postagens. O editor usa Markdown com prévia e inserção de fotos na posição do cursor, entre os parágrafos. A autenticação e as permissões continuam sendo verificadas no backend.
