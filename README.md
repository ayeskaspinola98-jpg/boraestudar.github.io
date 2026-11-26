# Bora Estudar

App web para estudar para concursos públicos em blocos curtos. Tem timer de foco, missões do dia,
importação de edital, gráficos de avanço por matéria, mapas mentais e troféus. Funciona no computador
e no celular, e pode ser instalado como aplicativo (PWA).

Não precisa de servidor nem de instalação de pacotes: é HTML, CSS e JavaScript puros.

## Rodar no seu computador

Dê dois cliques em `index.html`. Se preferir um servidor local (necessário para testar a instalação como app):

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar no GitHub Pages (grátis)

1. Crie uma conta em github.com e clique em **New repository**. Dê o nome `bora-estudar` e deixe **Public**.
2. Clique em **uploading an existing file** e arraste **o conteúdo** desta pasta (inclusive a pasta `icons`
   e o arquivo `.nojekyll`). Confirme com **Commit changes**.
3. Vá em **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**,
   branch `main` e pasta `/ (root)`. Salve.
4. Em um ou dois minutos o app abre em `https://SEU-USUARIO.github.io/bora-estudar/`.

Para atualizar, envie os arquivos novos para o repositório. Aumente o número da versão em `sw.js`
(`bora-estudar-v1` para `v2`, e assim por diante) para os aparelhos baixarem a atualização.

## Instalar como aplicativo

- **Android (Chrome):** menu ⋮ → **Instalar app**.
- **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**.
- **Windows e Mac (Chrome ou Edge):** ícone de instalar na barra de endereço.

## Onde ficam os dados

Tudo fica no próprio navegador (`localStorage`), neste aparelho. Não há conta nem sincronização:
trocar de aparelho ou limpar os dados do navegador começa do zero. Sincronizar entre aparelhos e cobrar
por recursos exigem um servidor (login, banco de dados e pagamento), que não faz parte deste projeto.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro (HTML, CSS e JS) |
| `manifest.webmanifest` | Nome, cores e ícones da instalação como app |
| `sw.js` | Faz o app abrir sem internet |
| `icons/` | Ícones do app |
| `.nojekyll` | Diz ao GitHub Pages para servir os arquivos como estão |

## Licença

Defina antes de divulgar. Sem um arquivo `LICENSE`, ninguém além de você tem permissão para copiar ou
reutilizar o código, mesmo que o repositório seja público. Se pretende vender recursos, prefira manter
as partes pagas em um servidor próprio e não neste repositório.
