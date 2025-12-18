# Guia de Publicação e Escala

## 1. Publicar na Vercel (Agora)
Como eu (o Agente) não tenho acesso às suas senhas, você fará a conexão final. É muito simples:

### Passo 1: Guardar o Código (Git)
Abra o seu terminal (ou VS Code) e corra estes comandos para salvar a versão "ContaFranca":
```bash
git init
git add .
git commit -m "Versão Final ContaFranca"
```

### Passo 2: Enviar para o GitHub
1. Crie um repositório no GitHub chamado `contafranca-analyser`.
2. Conecte e envie:
```bash
git remote add origin https://github.com/SEU_USER/contafranca-analyser.git
git push -u origin master
```

### Passo 3: Ligar à Vercel
1. Vá a [vercel.com](https://vercel.com) e clique em "Add New Project".
2. Importe o `contafranca-analyser`.
3. Clique em **Deploy**.
4. Em 2 minutos terá um link como: `contafranca-analyser.vercel.app`.

---

## 2. As suas Dúvidas

### P: Posso mudar o link depois?
**R:** **Sim!**
A Vercel dá-lhe um link automático, mas você pode ir a **Settings > Domains** e adicionar qualquer link que quiser (ex: `analise.SuaEmpresa.com` ou `cliente-x.pt`). É imediato.

### P: Posso editar para outro cliente? (Escalar o Negócio)
**R:** **Sim, e é aqui que você ganha dinheiro.**
Esse modelo chama-se "Multi-Tenant" ou "White Label".
Para um novo cliente (ex: "ConsultoriaSilva"), faça o seguinte:

1.  **Duplique a Pasta** (ou crie um novo Branch no Git `git checkout -b consultoria-silva`).
2.  **Troque o Logo**: Substitua o ficheiro `public/logo.jpg`.
3.  **Troque as Cores**: Vá a `globals.css` e mude o `--primary` (ex: para Verde).
4.  **Troque o Nome**: Em `Sidebar.js`.
5.  **Faça Deploy**: Publique como um novo projeto na Vercel (`analise-silva.vercel.app`).

Você pode vender este mesmo software 10 vezes para 10 clientes diferentes, apenas trocando a "pintura" (Branding).
