const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const restartGame = async (req, res) => {
  try {
    playersDb.resetGame();
    emitEvent("gameRestarted", { message: "Game has been restarted" });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    if (poloSelected.role === "polo-especial") {
      // Substract -10 points to polo-especial and add +50 to marco
      myUser.points += 50;
      poloSelected.points -= 10;
      if(myUser.points >= 100) {
        console.log("Notificando final...");
        emitEvent("gameOver", allPlayers);
        return;
      }
      // Notify all players that the game is over
      allPlayers.forEach((player) => {
        console.log("Current score from player", player.nickname, player.points);
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      // Substract -10 points to marco and add +10 to polo-especial
      myUser.points -= 10;
      const poloEspecial = playersDb.findPlayersByRole("polo-especial");
      poloEspecial.forEach((polo) => {
        polo.points += 10;
        if(polo.points >= 100) {
          console.log("Notificando final...");
          emitEvent("gameOver", allPlayers);
          return;
        }
      });
      // Notify all players that the game is over
      allPlayers.forEach((player) => {
        console.log("Current score from player", player.nickname, player.points);
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido`,
        });
      });
    }

    // Emit the updated game data to results page
    emitEvent("roundOver", allPlayers);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  restartGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
};
