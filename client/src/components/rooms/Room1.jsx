import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRoomSync } from '../../context/RoomSyncContext'

// Salle 1 : Empreinte Carbone - Le Mot de Passe
export default function Room1({ onSubmit }) {
  const { syncRoomState, subscribeToRoomState, getRoomState, initializeRoomState } = useRoomSync()
  const [selectedActions, setSelectedActions] = useState({
    transport: '',
    food: '',
    energy: ''
  })
  const [answer, setAnswer] = useState('')

  const actions = {
    transport: {
      title: '🚗 Transport quotidien',
      options: {
        voiture: { label: 'Voiture essence (50km)', co2: 1200 },
        train: { label: 'Train (50km)', co2: 20 },
        avion: { label: 'Avion court-courrier (50km)', co2: 1400 },
        velo: { label: 'Vélo (50km)', co2: 0 }
      }
    },
    food: {
      title: '🍽️ Alimentation',
      options: {
        boeuf: { label: 'Steak de bœuf (200g)', co2: 800 },
        poulet: { label: 'Poulet (200g)', co2: 260 },
        legumes: { label: 'Repas végétarien', co2: 80 },
        local: { label: 'Légumes locaux', co2: 40 }
      }
    },
    energy: {
      title: '⚡ Énergie domestique',
      options: {
        charbon: { label: 'Électricité charbon (10kWh)', co2: 920 },
        gaz: { label: 'Chauffage gaz naturel (10kWh)', co2: 480 },
        nucleaire: { label: 'Électricité nucléaire (10kWh)', co2: 60 },
        solaire: { label: 'Panneaux solaires (10kWh)', co2: 40 }
      }
    }
  }

  // Bonnes réponses qui donnent des indices (choix les moins polluants)
  const correctAnswers = {
    transport: 'velo',     // 0g CO2
    food: 'local',         // 40g CO2
    energy: 'solaire'      // 40g CO2
    // Total: 80g CO2
  }

  // Initialiser l'état synchronisé
  useEffect(() => {
    const existingState = getRoomState(1)
    
    if (existingState) {
      setSelectedActions(existingState.selectedActions || {
        transport: '',
        food: '',
        energy: ''
      })
      setAnswer(existingState.answer || '')
    } else {
      const initialState = {
        selectedActions: {
          transport: '',
          food: '',
          energy: ''
        },
        answer: ''
      }
      initializeRoomState(1, initialState)
    }
  }, [])

  // Synchroniser les changements d'état
  useEffect(() => {
    const unsubscribe = subscribeToRoomState(1, (stateData) => {
      if (stateData) {
        setSelectedActions(stateData.selectedActions || {
          transport: '',
          food: '',
          energy: ''
        })
        setAnswer(stateData.answer || '')
      }
    })

    return unsubscribe
  }, [subscribeToRoomState])

  const calculateTotal = () => {
    let total = 0
    if (selectedActions.transport) {
      total += actions.transport.options[selectedActions.transport].co2
    }
    if (selectedActions.food) {
      total += actions.food.options[selectedActions.food].co2
    }
    if (selectedActions.energy) {
      total += actions.energy.options[selectedActions.energy].co2
    }
    return total
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const total = calculateTotal()
    onSubmit(answer || total)
  }

  const total = calculateTotal()
  const isComplete = selectedActions.transport && selectedActions.food && selectedActions.energy
  
  // Vérifier si toutes les bonnes réponses sont sélectionnées
  const hasCorrectAnswers = 
    selectedActions.transport === correctAnswers.transport &&
    selectedActions.food === correctAnswers.food &&
    selectedActions.energy === correctAnswers.energy
  
  // Indices à afficher quand les bonnes réponses sont sélectionnées
  const clues = [
    { 
      icon: '🚗', 
      category: 'Transport écologique',
      riddle: [
        'Je suis le seul nombre qui, quand on me sert pour additionner, ne change rien.',
        'Si tu me multiplies par n\'importe quel nombre, il disparait.',
        'Je ne suis ni positif ni négatif, mais je suis pair.'
      ],
      value: 0 
    },
    { 
      icon: '🍽️', 
      category: 'Alimentation locale',
      riddle: [
        'Je suis un nombre pair, multiple de 4 et inférieur à 50.',
        'La somme de mes chiffres vaut 4.',
        'J\'ai exactement 8 diviseurs positifs.'
      ],
      value: 40 
    },
    { 
      icon: '⚡', 
      category: 'Énergie solaire',
      riddle: [
        'Dans une écriture, je suis 101000.',
        'Dans une autre (ancienne), on m\'écrit XL.',
        'Si tu me multiplies par moi-même, tu obtiens 1600.'
      ],
      value: 40 
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🔐</span>
            <div>
              <h2 className="text-3xl font-bold text-primary">Salle 1 : Empreinte Carbone</h2>
              <p className="text-gray-400">Calculez l'empreinte carbone pour trouver le code</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400">
              📋 <strong>Mission :</strong> Les agents de la corporation ont laissé des traces. 
              Calculez l'empreinte carbone de leurs activités quotidiennes. Le total (en grammes de CO2) est le code d'accès !
            </p>
          </div>
        </div>

        {/* Sélection des actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(actions).map(([key, category]) => (
            <div key={key} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
              <div className="space-y-2">
                {Object.entries(category.options).map(([optionKey, option]) => (
                  <label
                    key={optionKey}
                    className={`block p-3 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedActions[key] === optionKey
                        ? 'bg-primary/20 border-primary'
                        : 'bg-gray-800 border-transparent hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={key}
                      value={optionKey}
                      checked={selectedActions[key] === optionKey}
                      onChange={(e) => {
                        const newSelectedActions = { ...selectedActions, [key]: e.target.value }
                        setSelectedActions(newSelectedActions)
                        syncRoomState(1, {
                          selectedActions: newSelectedActions,
                          answer
                        })
                      }}
                      className="mr-3"
                    />
                    <div className="inline">
                      <div className="font-medium">{option.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Résultat et soumission */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 border-2 border-primary"
          >
            {hasCorrectAnswers ? (
              // Afficher les indices si les bonnes réponses sont sélectionnées
              <div className="mb-6">
                <div className="text-center mb-4">
                  <p className="text-primary text-lg font-semibold mb-2">
                    ✅ Bonne sélection ! Voici les indices :
                  </p>
                  <p className="text-gray-400 text-sm">
                    Additionnez les émissions de CO₂ pour trouver le code d'accès
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {clues.map((clue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="bg-primary/10 border border-primary rounded-lg p-5"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <span className="text-4xl">{clue.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-2">{clue.category}</h4>
                          <p className="text-gray-400 text-sm mb-2">Émissions de CO₂ en grammes :</p>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-yellow-400 font-semibold mb-2">🧩 Devinette :</p>
                        <ul className="space-y-1.5">
                          {clue.riddle.map((line, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
                  <p className="text-blue-400 text-sm">
                    💡 <strong>Calcul :</strong> Résolvez les trois devinettes pour trouver les nombres, 
                    puis additionnez-les pour obtenir le code d'accès (empreinte carbone totale en grammes de CO₂).
                  </p>
                </div>
              </div>
            ) : (
              // Message si les réponses ne sont pas toutes correctes
              <div className="text-center mb-6">
                <p className="text-yellow-400 mb-4">
                  🔍 Ce ne sont pas les choix les plus écologiques...
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Essayez différentes combinaisons pour débloquer les indices !
                </p>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-300 text-sm">
                    💡 <strong>Astuce :</strong> Pour sauver la planète, cherchez les options 
                    les moins polluantes dans chaque catégorie. Trouvez la bonne combinaison pour révéler 
                    les indices qui vous permettront de calculer le code.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Entrez le code d'accès (empreinte totale en grammes) :
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    const newAnswer = e.target.value
                    setAnswer(newAnswer)
                    syncRoomState(1, {
                      selectedActions,
                      answer: newAnswer
                    })
                  }}
                  placeholder="Ex: 1234"
                  className="input text-center text-2xl"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-lg">
                🔓 Valider le code
              </button>
            </form>
          </motion.div>
        )}

        {!isComplete && (
          <div className="text-center text-gray-500 py-8">
            <p>Sélectionnez une option dans chaque catégorie pour trouver les indices</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

