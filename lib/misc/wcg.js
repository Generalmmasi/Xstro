const axios = require('axios');

class WordChainGame {
 constructor() {
  this.games = new Map();
  this.difficulties = {
   easy: { turnTime: 60, minLength: 3 },
   medium: { turnTime: 45, minLength: 4 },
   hard: { turnTime: 30, minLength: 5 },
  };
 }

 async validateWord(word) {
  const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  return response.status === 200;
 }

 createGame(chatId, difficulty = 'medium') {
  const settings = this.difficulties[difficulty];
  const game = new Game(settings.turnTime, settings.minLength);
  this.games.set(chatId, game);
  return game;
 }

 getGame(chatId) {
  return this.games.get(chatId);
 }

 deleteGame(chatId) {
  this.games.delete(chatId);
 }
}

const wcg = new WordChainGame();

class Game {
 constructor(turnTime, minLength) {
  this.players = new Set();
  this.currentPlayer = null;
  this.lastWord = '';
  this.usedWords = new Set();
  this.turnTime = turnTime;
  this.minLength = minLength;
  this.score = new Map();
  this.status = 'waiting';
  this.currentTurnStartTime = null;
  this.failedAttempts = new Map();
 }

 addPlayer(playerId) {
  if (this.status === 'waiting') {
   this.players.add(playerId);
   this.score.set(playerId, 0);
   this.failedAttempts.set(playerId, 0);
   return true;
  }
  return false;
 }

 start() {
  if (this.players.size < 2) return false;
  this.status = 'active';
  this.currentPlayer = Array.from(this.players)[0];
  this.currentTurnStartTime = Date.now();
  return true;
 }

 end() {
  this.status = 'ended';
  let winner = [...this.score.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  return { winner, scores: Object.fromEntries(this.score) };
 }

 getTimeElapsedInCurrentTurn() {
  if (!this.currentTurnStartTime) return 0;
  return Math.floor((Date.now() - this.currentTurnStartTime) / 1000);
 }

 getTimeRemainingInCurrentTurn() {
  const elapsed = this.getTimeElapsedInCurrentTurn();
  return Math.max(0, this.turnTime - elapsed);
 }

 async validateTurn(playerId, word) {
  if (this.status !== 'active') return { valid: false, reason: '*_Game is not active_*' };
  if (playerId !== this.currentPlayer) return { valid: false, reason: '*_Not Your Turn_*' };

  const timeElapsed = this.getTimeElapsedInCurrentTurn();
  if (timeElapsed > this.turnTime) {
   this.failedAttempts.set(playerId, this.failedAttempts.get(playerId) + 1);
   if (this.failedAttempts.get(playerId) > 3) return { valid: false, reason: '*_You failed too many times. Game over._*', endGame: true };
   return { valid: false, reason: `*_Time's up! You took ${timeElapsed} seconds. Moving to next player._*`, skipTurn: true };
  }

  word = word.toLowerCase();

  if (word.length < this.minLength) return { valid: false, reason: `*_Word must be at least ${this.minLength} letter words_*` };
  if (this.usedWords.has(word)) return { valid: false, reason: '*_Word already used_*' };
  if (this.lastWord && word[0] !== this.lastWord[this.lastWord.length - 1]) return { valid: false, reason: `*_Word must start with '${this.lastWord[this.lastWord.length - 1]}'_*` };

  const isValidWord = await wcg.validateWord(word);
  if (!isValidWord) return { valid: false, reason: '*_Not a valid English word_*' };

  return { valid: true };
 }

 makeMove(playerId, word) {
  this.lastWord = word;
  this.usedWords.add(word);
  this.score.set(playerId, (this.score.get(playerId) || 0) + word.length);
  this.failedAttempts.set(playerId, 0);

  const players = Array.from(this.players);
  const currentIndex = players.indexOf(this.currentPlayer);
  this.currentPlayer = players[(currentIndex + 1) % players.length];
  this.currentTurnStartTime = Date.now();
 }

 skipCurrentTurn() {
  const players = Array.from(this.players);
  const currentIndex = players.indexOf(this.currentPlayer);
  this.currentPlayer = players[(currentIndex + 1) % players.length];
  this.currentTurnStartTime = Date.now();
 }

 getGameStatus() {
  return {
   currentPlayer: this.currentPlayer,
   scores: Object.fromEntries(this.score),
   totalWords: this.usedWords.size,
   lastWord: this.lastWord,
   timeRemaining: this.getTimeRemainingInCurrentTurn(),
  };
 }
}
module.exports = WordChainGame;
