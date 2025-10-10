import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Home() {
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  const { setPlayerName, setRoomCode, setRoom } = useGame()
  
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState(null) // 'create' ou 'join'

  const handleCreateRoom = () => {
    if (!name.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }

    if (!connected) {
      toast.error('Connexion au serveur en cours...')
      return
    }

    setPlayerName(name)
    
    socket.emit('create-room', { playerName: name })
    
    socket.once('room-created', (room) => {
      setRoomCode(room.code)
      setRoom(room)
      toast.success('Partie créée !')
      navigate('/lobby')
    })
  }

  const handleJoinRoom = () => {
    if (!name.trim() || !joinCode.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (!connected) {
      toast.error('Connexion au serveur en cours...')
      return
    }

    setPlayerName(name)
    setRoomCode(joinCode.toUpperCase())
    
    socket.emit('join-room', { 
      roomCode: joinCode.toUpperCase(), 
      playerName: name 
    })
    
    socket.once('room-joined', (room) => {
      setRoom(room)
      toast.success('Partie rejointe !')
      navigate('/lobby')
    })

    socket.once('join-error', (error) => {
      toast.error(error.message)
    })
  }

  const handleJoinPublicRoom = () => {
    if (!name.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }

    if (!connected) {
      toast.error('Connexion au serveur en cours...')
      return
    }

    setPlayerName(name)
    
    socket.emit('join-public-room', { playerName: name })
    
    socket.once('room-joined', (room) => {
      setRoomCode(room.code)
      setRoom(room)
      toast.success('Lobby public rejoint !')
      navigate('/lobby')
    })

    socket.once('join-error', (error) => {
      toast.error(error.message)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary-200/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-accent-200/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-primary-300/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Logo et titre principal */}
            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-glow mb-6 animate-bounce-gentle">
                <span className="text-4xl">🌍</span>
              </div>
              <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent text-shadow-lg">
                EcoSpy
              </h1>
              <h2 className="text-4xl font-bold text-neutral-700 mb-6">
                Mission Climat
              </h2>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-neutral-600 leading-relaxed mb-8">
                Infiltrez la base d'une méga-corporation qui cache des données sur la pollution. 
                <span className="font-semibold text-primary-600">4 salles, 4 énigmes, 20 minutes</span> pour sauver la planète !
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="section-feature text-center">
                  <div className="text-3xl mb-3">🎮</div>
                  <h3 className="font-bold text-neutral-800 mb-2">Coopératif</h3>
                  <p className="text-sm text-neutral-600">1 à 4 joueurs</p>
                </div>
                <div className="section-feature text-center">
                  <div className="text-3xl mb-3">⏱️</div>
                  <h3 className="font-bold text-neutral-800 mb-2">Rapide</h3>
                  <p className="text-sm text-neutral-600">20 minutes max</p>
                </div>
                <div className="section-feature text-center">
                  <div className="text-3xl mb-3">🌱</div>
                  <h3 className="font-bold text-neutral-800 mb-2">Éducatif</h3>
                  <p className="text-sm text-neutral-600">Thème environnement</p>
                </div>
              </div>
            </div>

            {/* Statut de connexion */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full"
            >
              {connected ? (
                <span className="inline-flex items-center text-primary-600 bg-primary-100 px-4 py-2 rounded-full font-medium">
                  <span className="w-3 h-3 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                  Connecté au serveur
                </span>
              ) : (
                <span className="inline-flex items-center text-accent-600 bg-accent-100 px-4 py-2 rounded-full font-medium">
                  <span className="w-3 h-3 bg-accent-500 rounded-full mr-2 animate-pulse"></span>
                  Connexion en cours...
                </span>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Mode selection ou formulaires */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card-elevated max-w-lg mx-auto"
        >
          {!mode ? (
            // Sélection du mode
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-neutral-800 mb-2">Commencer l'aventure</h3>
                <p className="text-neutral-600">Choisissez votre mode de jeu</p>
              </div>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('create')}
                  className="w-full btn-primary py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span>Créer une partie</span>
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('join')}
                  className="w-full btn-secondary py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">👥</span>
                    <span>Rejoindre une partie</span>
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('public')}
                  className="w-full btn-accent py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <span>Lobby public</span>
                  </span>
                </motion.button>
              </div>

              {/* Info */}
              <div className="section-info">
                <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  <span>Informations du jeu</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500">👥</span>
                    <span className="text-neutral-600">1 à 4 joueurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500">⏱️</span>
                    <span className="text-neutral-600">20 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500">🤝</span>
                    <span className="text-neutral-600">Coopération</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500">🌱</span>
                    <span className="text-neutral-600">Environnement</span>
                  </div>
                </div>
              </div>
            </div>
          ) : mode === 'create' ? (
            // Formulaire de création
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMode(null)}
                  className="text-neutral-500 hover:text-neutral-700 text-2xl"
                >
                  ←
                </motion.button>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-800">Créer une partie</h3>
                  <p className="text-neutral-600 text-sm">Vous serez l'hôte de la partie</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Votre nom d'agent
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Smith"
                    className="input text-center"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  disabled={!connected || !name.trim()}
                  className="w-full btn-primary py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    <span>Créer la partie</span>
                  </span>
                </motion.button>
              </div>
            </div>
          ) : mode === 'join' ? (
            // Formulaire de connexion
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMode(null)}
                  className="text-neutral-500 hover:text-neutral-700 text-2xl"
                >
                  ←
                </motion.button>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-800">Rejoindre une partie</h3>
                  <p className="text-neutral-600 text-sm">Entrez le code de la partie</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Votre nom d'agent
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Smith"
                    className="input text-center"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Code de la partie
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="input uppercase text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinRoom}
                  disabled={!connected || !name.trim() || !joinCode.trim()}
                  className="w-full btn-secondary py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔑</span>
                    <span>Rejoindre</span>
                  </span>
                </motion.button>
              </div>
            </div>
          ) : (
            // Formulaire lobby public
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMode(null)}
                  className="text-neutral-500 hover:text-neutral-700 text-2xl"
                >
                  ←
                </motion.button>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-800">🌐 Lobby Public</h3>
                  <p className="text-neutral-600 text-sm">Rejoignez d'autres joueurs</p>
                </div>
              </div>
              
              <div className="section-info">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Lobby automatique</h4>
                    <p className="text-sm text-neutral-600">
                      Rejoignez automatiquement un lobby avec d'autres joueurs en attente !
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Votre nom d'agent
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Smith"
                    className="input text-center"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinPublicRoom()}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinPublicRoom}
                  disabled={!connected || !name.trim()}
                  className="w-full btn-accent py-4 text-lg hover-lift"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔍</span>
                    <span>Trouver un lobby</span>
                  </span>
                </motion.button>

                <div className="text-center text-sm text-neutral-500 bg-neutral-50 rounded-lg p-3">
                  <p>Vous serez mis en relation avec d'autres joueurs</p>
                  <p>ou un nouveau lobby sera créé pour vous.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 text-neutral-500 text-sm bg-neutral-100 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
            <span>Workshop M1 2025-2026 - EPSI/WIS</span>
          </div>
          <p className="mt-2 text-neutral-400 text-xs">Escape Game Éducatif sur l'Environnement</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

