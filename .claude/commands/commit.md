# Commit

Gera uma mensagem de commit com base nas mudanças staged e no histórico do projeto, depois realiza o commit.

## Passos

1. Execute em paralelo:
   - `git diff --staged` — veja o conteúdo exato das mudanças
   - `git status --short` — veja os arquivos staged e não staged
   - `git log --oneline -5` — identifique o estilo de mensagem do projeto

2. Analise as mudanças e elabore uma mensagem de commit:
   - Siga o estilo e idioma dos commits recentes do projeto
   - A primeira linha deve ser curta e descritiva (até ~72 caracteres)
   - Use o corpo para detalhar o "porquê" quando necessário
   - Não inclua arquivos não staged no commit
   - Não coloque a mensagem de que foi criado por IA

3. Se não houver nada staged, informe o usuário e pare.

4. Apresente a mensagem proposta ao usuário e peça confirmação antes de commitar.

5. Após confirmação, realize o commit com a mensagem aprovada.
