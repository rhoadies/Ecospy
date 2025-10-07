import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSocket } from '../../context/SocketContext'
import { useGame } from '../../context/GameContext'

// Salle 3 : Énigme Coopérative - Carte de Déforestation
export default function Room3({ onSubmit }) {
  const { socket } = useSocket()
  const { roomCode, room } = useGame()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [sharedClues, setSharedClues] = useState([])
  const [myClue, setMyClue] = useState(null)
  // Quiz additionnel: mêmes principes que la 1ère question (choix uniques)
  const [answers, setAnswers] = useState({}) // { [qIndex]: optionKey }

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
    }
  ]

  useEffect(() => {
    // Attribuer un indice aléatoire à ce joueur
    const clues = [
      { text: 'La région la plus critique a perdu 17% de sa surface', hint: 'amazonie' },
      { text: 'Le "poumon de la Terre" est menacé', hint: 'amazonie' },
      { text: 'La plus grande forêt tropicale du monde est en danger', hint: 'amazonie' },
      { text: 'Cette région représente 10% de la biodiversité mondiale', hint: 'amazonie' }
    ]
    
    const randomClue = clues[Math.floor(Math.random() * clues.length)]
    setMyClue(randomClue)
  }, [])

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
      socket.emit('share-clue', {
        roomCode,
        playerId: socket.id,
        clueData: myClue.text
      })
      setSharedClues(prev => [...prev, myClue.text])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedRegion && isQuizComplete) {
      onSubmit(selectedRegion)
    }
  }

  // Banque de questions (réponses uniques)
  const questions = [
    {
      title: 'Quelle action a le plus d\'impact pour protéger les forêts ? ',
      options: {
        a: 'Réduire la consommation de viande',
        b: 'Recycler le papier uniquement',
        c: 'Utiliser des sacs plastiques réutilisables seulement'
      },
      correct: 'a'
    },
    {
      title: 'La déforestation contribue à environ quel pourcentage des émissions mondiales ?',
      options: { a: '5%', b: '15%', c: '40%' },
      correct: 'b'
    },
    {
      title: 'Quel écosystème absorbe le plus de CO₂ ?',
      options: { a: 'Forêts', b: 'Déserts', c: 'Villes' },
      correct: 'a'
    }
  ]

  const isQuizComplete = questions.every((_, idx) => Boolean(answers[idx]))
  const selectAnswer = (qIndex, key) => {
    setAnswers(prev => ({ ...prev, [qIndex]: key }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🗺️</span>
            <div>
              <h2 className="text-3xl font-bold text-primary">Salle 3 : Carte de Déforestation</h2>
              <p className="text-gray-400">Énigme coopérative - Travaillez en équipe !</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">
              🤝 <strong>Coopération requise :</strong> Chaque joueur a un indice différent. 
              Partagez vos indices avec l'équipe via le chat ou le bouton ci-dessous pour identifier 
              la région la plus critique !
            </p>
          </div>
        </div>

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
                className="w-full btn-secondary"
                disabled={!myClue}
              >
                📢 Partager mon indice avec l'équipe
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">
                💬 Indices partagés ({sharedClues.length})
              </h3>
              
              {sharedClues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  En attente des indices de l'équipe...
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
                👥 <strong>{room?.players?.length || 0} joueur(s)</strong> dans l'équipe. 
                Chacun a un indice différent !
              </p>
            </div>
          </div>

          {/* Sélection de la région + Quiz */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">🌍 Sélectionnez la région critique</h3>
                
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
                        onChange={(e) => setSelectedRegion(e.target.value)}
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

              {/* Quiz additionnel */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">🧩 Questions complémentaires</h3>
                <div className="space-y-4">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="font-semibold mb-3">{qIndex + 1}. {q.title}</div>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {Object.entries(q.options).map(([key, label]) => (
                          <label
                            key={key}
                            className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                              answers[qIndex] === key ? 'bg-primary/20 border-primary' : 'bg-gray-900 border-transparent hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              value={key}
                              checked={answers[qIndex] === key}
                              onChange={() => selectAnswer(qIndex, key)}
                              className="mr-2"
                            />
                            <span className="align-middle">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Sélectionnez une réponse pour chaque question.</p>
              </div>

              <button
                type="submit"
                disabled={!selectedRegion || !isQuizComplete}
                className="w-full btn-primary py-4 text-lg"
              >
                🔓 Valider la région
              </button>
            </form>

            {/* Info éducative */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">💡 À savoir</h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• 10 millions d'hectares de forêt disparaissent chaque année</li>
                <li>• La déforestation contribue à 15% des émissions de gaz à effet de serre</li>
                <li>• 80% des espèces terrestres vivent dans les forêts</li>
                <li>• Les forêts absorbent 2 milliards de tonnes de CO₂ par an</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

