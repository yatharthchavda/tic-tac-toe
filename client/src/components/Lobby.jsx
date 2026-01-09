import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { startGame as emitStartGame } from '../utils/socket';
import '../styles/Lobby.css';

function Lobby({ playerName, roomName, onStartGame }) {
  const { socket, clientId, connectedPlayers } = useSocket();
  const [playersCount, setPlayersCount] = useState(1);
  const [hasClickedStart, setHasClickedStart] = useState(false);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    // Update players count
    const handleStatus = (msg) => {
      console.log('Status update:', msg);
      setPlayersCount(msg.clientsNbs);
      setCanStart(msg.clientsNbs === 2);
    };

    const handleDisconnectStatus = (msg) => {
      console.log('Disconnect status:', msg);
      setPlayersCount(msg.clientsNbs);
      setCanStart(msg.clientsNbs === 2);
      setHasClickedStart(false); // Reset start button if someone leaves
    };

    const handleStart = (data) => {
      console.log('Lobby received start event:', data);
      // Pass the game data to parent
      onStartGame(data);
    };

    const handleWaitingStart = () => {
      console.log('Waiting for second player to start...');
    };

    socket.on('status', handleStatus);
    socket.on('disconnect-status', handleDisconnectStatus);
    socket.on('start', handleStart);
    socket.on('waiting second player start', handleWaitingStart);

    return () => {
      socket.off('status', handleStatus);
      socket.off('disconnect-status', handleDisconnectStatus);
      socket.off('start', handleStart);
      socket.off('waiting second player start');
    };
  }, [socket, onStartGame]);

  const handleStartClick = () => {
    if (!canStart || hasClickedStart) return;
    
    setHasClickedStart(true);
    emitStartGame();
    console.log('Start button clicked');
  };

  const player1Name = connectedPlayers[0] || playerName;
  const player2Name = connectedPlayers[1] || 'Waiting...';

  return (
    <div className="lobby-container">
      <div className="lobby-content">
        <h2 className="lobby-title">Game Lobby</h2>
        
        <div className="room-info">
          <span className="room-label">Room:</span>
          <span className="room-name">{roomName}</span>
        </div>
        
        <div className="players-container">
          <div className="player-display">
            <div className="player-label">Player 1 (X):</div>
            <div className="player-name">{player1Name}</div>
          </div>
          
          <div className="player-display">
            <div className="player-label">Player 2 (O):</div>
            <div className="player-name">{player2Name}</div>
          </div>
        </div>
        
        <div className="game-status-indicator">
          {playersCount === 1 && 'Waiting for opponent to join...'}
          {playersCount === 2 && !hasClickedStart && 'Both players connected! Click Start when ready.'}
          {playersCount === 2 && hasClickedStart && 'Waiting for opponent to start...'}
        </div>
        
        <button 
          className={`lobby-start-button ${canStart && !hasClickedStart ? 'enabled' : 'disabled'}`}
          onClick={handleStartClick}
          disabled={!canStart || hasClickedStart}
        >
          {hasClickedStart ? 'Waiting...' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}

export default Lobby;
