const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Erro capturado: ${error.stack || error.message}`);

    return handlerInput.responseBuilder
      .speak('<speak>Deu um deslize tecnico aqui. Vamos de novo: diga comecar quiz.</speak>')
      .reprompt('Diga comecar quiz para continuar.')
      .getResponse();
  },
};

module.exports = {
  ErrorHandler,
};
