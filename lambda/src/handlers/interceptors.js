const RequestLogger = {
  process(handlerInput) {
    console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const ResponseLogger = {
  process(handlerInput, response) {
    console.log(`Outgoing response: ${JSON.stringify(response)}`);
  },
};

module.exports = {
  RequestLogger,
  ResponseLogger,
};
