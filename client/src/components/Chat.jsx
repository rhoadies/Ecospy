import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'

export default function Chat({ onClose }) {
  const { socket } = useSocket()
  const { roomCode, playerName, messages, addMessage } = useGame()
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Listener moved to Game.jsx so messages are captured even when panel is closed

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    socket.emit('send-message', {
      roomCode,
      playerName,
      message: inputMessage
    })

    setInputMessage('')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-xl font-bold">💬 Chat d'équipe</h3>
        <button
          onClick={onClose}
          className="text-2xl hover:text-primary transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-4xl mb-2">💭</p>
            <p>Aucun message pour le moment</p>
            <p className="text-sm mt-2">Communiquez avec votre équipe !</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.playerName === playerName
                  ? 'bg-primary/20 ml-8'
                  : 'bg-gray-800 mr-8'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {msg.playerName === playerName ? 'Vous' : msg.playerName}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="input flex-1"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-6 py-3 bg-primary hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {inputMessage.length}/200 caractères
        </p>
      </form>
    </div>
  )
}

