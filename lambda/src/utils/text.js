const { randomInt } = require('crypto');

function normalizeText(value) {
  if (!value) {
    return '';
  }

  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return items[randomInt(0, items.length)];
}

module.exports = {
  normalizeText,
  pickRandom,
};
