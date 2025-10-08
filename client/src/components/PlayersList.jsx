import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function PlayersList() {
  const { room, playerName } = useGame()
  const [collapsed, setCollapsed] = useState(false)

  if (!room || !room.players) return null

  return (
    <>
      {/* Collapsed toggle button (shown when panel is collapsed, especially on mobile) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed left-2 top-20 z-30 px-2 py-1 rounded-full bg-gray-900/90 border border-gray-700 text-white text-sm shadow"
          aria-label="Afficher l'équipe"
        >
          👥 Équipe
        </button>
      )}

      {!collapsed && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-2 top-20 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 p-3 z-30 min-w-[160px] max-w-[220px] shadow-xl"
        >
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <h3 className="font-bold text-white text-sm">Équipe</h3>
            <p className="text-xs text-gray-400">{room.players.length} joueur(s)</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
          aria-label="Réduire"
          title="Réduire"
        >
          ⤫
        </button>
      </div>

      <div className="space-y-1.5">
        {room.players.map((player, index) => {
          const isMe = player.name === playerName
          // Retrouver l'entrée peer par nom (côté écouteur on n'a pas forcement le socketId)
          const isInVoice = false
          const isPlayerSpeaking = false

          return (
            <motion.div
              key={player.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                isPlayerSpeaking 
                  ? 'bg-primary/20 ring-2 ring-primary/50' 
                  : 'bg-gray-800/50'
              }`}
            >
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                isPlayerSpeaking 
                  ? 'bg-primary scale-110 ring-4 ring-primary/30' 
                  : isInVoice
                  ? 'bg-gray-600'
                  : 'bg-gray-700'
              }`}>
                {player.isHost && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
                    👑
                  </div>
                )}
                👤
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate text-white leading-5">
                    {player.name}
                    {isMe && <span className="text-primary ml-1">(Vous)</span>}
                  </p>
                  {player.isHost && (
                    <span className="text-[10px] text-yellow-500">Hôte</span>
                  )}
                </div>
                
                {/* Voice status removed */}
              </div>

              {/* Voice indicators removed */
              }
            </motion.div>
          )
        })}
      </div>

      {/* Voice status removed */}
        </motion.div>
      )}
    </>
  )
}

