# Bora Estudar (com contas e progresso salvo)

App de estudos para concursos. Cada pessoa cria a própria conta (e-mail e senha), usa direto no navegador, sem baixar nada,
e o progresso fica salvo no servidor, protegido, para continuar em qualquer aparelho.

- **Servidor:** Node.js 22+ com SQLite embutido. Só 3 dependências (`express`, `helmet`, `express-rate-limit`).
- **Site:** HTML, CSS e JavaScript puros em `public/`. O servidor entrega o site e a API juntos, no mesmo endereço.

## Rodar no seu computador

```bash
npm install
npm start
# abra http://localhost:3000
```

Em desenvolvimento os segredos são criados sozinhos em `data/dev-secrets.json`. Para rodar os testes: `npm test`.

## Colocar no ar (para qualquer pessoa usar pelo navegador)

O servidor precisa de **HTTPS** (todas as hospedagens abaixo dão isso de graça) e de um **disco que não é apagado** quando reinicia,
porque é lá que fica o banco (`DATA_DIR`). Hospedagem sem disco persistente perde as contas a cada reinício.

1. Gere os segredos: `npm run gen-secrets`. Guarde as duas linhas num gerenciador de senhas.
   **Se perder a `DATA_KEY`, os progressos salvos não podem mais ser lidos.**
2. Suba este projeto para um repositório **privado** no GitHub (o `.gitignore` já deixa de fora `.env`, `data/` e `node_modules/`).
3. Crie um serviço web a partir do repositório numa hospedagem que aceite Docker e disco persistente
   (por exemplo Render, Fly.io, Railway, ou um VPS). Os planos e preços mudam, confira na hora.
4. Cadastre as variáveis de `.env.example` no painel (`NODE_ENV`, `PEPPER`, `DATA_KEY`, `APP_ORIGIN`, `DATA_DIR`, `TRUST_PROXY`).
5. Monte o disco persistente no caminho de `DATA_DIR` (a imagem usa `/data`).
6. Aponte seu domínio. Depois disso o endereço público abre a tela de login e quem quiser cria a conta.

Num VPS com Docker: 

```bash
docker build -t bora-estudar .
docker run -d --name bora --restart unless-stopped -p 3000:3000 -v bora-data:/data --env-file .env bora-estudar
```
(coloque na frente um proxy com HTTPS, como Caddy ou nginx.)

**Atenção:** `APP_ORIGIN` precisa ser exatamente o endereço que as pessoas usam (com `https://`). É com ele que o servidor
recusa pedidos vindos de outros sites.

## Como a segurança funciona

| Ameaça | Proteção |
|---|---|
| Roubo do banco de dados | Senhas com **scrypt** (custo alto) + segredo do servidor (`PEPPER`). Progresso criptografado com **AES-256-GCM** (`DATA_KEY`). Nem a senha nem o progresso ficam legíveis no arquivo do banco. |
| Adivinhar senhas | Bloqueio progressivo por conta (5 erros → 1 min, depois dobra até 60 min), limite por IP, política de senha (mínimo 10 caracteres, lista de senhas comuns, não pode conter o e-mail). |
| Descobrir quais e-mails têm conta pelo login | Mesma mensagem e mesmo tempo de resposta para "senha errada" e "e-mail inexistente". |
| Roubo de sessão | Cookie `HttpOnly`, `Secure`, `SameSite=Strict` (`__Host-` em produção). Só o **hash** do token fica no banco. Sessão expira em 30 dias de inatividade (máximo 90). Trocar a senha encerra todas as outras sessões. |
| Pedidos forjados por outros sites (CSRF) | Conferência de origem + token secreto por sessão em todo pedido que altera dados. |
| Injeção de código (XSS) | Política de segurança (CSP) que proíbe scripts embutidos e de outros sites; todo texto de usuário é escapado na tela. |
| Injeção de SQL | Só consultas parametrizadas. |
| Dados em aparelho compartilhado | O progresso não é guardado no navegador (nada de `localStorage`). Sair encerra a sessão no servidor. |
| Privacidade (LGPD) | Coleta só e-mail e nome opcional. O usuário pode **baixar** os dados e **excluir** a conta (apaga tudo). Endereços de IP não são guardados, só um código irreversível nos registros de segurança, apagados em 90 dias. |

### Esqueci a senha
Não há envio de e-mail. Ao criar a conta, a pessoa recebe um **código de recuperação** (mostrado uma única vez). Com ele e o e-mail
ela define uma nova senha; o código é trocado por um novo e as sessões antigas caem.

## Limites conhecidos (leia antes de divulgar)

- **Sem confirmação de e-mail:** qualquer pessoa pode cadastrar qualquer e-mail, e ao tentar cadastrar um e-mail já existente a tela avisa que ele tem conta.
  Para fechar isso é preciso um serviço de envio de e-mails (próximo passo natural, e necessário também para a cobrança).
- **Bloqueio por conta:** quem sabe seu e-mail pode causar bloqueios temporários (até 60 min) no seu login digitando senhas erradas. É a troca clássica contra força bruta.
- **Um servidor só:** SQLite atende bem milhares de usuários, mas não roda em várias máquinas ao mesmo tempo. Se crescer muito, migre para PostgreSQL.
- **Conflito entre aparelhos:** se você mexer em dois aparelhos ao mesmo tempo, vale o que foi alterado por último.
- **Revisão de segurança:** fiz testes automatizados (`npm test`, 17 testes) e de navegador, mas isto não substitui uma auditoria independente antes de ter muitos usuários.
- **Política de privacidade e termos de uso:** são exigidos assim que o app for público (e pelas lojas de aplicativos). Precisam ser escritos para o seu caso.

## Backups
`npm run backup` (ou `docker exec bora node scripts/backup.js`) faz uma cópia consistente em `DATA_DIR/backups`, mantendo as 14 mais recentes.
Agende por dia e leve as cópias para fora do servidor. A cópia continua criptografada: guarde a `DATA_KEY` separada.

## Trocar a chave de criptografia
Gere uma nova `DATA_KEY`, coloque a antiga em `DATA_KEY_PREVIOUS` e reinicie: o app lê com as duas e regrava com a nova a cada salvamento.

## Estrutura
```
src/server.js      servidor, cabeçalhos de segurança, arquivos do site
src/routes.js      contas, sessões, progresso (API)
src/security.js    sessões, CSRF, bloqueio progressivo
src/crypto.js      senha (scrypt), tokens, criptografia dos dados
src/db.js          banco SQLite
src/passwords.js   regras de senha e e-mail
public/            o app (index.html, entrar.js = login, app.js = app)
test/              testes automatizados
```
