import { createContext, useContext, useEffect, useRef } from 'react'
import { useSocket } from './SocketContext'
import { useGame } from './GameContext'

const RoomSyncContext = createContext()

export function RoomSyncProvider({ children }) {
  const { socket } = useSocket()
  const { roomCode, currentRoom } = useGame()
  const roomStates = useRef({})
  const listeners = useRef({})

  // Écouter les synchronisations d'état
  useEffect(() => {
    if (!socket || !roomCode) return

    const handleRoomStateSync = ({ roomNumber, stateData, fromPlayer }) => {
      // Ignorer les mises à jour de notre propre joueur
      if (fromPlayer === socket.id) return

      // Mettre à jour l'état de la salle
      roomStates.current[roomNumber] = stateData

      // Notifier les listeners
      if (listeners.current[roomNumber]) {
        listeners.current[roomNumber].forEach(callback => {
          callback(stateData)
        })
      }
    }

    socket.on('room-state-sync', handleRoomStateSync)

    return () => {
      socket.off('room-state-sync', handleRoomStateSync)
    }
  }, [socket, roomCode])

  // Fonction pour synchroniser l'état d'une salle
  const syncRoomState = (roomNumber, stateData) => {
    if (!socket || !roomCode) return

    // Mettre à jour l'état local
    roomStates.current[roomNumber] = stateData

    // Diffuser aux autres joueurs
    socket.emit('room-state-update', {
      roomCode,
      roomNumber,
      stateData
    })
  }

  // Fonction pour s'abonner aux changements d'état d'une salle
  const subscribeToRoomState = (roomNumber, callback) => {
    if (!listeners.current[roomNumber]) {
      listeners.current[roomNumber] = []
    }
    listeners.current[roomNumber].push(callback)

    // Retourner une fonction de désabonnement
    return () => {
      if (listeners.current[roomNumber]) {
        listeners.current[roomNumber] = listeners.current[roomNumber].filter(
          cb => cb !== callback
        )
      }
    }
  }

  // Fonction pour obtenir l'état actuel d'une salle
  const getRoomState = (roomNumber) => {
    return roomStates.current[roomNumber] || null
  }

  // Fonction pour initialiser l'état d'une salle (généralement appelée par le premier joueur)
  const initializeRoomState = (roomNumber, initialState) => {
    if (!roomStates.current[roomNumber]) {
      roomStates.current[roomNumber] = initialState
      syncRoomState(roomNumber, initialState)
    }
  }

  const value = {
    syncRoomState,
    subscribeToRoomState,
    getRoomState,
    initializeRoomState
  }

  return (
    <RoomSyncContext.Provider value={value}>
      {children}
    </RoomSyncContext.Provider>
  )
}

export function useRoomSync() {
  const context = useContext(RoomSyncContext)
  if (!context) {
    throw new Error('useRoomSync must be used within a RoomSyncProvider')
  }
  return context
}
