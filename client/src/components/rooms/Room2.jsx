import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRoomSync } from '../../context/RoomSyncContext'

// Salle 2 : Memory Game - Pollution Océanique
export default function Room2({ onSubmit }) {
  const { syncRoomState, subscribeToRoomState, getRoomState, initializeRoomState } = useRoomSync()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  const cardPairs = [
    { id: 1, type: 'waste', value: 'Bouteille plastique', icon: '🍾', info: '450 ans' },
    { id: 2, type: 'time', value: '450 ans', icon: '⏰', info: 'Bouteille plastique' },
    { id: 3, type: 'waste', value: 'Sac plastique', icon: '🛍️', info: '20 ans' },
    { id: 4, type: 'time', value: '20 ans', icon: '⏰', info: 'Sac plastique' },
    { id: 5, type: 'waste', value: 'Mégot', icon: '🚬', info: '2 ans' },
    { id: 6, type: 'time', value: '2 ans', icon: '⏰', info: 'Mégot' },
    { id: 7, type: 'waste', value: 'Canette alu', icon: '🥫', info: '200 ans' },
    { id: 8, type: 'time', value: '200 ans', icon: '⏰', info: 'Canette alu' },
    { id: 9, type: 'waste', value: 'Polystyrène', icon: '📦', info: '500 ans' },
    { id: 10, type: 'time', value: '500 ans', icon: '⏰', info: 'Polystyrène' },
    { id: 11, type: 'waste', value: 'Fil de pêche', icon: '🎣', info: '600 ans' },
    { id: 12, type: 'time', value: '600 ans', icon: '⏰', info: 'Fil de pêche' },
    { id: 13, type: 'waste', value: 'Bouteille verre', icon: '🍷', info: '4000 ans' },
    { id: 14, type: 'time', value: '4000 ans', icon: '⏰', info: 'Bouteille verre' },
    { id: 15, type: 'waste', value: 'Couche bébé', icon: '👶', info: '500 ans' },
    { id: 16, type: 'time', value: '500 ans', icon: '⏰', info: 'Couche bébé' },
  ]

  useEffect(() => {
    // Vérifier s'il y a déjà un état synchronisé
    const existingState = getRoomState(2)
    
    if (existingState) {
      // Utiliser l'état existant
      setCards(existingState.cards)
      setFlipped(existingState.flipped || [])
      setMatched(existingState.matched || [])
      setMoves(existingState.moves || 0)
    } else {
      // Initialiser avec un état aléatoire mais déterministe
      // Utiliser une graine basée sur le timestamp pour que tous les joueurs aient le même mélange
      const seed = Math.floor(Date.now() / 1000) // Graine basée sur les secondes
      const shuffled = [...cardPairs].sort((a, b) => {
        // Fonction de mélange déterministe basée sur la graine
        const hashA = (a.id * seed) % 1000
        const hashB = (b.id * seed) % 1000
        return hashA - hashB
      })
      
      const initialState = {
        cards: shuffled,
        flipped: [],
        matched: [],
        moves: 0
      }
      
      setCards(shuffled)
      initializeRoomState(2, initialState)
    }
  }, [])

  // Synchroniser les changements d'état (sans créer de boucles)
  useEffect(() => {
    const unsubscribe = subscribeToRoomState(2, (stateData) => {
      if (stateData) {
        // Ne synchroniser que si l'état est différent pour éviter les boucles
        if (JSON.stringify(stateData.cards) !== JSON.stringify(cards)) {
          setCards(stateData.cards || [])
        }
        if (JSON.stringify(stateData.flipped) !== JSON.stringify(flipped)) {
          setFlipped(stateData.flipped || [])
        }
        if (JSON.stringify(stateData.matched) !== JSON.stringify(matched)) {
          setMatched(stateData.matched || [])
        }
        if (stateData.moves !== moves) {
          setMoves(stateData.moves || 0)
        }
      }
    })

    return unsubscribe
  }, [subscribeToRoomState, cards, flipped, matched, moves])

  // Logique de vérification des paires avec synchronisation différée
  useEffect(() => {
    if (flipped.length === 2) {
      const newMoves = moves + 1
      setMoves(newMoves)
      const [first, second] = flipped
      const firstCard = cards[first]
      const secondCard = cards[second]

      // Vérifier si c'est une paire (l'info de l'un correspond à la valeur de l'autre)
      if (
        (firstCard.type === 'waste' && secondCard.type === 'time' && firstCard.info === secondCard.value) ||
        (firstCard.type === 'time' && secondCard.type === 'waste' && firstCard.info === secondCard.value)
      ) {
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        
        // Synchroniser après la mise à jour de l'état
        setTimeout(() => {
          syncRoomState(2, {
            cards,
            flipped: [],
            matched: newMatched,
            moves: newMoves
          })
        }, 100)
      } else {
        setTimeout(() => {
          setFlipped([])
          // Synchroniser après le timeout
          setTimeout(() => {
            syncRoomState(2, {
              cards,
              flipped: [],
              matched,
              moves: newMoves
            })
          }, 100)
        }, 1000)
      }
    }
  }, [flipped, cards, matched, moves, syncRoomState])

  useEffect(() => {
    // Vérifier si toutes les paires sont trouvées
    if (matched.length === cards.length && cards.length > 0) {
      setTimeout(() => {
        onSubmit('8') // 8 paires
      }, 1000)
    }
  }, [matched, cards])

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return
    }
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    
    // Synchroniser seulement le clic, pas toute la logique de jeu
    syncRoomState(2, {
      cards,
      flipped: newFlipped,
      matched,
      moves
    })
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
            <span className="text-3xl md:text-4xl">🌊</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Salle 2 : Océan Pollué</h2>
              <p className="text-gray-400 text-sm md:text-base">Associez les déchets à leur durée de décomposition</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mb-3">
            <p className="text-yellow-400 text-sm">
              📋 <strong>Mission :</strong> Les océans sont envahis de déchets. Associez chaque déchet 
              à son temps de décomposition dans l'océan pour débloquer l'accès !
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 justify-center">
            <div className="bg-gray-900 px-6 py-3 rounded-lg">
              <span className="text-gray-400">Coups :</span>
              <span className="ml-2 text-2xl font-bold text-white">{moves}</span>
            </div>
            <div className="bg-gray-900 px-6 py-3 rounded-lg">
              <span className="text-gray-400">Trouvées :</span>
              <span className="ml-2 text-2xl font-bold text-primary">{matched.length / 2}/8</span>
            </div>
          </div>
        </div>

        {/* Memory Grid: 4 x 4 (always 4 columns, 4 rows) - smaller cards */}
        <div className="grid grid-cols-4 gap-2 mb-4 max-w-[640px] mx-auto">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index)
            const isMatched = matched.includes(index)

            return (
              <motion.div
                key={index}
                whileHover={{ scale: isMatched ? 1 : 1.05 }}
                whileTap={{ scale: isMatched ? 1 : 0.95 }}
                onClick={() => handleCardClick(index)}
                className={`relative aspect-square cursor-pointer ${
                  isMatched ? 'cursor-default' : ''
                }`}
              >
                <div
                  className={`w-full h-full rounded-lg transition-all duration-300 transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Face arrière (back) - color by type to distinguish time vs object */}
                  <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-center text-3xl ${
                      isMatched
                        ? 'bg-primary'
                        : card.type === 'time'
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    } backface-hidden`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    🌊
                  </div>

                  {/* Face avant (front) - neutral style */}
                  <div
                    className={`absolute inset-0 rounded-lg p-1.5 flex flex-col items-center justify-center text-center ${
                      isMatched ? 'bg-primary/20 border-2 border-primary' : 'bg-gray-800 text-white'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="text-2xl mb-0.5">{card.icon}</div>
                    <div className="text-[10px] md:text-xs font-semibold leading-tight">
                      {card.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Info éducative */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Le saviez-vous ?</h3>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Chaque année, 8 millions de tonnes de plastique finissent dans les océans</li>
            <li>• D'ici 2050, il y aura plus de plastique que de poissons dans l'océan (en poids)</li>
            <li>• Les micro-plastiques sont retrouvés dans 90% des oiseaux marins</li>
            <li>• Une seule bouteille plastique peut se fragmenter en 10 000 micro-plastiques</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

