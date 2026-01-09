/**
 * Player class - Represents a connected user in the game
 */
export class Player {
  constructor(socketId) {
    this.id = socketId;
    this.name = '';
    this.requestedGameRoom = '';
    this.gameMark = '';
    this.gameStartIntention = false;
  }

  setUserName(name) {
    this.name = name;
  }

  setRequestedGameRoom(room) {
    this.requestedGameRoom = room;
  }

  setGameMark(gameMark) {
    this.gameMark = gameMark;
  }

  setStartGameIntention(gameStart = true) {
    this.gameStartIntention = gameStart;
  }

  getGameIntention() {
    return this.gameStartIntention;
  }
}
