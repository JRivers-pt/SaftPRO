# Como Configurar um Domínio Personalizado (ContaFranca)

Sim, é possível remover o "vercel.app" do link oficial. Tens duas opções:

## Opção 1: Domínio Profissional (Recomendado)
Para teres um link como `www.contafranca.pt` ou `app.contafranca.com`.

1. **Comprar o Domínio**: Adquire o domínio em sites como Namecheap, GoDaddy, ou PTisp (para .pt).
2. **No Vercel**:
   - Vai ao Dashboard do teu projeto.
   - Clica em **Settings** (Definições) > **Domains** (Domínios).
   - Introduz o teu domínio (ex: `contafranca.pt`) e clica em **Add**.
3. **Configurar DNS**:
   - O Vercel vai dar-te uns valores (normalmente um "A Record" e um "CNAME").
   - Copia esses valores para a zona de DNS onde compraste o domínio.
   - Aguarda uns minutos (ou até 24h) e ficará ativo com HTTPS automático.

## Opção 2: Renomear o Subdomínio (Grátis)
Se não quiseres comprar um domínio agora, podes melhorar o link gratuito.

1. Vai a **Settings** > **Domains**.
2. Clica em **Edit** no domínio atual (`...vercel.app`).
3. Altera para algo mais profissional, ex: `contafranca-app.vercel.app`.
   - *Nota: Tem de estar disponível.*

---
**Nota para Apresentação**: Se a apresentação for hoje e não tiveres tempo para configurar DNS, a Opção 2 é imediata!
