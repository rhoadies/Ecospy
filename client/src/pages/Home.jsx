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
      toast.success('Salon Multijoueur rejoint !')
      navigate('/lobby')
    })

    socket.once('join-error', (error) => {
      toast.error(error.message)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-500 to-green-400 bg-clip-text text-transparent">
              🌍 EcoSpy
            </h1>
            <h2 className="text-3xl font-semibold text-gray-300 mb-4">
              Mission Climat
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Bienvenue dans "Ecospy", une mission pour sauver la planète !

            La Terre est en danger. Les signaux d'alarme sont partout : océans étouffés, forêts en feu, espèces en voie d'extinction...

            Toi et ton équipe êtes les derniers espoirs d'un monde qui vacille. Votre mission ? Explorer, enquêter et résoudre les énigmes cachées dans chaque lieu pour restaurer l'équilibre de la planète.

            Ce n’est pas qu’un jeu. C’est une prise de conscience. Chaque énigme te fera découvrir un aspect essentiel de l’environnement : les ressources, les énergies, les déchets, la biodiversité…

            Saurez-vous sauver la planète avant qu’il ne soit trop tard ?
            </p>
          </motion.div>

          {/* Statut de connexion */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            {connected ? (
              <span className="inline-flex items-center text-primary">
                <span className="w-3 h-3 bg-primary rounded-full mr-2 animate-pulse"></span>
                Connecté au serveur
              </span>
            ) : (
              <span className="inline-flex items-center text-yellow-500">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                Connexion en cours...
              </span>
            )}
          </motion.div>
        </div>

        {/* Mode selection ou formulaires */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card max-w-md mx-auto"
        >
          {!mode ? (
            // Sélection du mode
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center mb-6">Commencer</h3>
              
              <button
                onClick={() => setMode('create')}
                className="w-full btn-primary py-4 text-lg"
              >
                🎮 Créer une partie
              </button>
              
              <button
                onClick={() => setMode('join')}
                className="w-full btn-secondary py-4 text-lg"
              >
                👥 Rejoindre une partie
              </button>

              <button
                onClick={() => setMode('public')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-lg rounded-lg transition-all duration-300"
              >
                🌐 Rejoindre un Salon Multijoueur
              </button>

              {/* Info */}
              <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-primary mb-2">ℹ️ Informations</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 1 à 4 joueurs</li>
                  <li>• Durée : 20 minutes</li>
                  <li>• Coopération requise</li>
                  <li>• Thème : Environnement</li>
                </ul>
              </div>
            </div>
          ) : mode === 'create' ? (
            // Formulaire de création
            <div className="space-y-4">
              <button
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Retour
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Créer une partie</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent Smith"
                  className="input"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={!connected || !name.trim()}
                className="w-full btn-primary py-4 text-lg"
              >
                Créer la partie
              </button>
            </div>
          ) : mode === 'join' ? (
            // Formulaire de connexion
            <div className="space-y-4">
              <button
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Retour
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Rejoindre une partie</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent Smith"
                  className="input"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code de la partie</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="input uppercase text-center text-2xl tracking-widest"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!connected || !name.trim() || !joinCode.trim()}
                className="w-full btn-secondary py-4 text-lg"
              >
                Rejoindre
              </button>
            </div>
          ) : (
            // Formulaire Salon Multijoueur
            <div className="space-y-4">
              <button
                onClick={() => setMode(null)}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Retour
              </button>
              
              <h3 className="text-2xl font-bold mb-6">🌐 Salon Multijoueur</h3>
              
              <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 mb-4">
                <p className="text-purple-300 text-sm">
                  Rejoignez automatiquement un salon avec d'autres joueurs en attente !
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent Smith"
                  className="input"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinPublicRoom()}
                />
              </div>

              <button
                onClick={handleJoinPublicRoom}
                disabled={!connected || !name.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-lg rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trouver un salon
              </button>

              <div className="text-center text-sm text-gray-400">
                <p>Vous serez mis en relation avec d'autres joueurs</p>
                <p>ou un nouveau salon sera créé pour vous.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>Workshop M1 2025-2026 - EPSI/WIS</p>
          <p className="mt-1">Escape Game Éducatif sur l'Environnement</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

