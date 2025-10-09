import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import { useRoomSync } from '../context/RoomSyncContext'
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
  const { clearAllRoomStates } = useRoomSync()
  const { 
    room, 
    roomCode, 
    currentRoom, 
    setCurrentRoom, 
    gameStarted, 
    setGameResult,
    playerName,
    addMessage,
    resetGame
  } = useGame()

  const [showChat, setShowChat] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [incomingRoom, setIncomingRoom] = useState(null)
  const [showLearn, setShowLearn] = useState(false)
  const [learnKey, setLearnKey] = useState(null)
  const [nextRoomPending, setNextRoomPending] = useState(null)

  // Mini debrief content per room
  const miniEducational = {
    1: {
      title: '🌡️ Empreinte Carbone – À retenir',
      points: [
        "L'empreinte carbone moyenne d'un Français ~10 t CO₂/an",
        "Objectif 2050: 2 t CO₂/an/personne",
        'Les transports pèsent lourd; vélo/transports en commun aident'
      ]
    },
    2: {
      title: '🌊 Pollution Océanique – À retenir',
      points: [
        "8 Mt de plastique entrent dans l'océan chaque année",
        'Des centaines d’espèces affectées; réduire et recycler est clé'
      ]
    },
    3: {
      title: '🌳 Déforestation – À retenir',
      points: [
        '10 Mha de forêts disparaissent chaque année',
        'Consommer responsable et protéger les forêts est crucial'
      ]
    },
    4: {
      title: '⚡ Transition Énergétique – À retenir',
      points: [
        'Augmenter la part de renouvelables réduit les émissions',
        'Efficacité et sobriété complètent le mix bas-carbone'
      ]
    }
  }
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!room || !roomCode || !gameStarted) {
      navigate('/')
      return
    }

    // Écouter la résolution d'énigmes → animation d'infiltration avant passage
    socket.on('puzzle-solved', ({ roomNumber, nextRoom, message }) => {
      toast.success(message)
      setIncomingRoom(nextRoom)
      setNextRoomPending(nextRoom)
      setLearnKey(String(roomNumber))
      setShowLearn(true)
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
      clearAllRoomStates()
      resetGame()
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
        <div className="max-w-7xl mx-auto px-3 py-2 md:px-4 md:py-4 flex items-center justify-between">
          {/* Info partie */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-xs md:text-sm">
              <span className="text-gray-400">Salle</span>
              <span className="ml-2 text-xl md:text-2xl font-bold text-primary">{currentRoom}/4</span>
            </div>
            <div className="hidden md:block text-sm text-gray-400">
              Code: <span className="text-white font-mono">{roomCode}</span>
            </div>
          </div>

          {/* Timer */}
          <Timer maxTime={1200} />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Bouton Chat Textuel */}
            <button
              onClick={() => {
                const next = !showChat
                setShowChat(next)
                if (next) setUnreadCount(0)
              }}
              className="relative px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
              className="px-3 py-2 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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

      {/* Transition overlay: porte qui s'ouvre + agent qui avance */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <div className="relative w-full max-w-xl mx-auto h-64">
              {/* Porte (verrou → déverrouillage) */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-8 text-6xl"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: [0, -5, 0], scale: [0.8, 1, 1] }}
                transition={{ duration: 0.6 }}
              >
                🔒
              </motion.div>
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-8 text-6xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0, 1], scale: [0.8, 0.9, 1] }}
                transition={{ duration: 1.0 }}
              >
                🔓
              </motion.div>

              {/* Couloir */}
              <div className="absolute inset-x-6 bottom-10 top-24 bg-gradient-to-b from-gray-800/80 to-black/80 rounded-xl border border-gray-700" />

              {/* Agent qui avance vers la porte */}
              <motion.div
                className="absolute bottom-10 left-6 text-5xl"
                initial={{ x: 0 }}
                animate={{ x: ['0%', '35%', '70%'] }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              >
                🕵️
              </motion.div>

              {/* Étiquette prochaine salle */}
              <motion.div
                className="absolute bottom-3 left-0 right-0 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span className="px-3 py-1 rounded bg-primary/20 border border-primary text-primary text-sm">
                  Accès autorisé • Salle {incomingRoom}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini debrief overlay before transition */}
      <AnimatePresence>
        {showLearn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-xl mx-4 bg-gray-900 border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-primary mb-3">
                {miniEducational[learnKey]?.title || 'À retenir'}
              </h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                {(miniEducational[learnKey]?.points || []).map((p, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    // Skip to transition
                    setShowLearn(false)
                    setShowTransition(true)
                    setTimeout(() => {
                      setShowTransition(false)
                      if (nextRoomPending) setCurrentRoom(nextRoomPending)
                      setIncomingRoom(null)
                      setNextRoomPending(null)
                    }, 1600)
                  }}
                  className="btn-primary px-4 py-2"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

