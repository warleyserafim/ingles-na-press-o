const Alexa = require('ask-sdk-core');
const {
  createDefaultState,
  startRound,
  getCurrentQuestion,
  advanceQuestion,
  buildQuestionPrompt,
  MODES,
} = require('../utils/gameEngine');
const { isAnswerCorrect } = require('../utils/matcher');
const { normalizeText } = require('../utils/text');

function getGameState(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  if (!sessionAttributes.gameState) {
    sessionAttributes.gameState = createDefaultState();
  }

  return sessionAttributes.gameState;
}

function saveGameState(handlerInput, state) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.gameState = state;
}

function parseMode(rawValue) {
  const value = normalizeText(rawValue);

  if (!value) {
    return null;
  }

  if (value.includes('trad')) {
    return MODES.TRANSLATION;
  }

  if (value.includes('situ') || value.includes('cenario') || value.includes('real')) {
    return MODES.SITUATION;
  }

  if (value.includes('desafio') || value.includes('5') || value.includes('cinco')) {
    return MODES.CHALLENGE;
  }

  return null;
}

function modeLabel(mode) {
  if (mode === MODES.TRANSLATION) {
    return 'Tradução';
  }

  if (mode === MODES.SITUATION) {
    return 'Situacao real';
  }

  return 'Desafio';
}

function askModeResponse(handlerInput, speechPrefix) {
  const speech = speechPrefix
    || 'Bora escolher um modo: traducao, situacao real ou desafio de cinco perguntas.';

  return handlerInput.responseBuilder
    .speak(`<speak>${speech}</speak>`)
    .reprompt('Diga o modo: traducao, situacao real, ou desafio de cinco perguntas.')
    .getResponse();
}

function getCurrentOrSyncQuestion(state) {
  if (state.currentQuestion) {
    return state.currentQuestion;
  }

  return getCurrentQuestion(state);
}

function askCurrentQuestion(handlerInput, state, opener) {
  const question = getCurrentOrSyncQuestion(state);

  if (!question) {
    state.awaitingModeChoice = true;
    state.roundActive = false;
    state.awaitingAnswer = false;
    saveGameState(handlerInput, state);

    return askModeResponse(handlerInput, 'Acabaram as perguntas deste bloco. Quer trocar de modo?');
  }

  const prompt = buildQuestionPrompt(question, state);
  state.currentQuestion = question;
  state.awaitingAnswer = true;
  state.lastQuestionPrompt = prompt;
  saveGameState(handlerInput, state);

  const intro = opener ? `${opener} ` : '';
  const speech = `<speak>${intro}${prompt}</speak>`;

  return handlerInput.responseBuilder
    .speak(speech)
    .reprompt('Estou te ouvindo. Pode responder em ingles, ou diga repetir.')
    .getResponse();
}

function buildRoundStartSpeech(mode) {
  if (mode === MODES.TRANSLATION) {
    return 'Modo traducao ativado. Responda em ingles.';
  }

  if (mode === MODES.SITUATION) {
    return 'Modo situacao real ativado. Pense rapido e responda em ingles.';
  }

  return 'Desafio ativado. Sao cinco perguntas valendo ponto.';
}

function startModeRound(handlerInput, mode) {
  const state = startRound(mode);
  state.currentQuestion = getCurrentQuestion(state);
  saveGameState(handlerInput, state);

  return askCurrentQuestion(handlerInput, state, buildRoundStartSpeech(mode));
}

function endCurrentRound(handlerInput, state, outro) {
  const finalState = {
    ...state,
    roundActive: false,
    awaitingModeChoice: true,
    awaitingAnswer: false,
    currentQuestion: null,
  };

  saveGameState(handlerInput, finalState);

  return handlerInput.responseBuilder
    .speak(`<speak>${outro} Quer escolher outro modo?</speak>`)
    .reprompt('Diga traducao, situacao real, ou desafio.')
    .getResponse();
}

const StartQuizIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartQuizIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const modeValue = slots.modeType && slots.modeType.value;
    const parsedMode = parseMode(modeValue);

    if (!parsedMode) {
      const state = getGameState(handlerInput);
      state.awaitingModeChoice = true;
      saveGameState(handlerInput, state);
      return askModeResponse(handlerInput, 'Show! Qual modo voce quer: traducao, situacao real ou desafio?');
    }

    return startModeRound(handlerInput, parsedMode);
  },
};

const ChooseModeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChooseModeIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const modeValue = slots.modeType && slots.modeType.value;
    const parsedMode = parseMode(modeValue);

    if (!parsedMode) {
      return askModeResponse(handlerInput, 'Nao peguei o modo. Diga traducao, situacao real ou desafio.');
    }

    return startModeRound(handlerInput, parsedMode);
  },
};

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (!state.roundActive) {
      state.awaitingModeChoice = true;
      saveGameState(handlerInput, state);
      return askModeResponse(handlerInput, 'Primeiro vamos escolher um modo para comecar.');
    }

    if (!state.awaitingAnswer) {
      return handlerInput.responseBuilder
        .speak('<speak>Estou entre perguntas. Diga proxima para seguir ou repetir para ouvir de novo.</speak>')
        .reprompt('Diga proxima para continuar.')
        .getResponse();
    }

    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const userAnswer = slots.userAnswer && slots.userAnswer.value;

    if (!userAnswer) {
      return handlerInput.responseBuilder
        .speak('<speak>Nao ouvi sua resposta. Tente em ingles, bem curto.</speak>')
        .reprompt('Pode responder agora.')
        .getResponse();
    }

    const currentQuestion = getCurrentOrSyncQuestion(state);

    if (!currentQuestion) {
      state.awaitingModeChoice = true;
      state.roundActive = false;
      saveGameState(handlerInput, state);
      return askModeResponse(handlerInput, 'Perdi o contexto da rodada. Vamos reiniciar no modo que voce quiser.');
    }

    const correct = isAnswerCorrect(currentQuestion, userAnswer);
    state.answeredCount += 1;

    let feedback;
    if (correct) {
      state.score += 1;
      feedback = currentQuestion.successFeedback || 'Boa!';
    } else {
      feedback = `${currentQuestion.errorFeedback} A resposta esperada era ${currentQuestion.expectedAnswer}.`;
    }

    const advancedState = advanceQuestion(state);
    const nextQuestion = getCurrentOrSyncQuestion(advancedState);

    if (!nextQuestion) {
      const summary = `Fim da rodada ${modeLabel(advancedState.currentMode)}! Voce fez ${advancedState.score} ponto${advancedState.score === 1 ? '' : 's'} em ${advancedState.answeredCount} resposta${advancedState.answeredCount === 1 ? '' : 's'}. ${feedback}`;
      return endCurrentRound(handlerInput, advancedState, summary);
    }

    const prompt = buildQuestionPrompt(nextQuestion, advancedState);
    advancedState.currentQuestion = nextQuestion;
    advancedState.awaitingAnswer = true;
    advancedState.lastQuestionPrompt = prompt;
    saveGameState(handlerInput, advancedState);

    const speech = `<speak>${feedback} Bora pra proxima! ${prompt}</speak>`;

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('Pode responder em ingles, ou diga repetir.')
      .getResponse();
  },
};

const RepeatQuestionIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatQuestionIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (!state.roundActive || !state.lastQuestionPrompt) {
      return askModeResponse(handlerInput, 'Ainda nao ha pergunta para repetir. Escolha um modo para comecar.');
    }

    return handlerInput.responseBuilder
      .speak(`<speak>${state.lastQuestionPrompt}</speak>`)
      .reprompt('Pode responder em ingles.')
      .getResponse();
  },
};

const NextQuestionIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NextQuestionIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (!state.roundActive) {
      return askModeResponse(handlerInput, 'Para pular pergunta, precisamos iniciar um modo antes.');
    }

    const advancedState = advanceQuestion(state);
    const nextQuestion = getCurrentOrSyncQuestion(advancedState);

    if (!nextQuestion) {
      const summary = `Fechamos essa rodada! Sua pontuacao final foi ${advancedState.score} em ${advancedState.answeredCount} respostas.`;
      return endCurrentRound(handlerInput, advancedState, summary);
    }

    advancedState.currentQuestion = nextQuestion;
    advancedState.awaitingAnswer = true;
    advancedState.lastQuestionPrompt = buildQuestionPrompt(nextQuestion, advancedState);
    saveGameState(handlerInput, advancedState);

    return handlerInput.responseBuilder
      .speak(`<speak>Pergunta pulada. ${advancedState.lastQuestionPrompt}</speak>`)
      .reprompt('Pode responder em ingles.')
      .getResponse();
  },
};

const ScoreIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ScoreIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (!state.roundActive) {
      return handlerInput.responseBuilder
        .speak('<speak>Voce ainda nao iniciou uma rodada. Diga comecar quiz para treinar agora.</speak>')
        .reprompt('Diga comecar quiz.')
        .getResponse();
    }

    const speech = `Sua pontuacao atual e ${state.score} em ${state.answeredCount} respostas no modo ${modeLabel(state.currentMode)}.`;

    return handlerInput.responseBuilder
      .speak(`<speak>${speech}</speak>`)
      .reprompt('Se quiser, diga proxima ou responda a pergunta atual.')
      .getResponse();
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (state.awaitingModeChoice || !state.roundActive) {
      return askModeResponse(handlerInput, 'Perfeito! Qual modo voce escolhe?');
    }

    if (state.roundActive && state.lastQuestionPrompt) {
      return handlerInput.responseBuilder
        .speak(`<speak>Vamos nessa! ${state.lastQuestionPrompt}</speak>`)
        .reprompt('Pode responder em ingles.')
        .getResponse();
    }

    return askModeResponse(handlerInput, 'Bora! Diga o modo que voce quer jogar.');
  },
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const state = getGameState(handlerInput);

    if (state.roundActive) {
      const speech = `Rodada encerrada. Seu placar ficou em ${state.score} ponto${state.score === 1 ? '' : 's'} em ${state.answeredCount} resposta${state.answeredCount === 1 ? '' : 's'}.`;
      return endCurrentRound(handlerInput, state, speech);
    }

    return handlerInput.responseBuilder
      .speak('<speak>Tranquilo! Quando quiser voltar para o treino, e so chamar Ingles na Pressao.</speak>')
      .getResponse();
  },
};

module.exports = {
  StartQuizIntentHandler,
  ChooseModeIntentHandler,
  AnswerIntentHandler,
  RepeatQuestionIntentHandler,
  NextQuestionIntentHandler,
  ScoreIntentHandler,
  YesIntentHandler,
  NoIntentHandler,
};
