# Website Oficial — ART OLIVEIRA

Projeto completo em **React + Vite + Tailwind CSS**, preparado para publicação gratuita na **Vercel** ou **Netlify**, com Painel Administrativo privado integrado e suporte para base de dados na nuvem (**Firebase Firestore**).

---

## Como publicar online em 3 passos simples

### Passo 1: Ligar a Base de Dados na Nuvem (Firebase — Gratuito)
Para que as fotografias e obras que publicares no painel administrativo fiquem visíveis para qualquer visitante no mundo:
1. Acede a https://console.firebase.google.com/ e cria um projeto gratuito (ex.: `art-oliveira-site`).
2. No menu lateral esquerdo, entra em **Build > Firestore Database**, clica em **Criar base de dados** e escolhe o modo de teste/produção.
3. Vai às **Definições do Projeto** (ícone de engrenagem), regista uma aplicação Web (`</>`) e copia o bloco `firebaseConfig`.
4. Abre o ficheiro `src/firebaseConfig.js` desta pasta e cola os teus dados (`apiKey`, `authDomain`, `projectId`, etc.).

### Passo 2: Publicar na Vercel ou Netlify (Gratuito)
1. Cria uma conta gratuita em https://vercel.com ou https://www.netlify.com.
2. Envia esta pasta para um repositório no GitHub (ou importa diretamente no painel da Vercel/Netlify).
3. A plataforma deteta automaticamente o Vite e gera o link público (ex.: `artoliveira.vercel.app`) pronto para colocares na bio do Instagram `@artoliveira_oficial`.

### Passo 3: Entrar no teu Painel Administrativo
1. Abre o teu site publicado, desce até ao rodapé e clica em **Área Reservada**.
2. Dados de acesso iniciais:
   - **Email:** `admin@artoliveira.cv`
   - **Palavra-passe:** `artoliveira2026`
3. Dentro do painel, vai ao separador **Segurança & Backup** para alterar a tua palavra-passe pessoal.
