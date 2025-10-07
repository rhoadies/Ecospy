import { useState } from 'react'
import { motion } from 'framer-motion'

// Salle 1 : Choisir les 3 meilleures options et calculer le total
export default function Room1({ onSubmit }) {
  const [selectedKeys, setSelectedKeys] = useState([]) // three selections max
  const [answer, setAnswer] = useState('')

  // Options proposées (valeurs en grammes de CO2)
  const options = [
    { key: 'velo', label: 'Vélo (50km)', co2: 0 },
    { key: 'train', label: 'Train (50km)', co2: 20 },
    { key: 'local', label: 'Légumes locaux', co2: 40 },
    { key: 'solaire', label: 'Électricité solaire (10kWh)', co2: 40 },
    { key: 'nucleaire', label: 'Électricité nucléaire (10kWh)', co2: 60 },
    { key: 'legumes', label: 'Repas végétarien', co2: 80 },
    { key: 'poulet', label: 'Poulet (200g)', co2: 260 },
    { key: 'gaz', label: 'Chauffage gaz naturel (10kWh)', co2: 480 },
    { key: 'boeuf', label: 'Steak de bœuf (200g)', co2: 800 },
    { key: 'voiture', label: 'Voiture essence (50km)', co2: 1200 },
    { key: 'avion', label: 'Avion court-courrier (50km)', co2: 1400 }
  ]

  const toggleSelect = (key) => {
    setSelectedKeys(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key)
      if (prev.length >= 3) return prev // max 3
      return [...prev, key]
    })
  }

  const isComplete = selectedKeys.length === 3

  const hiddenTotal = selectedKeys.reduce((sum, key) => {
    const opt = options.find(o => o.key === key)
    return sum + (opt ? opt.co2 : 0)
  }, 0)

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
              <h2 className="text-3xl font-bold text-primary">Salle 1 : Choix éco-responsables</h2>
              <p className="text-gray-400">Choisissez les 3 meilleures options pour réduire le réchauffement</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400">
              📋 <strong>Mission :</strong> Sélectionnez <strong>3 options</strong> parmi la liste ci-dessous.
              Les valeurs CO₂ ne sont pas affichées avant d'avoir choisi 3 options. Ensuite, <strong>calculez le total</strong> (en grammes) et entrez-le comme code.
            </p>
          </div>
        </div>

        {/* Liste des options (sans CO₂ affiché) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {options.map((opt) => {
            const selected = selectedKeys.includes(opt.key)
            return (
              <button
                key={opt.key}
                onClick={() => toggleSelect(opt.key)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selected ? 'bg-primary/20 border-primary' : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                {!isComplete && (
                  <div className="text-xs text-gray-500 mt-1">Sélectionnez jusqu'à 3 options</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Saisie du total une fois 3 options choisies */}
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 border-2 border-primary"
          >
            <div className="text-center mb-4">
              <p className="text-gray-300">
                Vous avez sélectionné <strong>{selectedKeys.length}</strong> options. Calculez le <strong>total en grammes de CO₂</strong> et saisissez-le ci-dessous.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code d'accès (total en g CO₂)</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Ex: 60"
                  className="input text-center text-2xl"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-lg">
                🔓 Valider le code
              </button>

              <p className="text-xs text-gray-500 text-center">
                Astuce: additionnez mentalement; les valeurs réelles sont 0g, 20g, 40g pour les meilleures options.
              </p>
            </form>
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Choisissez 3 options. Les valeurs CO₂ seront révélées après.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

