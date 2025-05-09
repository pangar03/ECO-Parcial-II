import { navigateTo, socket } from "../app.js";

export default function renderScreen1(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div id="screen1">
    <h2>Marco Polo Game</h2>
    <p>Player List</p>
    <ul id="player-list"></ul>
  </div>
  `;

  let players = data.players;
  if(players) {
    const playerList = document.getElementById("player-list");
    playerList.innerHTML = `
      ${players.map(player => `<li class="player-card" id="player-${player.id}"><h5>${player.nickname}: ${player.points} Points</h5></li>`).join("")}
    `; 
  }

  socket.on("next-screen", (data) => {
    navigateTo("/screen2", { name: "Hola" });
  });

  socket.on("userJoined", (data) => {
    const playerList = document.getElementById("player-list");
    console.log("DATA", data);
    players = data.players;
    playerList.innerHTML = `
      ${players.map(player => `<li class="player-card" id="player-${player.id}"><h5>${player.nickname}: ${player.points} Points</h5></li>`).join("")}
    `; 
  })

  socket.on("roundOver", (players) => {
    console.log("Game Over", players);
    const playerList = document.getElementById("player-list");
    players.forEach(player => {
      const playerItem = document.getElementById("player-" + player.id);
      playerItem.innerHTML = `${player.nickname}: ${player.points} Points`;
      playerList.appendChild(playerItem);
    });
  })

  socket.on("gameOver", (players) => {
    navigateTo("/screen2", { players });
  });
}
