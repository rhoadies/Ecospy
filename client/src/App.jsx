import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'
import { GameProvider } from './context/GameContext'
import { VoiceProvider } from './context/VoiceContext'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Debriefing from './pages/Debriefing'

function App() {
  return (
    <Router>
      <SocketProvider>
        <GameProvider>
          <VoiceProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark to-gray-900">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<Game />} />
                <Route path="/debriefing" element={<Debriefing />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #10b981'
                  }
                }}
              />
            </div>
          </VoiceProvider>
        </GameProvider>
      </SocketProvider>
    </Router>
  )
}

export default App

