import { makeRequest, navigateTo, socket } from "../app.js";

export default function renderGameOverScreen(data) {
  const app = document.getElementById("app");
  console.log("data", data);
  app.innerHTML = `
    <div id="game-over">
      <h1>Game Over</h1>
      <h2 id="game-result">${data.message}</h2>
      <button id="restart-button">Restart game</button>
    </div>
  `;

  console.log("data", data);

  const restartButton = document.getElementById("restart-button");

  if(!data.restart){
    restartButton.style.display = "none";
    const container = document.getElementById("game-over");
    container.innerHTML += `
      <h2>Results:</h2>
      ${data.players.map(player => `<li class="player-card" id="player-${player.id}"><h5>${player.nickname}: ${player.points} Points</h5></li>`).join("")}
    `; 
  }

  restartButton.addEventListener("click", async () => {
    await makeRequest("/api/game/start", "POST");
  });

  // Keep the socket.on listener for game start event
  socket.on("startGame", (role) => {
    navigateTo("/game", { nickname: data.nickname, role });
  });

  socket.on("gameRestarted", (data) => {
    navigateTo("/");
  });
}
