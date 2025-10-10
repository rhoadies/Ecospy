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
      location: 'Amérique du Sud (Brésil)',
      hectares: '5.5M km²',
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
      location: 'Afrique centrale',
      hectares: '3.7M km²',
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
      location: 'Asie du Sud-Est',
      hectares: '0.9M km²',
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
      location: 'Brésil (côte atlantique)',
      hectares: '0.1M km²',
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
      location: 'Russie/Canada',
      hectares: '13M km²',
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
                  {/* Carte du monde avec image réelle */}
                  <div className="relative w-full h-[500px] bg-gray-700 rounded-lg overflow-hidden mb-4">
                    {/* Image de carte du monde haute résolution */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png"
                      alt="Carte du monde - Régions de déforestation"
                      className="w-full h-full object-cover opacity-90"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    
                    {/* Fallback SVG si l'image ne charge pas */}
                    <div className="absolute inset-0 hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
                      <div className="flex items-center justify-center h-full text-white text-lg">
                        🌍 Carte du monde
                      </div>
                    </div>
                    
                    {/* Points numérotés sur la carte - Positions plus précises */}
                    {/* 1. Amazonie (Brésil) - Amérique du Sud */}
                    <div className="absolute" style={{ left: '28%', top: '68%' }}>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white flex items-center justify-center shadow-xl animate-pulse">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <strong>1. Amazonie</strong><br/>
                          <span className="text-xs text-gray-300">Brésil - 17% déforestation</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 2. Congo (Afrique centrale) */}
                    <div className="absolute" style={{ left: '52%', top: '58%' }}>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-orange-500 rounded-full border-3 border-white flex items-center justify-center shadow-xl animate-pulse">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <strong>2. Congo</strong><br/>
                          <span className="text-xs text-gray-300">Afrique - 5% déforestation</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 3. Indonésie (Asie du Sud-Est) */}
                    <div className="absolute" style={{ left: '78%', top: '65%' }}>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-red-600 rounded-full border-3 border-white flex items-center justify-center shadow-xl animate-pulse">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <strong>3. Indonésie</strong><br/>
                          <span className="text-xs text-gray-300">Asie - 24% déforestation</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 4. Forêt Atlantique (Brésil) */}
                    <div className="absolute" style={{ left: '30%', top: '75%' }}>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-red-700 rounded-full border-3 border-white flex items-center justify-center shadow-xl animate-pulse">
                          <span className="text-white text-sm font-bold">4</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <strong>4. Forêt Atlantique</strong><br/>
                          <span className="text-xs text-gray-300">Brésil - 88% déforestation</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 5. Taïga (Russie/Canada) */}
                    <div className="absolute" style={{ left: '20%', top: '25%' }}>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-xl animate-pulse">
                          <span className="text-white text-sm font-bold">5</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <strong>5. Taïga</strong><br/>
                          <span className="text-xs text-gray-300">Russie/Canada - 3% déforestation</span>
                        </div>
                      </div>
                    </div>
                  </div>
    
                  {/* Légende améliorée */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                      🌍 Légende des régions de déforestation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {regions.map((region, index) => (
                        <div key={region.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-600/50 hover:bg-gray-600/70 transition-colors">
                          <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
                            index === 0 ? 'bg-red-500' :
                            index === 1 ? 'bg-orange-500' :
                            index === 2 ? 'bg-red-600' :
                            index === 3 ? 'bg-red-700' :
                            'bg-green-500'
                          }`}>
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{region.name}</div>
                            <div className="text-gray-300 text-xs">{region.location}</div>
                            <div className="text-xs text-gray-400">
                              {region.data.deforestation} déforestation • {region.data.area}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            region.data.critical 
                              ? 'bg-red-500/20 text-red-400 border border-red-500' 
                              : 'bg-green-500/20 text-green-400 border border-green-500'
                          }`}>
                            {region.data.critical ? '⚠️ Critique' : '✅ Stable'}
                          </div>
                        </div>
                      ))}
                    </div>
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

