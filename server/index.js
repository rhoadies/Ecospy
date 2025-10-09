import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { GameManager } from './gameLogic.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf-8'));

const app = express();
const httpServer = createServer(app);

// Configuration
const PORT = process.env.PORT || 5000;
// Allow multiple origins via env (comma-separated). Fallback to CLIENT_URL, then localhost in dev
const CLIENT_URL = process.env.CLIENT_URL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

// Middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow non-browser requests (origin undefined) and any origin in the allowlist
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Game Manager
const gameManager = new GameManager();

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    rooms: gameManager.getRoomsCount(),
    players: gameManager.getPlayersCount(),
    allowedOrigins: ALLOWED_ORIGINS
  });
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`🟢 Joueur connecté: ${socket.id}`);

  // Créer une nouvelle partie
  socket.on('create-room', ({ playerName }) => {
    const room = gameManager.createRoom(socket.id, playerName);
    socket.join(room.code);
    socket.emit('room-created', room);
    console.log(`🎮 Partie créée: ${room.code} par ${playerName}`);
  });

  // Rejoindre une partie
  socket.on('join-room', ({ roomCode, playerName }) => {
    const result = gameManager.joinRoom(roomCode, socket.id, playerName);
    
    if (result.success) {
      socket.join(roomCode);
      socket.emit('room-joined', result.room);
      // Notifier tous les joueurs de la salle
      io.to(roomCode).emit('player-joined', {
        players: result.room.players,
        newPlayer: playerName
      });
      console.log(`👥 ${playerName} a rejoint la partie ${roomCode}`);
    } else {
      socket.emit('join-error', { message: result.message });
    }
  });

  // Rejoindre une partie publique
  socket.on('join-public-room', ({ playerName }) => {
    const result = gameManager.findOrCreatePublicRoom(socket.id, playerName);
    
    if (result.success) {
      socket.join(result.room.code);
      socket.emit('room-joined', result.room);
      // Notifier tous les joueurs de la salle
      io.to(result.room.code).emit('player-joined', {
        players: result.room.players,
        newPlayer: playerName
      });
      console.log(`🌐 ${playerName} a rejoint une partie publique ${result.room.code}`);
    } else {
      socket.emit('join-error', { message: result.message });
    }
  });

  // Obtenir la liste des parties publiques
  socket.on('get-public-rooms', () => {
    const publicRooms = gameManager.getPublicRooms();
    socket.emit('public-rooms-list', publicRooms);
  });

  // Démarrer la partie
  socket.on('start-game', ({ roomCode }) => {
    const room = gameManager.startGame(roomCode);
    if (room) {
      io.to(roomCode).emit('game-started', {
        startTime: room.startTime,
        currentRoom: room.currentRoom
      });
      console.log(`Partie ${roomCode} démarrée!`);
    }
  });

  // Soumettre une réponse à une énigme
  socket.on('submit-answer', ({ roomCode, roomNumber, answer, playerId }) => {
    const result = gameManager.checkAnswer(roomCode, roomNumber, answer);
    
    if (result.correct) {
      const room = gameManager.getRoom(roomCode);
      io.to(roomCode).emit('puzzle-solved', {
        roomNumber,
        nextRoom: room.currentRoom,
        message: result.message
      });
      
      // Vérifier si le jeu est terminé
      if (room.currentRoom > 4) {
        const gameResult = gameManager.endGame(roomCode);
        io.to(roomCode).emit('game-completed', gameResult);
        console.log(`🏆 Partie ${roomCode} terminée! Temps: ${gameResult.finalTime}s`);
      }
    } else {
      socket.emit('wrong-answer', { message: result.message });
    }
  });

  // Chat en temps réel
  socket.on('send-message', ({ roomCode, playerName, message }) => {
    io.to(roomCode).emit('new-message', {
      playerName,
      message,
      timestamp: Date.now()
    });
  });

  // Aide pour énigme coopérative (Salle 3)
  socket.on('share-clue', ({ roomCode, playerId, clueData }) => {
    socket.to(roomCode).emit('clue-shared', { playerId, clueData });
  });

  // Synchronisation d'état des salles
  socket.on('room-state-update', ({ roomCode, roomNumber, stateData }) => {
    // Diffuser l'état à tous les joueurs de la salle
    io.to(roomCode).emit('room-state-sync', {
      roomNumber,
      stateData,
      fromPlayer: socket.id
    });
  });

  // Demande de synchronisation d'état
  socket.on('request-room-state', ({ roomCode, roomNumber }) => {
    // Pour l'instant, on ne stocke pas l'état côté serveur
    // On pourrait l'ajouter si nécessaire
    socket.emit('room-state-requested', { roomNumber });
  });

  // Voice chat features removed

  // Déconnexion
  socket.on('disconnect', () => {
    const result = gameManager.removePlayer(socket.id);
    if (result.roomCode) {
      io.to(result.roomCode).emit('player-left', {
        players: result.players,
        leftPlayer: result.playerName
      });
      // Voice notifications removed
      console.log(`🔴 ${result.playerName} a quitté la partie ${result.roomCode}`);
    }
    console.log(`🔴 Joueur déconnecté: ${socket.id}`);
  });
});

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`\nAPI docs: http://localhost:${PORT}/docs`);
  console.log(`Health:   http://localhost:${PORT}/health`);
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promesse rejetée:', error);
});

