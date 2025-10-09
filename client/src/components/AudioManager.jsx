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
      // Créer un son de victoire avec Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        // Créer une mélodie de victoire (fanfare)
        const playVictorySound = () => {
          const notes = [
            { freq: 523.25, duration: 0.15 }, // C5
            { freq: 587.33, duration: 0.15 }, // D5
            { freq: 659.25, duration: 0.15 }, // E5
            { freq: 783.99, duration: 0.3 },  // G5
            { freq: 659.25, duration: 0.15 }, // E5
            { freq: 783.99, duration: 0.5 }   // G5 (longue)
          ]
          
          let currentTime = 0
          notes.forEach((note) => {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime)
              oscillator.type = 'triangle'
              
              gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration)
              
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + note.duration)
            }, currentTime * 1000)
            
            currentTime += note.duration
          })
        }
        
        // Attendre un peu avant de jouer le son
        setTimeout(() => {
          playVictorySound()
        }, 500)
      } catch (error) {
        console.error('Erreur lors de la lecture du son de victoire:', error)
      }
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

