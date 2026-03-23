const Alexa = require('ask-sdk-core');
const { createDefaultState } = require('../utils/gameEngine');

function buildWelcomeSpeech() {
  return '<speak>Bem-vindo ao Ingles na Pressao! Treino rapido, energia alta e ingles na ponta da lingua. Escolha um modo: traducao, situacao real ou desafio de cinco perguntas.</speak>';
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.gameState = createDefaultState();

    return handlerInput.responseBuilder
      .speak(buildWelcomeSpeech())
      .reprompt('Diga: traducao, situacao real, ou desafio de cinco perguntas.')
      .getResponse();
  },
};

module.exports = {
  LaunchRequestHandler,
};
