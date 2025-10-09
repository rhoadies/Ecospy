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
                      <div className="text-sm text-gray-400">
                        {option.co2}g CO₂
                      </div>
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
            <div className="text-center mb-6">
              <p className="text-gray-400 mb-2">Empreinte carbone totale calculée :</p>
              <div className="text-5xl font-bold text-primary">
                {total}g CO₂
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Soit {(total / 1000).toFixed(2)} kg de CO₂ pour une seule journée
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                💡 <strong>Info pédagogique :</strong> En France, l'empreinte carbone moyenne est de 
                ~10 tonnes de CO₂ par an et par personne. L'objectif pour limiter le réchauffement 
                climatique à 1,5°C est de descendre à 2 tonnes par an d'ici 2050.
              </p>
            </div>

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
            <p>Sélectionnez une option dans chaque catégorie pour calculer l'empreinte carbone</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

