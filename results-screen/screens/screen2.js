import { makeRequest } from "../../game/app.js";
import { navigateTo, socket } from "../app.js";

export default function renderScreen1(data) {
  const app = document.getElementById("app");
  const players = data.players.sort((a, b) => Number(b.points) - Number(a.points));
  console.log("Players!", players);

  app.innerHTML = `
        <div id="screen2">
            <h2>Leaderboard</h2>
            <p>Check the game results</p>
            <ul id="player-list">
              ${players.map(player => `<li class="player-card" id="player-${player.id}"><h5>${player.nickname}: ${player.points} Points</h5></li>`).join("")}
            </ul>
            <button id="alpha-sort">Sort by A-Z</button>
            <button id="go-screen-back">Go to previous screen</button>
            <button id="restart-button">Restart game</button>
        </div>
        `;

  const goBackButton = document.getElementById("go-screen-back");
  const alphaSortButton = document.getElementById("alpha-sort");
  const restartButton = document.getElementById("restart-button");

  alphaSortButton.addEventListener("click", () => {
    const sortedPlayers = players.sort((a, b) => a.nickname > b.nickname ? 1 : -1);
    const playerList = document.getElementById("player-list");
    playerList.innerHTML = `
      ${sortedPlayers.map(player => `<li class="player-card" id="player-${player.id}"><h5>${player.nickname}: ${player.points} Points</h5></li>`).join("")}
    `;
  });

  restartButton.addEventListener("click", async () => {
    await makeRequest("/api/game/start", "POST");
    navigateTo("/");
  });

  goBackButton.addEventListener("click", () => {
    navigateTo("/", data);
  });

  socket.on("gameRestarted", (data) => {
    navigateTo("/");
  });
}
