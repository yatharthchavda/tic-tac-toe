import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { checkGameRoom, readyToStart } from '../utils/socket';
import '../styles/Greetings.css';

function Greetings({ onJoinRoom }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { socket } = useSocket();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !room.trim()) {
      alert('Please fill out Room Name and Player Name fields!');
      return;
    }

    setIsJoining(true);

    // Wait for connection if not connected
    if (!socket.connected) {
      await new Promise((resolve) => {
        socket.once('connection-established', resolve);
        setTimeout(resolve, 1000); // Fallback timeout
      });
    }

    // Check room availability
    checkGameRoom(username, room);

    socket.once('tooManyPlayers', (result) => {
      setIsJoining(false);
      
      if (result === 'tooCrowdy') {
        socket.disconnect();
        alert('Too many players in this Gaming Room!');
        return;
      }
      
      // Room available, emit ready to start
      readyToStart();
      onJoinRoom(username, room);
    });
  };

  return (
    <div className="greetings-background show">
      <div className="greetings-view show">
        <div className="tictacImage">
          <img src="/title.png" alt="Tic Tac Toe" />
        </div>
        
        <form onSubmit={handleJoinRoom}>
          <label htmlFor="gameRoom">
            Enter a game room name to join with other player
          </label>
          <input
            type="text"
            id="gameRoom"
            placeholder="Room Name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
            disabled={isJoining}
          />

          <label htmlFor="playerName">Enter your username</label>
          <input
            type="text"
            id="playerName"
            placeholder="Eg: Heet"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isJoining}
          />

          <button type="submit" disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Greetings;
