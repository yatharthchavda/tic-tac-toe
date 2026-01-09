import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { sendTurn, sendGameStatus, startGame as emitStartGame } from '../utils/socket';
import Cell from './Cell';
import WinningMessage from './WinningMessage';
import '../styles/GameBoard.css';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function GameBoard({ playerName, roomName, initialGameData }) {
  const { socket, clientId, connectedPlayers } = useSocket();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  console.log('GameBoard render - clientId:', clientId, 'isMyTurn:', isMyTurn, 'activePlayerId:', activePlayerId);

  // Player names
  const player1Name = connectedPlayers[0] || 'Player 1';
  const player2Name = connectedPlayers[1] || 'Player 2';
  const myMark = clientId === 0 ? 'X' : 'O';
  const opponentMark = clientId === 0 ? 'O' : 'X';

  // Initialize game state from the data passed from Lobby
  useEffect(() => {
    if (initialGameData && clientId !== null) {
      console.log('Initializing game with data:', initialGameData);
      setActivePlayerId(initialGameData.activePlayer);
      setIsMyTurn(initialGameData.activePlayer === clientId);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setIsDraw(false);
    }
  }, [initialGameData, clientId]);

  // Show loading if clientId is not set yet
  if (clientId === null) {
    return (
      <div className="game-board-area">
        <div style={{ textAlign: 'center', color: 'white', fontSize: '24px' }}>
          Connecting to game...
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleStart = (data) => {
      console.log('Game started event received:', data);
      console.log('Current clientId:', clientId);
      console.log('Active player:', data.activePlayer);
      console.log('Is my turn?', data.activePlayer === clientId);
      
      setActivePlayerId(data.activePlayer);
      setIsMyTurn(data.activePlayer === clientId);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setIsDraw(false);
    };

    const handleTurn = (data) => {
      console.log('Turn received:', data);
      
      // Update board with the move
      setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        const mark = data.recentPlayer === 0 ? 'X' : 'O';
        newBoard[data.lastPos] = mark;
        
        // Check for winner or draw after updating board
        setTimeout(() => {
          const winnerMark = checkWinner(newBoard);
          if (winnerMark) {
            setWinner(winnerMark);
            sendGameStatus('ended');
          } else if (newBoard.every(cell => cell !== null)) {
            setIsDraw(true);
            sendGameStatus('draw');
          }
        }, 100);
        
        return newBoard;
      });
      
      // Update turn
      setActivePlayerId(data.next);
      setIsMyTurn(data.next === clientId);
    };

    socket.on('start', handleStart);
    socket.on('turn', handleTurn);

    return () => {
      socket.off('start', handleStart);
      socket.off('turn', handleTurn);
    };
  }, [socket, clientId]);

  const checkWinner = (currentBoard) => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }
    return null;
  };

  const handleCellClick = (index) => {
    console.log('Cell clicked:', {
      index,
      isMyTurn,
      clientId,
      activePlayerId,
      cellValue: board[index],
      winner,
      isDraw
    });

    // Check if move is valid
    if (!isMyTurn || board[index] !== null || winner || isDraw) {
      console.log('Move blocked:', {
        notMyTurn: !isMyTurn,
        cellOccupied: board[index] !== null,
        gameOver: winner || isDraw
      });
      return;
    }

    console.log('Sending turn to server...');
    // Make the move
    sendTurn(clientId, index);
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    sendGameStatus('restart');
    emitStartGame();
  };

  const currentTurnText = () => {
    if (winner || isDraw) return '';
    if (isMyTurn) return `Your Turn (${myMark})`;
    return `${activePlayerId === 0 ? player1Name : player2Name}'s Turn`;
  };

  return (
    <div className="game-board-area">
      {/* Player Info */}
      <div className="player-info-container">
        <div className="player-info">
          <div className="player-info-item">
            <span className="player-label">Player 1 (X):</span>
            <span className="player-name-display">{player1Name}</span>
          </div>
          <div className="player-info-item">
            <span className="player-label">Player 2 (O):</span>
            <span className="player-name-display">{player2Name}</span>
          </div>
        </div>
        <div className="current-turn-indicator">
          <span id="currentTurnText">{currentTurnText()}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className={`board ${winner ? 'winner-' + winner.toLowerCase() : ''}`}>
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onClick={() => handleCellClick(index)}
            isClickable={isMyTurn && !cell && !winner && !isDraw}
          />
        ))}
      </div>

      {/* Winning Message */}
      {(winner || isDraw) && (
        <WinningMessage
          winner={winner}
          isDraw={isDraw}
          myMark={myMark}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default GameBoard;
