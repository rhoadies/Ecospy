import { useEffect, useRef } from 'react'
import { useVoice } from '../context/VoiceContext'
import { useGame } from '../context/GameContext'

// Composant invisible qui gère la lecture audio
export default function AudioManager() {
  const { peers } = useVoice()
  const { gameResult } = useGame()
  const audioElements = useRef({})
  const victoryAudioRef = useRef(null)

  // Expose a global helper to resume audio on user gesture
  useEffect(() => {
    window.resumeVoiceAudio = () => {
      Object.values(audioElements.current).forEach((audio) => {
        if (audio && audio.srcObject) {
          audio.play().catch(() => {})
        }
      })
    }

    const onFirstUserGesture = () => {
      window.resumeVoiceAudio()
      document.removeEventListener('click', onFirstUserGesture)
      document.removeEventListener('keydown', onFirstUserGesture)
    }
    document.addEventListener('click', onFirstUserGesture)
    document.addEventListener('keydown', onFirstUserGesture)

    return () => {
      document.removeEventListener('click', onFirstUserGesture)
      document.removeEventListener('keydown', onFirstUserGesture)
    }
  }, [])

  useEffect(() => {
    // Créer/mettre à jour les éléments audio pour chaque peer
    Object.entries(peers).forEach(([socketId, peer]) => {
      if (peer.stream) {
        // Créer l'élément audio s'il n'existe pas
        if (!audioElements.current[socketId]) {
          const audio = new Audio()
          audio.autoplay = true
          audio.playsInline = true
          audio.volume = 1.0
          audioElements.current[socketId] = audio
        }

        // Connecter le stream
        const audio = audioElements.current[socketId]
        if (audio.srcObject !== peer.stream) {
          audio.srcObject = peer.stream
        }
        audio.muted = peer.isMuted || false
        
        // Essayer de démarrer la lecture
        audio.play()
          .then(() => {
            // ok
          })
          .catch(() => {
            // Autoplay bloqué: on réessaiera au prochain geste utilisateur
            // et on programme un retry dans 1s
            setTimeout(() => window.resumeVoiceAudio && window.resumeVoiceAudio(), 1000)
          })
      }
    })

    // Nettoyer les anciens éléments audio
    Object.keys(audioElements.current).forEach(socketId => {
      if (!peers[socketId] || !peers[socketId].stream) {
        const audio = audioElements.current[socketId]
        if (audio) {
          audio.pause()
          audio.srcObject = null
          delete audioElements.current[socketId]
        }
      }
    })
  }, [peers])

  // Musique de victoire
  useEffect(() => {
    if (gameResult && gameResult.success !== false) {
      // Créer un son de victoire simple avec Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Créer une mélodie de victoire simple
      const playVictorySound = () => {
        const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        const duration = 0.3
        
        notes.forEach((frequency, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
            oscillator.type = 'sine'
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + duration)
          }, index * 200)
        })
      }
      
      playVictorySound()
    }
  }, [gameResult])

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      Object.values(audioElements.current).forEach(audio => {
        audio.pause()
        audio.srcObject = null
      })
      audioElements.current = {}
    }
  }, [])

  return null // Composant invisible
}

