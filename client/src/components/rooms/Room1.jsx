import { useState } from 'react'
import { motion } from 'framer-motion'

// Salle 1 : 3 catégories (Transport, Énergie, Alimentation) – choisir la meilleure de chaque
export default function Room1({ onSubmit }) {
  const [selected, setSelected] = useState({ transport: '', energy: '', food: '' })
  const [answer, setAnswer] = useState('')

  const categories = {
    transport: {
      title: '🚗 Transport',
      options: {
        velo: { label: 'Vélo (50km)', co2: 0 },
        train: { label: 'Train (50km)', co2: 20 },
        voiture: { label: 'Voiture essence (50km)', co2: 1200 },
        avion: { label: 'Avion court-courrier (50km)', co2: 1400 }
      }
    },
    energy: {
      title: '⚡ Énergie',
      options: {
        solaire: { label: 'Électricité solaire (10kWh)', co2: 40 },
        nucleaire: { label: 'Électricité nucléaire (10kWh)', co2: 60 },
        gaz: { label: 'Chauffage gaz naturel (10kWh)', co2: 480 },
        charbon: { label: 'Électricité charbon (10kWh)', co2: 920 }
      }
    },
    food: {
      title: '🍽️ Alimentation',
      options: {
        local: { label: 'Légumes locaux', co2: 40 },
        legumes: { label: 'Repas végétarien', co2: 80 },
        poulet: { label: 'Poulet (200g)', co2: 260 },
        boeuf: { label: 'Steak de bœuf (200g)', co2: 800 }
      }
    }
  }

  const isComplete = selected.transport && selected.energy && selected.food

  const handleChange = (category, value) => {
    setSelected(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(answer)
  }

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
              <p className="text-gray-400">Choisissez 1 option dans chaque catégorie, puis entrez le total (g CO₂)</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400">
              📋 <strong>Mission :</strong> Sélectionnez la <strong>meilleure option</strong> (la plus sobre en CO₂)
              dans chaque catégorie <strong>(Transport, Énergie, Alimentation)</strong>. Les quantités de CO₂ ne sont
              <strong> pas affichées</strong>. Calculez ensuite le <strong>total en grammes</strong> et entrez-le comme code.
            </p>
          </div>
        </div>

        {/* Catégories */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(categories).map(([catKey, cat]) => (
            <div key={catKey} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">{cat.title}</h3>
              <div className="space-y-2">
                {Object.entries(cat.options).map(([optKey, opt]) => (
                  <label
                    key={optKey}
                    className={`block p-3 rounded-lg cursor-pointer transition-all border-2 ${
                      selected[catKey] === optKey ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-transparent hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={catKey}
                      value={optKey}
                      checked={selected[catKey] === optKey}
                      onChange={(e) => handleChange(catKey, e.target.value)}
                      className="mr-3"
                    />
                    <div className="inline">
                      <div className="font-medium">{opt.label}</div>
                      {/* CO₂ hidden by design */}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Saisie du total */}
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 border-2 border-primary"
          >
            {/* Récapitulatif des choix avec CO2 affiché par option, sans total */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Object.entries(categories).map(([catKey, cat]) => {
                const optKey = selected[catKey]
                const opt = cat.options[optKey]
                return (
                  <div key={catKey} className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">{cat.title}</div>
                    <div className="font-semibold">{opt?.label || '—'}</div>
                    {opt && (
                      <div className="text-xs text-gray-400 mt-1">{opt.co2} g CO₂</div>
                    )}
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code d'accès (total en g CO₂)</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Ex: 180"
                  className="input text-center text-2xl"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-lg">
                🔓 Valider le code
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Sélectionnez 1 option dans chaque catégorie pour continuer.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

