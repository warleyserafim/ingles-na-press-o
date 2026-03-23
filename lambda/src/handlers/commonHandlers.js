const Alexa = require('ask-sdk-core');

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const isIntent = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    if (!isIntent) {
      return false;
    }

    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    return intentName === 'HelpIntent' || intentName === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speech = 'Treino rapido de ingles em tres modos: traducao, situacao real e desafio de cinco perguntas. Durante a rodada, responda em ingles. Voce tambem pode dizer repetir, proxima ou pontuacao.';

    return handlerInput.responseBuilder
      .speak(`<speak>${speech}</speak>`)
      .reprompt('Diga: comecar quiz, ou escolha um modo agora.')
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') {
      return false;
    }

    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    return intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('<speak>Valeu pelo treino de hoje! Continue praticando e ate a proxima.</speak>')
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('<speak>Boa tentativa, mas nao peguei isso. Diga um modo, responda em ingles, ou fale ajuda.</speak>')
      .reprompt('Diga traducao, situacao real, desafio, ou ajuda.')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Sessao encerrada: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    return handlerInput.responseBuilder
      .speak(`<speak>Recebi o intent ${intentName}, mas ele nao tem handler especifico ainda.</speak>`)
      .getResponse();
  },
};

module.exports = {
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  IntentReflectorHandler,
};
