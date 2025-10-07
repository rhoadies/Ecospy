import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import Timer from '../components/Timer'
import Chat from '../components/Chat'
import PlayersList from '../components/PlayersList'
import Room1 from '../components/rooms/Room1'
import Room2 from '../components/rooms/Room2'
import Room3 from '../components/rooms/Room3'
import Room4 from '../components/rooms/Room4'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function Game() {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { 
    room, 
    roomCode, 
    currentRoom, 
    setCurrentRoom, 
    gameStarted, 
    setGameResult,
    playerName,
    addMessage
  } = useGame()

  const [showChat, setShowChat] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!room || !roomCode || !gameStarted) {
      navigate('/')
      return
    }

    // Écouter la résolution d'énigmes
    socket.on('puzzle-solved', ({ roomNumber, nextRoom, message }) => {
      toast.success(message)
      setTimeout(() => {
        setCurrentRoom(nextRoom)
      }, 1500)
    })

    // Écouter les mauvaises réponses
    socket.on('wrong-answer', ({ message }) => {
      toast.error(message)
    })

    // Écouter la fin du jeu
    socket.on('game-completed', (result) => {
      setGameResult(result)
      toast.success('Mission accomplie ! 🎉')
      setTimeout(() => {
        navigate('/debriefing')
      }, 2000)
    })

    // Messages texte – capter même si le panneau est fermé
    socket.on('new-message', (message) => {
      addMessage(message)
      if (!showChat && message.playerName !== playerName) {
        setUnreadCount((c) => c + 1)
        toast((t) => (
          `${message.playerName}: ${message.message}`
        ), { icon: '💬' })
      }
    })

    return () => {
      socket.off('puzzle-solved')
      socket.off('wrong-answer')
      socket.off('game-completed')
      socket.off('new-message')
    }
  }, [socket, room, roomCode, gameStarted, navigate, showChat, addMessage, playerName])

  const handleSubmitAnswer = (answer) => {
    socket.emit('submit-answer', {
      roomCode,
      roomNumber: currentRoom,
      answer,
      playerId: socket.id
    })
  }

  const handleQuit = () => {
    if (window.confirm('Êtes-vous sûr de vouloir quitter la partie ? Votre progression sera perdue.')) {
      navigate('/')
    }
  }

  const renderRoom = () => {
    const roomProps = {
      onSubmit: handleSubmitAnswer,
      roomCode,
      playerName
    }

    switch (currentRoom) {
      case 1:
        return <Room1 {...roomProps} />
      case 2:
        return <Room2 {...roomProps} />
      case 3:
        return <Room3 {...roomProps} />
      case 4:
        return <Room4 {...roomProps} />
      default:
        return (
          <div className="text-center py-20">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-2xl">Chargement de la prochaine salle...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen p-4">
      {/* Liste des joueurs à gauche */}
      <PlayersList />

      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Info partie */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Salle</span>
              <span className="ml-2 text-2xl font-bold text-primary">{currentRoom}/4</span>
            </div>
            <div className="hidden md:block text-sm text-gray-400">
              Code: <span className="text-white font-mono">{roomCode}</span>
            </div>
          </div>

          {/* Timer */}
          <Timer maxTime={1800} />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Bouton Chat Textuel */}
            <button
              onClick={() => {
                const next = !showChat
                setShowChat(next)
                if (next) setUnreadCount(0)
              }}
              className="relative px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              💬 Chat
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 border border-red-300">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Bouton Quitter */}
            <button
              onClick={handleQuit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Quitter la partie"
            >
              ✕ Quitter
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 pb-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            {renderRoom()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Chat sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-gray-900 border-l border-gray-700 z-50 shadow-2xl"
          >
            <Chat onClose={() => setShowChat(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progression indicator */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  num < currentRoom
                    ? 'bg-primary text-white'
                    : num === currentRoom
                    ? 'bg-primary text-white ring-4 ring-primary/30 animate-pulse'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {num < currentRoom ? '✓' : num}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

