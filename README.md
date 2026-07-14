# Agente Financeiro — App

Este repositório contém só o app (React). Ele é feito pra ser importado direto no Vercel ou Netlify, sem precisar configurar "Root Directory" — o projeto já está na raiz.

## Deploy (Vercel)

1. Suba estes arquivos pra um repositório novo no GitHub (ex: `agente-financeiro-app`)
2. No Vercel, **Add New → Project** → selecione esse repositório
3. Ele detecta Vite automaticamente — não precisa mexer em nada, só clicar em **Deploy**
4. Depois do deploy, vá em Settings → Environment Variables e adicione:
   - `VITE_BACKEND_URL` = a URL do backend (veja o repositório `agente-financeiro-backend`)
5. Redeploy pra aplicar a variável

## Rodando localmente

```bash
npm install
npm run dev
```
