# Plano de Entrega de Serviço - ContaFranca SAFT Analyser

Este documento serve como guia para entregar este software como um **Serviço (SaaS)** ao seu cliente **ContaFranca**.

## 1. O Que Você Está Vendendo?
Você não está vendendo apenas "código". Está vendendo:
1.  **Segurança e Privacidade**: A garantia de que os dados financeiros dos clientes deles NUNCA saem do computador (Processamento Local).
2.  **Branding Premium**: Uma ferramenta que faz a ContaFranca parecer tecnologicamente avançada ("Dark Tech").
3.  **Manutenção Contínua**: A promessa de que a ferramenta estará sempre online e atualizada com as regras da AT.

## 2. Checklist de Lançamento
- [x] **Branding**: Logo e cores atualizados para ContaFranca.
- [x] **Funcionalidade**: Validação de SAFT, Gráficos e "Top Produtos" funcional.
- [x] **Build**: O código compila sem erros (`npm run build` passou).
- [ ] **Deploy**: Colocar online (Ver secção 3).

## 3. Como Colocar Online (O Serviço)
Para cobrar uma mensalidade ou fee de manutenção, você deve controlar o alojamento.

### Opção A: Vercel (Recomendado)
1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Conecte este repositório GitHub.
3.  Configure o domínio: `analise.contafranca.pt` (Peça ao cliente para criar um registo CNAME apontando para a Vercel).
4.  **Custo para si**: $0/mês (Tier Hobby) ou $20/mês (Pro, se precisar de equipa).
5.  **Preço para o cliente**: Cobrança única de setup + Mensalidade de manutenção/hosting.

## 4. Email de Entrega (Template)

**Assunto:** Lançamento: Portal de Análise SAFT - ContaFranca

Caro [Nome do Cliente],

Tenho o prazer de informar que a nova ferramenta de análise SAFT da **ContaFranca** está pronta para lançamento.

**O que está incluído:**
*   **Portal "White Label"**: Personalizado com a vossa marca e cores institucionais.
*   **Privacidade Total**: Implementámos uma arquitetura "Zero-Knowledge". Os ficheiros SAFT dos vossos clientes são processados 100% no browser e nunca são enviados para os nossos servidores.
*   **Painel de Gestão**: Visualização imediata de Vendas, Top Produtos e Alertas de Risco.

**Acesso:**
Aceda aqui: [Link do Projeto Vercel]

Fico a aguardar o vosso feedback para avançarmos com a configuração do domínio final (`analise.contafranca.pt`).

Cumprimentos,
[Seu Nome]
