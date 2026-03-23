const { normalizeText } = require('./text');

function isAnswerCorrect(question, userAnswer) {
  if (!question || !userAnswer) {
    return false;
  }

  const normalizedUserAnswer = normalizeText(userAnswer);
  const accepted = [question.expectedAnswer, ...(question.acceptedAnswers || [])]
    .map((item) => normalizeText(item))
    .filter(Boolean);

  if (accepted.includes(normalizedUserAnswer)) {
    return true;
  }

  // MVP: matching exato sobre uma lista de respostas aceitas.
  // Evolucao sugerida: adicionar fuzzy matching (distancia de Levenshtein),
  // NLP com intents semanticas ou validacao via LLM com guardrails.
  return false;
}

module.exports = {
  isAnswerCorrect,
};
