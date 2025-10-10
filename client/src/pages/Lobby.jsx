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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary-200/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-accent-200/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full relative z-10"
      >
        <div className="card-elevated">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-glow mb-4">
                <span className="text-3xl">🎮</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Salle d'attente
              </h1>
              
              {/* Code de la partie */}
              <div className="inline-block bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 rounded-2xl border-2 border-primary-200 shadow-medium">
                <p className="text-sm text-neutral-600 mb-2 font-semibold">Code de la partie</p>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black tracking-widest text-primary-600 font-mono">{roomCode}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyRoomCode}
                    className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-300 shadow-medium"
                    title="Copier le code"
                  >
                    {copied ? '✓ Copié!' : '📋'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Liste des joueurs */}
          <div className="mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <span>Équipe de mission</span>
                <span className="badge badge-primary">({room?.players?.length || 0}/4)</span>
              </h2>
              
              <div className="grid gap-4">
                {room?.players?.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-interactive hover-lift"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-2xl shadow-medium">
                          👤
                        </div>
                        <div>
                          <p className="font-bold text-lg text-neutral-800">{player.name}</p>
                          {player.isHost && (
                            <span className="badge badge-accent text-xs">👑 Hôte</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-neutral-600">En ligne</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Slots vides */}
                {[...Array(4 - (room?.players?.length || 0))].map((_, i) => (
                  <motion.div
                    key={`empty-${i}`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (room?.players?.length || 0) * 0.1 + i * 0.1 }}
                    className="bg-neutral-100 p-4 rounded-xl border-2 border-dashed border-neutral-300"
                  >
                    <div className="flex items-center gap-4 opacity-60">
                      <div className="w-14 h-14 bg-neutral-200 rounded-2xl flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <p className="text-neutral-500 font-medium">En attente d'un joueur...</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Informations de la mission */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="section-hero mb-8"
          >
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <span>Brief de mission</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-bold text-neutral-800 mb-1">Objectif</h4>
                <p className="text-sm text-neutral-600">Infiltrer 4 salles et récupérer les données sur la pollution</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <h4 className="font-bold text-neutral-800 mb-1">Durée</h4>
                <p className="text-sm text-neutral-600">20 minutes maximum</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h4 className="font-bold text-neutral-800 mb-1">Mode</h4>
                <p className="text-sm text-neutral-600">Coopération requise</p>
              </div>
            </div>
            <div className="section-info">
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Communication</h4>
                  <p className="text-sm text-neutral-600">
                    Utilisez le chat textuel pour communiquer avec votre équipe pendant la mission.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {isHost ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartGame}
                disabled={room?.players?.length < 1}
                className="w-full btn-primary py-4 text-lg hover-lift"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <span>Lancer la mission</span>
                </span>
              </motion.button>
            ) : (
              <div className="text-center py-6 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-neutral-600 font-medium">En attente que l'hôte lance la partie...</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full btn-ghost py-3 text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚪</span>
                <span>Quitter la partie</span>
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-neutral-500 text-sm bg-neutral-100 px-4 py-2 rounded-full">
            <span className="text-lg">💡</span>
            <span>Astuce : Créer un lobby public pour jouer à plusieurs !</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

