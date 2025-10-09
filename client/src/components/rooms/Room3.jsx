import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../../context/SocketContext'
import { useGame } from '../../context/GameContext'
import { useRoomSync } from '../../context/RoomSyncContext'
import toast from 'react-hot-toast'

// Salle 3 : Énigme Coopérative - Carte de Déforestation
export default function Room3({ onSubmit }) {
  const { socket } = useSocket()
  const { roomCode, room } = useGame()
  const { syncRoomState, subscribeToRoomState, getRoomState, initializeRoomState } = useRoomSync()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [sharedClues, setSharedClues] = useState([])
  const [myClue, setMyClue] = useState(null)
  const [stage, setStage] = useState(0) // 0..4 to guess 5 regions in order
  const [sharedByPlayer, setSharedByPlayer] = useState({}) // Suivi des indices partagés par joueur et stage (synchronisé)
  const [mySharedStages, setMySharedStages] = useState(new Set()) // Suivi local de mes partages
  const [showMap, setShowMap] = useState(false) // État pour afficher la carte

  const regions = [
    {
      id: 'amazonie',
      name: 'Amazonie',
      icon: '🌳',
      data: {
        deforestation: '17%',
        area: '5.5M km²',
        critical: true
      }
    },
    {
      id: 'congo',
      name: 'Bassin du Congo',
      icon: '🦍',
      data: {
        deforestation: '5%',
        area: '3.7M km²',
        critical: false
      }
    },
    {
      id: 'indonesie',
      name: 'Indonésie',
      icon: '🐅',
      data: {
        deforestation: '24%',
        area: '0.9M km²',
        critical: true
      }
    },
    {
      id: 'atlantique',
      name: 'Forêt Atlantique',
      icon: '🦜',
      data: {
        deforestation: '88%',
        area: '0.1M km²',
        critical: true
      }
    },
    {
      id: 'taiga',
      name: 'Taïga (boréale)',
      icon: '🐺',
      data: {
        deforestation: '3%',
        area: '13M km²',
        critical: false
      }
    }
  ]

  // Order to guess
  const targetOrder = ['amazonie', 'indonesie', 'atlantique', 'congo', 'taiga']

  const clueBank = {
    amazonie: [
      { text: 'La région la plus critique a perdu 17% de sa surface', hint: 'amazonie' },
      { text: 'Le "poumon de la Terre" est menacé', hint: 'amazonie' },
      { text: 'La plus grande forêt tropicale du monde est en danger', hint: 'amazonie' }
    ],
    indonesie: [
      { text: 'Archipel d’Asie du Sud-Est, palmiers à huile et tigres', hint: 'indonesie' },
      { text: 'Îles tropicales avec une forte pression agricole', hint: 'indonesie' }
    ],
    atlantique: [
      { text: 'Forêt côtière d’Amérique du Sud très fragmentée', hint: 'atlantique' },
      { text: 'A perdu plus de 80% de sa surface originelle', hint: 'atlantique' }
    ],
    congo: [
      { text: 'Deuxième plus grande forêt tropicale après l’Amazonie', hint: 'congo' },
      { text: 'Située en Afrique centrale, refuge pour les gorilles', hint: 'congo' }
    ],
    taiga: [
      { text: 'Forêt boréale des hautes latitudes, surtout conifères', hint: 'taiga' },
      { text: 'Immense biome du nord, faible densité humaine', hint: 'taiga' }
    ]
  }

  // Initialiser l'état synchronisé
  useEffect(() => {
    const existingState = getRoomState(3)
    
    if (existingState) {
      setSelectedRegion(existingState.selectedRegion || '')
      setSharedClues(existingState.sharedClues || [])
      setStage(existingState.stage || 0)
      setSharedByPlayer(existingState.sharedByPlayer || {})
    } else {
      const initialState = {
        selectedRegion: '',
        sharedClues: [],
        stage: 0,
        sharedByPlayer: {}
      }
      initializeRoomState(3, initialState)
    }
  }, [])

  // Synchroniser les changements d'état
  useEffect(() => {
    const unsubscribe = subscribeToRoomState(3, (stateData) => {
      if (stateData) {
        setSelectedRegion(stateData.selectedRegion || '')
        setSharedClues(stateData.sharedClues || [])
        setStage(stateData.stage || 0)
        setSharedByPlayer(stateData.sharedByPlayer || {})
      }
    })

    return unsubscribe
  }, [subscribeToRoomState])

  useEffect(() => {
    // Give a clue for the current target region
    const target = targetOrder[stage]
    const pool = clueBank[target] || []
    if (pool.length > 0) {
      const randomClue = pool[Math.floor(Math.random() * pool.length)]
      setMyClue(randomClue)
    }
  }, [stage])

  useEffect(() => {
    // Écouter les indices partagés par les autres joueurs
    socket.on('clue-shared', ({ clueData }) => {
      setSharedClues(prev => [...prev, clueData])
    })

    return () => {
      socket.off('clue-shared')
    }
  }, [socket])

  const handleShareClue = () => {
    if (myClue) {
      // Vérifier si ce joueur a déjà partagé son indice pour ce stage (vérification locale)
      if (mySharedStages.has(stage)) {
        toast.error('Vous avez déjà partagé votre indice pour cette question !')
        return
      }

      // Marquer localement que j'ai partagé pour ce stage
      const newSharedStages = new Set(mySharedStages)
      newSharedStages.add(stage)
      setMySharedStages(newSharedStages)

      socket.emit('share-clue', {
        roomCode,
        playerId: socket.id,
        clueData: myClue.text
      })
      const newSharedClues = [...sharedClues, myClue.text]
      const playerStageKey = `${socket.id}_${stage}`
      const newSharedByPlayer = {
        ...sharedByPlayer,
        [playerStageKey]: true
      }
      setSharedClues(newSharedClues)
      setSharedByPlayer(newSharedByPlayer)
      
      // Synchroniser l'état
      syncRoomState(3, {
        selectedRegion,
        sharedClues: newSharedClues,
        stage,
        sharedByPlayer: newSharedByPlayer
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedRegion) return
    const target = targetOrder[stage]
    if (selectedRegion === target) {
      // Correct -> advance to next stage or complete
      const nextStage = stage + 1
      if (nextStage >= targetOrder.length) {
        toast.success('Toutes les régions ont été identifiées !')
        onSubmit('amazonie') // final answer to server stays consistent
      } else {
        toast.success('Correct ! Passez à la région suivante.')
        const newStage = nextStage
        const newSelectedRegion = ''
        const newSharedClues = []
        const newSharedByPlayer = {} // Réinitialiser les indices partagés pour le nouveau stage
        setStage(newStage)
        setSelectedRegion(newSelectedRegion)
        setSharedClues(newSharedClues)
        setSharedByPlayer(newSharedByPlayer)
        setMySharedStages(new Set()) // Réinitialiser mes partages locaux
        
        // Synchroniser l'état
        syncRoomState(3, {
          selectedRegion: newSelectedRegion,
          sharedClues: newSharedClues,
          stage: newStage,
          sharedByPlayer: newSharedByPlayer
        })
      }
    } else {
      toast.error('Ce n\'est pas la bonne région. Réessayez.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 md:p-6"
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl md:text-4xl">🗺️</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Salle 3 : Carte de Déforestation</h2>
              <p className="text-gray-400 text-sm md:text-base">Énigme coopérative - Travaillez en équipe !</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-3">
            <p className="text-red-400 text-sm">
              🤝 <strong>Coopération requise :</strong> Chaque joueur a un indice différent. 
              Partagez vos indices avec l\'équipe via le chat ou le bouton ci-dessous pour identifier 
              la région la plus critique !
            </p>
          </div>

          {/* Info éducative */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">💡 À savoir</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• 10 millions d\'hectares de forêt disparaissent chaque année</li>
              <li>• La déforestation contribue à 15% des émissions de gaz à effet de serre</li>
              <li>• 80% des espèces terrestres vivent dans les forêts</li>
              <li>• Les forêts absorbent 2 milliards de tonnes de CO₂ par an</li>
            </ul>
          </div>

          {/* Bouton Carte */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowMap(true)}
              className="btn-secondary px-6 py-3 flex items-center gap-2"
            >
              🗺️ Voir la carte des régions
            </button>
          </div>
        </div>

        {/* Modal Carte */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowMap(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full border-2 border-primary"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-primary">🗺️ Carte des 5 régions</h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 mb-4">
                  {/* Carte du monde SVG */}
                  <div className="relative w-full h-96 bg-blue-900/20 rounded-lg overflow-hidden mb-4">
                    <svg
                      viewBox="0 0 800 400"
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}
                    >
                      {/* Continents simplifiés */}
                      {/* Amérique du Sud */}
                      <path
                        d="M150 200 Q180 180 200 200 Q220 250 200 300 Q180 320 150 300 Q130 280 140 250 Z"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Afrique */}
                      <path
                        d="M350 120 Q380 100 400 120 Q420 180 400 280 Q380 300 350 280 Q330 250 340 200 Z"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Europe */}
                      <path
                        d="M350 80 Q380 60 400 80 Q420 100 400 120 Q380 100 350 120 Z"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Asie */}
                      <path
                        d="M400 80 Q500 60 600 100 Q650 150 600 200 Q550 180 500 160 Q450 140 400 120 Z"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Océanie */}
                      <path
                        d="M600 250 Q650 230 680 250 Q700 280 680 320 Q650 340 600 320 Q580 300 590 270 Z"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Madagascar */}
                      <ellipse
                        cx="420"
                        cy="280"
                        rx="15"
                        ry="25"
                        fill="#2d5a27"
                        stroke="#1a3d1a"
                        strokeWidth="1"
                      />
                      
                      {/* Points des régions */}
                      {/* Amazonie */}
                      <circle
                        cx="180"
                        cy="250"
                        r="8"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text x="190" y="255" fill="white" fontSize="12" fontWeight="bold">1</text>
                      
                      {/* Congo */}
                      <circle
                        cx="380"
        cy="200"
        r="8"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text x="390" y="205" fill="white" fontSize="12" fontWeight="bold">2</text>
      
      {/* Bornéo */}
      <circle
        cx="520"
        cy="220"
        r="8"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text x="530" y="225" fill="white" fontSize="12" fontWeight="bold">3</text>
      
      {/* Sumatra */}
      <circle
        cx="480"
        cy="240"
        r="8"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text x="490" y="245" fill="white" fontSize="12" fontWeight="bold">4</text>
      
      {/* Madagascar */}
      <circle
        cx="420"
        cy="280"
        r="8"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text x="430" y="285" fill="white" fontSize="12" fontWeight="bold">5</text>
    </svg>
    
    {/* Légende */}
    <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3">
      <h4 className="text-white font-bold mb-2">🌍 Régions de déforestation</h4>
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>1. Amazonie (Brésil)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>2. Congo (Afrique)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>3. Bornéo (Asie)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>4. Sumatra (Indonésie)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>5. Madagascar</span>
        </div>
      </div>
    </div>
  </div>
  
  {/* Détails des régions */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {regions.map((region, index) => (
      <div
        key={region.id}
        className="bg-gray-700 rounded-lg p-4 border-2 border-gray-600"
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-1">{region.name}</h4>
            <p className="text-sm text-gray-300 mb-2">{region.location}</p>
            <div className="bg-red-500/20 border border-red-500 rounded px-2 py-1 inline-block">
              <span className="text-red-400 text-xs font-semibold">
                🌳 {region.hectares}
              </span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>

  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
    <p className="text-blue-400 text-sm">
      <strong>Astuce :</strong> Utilisez cette carte pour identifier les régions mentionnées 
      dans les indices partagés par votre équipe !
    </p>
  </div>
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Panneau des indices */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">🔍 Votre indice secret</h3>
              
              {myClue && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-lg">{myClue.text}</p>
                </div>
              )}

              <button
                onClick={handleShareClue}
                className={`w-full ${
                  mySharedStages.has(stage) 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'btn-secondary'
                }`}
                disabled={!myClue || mySharedStages.has(stage)}
              >
                {mySharedStages.has(stage) 
                  ? '✅ Indice déjà partagé' 
                  : '📢 Partager mon indice avec l\'équipe'
                }
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">
                💬 Indices partagés ({sharedClues.length})
              </h3>
              
              {sharedClues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  En attente des indices de l\'équipe...
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sharedClues.map((clue, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 p-3 rounded-lg border border-primary/30"
                    >
                      <p className="text-sm">{clue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info joueurs */}
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                👥 <strong>{room?.players?.length || 0} joueur(s)</strong> dans l\'équipe. 
                Chacun a un indice différent !
              </p>
            </div>
          </div>

          {/* Séquences de régions à identifier (5 au total) */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">🌍 Étape {stage + 1} / {targetOrder.length}</h3>
                <p className="text-sm text-gray-400 mb-4">Identifiez la région correspondant aux indices partagés.</p>
                
                <div className="space-y-3">
                  {regions.map((region) => (
                    <label
                      key={region.id}
                      className={`block p-4 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedRegion === region.id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-gray-800 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="region"
                        value={region.id}
                        checked={selectedRegion === region.id}
                        onChange={(e) => {
                          const newSelectedRegion = e.target.value
                          setSelectedRegion(newSelectedRegion)
                          syncRoomState(3, {
                            selectedRegion: newSelectedRegion,
                            sharedClues,
                            stage,
                            sharedByPlayer
                          })
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{region.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{region.name}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Déforestation : {region.data.deforestation} • 
                            Superficie : {region.data.area}
                          </div>
                        </div>
                        {selectedRegion === region.id && (
                          <span className="text-2xl">✓</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedRegion}
                className="w-full btn-primary py-4 text-lg"
              >
                {stage + 1 < targetOrder.length ? '✅ Valider et continuer' : '🔓 Valider la dernière région'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

