const { QUESTIONS_BY_MODE, MODES } = require('../data/questions');

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function createDefaultState() {
  return {
    currentMode: null,
    questionQueue: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    score: 0,
    answeredCount: 0,
    totalQuestions: 0,
    lastQuestionPrompt: null,
    awaitingModeChoice: true,
    awaitingAnswer: false,
    roundActive: false,
  };
}

function startRound(mode) {
  const bank = QUESTIONS_BY_MODE[mode] || [];
  const queue = shuffle(bank);

  if (mode === MODES.CHALLENGE) {
    return {
      ...createDefaultState(),
      currentMode: mode,
      questionQueue: queue.slice(0, 5),
      totalQuestions: 5,
      awaitingModeChoice: false,
      awaitingAnswer: true,
      roundActive: true,
    };
  }

  return {
    ...createDefaultState(),
    currentMode: mode,
    questionQueue: queue,
    totalQuestions: queue.length,
    awaitingModeChoice: false,
    awaitingAnswer: true,
    roundActive: true,
  };
}

function getCurrentQuestion(state) {
  if (!state || !state.questionQueue) {
    return null;
  }

  return state.questionQueue[state.currentQuestionIndex] || null;
}

function advanceQuestion(state) {
  if (!state) {
    return state;
  }

  const nextIndex = state.currentQuestionIndex + 1;

  if (state.currentMode === MODES.CHALLENGE) {
    return {
      ...state,
      currentQuestionIndex: nextIndex,
      currentQuestion: state.questionQueue[nextIndex] || null,
      awaitingAnswer: Boolean(state.questionQueue[nextIndex]),
    };
  }

  if (nextIndex < state.questionQueue.length) {
    return {
      ...state,
      currentQuestionIndex: nextIndex,
      currentQuestion: state.questionQueue[nextIndex],
      awaitingAnswer: true,
    };
  }

  // Modo livre: recicla perguntas para manter o treino continuo.
  const reshuffled = shuffle(QUESTIONS_BY_MODE[state.currentMode] || []);
  return {
    ...state,
    currentQuestionIndex: 0,
    questionQueue: reshuffled,
    currentQuestion: reshuffled[0] || null,
    awaitingAnswer: Boolean(reshuffled[0]),
  };
}

function buildQuestionPrompt(question, state) {
  if (!question) {
    return 'Nao achei uma pergunta agora. Quer tentar outro modo?';
  }

  if (state.currentMode === MODES.CHALLENGE) {
    const current = state.currentQuestionIndex + 1;
    return `Desafio ${current} de ${state.totalQuestions}. ${question.promptPt}`;
  }

  return question.promptPt;
}

module.exports = {
  createDefaultState,
  startRound,
  getCurrentQuestion,
  advanceQuestion,
  buildQuestionPrompt,
  MODES,
};
