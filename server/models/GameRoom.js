/**
 * GameRoom class - Represents a single game room with 2 players
 */
export class GameRoom {
  constructor(roomName) {
    this.name = roomName;
    this.onlineClients = [];
    this.gameRound = null;
    this.activePlayer = 0;
  }

  addPlayer(playerObj) {
    this.onlineClients.push(playerObj);
  }

  getPlayersNumber() {
    return this.onlineClients.length;
  }

  checkPlayersGameStart() {
    for (const player of this.onlineClients) {
      if (player.getGameIntention() === false) {
        this.gameRound = false;
        return;
      }
    }
    this.gameRound = true;
  }

  getRandomActivePlayer() {
    this.activePlayer = Math.floor(Math.random() * 2);
    return this.activePlayer;
  }

  getSwapPlayer() {
    this.activePlayer = this.activePlayer === 0 ? 1 : 0;
    return this.activePlayer;
  }

  getReadyForGame() {
    this.checkPlayersGameStart();
    return this.gameRound;
  }

  roomAvailable() {
    // Check to have only 2 players joined
    return this.onlineClients.length < 2;
  }

  getPlayerIdx(sid) {
    // Return the player index from active game room
    return this.onlineClients.findIndex(player => player.id === sid);
  }

  getClientsInRoom(requestType = 'byId') {
    const connectedPlayers = [];
    
    for (const player of this.onlineClients) {
      if (requestType === 'byId') {
        connectedPlayers.push(player.id);
      } else if (requestType === 'byName') {
        connectedPlayers.push(player.name);
      }
    }
    
    return connectedPlayers;
  }

  startRound() {
    for (const player of this.onlineClients) {
      player.gameStartIntention = false;
    }
  }
}
