# Solano Oliveira — palavras e instantes

Blog pessoal minimalista, com Angular 21 e Java 21 / Spring Boot 3.5. O visual segue o [design.md](design.md): cores pastéis, cantos arredondados e layout responsivo, sem sombras ou gradientes. O botão no cabeçalho alterna entre os modos claro e escuro; a escolha fica salva no navegador e, na primeira visita, segue o tema do sistema. A página inicial abre diretamente na lista de postagens.

## O que já funciona

- Página pública com lista de postagens e estado vazio, sem postagens fictícias.
- Leitura de textos e fotografias; cada postagem tem um endereço compartilhável com `?post=ID`.
- Área do autor com uma única conta, sem cadastro público.
- Publicação de texto simples e até 12 fotos JPEG/PNG, com até 10 MB cada.
- Exclusão de postagens com confirmação.
- Banco H2 em arquivo e imagens em disco, preservados entre reinícios.
- Login por sessão com cookie HttpOnly, proteção CSRF, senha armazenada em memória como hash BCrypt e validação de uploads. O servidor verifica as permissões em todas as operações de escrita.

## Trabalhar com o Codex e GitHub

O repositório conectado é a base do projeto. Você pode pedir mudanças como “adicione uma página sobre mim” ou “mude as cores do cabeçalho”. O Codex altera os arquivos e executa as verificações. Revise o resultado e envie as alterações ao GitHub em uma branch e um pull request (proposta de alteração); depois, integre na branch `main`. Alterar arquivos aqui não publica automaticamente o site na internet.

## Executar em desenvolvimento

Pré-requisitos: Node.js 24, npm, JDK 21 completo e Maven 3.9+. Não basta instalar apenas um runtime Java.

1. Na pasta `frontend`, execute `npm ci` e `npm run build`.
2. Defina `BLOG_ADMIN_PASSWORD` como uma senha privada de pelo menos 12 caracteres. Não coloque a senha no Git ou em mensagens. O usuário padrão é `admin`; `BLOG_ADMIN_USERNAME` permite alterá-lo.
3. Na pasta `backend`, execute `mvn spring-boot:run`.
4. Em outro terminal, na pasta `frontend`, execute `npm start`.

O Angular usa a porta 4200 e encaminha `/api` para o backend na porta 8080. O login não aparece na navegação pública. Para entrar como autor, acrescente `/?autor=1` ao endereço do blog (no desenvolvimento, digite `localhost:4200/?autor=1` no navegador). Esse endereço discreto não substitui a autenticação: publicar continua exigindo senha. Visitantes podem ler sem entrar.

No ambiente de nuvem, `bash scripts/cloud-setup.sh` instala as ferramentas em `/workspace`, configura o proxy Maven existente, instala as dependências e valida o projeto. Depois de definir a senha, `bash scripts/cloud-backend.sh` inicia o backend já compilado. Use o checkout existente; cada tarefa já é isolada, não é necessário criar um worktree.

## Compilar e testar

```sh
cd frontend
npm ci
npm run build
cd ../backend
mvn verify
```

Pare o backend antes de recompilar ou substituir seu JAR em execução.

O JAR `backend/target/blog-0.0.1-SNAPSHOT.jar` inclui a compilação Angular e pode servir o site e a API juntos. Compile o frontend antes de empacotar o backend. Para executar, defina a senha e rode `java -jar target/blog-0.0.1-SNAPSHOT.jar` na pasta `backend`.

Os quatro testes de integração da API verificam acesso público, bloqueio de escritas anônimas, login, CSRF, publicação, upload, leitura, exclusão e rejeição de entradas inválidas. O GitHub Actions executa a compilação Angular e `mvn verify`.

Os testes de navegador ficam em `frontend/e2e`. Com os dois serviços iniciados, um banco de teste vazio e `BLOG_ADMIN_PASSWORD` configurada no processo de teste, execute `npm run test:e2e` em `frontend`. Usam Chromium em `/usr/bin/chromium`; defina `CHROMIUM_PATH` para outro caminho. Eles publicam e excluem uma postagem de teste, portanto não os execute contra dados de produção. O segundo teste verifica o layout em 375 px. O terceiro verifica o tema do sistema, a alternância claro/escuro e a persistência da preferência ao recarregar.

## Dados, senha e hospedagem

| Variável              | Uso                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------ |
| `BLOG_ADMIN_PASSWORD` | Obrigatória, senha privada com no mínimo 12 caracteres.                              |
| `BLOG_ADMIN_USERNAME` | Nome da única conta; padrão `admin`.                                                 |
| `BLOG_DATA_DIR`       | Diretório persistente para banco e fotos; padrão `./data`, relativo ao backend.      |
| `BLOG_SECURE_COOKIES` | Defina `true` na hospedagem HTTPS. Padrão `false` apenas para desenvolvimento local. |
| `SERVER_PORT`         | Porta do backend; padrão 8080.                                                       |

Para colocar o blog no ar, ainda é necessário escolher uma hospedagem Java com HTTPS e disco persistente. Configure senha privada, `BLOG_SECURE_COOKIES=true`, `BLOG_DATA_DIR` absoluto e backups. O banco H2 em arquivo atende à primeira versão com uma instância; não compartilhe o arquivo entre várias instâncias. Banco e fotos não são enviados ao GitHub. Faça backup do diretório de dados com a aplicação parada.

Nesta versão não há edição posterior, recuperação de senha por e-mail, editor de texto rico ou armazenamento externo de fotos. A senha é redefinida alterando a variável privada e reiniciando o backend. Fotos removidas do editor ou de uma postagem excluída não são apagadas automaticamente do disco.
