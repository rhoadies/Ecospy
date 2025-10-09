import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Lobby() {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { room, setRoom, roomCode, playerName, setGameStarted, setStartTime, setCurrentRoom } = useGame()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!room || !roomCode) {
      navigate('/')
      return
    }

    // Écouter les nouveaux joueurs
    socket.on('player-joined', ({ players, newPlayer }) => {
      setRoom(prev => ({ ...prev, players }))
      toast.success(`${newPlayer} a rejoint la partie!`)
    })

    // Écouter les joueurs qui partent
    socket.on('player-left', ({ players, leftPlayer }) => {
      setRoom(prev => ({ ...prev, players }))
      toast.error(`${leftPlayer} a quitté la partie`)
    })

    // Écouter le démarrage du jeu
    socket.on('game-started', ({ startTime, currentRoom }) => {
      setGameStarted(true)
      setStartTime(startTime)
      setCurrentRoom(currentRoom)
      toast.success('La partie commence !')
      setTimeout(() => navigate('/game'), 1000)
    })

    return () => {
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('game-started')
    }
  }, [socket, room, roomCode, navigate])

  const handleStartGame = () => {
    socket.emit('start-game', { roomCode })
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Code copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = room?.players?.find(p => p.name === playerName)?.isHost

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full"
      >
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary">Salle d'attente</h1>
            
            {/* Code de la partie */}
            <div className="inline-block bg-gray-900 px-8 py-4 rounded-lg border-2 border-primary">
              <p className="text-sm text-gray-400 mb-1">Code de la partie</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold tracking-widest">{roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  className="px-4 py-2 bg-primary hover:bg-green-600 rounded-lg transition-colors"
                  title="Copier le code"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* Liste des joueurs */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Joueurs ({room?.players?.length || 0}/4)
            </h2>
            <div className="grid gap-3">
              {room?.players?.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 p-4 rounded-lg flex items-center justify-between border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      {player.isHost && (
                        <span className="text-xs text-primary">👑 Hôte</span>
                      )}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </motion.div>
              ))}
              
              {/* Slots vides */}
              {[...Array(4 - (room?.players?.length || 0))].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-gray-900/50 p-4 rounded-lg border border-dashed border-gray-700"
                >
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <p className="text-gray-600">En attente d'un joueur...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations de la mission */}
          <div className="bg-gray-900 p-6 rounded-lg border border-primary mb-8">
            <h3 className="text-xl font-bold text-primary mb-3">📋 Brief de mission</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong className="text-white">Objectif :</strong> Infiltrer 4 salles de la base ennemie 
                et récupérer les données sur la pollution mondiale.
              </p>
              <p>
                <strong className="text-white">Durée :</strong> 20 minutes maximum
              </p>
              <p>
                <strong className="text-white">Difficulté :</strong> Coopération requise
              </p>
              <p className="text-sm text-yellow-500 mt-4">
                ⚠️ Utilisez le chat textuel pour communiquer si besoin.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={room?.players?.length < 1}
                className="w-full btn-primary py-4 text-lg"
              >
                Lancer la mission
              </button>
            ) : (
              <div className="text-center py-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-gray-400">En attente que l'hôte lance la partie...</p>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Quitter la partie
            </button>
          </div>
        </div>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-gray-500 text-sm"
        >
          <p>💡 Astuce : Utilisez un casque pour une meilleure immersion</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

