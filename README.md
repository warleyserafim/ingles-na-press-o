# Ingles na Pressao (MVP)

Skill Alexa Custom em pt-BR para microtreinos de ingles por voz, com foco em sessoes curtas, ritmo rapido e feedback motivador.

## Visao geral

- Nome: Ingles na Pressao
- Invocation name: `ingles de bolso`
- Stack: Alexa Skills Kit SDK v2 (Node.js)
- Estilo: quiz interativo, sem login e sem banco externo
- Estado: session attributes (memoria de sessao da Alexa)

## Funcionalidades do MVP

- Fluxo curto e gamificado
- 3 modos:
  - Traducao (pt -> en)
  - Situacao real (cenarios práticos)
  - Desafio de 5 perguntas
- Correcao simples por lista de respostas aceitas
- Normalizacao basica de texto (caixa, pontuacao, acentos)
- Pontuacao por rodada
- Comandos de repeticao, proxima pergunta e placar
- Handlers de ajuda, cancelamento, fallback e erro global

## Estrutura de pastas

```text
.
|-- README.md
|-- .gitignore
|-- lambda
|   |-- index.js
|   |-- package.json
|   `-- src
|       |-- data
|       |   `-- questions.js
|       |-- handlers
|       |   |-- commonHandlers.js
|       |   |-- errorHandler.js
|       |   |-- gameHandlers.js
|       |   |-- interceptors.js
|       |   `-- launchHandlers.js
|       `-- utils
|           |-- gameEngine.js
|           |-- matcher.js
|           `-- text.js
`-- skill-package
    `-- interactionModels
        `-- custom
            `-- pt-BR.json
```

## Intents implementados

- `LaunchRequest`
- `StartQuizIntent`
- `ChooseModeIntent`
- `AnswerIntent`
- `RepeatQuestionIntent`
- `NextQuestionIntent`
- `ScoreIntent`
- `HelpIntent`
- `AMAZON.YesIntent`
- `AMAZON.NoIntent`
- `AMAZON.CancelIntent`
- `AMAZON.StopIntent`
- `AMAZON.FallbackIntent`
- `SessionEndedRequest`

## Regras de sessao e estado

Estado controlado via `sessionAttributes.gameState`:

- `currentMode`
- `currentQuestionIndex`
- `currentQuestion`
- `score`
- `answeredCount`
- `totalQuestions`
- `lastQuestionPrompt`
- `awaitingModeChoice`
- `awaitingAnswer`
- `roundActive`

Comportamento:

- Inicio de rodada reseta score e progresso
- Desafio encerra ao fim de 5 perguntas
- Traducao e situacao real continuam em modo livre (reciclam perguntas)
- `repetir` repete exatamente a ultima pergunta
- `pontuacao` retorna placar atual
- `proxima` pula para a proxima pergunta
- Entrada invalida orienta rapidamente e preserva contexto

## Validacao de respostas

Camada atual:

- Normaliza texto para comparacao
- Ignora caixa alta/baixa
- Remove acentos e pontuacao
- Usa matching exato contra:
  - resposta principal esperada
  - lista de respostas aceitas

Evolucao recomendada (futuro):

- fuzzy matching (Levenshtein + threshold)
- intents semanticas por dominio
- validacao contextual com LLM + guardrails

## Conteudo inicial

- Traducao: 20 perguntas
- Situacao real: 15 perguntas
- Desafio: 10 perguntas (sorteia 5 por rodada)

Cada item possui:

- `id`
- `mode`
- `promptPt`
- `expectedAnswer`
- `acceptedAnswers`
- `hint`
- `successFeedback`
- `errorFeedback`

Arquivo: `lambda/src/data/questions.js`

## Como rodar como Alexa-hosted (Developer Console)

### Opcao A: criar skill Alexa-hosted e copiar o projeto

1. Acesse o [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Clique em **Create Skill**.
3. Nome: `Ingles na Pressao`.
4. Modelo: **Custom**.
5. Hosting method: **Alexa-hosted (Node.js)**.
6. Crie a skill.
7. Em **Code**, substitua o conteudo da pasta `lambda/` pelo conteudo deste projeto.
8. Em **Build > Interaction Model > JSON Editor**, cole o arquivo `skill-package/interactionModels/custom/pt-BR.json`.
9. Clique em **Save Model** e depois **Build Model**.
10. Em **Code**, execute o deploy (botao **Deploy**).

### Opcao B: importar de repositório publico

1. Suba este projeto em um repo publico.
2. No Developer Console, use a opcao de importacao de skill por repositório.
3. Apos importar, revise o interaction model e faça **Build Model**.
4. Execute deploy da lambda Alexa-hosted.

## Teste no Alexa Simulator

1. Abra a skill no Developer Console.
2. Vá para **Test** e habilite o teste para `Development`.
3. Use texto ou voz no **Alexa Simulator**.
4. Verifique se o fluxo segue: abertura -> escolha de modo -> pergunta -> resposta -> feedback -> proxima.

### 15 frases de teste sugeridas

1. `abrir ingles de bolso`
2. `comecar quiz`
3. `modo traducao`
4. `i am hungry`
5. `repetir`
6. `proxima`
7. `qual meu score`
8. `mudar para situacao real`
9. `water please`
10. `modo desafio`
11. `i am ready`
12. `a resposta e i need internet`
13. `pontuacao`
14. `ajuda`
15. `parar`

## Publicacao (resumo)

1. Complete metadados em **Distribution** (descricao, icones, categoria, privacidade).
2. Execute testes de certificacao internos no Developer Console.
3. Corrija avisos de voice model e politicas.
4. Submeta para certificacao.
5. Acompanhe feedback da Amazon e reenvie se necessario.

## Sugestoes de evolucao

- trilha de ingles para dev
- trilha de ingles para entrevista
- streak diario e notificacoes
- ranking semanal entre amigos
- feedback semantico mais inteligente
- personalizacao automatica por nivel
- persistencia com DynamoDB/S3
- painel de telemetria de retencao

## Observacoes de engenharia

- Projeto intencionalmente simples para MVP.
- Nao usa servicos pagos externos.
- Estrutura modular para crescimento sem refatoracao pesada.
