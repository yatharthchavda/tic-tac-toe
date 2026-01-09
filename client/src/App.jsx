import { useState } from 'react'
import { SocketProvider } from './context/SocketContext'
import Greetings from './components/Greetings'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'
import './styles/App.css'

function App() {
  const [currentView, setCurrentView] = useState('greetings') // greetings, lobby, game
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [gameStartData, setGameStartData] = useState(null)

  return (
    <SocketProvider>
      <main className="app-container">
        {currentView === 'greetings' && (
          <Greetings 
            onJoinRoom={(name, room) => {
              setPlayerName(name)
              setRoomName(room)
              setCurrentView('lobby')
            }}
          />
        )}
        
        {currentView === 'lobby' && (
          <Lobby 
            playerName={playerName}
            roomName={roomName}
            onStartGame={(data) => {
              setGameStartData(data)
              setCurrentView('game')
            }}
          />
        )}
        
        {currentView === 'game' && (
          <GameBoard 
            playerName={playerName}
            roomName={roomName}
            initialGameData={gameStartData}
          />
        )}
      </main>
    </SocketProvider>
  )
}

export default App
