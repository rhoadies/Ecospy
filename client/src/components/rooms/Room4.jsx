import { useState } from 'react'
import { motion } from 'framer-motion'

// Salle 4 : Mix Énergétique Final
export default function Room4({ onSubmit }) {
  const [energyMix, setEnergyMix] = useState({
    solaire: 0,
    eolien: 0,
    hydraulique: 0,
    nucleaire: 0,
    gaz: 0,
    charbon: 0
  })

  const energySources = {
    solaire: {
      name: 'Solaire',
      icon: '☀️',
      co2: 0.05, // kg CO2/kWh
      cost: 60,
      color: 'bg-yellow-500'
    },
    eolien: {
      name: 'Éolien',
      icon: '💨',
      co2: 0.01,
      cost: 50,
      color: 'bg-cyan-500'
    },
    hydraulique: {
      name: 'Hydraulique',
      icon: '💧',
      co2: 0.02,
      cost: 40,
      color: 'bg-blue-500'
    },
    nucleaire: {
      name: 'Nucléaire',
      icon: '⚛️',
      co2: 0.06,
      cost: 100,
      color: 'bg-purple-500'
    },
    gaz: {
      name: 'Gaz naturel',
      icon: '🔥',
      co2: 0.49,
      cost: 70,
      color: 'bg-orange-500'
    },
    charbon: {
      name: 'Charbon',
      icon: '⚫',
      co2: 0.82,
      cost: 80,
      color: 'bg-gray-700'
    }
  }

  const handleSliderChange = (source, value) => {
    setEnergyMix({ ...energyMix, [source]: parseInt(value) })
  }

  const getTotalPercentage = () => {
    return Object.values(energyMix).reduce((sum, val) => sum + val, 0)
  }

  const getTotalCO2 = () => {
    let total = 0
    Object.entries(energyMix).forEach(([source, percentage]) => {
      total += (percentage / 100) * energySources[source].co2
    })
    return total.toFixed(3)
  }

  const getRenewablePercentage = () => {
    return energyMix.solaire + energyMix.eolien + energyMix.hydraulique
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const renewable = getRenewablePercentage()
    onSubmit(renewable.toString())
  }

  const totalPercentage = getTotalPercentage()
  const isValid = totalPercentage === 100
  const renewablePercentage = getRenewablePercentage()
  const co2Total = getTotalCO2()

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
            <span className="text-5xl">⚡</span>
            <div>
              <h2 className="text-3xl font-bold text-primary">Salle 4 : Mix Énergétique Final</h2>
              <p className="text-gray-400">Optimisez la production d'énergie pour le code final</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400">
              📋 <strong>Mission finale :</strong> Créez un mix énergétique optimal. 
              Le pourcentage total d'énergies renouvelables est le code final !
            </p>
            <p className="text-yellow-300 text-sm mt-2">
              🎯 Objectif : Atteindre 100% de production totale avec au moins 60% de renouvelables
            </p>
          </div>
        </div>

        {/* Status bars */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Production totale</p>
              <p className={`text-3xl font-bold ${
                totalPercentage === 100 ? 'text-primary' : 
                totalPercentage > 100 ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {totalPercentage}%
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Énergies renouvelables</p>
              <p className={`text-3xl font-bold ${
                renewablePercentage >= 60 ? 'text-primary' : 'text-yellow-500'
              }`}>
                {renewablePercentage}%
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Émissions CO₂</p>
              <p className={`text-3xl font-bold ${
                parseFloat(co2Total) < 0.2 ? 'text-primary' : 'text-red-500'
              }`}>
                {co2Total} kg
              </p>
              <p className="text-xs text-gray-500">par kWh produit</p>
            </div>
          </div>
        </div>

        {/* Energy sliders */}
        <div className="space-y-4 mb-8">
          {Object.entries(energySources).map(([key, source]) => {
            const isRenewable = ['solaire', 'eolien', 'hydraulique'].includes(key)
            
            return (
              <div key={key} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{source.icon}</span>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {source.name}
                        {isRenewable && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            ♻️ Renouvelable
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {source.co2} kg CO₂/kWh
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold w-20 text-right">
                    {energyMix[key]}%
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={energyMix[key]}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                    className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        ${source.color.replace('bg-', '#')} 0%, 
                        ${source.color.replace('bg-', '#')} ${energyMix[key]}%, 
                        #374151 ${energyMix[key]}%, 
                        #374151 100%)`
                    }}
                  />
                  <button
                    onClick={() => setEnergyMix({ ...energyMix, [key]: 0 })}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    Reset
                  </button>
                </div>

                {/* Bar de progression visuelle */}
                <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${source.color} transition-all duration-300`}
                    style={{ width: `${energyMix[key]}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Validation */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className={`rounded-lg p-6 border-2 ${
              renewablePercentage >= 60 ? 'bg-primary/10 border-primary' : 'bg-yellow-500/10 border-yellow-500'
            }`}>
              <div className="text-center mb-4">
                <p className="text-gray-400 mb-2">Code final (% d'énergies renouvelables) :</p>
                <div className={`text-5xl font-bold ${
                  renewablePercentage >= 60 ? 'text-primary' : 'text-yellow-500'
                }`}>
                  {renewablePercentage}%
                </div>
              </div>

              {renewablePercentage >= 60 ? (
                <div className="text-center mb-4">
                  <p className="text-primary font-semibold">
                    ✅ Excellent ! Vous avez créé un mix énergétique durable !
                  </p>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <p className="text-yellow-500">
                    ⚠️ Essayez d'atteindre au moins 60% de renouvelables pour une mission réussie
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <button type="submit" className="w-full btn-primary py-4 text-lg">
                  🏆 Terminer la mission
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {!isValid && (
          <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">
              Ajustez les curseurs pour atteindre exactement 100% de production
            </p>
            <p className={`text-2xl font-bold mt-2 ${
              totalPercentage > 100 ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {totalPercentage > 100 ? 'Trop de production !' : `Manque ${100 - totalPercentage}%`}
            </p>
          </div>
        )}

        {/* Info éducative */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Transition énergétique</h3>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• En 2023, les renouvelables représentaient 30% de la production mondiale d'électricité</li>
            <li>• L'objectif européen est d'atteindre 42,5% de renouvelables d'ici 2030</li>
            <li>• Le solaire et l'éolien sont désormais les énergies les moins chères à produire</li>
            <li>• La France vise la neutralité carbone d'ici 2050</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

