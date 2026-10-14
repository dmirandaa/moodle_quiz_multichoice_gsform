# Formulários Google para XML do Moodle

Este Google Apps Script cria um formulário para cadastrar questões de múltipla escolha e exporta as respostas no formato XML do Moodle. Cada envio cria uma questão; após cada resposta, o arquivo XML no Google Drive é atualizado com todas as questões enviadas.

## Configuração

1. Crie um projeto independente em [script.google.com](https://script.google.com).
2. Substitua o código inicial pelo conteúdo de `Code.gs`.
3. Execute `createMoodleQuizForm` e autorize o acesso ao Forms, Sheets e Drive para criar o formulário inicial. Essa função sempre cria um formulário novo.
4. No registro de execução, abra o link de edição do formulário.
5. Use o formulário para cadastrar questões. O acionador instalado criará ou atualizará `moodle-quiz.xml` no Google Drive da conta que autorizou o script. A exportação lê diretamente a aba de respostas da planilha vinculada ao formulário. Execute `exportMoodleXml` manualmente para gerar o arquivo novamente quando necessário.
6. Baixe o XML no Drive e importe no Moodle em **Banco de questões > Importar > Formato Moodle XML**.

Para atualizar as perguntas do formulário existente, execute `updateMoodleQuizForm`. Ela atualiza ou adiciona campos pelo título, remove os campos antigos de nota e penalidade e preserva o destino de respostas vinculado. Não execute `createMoodleQuizForm` novamente a menos que queira criar outro formulário e outra planilha.

## Campos do formulário

- **Nome da questão**: opcional; o padrão é `Questão N`.
- **Texto da questão (HTML)**: aceita marcação HTML, como `<p>`, `<strong>`, `<em>`, `<ul>` e `<li>`. O Google Forms não oferece editor visual de texto rico para respostas; digite as marcações HTML diretamente.
- **Alternativas**: informe uma alternativa por linha. Linhas vazias são ignoradas.
- **Feedback de cada alternativa**: opcional; informe uma linha por alternativa, na mesma ordem. Deixe uma linha vazia para qualquer alternativa sem feedback. Se o campo inteiro ficar vazio, nenhuma alternativa terá feedback individual. Aceita HTML, como `<p>`, `<strong>` e `<em>`.
- **Números das alternativas corretas**: posições começando em 1 entre as linhas não vazias, separadas por vírgula. Exemplos: `1` ou `1,3`.
- **Tipo de resposta**: escolha resposta única ou múltiplas respostas. Resposta única exige exatamente uma alternativa correta.
- **Feedback geral**: opcional; exibido pelo Moodle após a resposta. Aceita HTML, como `<p>`, `<strong>`, `<em>`, `<ul>` e `<li>`.
- **Tags**: opcional; informe uma ou mais tags separadas por vírgula ou em linhas diferentes. As tags são exportadas para o Moodle como metadados da questão.
- **Embaralhar alternativas**: controla se o Moodle embaralha as alternativas.
Para questões com múltiplas respostas corretas, as frações positivas são divididas igualmente entre as corretas e as frações negativas entre as incorretas. Assim, selecionar todas as alternativas resulta em nota zero quando houver alternativas incorretas. Em questões de resposta única, a alternativa correta recebe 100% e as demais 0%.

O XML usa nota padrão `1` e fator de penalidade `0,3333333` para todas as questões. Esses valores não são solicitados no formulário.

Para que a exportação encontre as respostas, mantenha o formulário vinculado à planilha criada para ele e não altere os cabeçalhos das colunas correspondentes às perguntas.

## Observações

- O campo de texto aceita HTML digitado (por exemplo, `<strong>texto</strong>`), mas o Google Forms não oferece um editor visual de texto rico para respostas.
- O script valida as respostas antes de gravar o XML. Se alguma resposta for inválida, corrija-a e execute `exportMoodleXml` novamente.
- O XML fica no Google Drive da conta que autorizou o script. Quem puder editar o projeto do Apps Script poderá acessar o formulário, as respostas e o arquivo exportado.
- Executar `createMoodleQuizForm` novamente cria outro formulário, planilha e acionador; a configuração existente não é substituída.