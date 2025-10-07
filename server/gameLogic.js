// Logique de gestion du jeu

export class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  // Génère un code de partie aléatoire
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Créer une nouvelle partie
  createRoom(playerId, playerName) {
    const code = this.generateRoomCode();
    const room = {
      code,
      host: playerId,
      players: [{
        id: playerId,
        name: playerName,
        isHost: true
      }],
      status: 'waiting', // waiting, playing, completed
      currentRoom: 1,
      startTime: null,
      endTime: null,
      solvedPuzzles: []
    };
    
    this.rooms.set(code, room);
    return room;
  }

  // Rejoindre une partie existante
  joinRoom(roomCode, playerId, playerName) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, message: 'Partie introuvable' };
    }
    
    if (room.status !== 'waiting') {
      return { success: false, message: 'La partie a déjà commencé' };
    }
    
    if (room.players.length >= 4) {
      return { success: false, message: 'Partie complète (4 joueurs max)' };
    }
    
    room.players.push({
      id: playerId,
      name: playerName,
      isHost: false
    });
    
    return { success: true, room };
  }

  // Démarrer la partie
  startGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'waiting') return null;
    
    room.status = 'playing';
    room.startTime = Date.now();
    return room;
  }

  // Vérifier la réponse d'une énigme
  checkAnswer(roomCode, roomNumber, answer) {
    const room = this.rooms.get(roomCode);
    if (!room) return { correct: false, message: 'Partie introuvable' };

    const correctAnswers = this.getCorrectAnswers();
    const roomAnswers = correctAnswers[roomNumber];
    
    if (!roomAnswers) {
      return { correct: false, message: 'Énigme invalide' };
    }

    // Vérification de la réponse (insensible à la casse)
    const normalized = answer.toString().toLowerCase().trim();
    const isCorrect = roomAnswers.some(validAnswer => 
      normalized === validAnswer.toString().toLowerCase().trim()
    );

    if (isCorrect) {
      room.solvedPuzzles.push({
        roomNumber,
        solvedAt: Date.now()
      });
      room.currentRoom = roomNumber + 1;
      return { 
        correct: true, 
        message: 'Énigme résolue ! Passage à la salle suivante.' 
      };
    }

    return { 
      correct: false, 
      message: 'Réponse incorrecte. Réessayez !' 
    };
  }

  // Définir les réponses correctes (simplifiées)
  getCorrectAnswers() {
    return {
      // Salle 1: 3 catégories, meilleures options: 0 (vélo) + 40 (solaire) + 40 (local) = 80
      1: ['80'],
      // Salle 2: Memory (8 paires) + raccourci facile '1'
      2: ['8', 'huit', '1'],
      // Salle 3: Région critique + raccourci facile '1'
      3: ['amazonie', 'amazon', 'amazonia', '1'],
      // Salle 4: Mix énergétique (>=60%)
      // On accepte plusieurs paliers + raccourci facile '1'
      4: ['60', '60%', '65', '65%', '70', '70%', '1'],
    };
  }

  // Terminer la partie
  endGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.status = 'completed';
    room.endTime = Date.now();
    const totalTime = Math.floor((room.endTime - room.startTime) / 1000);
    
    return {
      success: true,
      finalTime: totalTime,
      maxTime: 1800, // 30 minutes
      players: room.players,
      solvedPuzzles: room.solvedPuzzles
    };
  }

  // Retirer un joueur
  removePlayer(playerId) {
    for (const [code, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Supprimer la room si vide
        if (room.players.length === 0) {
          this.rooms.delete(code);
        }
        
        return {
          roomCode: code,
          playerName: player.name,
          players: room.players
        };
      }
    }
    return {};
  }

  // Obtenir une room
  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  // Statistiques
  getRoomsCount() {
    return this.rooms.size;
  }

  getPlayersCount() {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.players.length;
    }
    return count;
  }
}

