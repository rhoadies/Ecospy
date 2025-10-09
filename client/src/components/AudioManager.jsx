import { useEffect } from 'react'
import { useGame } from '../context/GameContext'

// Composant invisible qui gère le son de victoire
export default function AudioManager() {
  const { gameResult } = useGame()

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

  return null // Composant invisible
}

