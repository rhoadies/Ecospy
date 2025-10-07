import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { motion } from 'framer-motion'

export default function Debriefing() {
  const navigate = useNavigate()
  const { gameResult, resetGame } = useGame()

  useEffect(() => {
    if (!gameResult) {
      navigate('/')
    }
  }, [gameResult, navigate])

  if (!gameResult) return null

  const isSuccess = gameResult.success !== false
  const minutes = Math.floor(gameResult.finalTime / 60)
  const seconds = gameResult.finalTime % 60

  const handlePlayAgain = () => {
    resetGame()
    navigate('/')
  }

  const educationalContent = {
    carbonFootprint: {
      title: "🌡️ Empreinte Carbone",
      points: [
        "L'empreinte carbone moyenne d'un Français : ~10 tonnes CO₂/an",
        "Objectif 2050 pour le climat : 2 tonnes CO₂/an/personne",
        "Les transports représentent 31% des émissions en France",
        "Passer au vélo pour les trajets courts peut économiser 2,5 kg CO₂/trajet"
      ]
    },
    oceanPollution: {
      title: "🌊 Pollution Océanique",
      points: [
        "8 millions de tonnes de plastique dans les océans chaque année",
        "5 000 milliards de morceaux de plastique flottent à la surface",
        "Plus de 800 espèces marines impactées par les déchets plastiques",
        "Solution : réduire, réutiliser, recycler + ramasser les déchets"
      ]
    },
    deforestation: {
      title: "🌳 Déforestation",
      points: [
        "10 millions d'hectares de forêts perdus chaque année",
        "La déforestation = 15% des émissions mondiales de gaz à effet de serre",
        "80% de la biodiversité terrestre vit dans les forêts",
        "Actions : consommer responsable, soutenir la reforestation"
      ]
    },
    energy: {
      title: "⚡ Transition Énergétique",
      points: [
        "Les énergies renouvelables sont désormais compétitives",
        "Le solaire et l'éolien : énergies les moins chères en 2024",
        "Objectif France : neutralité carbone en 2050",
        "Chacun peut agir : économies d'énergie, isolation, électricité verte"
      ]
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl w-full"
      >
        {/* Résultat */}
        <div className={`card mb-8 text-center ${
          isSuccess ? 'border-2 border-primary' : 'border-2 border-red-500'
        }`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-6"
          >
            {isSuccess ? '🎉' : '⏰'}
          </motion.div>

          <h1 className={`text-5xl font-bold mb-4 ${
            isSuccess ? 'text-primary' : 'text-red-500'
          }`}>
            {isSuccess ? 'Mission Accomplie !' : 'Mission Échouée'}
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            {isSuccess 
              ? 'Vous avez réussi à infiltrer la base et récupérer les données !'
              : 'Le temps s\'est écoulé avant la fin de la mission...'}
          </p>

          {/* Temps */}
          <div className="bg-gray-900 rounded-lg p-6 inline-block">
            <p className="text-gray-400 mb-2">Temps de mission</p>
            <p className="text-4xl font-mono font-bold">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              sur {Math.floor(gameResult.maxTime / 60)} minutes maximum
            </p>
          </div>

          {/* Performance */}
          {isSuccess && (
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-sm text-gray-400">Performance</div>
                <div className="text-2xl font-bold text-primary">
                  {gameResult.finalTime < 900 ? 'Excellent' : 
                   gameResult.finalTime < 1200 ? 'Très bien' : 
                   gameResult.finalTime < 1500 ? 'Bien' : 'Accompli'}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">🧩</div>
                <div className="text-sm text-gray-400">Énigmes résolues</div>
                <div className="text-2xl font-bold text-primary">4/4</div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-sm text-gray-400">Joueurs</div>
                <div className="text-2xl font-bold text-primary">
                  {gameResult.players?.length || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Débriefing éducatif */}
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">📚 Ce que vous avez appris</h2>
            <p className="text-gray-400">
              Découvrez les enjeux environnementaux abordés dans cette mission
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.values(educationalContent).map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-900 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold mb-4 text-primary">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.points.map((point, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Actions concrètes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-primary/10 border-2 border-primary rounded-lg p-6"
          >
            <h3 className="text-2xl font-bold mb-4 text-center">
              🌍 Comment agir au quotidien ?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">🚴 Transports</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Privilégier le vélo/transports en commun</li>
                  <li>• Covoiturage pour les longs trajets</li>
                  <li>• Limiter les vols en avion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">🍽️ Alimentation</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Réduire la viande rouge</li>
                  <li>• Acheter local et de saison</li>
                  <li>• Éviter le gaspillage alimentaire</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">♻️ Déchets</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Trier et recycler</li>
                  <li>• Refuser le plastique jetable</li>
                  <li>• Réparer plutôt que jeter</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">⚡ Énergie</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Éteindre les appareils inutilisés</li>
                  <li>• Isoler son logement</li>
                  <li>• Choisir un fournisseur d'énergie verte</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Ressources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-3">🔗 Pour aller plus loin</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                • <strong>ADEME</strong> – Agence de la transition écologique
                {' '}<a
                  href="https://www.ademe.fr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-green-400"
                >ademe.fr</a>
              </p>
              <p>
                • <strong>GIEC</strong> – Groupe d'experts intergouvernemental sur l'évolution du climat
                {' '}<a
                  href="https://www.ipcc.ch/languages-2/francais/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-green-400"
                >ipcc.ch</a>
              </p>
              <p>
                • <strong>Bon Pote</strong> – Vulgarisation scientifique du climat
                {' '}<a
                  href="https://bonpote.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-green-400"
                >bonpote.com</a>
              </p>
              <p>
                • <strong>NASA Climate</strong> – Données et indicateurs climatiques
                {' '}<a
                  href="https://climate.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-green-400"
                >climate.nasa.gov</a>
              </p>
            </div>
          </motion.div>

          {/* Boutons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="flex-1 btn-primary py-4 text-lg"
            >
              🔄 Rejouer
            </button>
            <button
              onClick={() => window.close()}
              className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-lg"
            >
              ✕ Quitter
            </button>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 text-gray-500"
        >
          <p className="mb-2">
            Merci d'avoir joué à EcoSpy - Mission Climat ! 🌍
          </p>
          <p className="text-sm">
            Workshop M1 2025-2026 • EPSI/WIS
          </p>
          <p className="text-xs mt-2">
            Chaque action compte pour préserver notre planète 💚
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

