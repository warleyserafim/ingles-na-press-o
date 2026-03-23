const Alexa = require('ask-sdk-core');

const { LaunchRequestHandler } = require('./src/handlers/launchHandlers');
const {
  StartQuizIntentHandler,
  ChooseModeIntentHandler,
  AnswerIntentHandler,
  RepeatQuestionIntentHandler,
  NextQuestionIntentHandler,
  ScoreIntentHandler,
  YesIntentHandler,
  NoIntentHandler,
} = require('./src/handlers/gameHandlers');
const {
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  IntentReflectorHandler,
} = require('./src/handlers/commonHandlers');
const { ErrorHandler } = require('./src/handlers/errorHandler');
const { RequestLogger, ResponseLogger } = require('./src/handlers/interceptors');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    StartQuizIntentHandler,
    ChooseModeIntentHandler,
    AnswerIntentHandler,
    RepeatQuestionIntentHandler,
    NextQuestionIntentHandler,
    ScoreIntentHandler,
    HelpIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
  )
  .addRequestInterceptors(RequestLogger)
  .addResponseInterceptors(ResponseLogger)
  .addErrorHandlers(ErrorHandler)
  .lambda();
