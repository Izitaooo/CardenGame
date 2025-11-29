const socket = io();
const allCards = {}; // Track all cards
// Get room from URL
const urlParams = new URLSearchParams(window.location.search);
const currentRoom = urlParams.get("room");

// Re-join the room when connected
if (currentRoom) {
  socket.emit("joinRoom", currentRoom);
  console.log("Rejoining room:", currentRoom);
}

socket.on("roomJoined", (roomName) => {
  console.log("Successfully joined room:", roomName);
  // Update indicator if you have one
  const indicator = document.getElementById("roomNameText");
  indicator.textContent = `room: ${roomName}`;
});

socket.on("updatePlayers", (players) => {
  console.log(players);
});

let startX = 0,
  startY = 0,
  newX = 0,
  newY = 0;

let zIndexes = [];
//const card = {

//}

/* let card = document.getElementById("card1");
gsap.to(card, {
  transform: "scale(1)",
  duration: "0.2",
});
let card2 = document.getElementById("card2");
gsap.to(card2, {
  transform: "scale(1)",
  duration: "0.2",
}); */

let dropper1 = document.getElementById("drop1");
let dropper2 = document.getElementById("drop2");
let dropper3 = document.getElementById("drop3");
let dropper4 = document.getElementById("drop4");
let dropper5 = document.getElementById("drop5");
let dropper6 = document.getElementById("drop6");

let domRect2 = dropper1.getBoundingClientRect();
let domRect3 = dropper2.getBoundingClientRect();
let domRect4 = dropper3.getBoundingClientRect();
let domRect5 = dropper4.getBoundingClientRect();
let domRect6 = dropper5.getBoundingClientRect();
let domRect7 = dropper6.getBoundingClientRect();

const randBtn = document.getElementById("randBtn");
const spawnButtons = document.querySelectorAll(".spawnButtons");

const buttonMap = {
  shortyBtn:     0,
  frenzyBtn:     1,
  ghostBtn:      2,
  sheriffBtn:    3,
  stingerBtn:    4,
  spectreBtn:    5,
  buckyBtn:      6,
  judgeBtn:      7,
  bulldogBtn:    8,
  guardianBtn:   9,
  phantomBtn:    10,
  vandalBtn:     11,
  marshalBtn:    12,
  outlawBtn:     13,
  operatorBtn:   14,
  aresBtn:       15,
  odinBtn:       16,
};

let playersInRoom = 2;

socket.on("roomPlayerCount", (data) => {
  playersInRoom = data.count;
  console.log(`Players in room ${data.roomName}: ${playersInRoom}`);

  if (playersInRoom === 2) {
    document.getElementById("waitForPlayerText").classList = "playersThere";
  }
});

const hand = document.getElementById("hand");

let agents = ["clove", "iso", "jett", "omen", "sage", "skye", "sova", "vyse"];
let agentsChosen = [];
const agentHandlers = {}; // Store handler references

// Add event listeners to all agents
agents.forEach((agent) => {
  const element = document.getElementById(agent);
  agentHandlers[agent] = () => selectAgent(agent); // Store the handler
  element.addEventListener("click", agentHandlers[agent]);
});

function selectAgent(agentName) {
  if (agentsChosen.length < 3) {
    if (!agentsChosen.includes(agentName)) {
      agentsChosen.push(agentName);
      document.getElementById(agentName).classList.add("selected");
    } else {
      if (agentsChosen.includes(agentName)) {
        agentsChosen = agentsChosen.filter((agent) => agent !== agentName);
        document.getElementById(agentName).classList.remove("selected");
      }
    }
  } else {
    if (agentsChosen.includes(agentName)) {
      agentsChosen = agentsChosen.filter((agent) => agent !== agentName);
      document.getElementById(agentName).classList.remove("selected");
    }
  }
  if (agentsChosen.length === 3 && playersInRoom === 2) {
    document.getElementById("lockIn").classList.add("full");
  } else {
    document.getElementById("lockIn").classList.remove("full");
  }

  console.log("Selected agents:", agentsChosen);
}

function lockIn() {
  console.log("lock in");
  if (agentsChosen.length === 3 && playersInRoom === 2) {
    console.log("Locked in agents:", agentsChosen);
    /*    document
      .getElementById("agentSelectMenuBackground")
      .classList.add("agentsLocked");*/

    agent0 = document.getElementById(agentsChosen[0]);
    agent1 = document.getElementById(agentsChosen[1]);
    agent2 = document.getElementById(agentsChosen[2]);

    for (let agent of agents) {
      if (agentsChosen.includes(agent)) {
        const el = document.getElementById(agent);
        el.health = 10; // Add custom property here

        //console.log("is there");
        document.getElementById(agent).classList.remove("selected");
        document.getElementById(agent).classList.add("inGame");
        document.getElementById(agent).style.zIndex = "1000"; // start high
        const gl = document.getElementById(agent).querySelector(".glint");
        if (gl) gl.style.zIndex = "1000";
        document.getElementById(agent).style.pointerEvents = "none";
        // Use the stored handler reference
        document
          .getElementById(agent)
          .removeEventListener("click", agentHandlers[agent]);
      } else {
        document.getElementById(agent).classList.add("agentsLocked");

        //console.log("not there");
      }
    }

    setTimeout(() => {
      // First pass: calculate all positions BEFORE converting
      let agentData = [];
      for (let agent of agentsChosen) {
        let agentToMove = document.getElementById(agent);
        const rect = agentToMove.getBoundingClientRect();

        agentData.push({
          element: agentToMove,
          startX: rect.left,
          startY: rect.top,
          pointerEvents: "none",
          endX: null,
          endY: null,
        });
      }

      // Get dropper positions
      let idropper = 4;
      for (let data of agentData) {
        let dropper = document.getElementById("drop" + idropper);
        const dropperRect = dropper.getBoundingClientRect();
        data.endX = dropperRect.left;
        data.endY = dropperRect.top;
        idropper++;
      }
      document
        .getElementById("agentSelectMenuBackground")
        .classList.add("agentsLocked");
      document.getElementById("agentSelectH2").classList.add("agentsLocked");
      document.getElementById("lockIn").classList.add("agentsLocked");
      /*setTimeout(() => {
                  document.getElementById("agentSelectMenuBackground").remove()
        }, 700);*/
      // Second pass: convert to fixed and animate
      for (let data of agentData) {
        /*document.body.appendChild(data.element);*/

        data.element.style.position = "fixed";
        data.element.style.left = data.startX + "px";
        data.element.style.top = data.startY + "px";
        data.element.style.zIndex = "1000"; // keep high while animating
        data.element.querySelector(".glint").style.zIndex = "1000";

        data.element.classList.add("animating");
        data.element.style.pointerEvents = "none";

        gsap.to(data.element, {
          left: data.endX + "px",
          top: data.endY + "px",
          duration: 0.5,
          ease: "power1.inOut",
          overwrite: true,
          onComplete: () => {
            // restore after this element finishes animating
            data.element.classList.remove("animating");
            data.element.style.pointerEvents = ""; // revert to stylesheet default
            // optionally reset will-change if you set it elsewhere
          },
        });
      }

      setTimeout(() => {
        for (let agent of agents) {
          if (!agentsChosen.includes(agent)) {
            document.getElementById(agent).remove();
          } else {
            document.getElementById(agent).style.zIndex = "1";
            document
              .getElementById(agent)
              .querySelector(".glint").style.zIndex = "1";
          }
        }
        document.getElementById("agentSelectH2").remove();
        document.getElementById("lockIn").remove();
      }, 700);
    }, 1000);

    /*      for (let agent of agents) {
          if (!agentsChosen.includes(agent)) {
              document.getElementById(agent).remove();
          }
      }*/
  }
  socket.emit("agentsLockedIn", {
    agentsChosen,
  });
  ImPlaying = false;
  MainGameLoop();
}
let enemyAgents = [];
socket.on("enemyChose", (data) => {
  enemyAgents = data.agentsChosen;
  //console.log("Enemy chose agents:", data.agentsChosen);
  enemyAgents.forEach((agent, index) => {
    const dropperNum = 1 + index;
    const dropper = document.getElementById("drop" + dropperNum);

    cardsGame.push(spawnEnemyAgent(agent, dropper));
  });

  // Animate all enemy agents
  for (let agent of enemyAgents) {
    let agentControl = document.getElementById("enemy_" + agent);
    if (agentControl) {
      const finalTop =
        parseFloat(agentControl.style.top) + window.innerHeight * 0.1;

      gsap.to(agentControl, {
        top: finalTop + "px",
        opacity: 1,
        duration: 0.5,
        pointerEvents: "none",
        ease: "power1.inOut",
        overwrite: true,
      });
    }
  }
  ImPlaying = true;
  MainGameLoop();
});

function spawnEnemyAgent(agentName, dropper) {
    const enemyAgent = document.createElement("div");
    enemyAgent.className = "agentSelect enemy inGame";
    enemyAgent.id = "enemy_" + agentName;
    enemyAgent.style.position = "fixed";

    const dropperRect = dropper.getBoundingClientRect();
    enemyAgent.style.left = dropperRect.left + "px";
    enemyAgent.style.top = dropperRect.top - window.innerHeight * 0.1 + "px";

    // Start transparent
    enemyAgent.style.opacity = "0";
    enemyAgent.style.pointerEvents = "none";

    // Add health property
    enemyAgent.health = 10;

    const glint = document.createElement("div");
    glint.className = "glint";
    enemyAgent.appendChild(glint);

    // Add health display element
    const healthDisplay = document.createElement("div");
    healthDisplay.className = "heart";
    healthDisplay.textContent = "10";
    enemyAgent.appendChild(healthDisplay);

    document.body.appendChild(enemyAgent);

    return enemyAgent;
}
let ImPlaying;
let gameLoopStarted = false;
let agentClickHandlers = {}; // Move this outside so it persists

function MainGameLoop() {
    if (agentsChosen.length === 3 && enemyAgents.length === 3 && !gameLoopStarted) {
        gameLoopStarted = true;

        const agentElements = document.querySelectorAll(".agentSelect");
        const myAgents = Array.from(agentElements).filter(el =>
            agentsChosen.includes(el.id)
        );

        // Create handlers ONCE and store them globally
        myAgents.forEach(agentEl => {
            agentClickHandlers[agentEl.id] = () => SelectToAttack(agentEl.id);
        });

        // Initial setup
        updateTurnState(myAgents);
    }
}

function updateTurnState(myAgents) {
    if (ImPlaying) {
        // Enable my agents
        myAgents.forEach(agentEl => {
            agentEl.classList.add("selectable");
            // Use the globally stored handler
            if (agentClickHandlers[agentEl.id]) {
                agentEl.removeEventListener("click", agentClickHandlers[agentEl.id]);
                agentEl.addEventListener("click", agentClickHandlers[agentEl.id]);
            }
        });
        document.getElementById("youPlaying").classList.add("active");
        document.getElementById("enemyPlaying").classList.remove("active");
    } else {
        // Disable my agents
        myAgents.forEach(agentEl => {
            agentEl.classList.remove("selectable");
            agentEl.classList.remove("selected");
            // Use the globally stored handler
            if (agentClickHandlers[agentEl.id]) {
                agentEl.removeEventListener("click", agentClickHandlers[agentEl.id]);
            }
        });
        document.getElementById("enemyPlaying").classList.add("active");
        document.getElementById("youPlaying").classList.remove("active");
    }

    UpdatePermisions();
}

socket.on("rolesSwitched", () => {
    ImPlaying = !ImPlaying;

    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter(el =>
        agentsChosen.includes(el.id)
    );

    // Don't recreate handlers - just use the existing ones
    updateTurnState(myAgents);

    console.log("Switched to:", ImPlaying ? "You" : "Enemy");
})


function switchPlayer() {
    ImPlaying = !ImPlaying;

    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter(el =>
        agentsChosen.includes(el.id)
    );

    document.querySelectorAll(".agentSelect").forEach((el) => {
        el.classList.remove("selected");
    });

    // Remove damageable from ALL enemy agents and clean up their listeners
    document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
        el.classList.remove("damageable");
        el.style.pointerEvents = "none";

        // Remove old listener if it exists
        if (enemyClickHandlers[el.id]) {
            el.removeEventListener("click", enemyClickHandlers[el.id]);
            delete enemyClickHandlers[el.id];
        }
        if (enemyHoverHandlers[el.id]){
            el.removeEventListener("mouseover", enemyHoverHandlers[el.id]);
            delete enemyHoverHandlers[el.id]
        }
        if (enemyMouseLeaveHandlers[el.id]){
            el.removeEventListener("mouseleave", enemyMouseLeaveHandlers[el.id])
            delete enemyMouseLeaveHandlers[el.id]
        }
        damageDisplayHide(el.id);
    });

    // Don't recreate handlers - just use the existing ones
    updateTurnState(myAgents);

    console.log("Switched to:", ImPlaying ? "You" : "Enemy");

    socket.emit("switchRoles");
}
// Store enemy click handlers globally
const enemyClickHandlers = {};
const enemyHoverHandlers = {}
const enemyMouseLeaveHandlers = {}


let agentSelectedToAttack;
function SelectToAttack(agent) {
    agentSelectedToAttack = document.getElementById(agent);
    const agentEl = document.getElementById(agent);
    const wasSelected = agentEl.classList.contains("selected");

    // Remove selected from all agents
    document.querySelectorAll(".agentSelect").forEach((el) => {
        el.classList.remove("selected");
    });

    // Remove damageable from ALL enemy agents and clean up their listeners
    document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
        el.classList.remove("damageable");
        el.style.pointerEvents = "none";

        // Remove old listener if it exists
        if (enemyClickHandlers[el.id]) {
            el.removeEventListener("click", enemyClickHandlers[el.id]);
            delete enemyClickHandlers[el.id];
        }
        if (enemyHoverHandlers[el.id]){
            el.removeEventListener("mouseover", enemyHoverHandlers[el.id]);
            delete enemyHoverHandlers[el.id]
        }
        if (enemyMouseLeaveHandlers[el.id]){
            el.removeEventListener("mouseleave", enemyMouseLeaveHandlers[el.id])
            delete enemyMouseLeaveHandlers[el.id]
        }
    });

    // If it wasn't selected, select it now and make enemies damageable
    if (!wasSelected) {
        agentEl.classList.add("selected");
        console.log("selected to attack:", agent);

        document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
            console.log("making damageable:", el.id);
            el.classList.add("damageable");
            el.style.pointerEvents = "auto";


            enemyHoverHandlers[el.id] = () => damageDisplay(el.id);
            el.addEventListener("mouseover", enemyHoverHandlers[el.id]);

            enemyMouseLeaveHandlers[el.id] = () => damageDisplayHide(el.id);
            el.addEventListener("mouseleave", enemyMouseLeaveHandlers[el.id])

            // Create and store the handler
            enemyClickHandlers[el.id] = () => damageAgent(el.id);
            el.addEventListener("click", enemyClickHandlers[el.id]);
        });
    }
}
function damageDisplay(agentId){
    let agent = document.getElementById(agentId);

    weaponDamageLUT(agentSelectedToAttack.weapon);


    let damageCalc =agent.health - damage * ammo;
    agent.querySelector(".heart").textContent = damageCalc.toString();
    agent.querySelector(".heart").style.color = "red";
}
function damageDisplayHide(agentId) {
    let agent = document.getElementById(agentId);
    let damageCalc =agent.health;
    agent.querySelector(".heart").textContent = damageCalc.toString();
    agent.querySelector(".heart").style.color = "white";
}

function damageAgent(agentId) {
    let agent = document.getElementById(agentId);
    console.log("damaging agent:", agent.id);
    weaponDamageLUT(agentSelectedToAttack.weapon)
    console.log(`Firing ${ammo} shots with ${agent.weapon}. Damage: ${damage}, Hit Chance: ${chanceToHit}%`);


    for (let i = 0; i < ammo; i++) {
        const randomChance = Math.floor(Math.random() * 100);

        if (randomChance < chanceToHit) {
            // HIT confirmed!
            agent.health -= damage;
            console.log(`Shot ${i + 1}: HIT! Health remaining: ${agent.health}`);

            // OPTIONAL: Add a check here if the agent is defeated
            if (agent.health <= 0) {
                console.log("Agent defeated!");
                agent.health = 0;
                break; // Stop firing if the target is defeated
            }
        } else {
            // MISS confirmed!
            console.log(`Shot ${i + 1}: MISS. Health remaining: ${agent.health}`);
        }
    }

    console.log("New health:", agent.health);

    // Update the health display
    const healthDisplay = agent.querySelector(".heart");
    if (healthDisplay) {
        healthDisplay.textContent = agent.health;
    }
    socket.emit("damageAgent", agentId, 2);//2 is only for now, later replace with varriabnle!
    setTimeout(() => {
        switchPlayer();
    }, 1000);
}

let damage = 0;
let ammo = 0;
let chanceToHit = 0;
function weaponDamageLUT(weapon){
    if(weapon === "classic"){
        damage = 2;
        ammo = 3;
        chanceToHit = 75;
    }else if(weapon === "shorty"){
        damage = 4;
        ammo = 1;
        chanceToHit = 45;
    }else if(weapon === "frenzy"){
        damage = 3;
        ammo = 3;
        chanceToHit = 60;
    }else if(weapon === "ghost"){
        damage = 4;
        ammo = 4;
        chanceToHit = 70;
    }else if(weapon === "sheriff"){
        damage = 6;
        ammo = 2;
        chanceToHit = 85;
    }else if(weapon === "bucky"){
        damage = 7;
        ammo = 2;
        chanceToHit = 50;
    }else if(weapon === "judge"){
        damage = 6;
        ammo = 3;
        chanceToHit = 55;
    }else if(weapon === "stinger"){
        damage = 4;
        ammo = 4;
        chanceToHit = 65;
    }else if(weapon === "spectre"){
        damage = 5;
        ammo = 5;
        chanceToHit = 70;
    }else if(weapon === "bulldog"){
        damage = 6;
        ammo = 5;
        chanceToHit = 75;
    }else if(weapon === "guardian"){
        damage = 7;
        ammo = 3;
        chanceToHit = 85;
    }else if(weapon === "phantom"){
        damage = 8;
        ammo = 6;
        chanceToHit = 80;
    }else if(weapon === "vandal"){
        damage = 8;
        ammo = 5;
        chanceToHit = 80;
    }else if(weapon === "ares"){
        damage = 6;
        ammo = 8;
        chanceToHit = 60;
    }else if(weapon === "odin"){
        damage = 7;
        ammo = 10;
        chanceToHit = 55;
    }else if(weapon === "marshal"){
        damage = 8;
        ammo = 1;
        chanceToHit = 90;
    }else if(weapon === "outlaw"){
        damage = 9;
        ammo = 2;
        chanceToHit = 92;
    }else if(weapon === "operator"){
        damage = 10;
        ammo = 1;
        chanceToHit = 95;
    }else {
        // Default values
        damage = 1;
        ammo = 1;
        chanceToHit = 100;
    }
}


socket.on("damageAgent", (agentId, damage) => {
    let agent = document.getElementById(agentId.replace("enemy_", ""));
    console.log("Enemy damaging your agent:", agent.id);
    console.log("old health:", agent.health);
    agent.health -= damage;
    console.log("New health:", agent.health);
    agent.querySelector(".heart").innerHTML = agent.health;

});

function UpdatePermisions() {
  if (ImPlaying) {
    document.getElementById("youPlaying").classList.add("active");
    for (let i = 0; i < deckCards.length; i++) {
      deckCards[i].style.pointerEvents = "all";
      deckCards[i].style.cursor = "pointer";
    }
  } else {
    document.getElementById("enemyPlaying").classList.add("active");
    for (let i = 0; i < deckCards.length; i++) {
      deckCards[i].style.pointerEvents = "none";
      deckCards[i].style.cursor = "pointer";
    }
  }
}

let volumeSlider = document.getElementById("volume");
let volumeNow = volumeSlider.value;
let min = 0.0;
let max = 1;

volumeSlider.style.background = `linear-gradient(to right, #FF4655 0%, #FF4655 ${
  (min / max) * 100
}%, #111823 ${(min / max) * 100}%, #111823 100%)`;

function volumeUpdate() {
  this.style.background = `linear-gradient(to right, #FF4655 0%, #FF4655 ${
    ((this.value - this.min) / (this.max - this.min)) * 100
  }%, #111823 ${
    ((this.value - this.min) / (this.max - this.min)) * 100
  }%, #111823 100%)`;
  volumeNow = this.value;
  Howler.volume(volumeNow);
  console.log("volume is:" + volumeNow);
}

volumeSlider.addEventListener("input", volumeUpdate);
window.addEventListener("DOMContentLoaded", () => {
  volumeUpdate.call(volumeSlider);
});

const dropSound = new Howl({
  src: ["audio/Mystbloom Kill 4.mp3"],
  volume: 0.1,
});
const deckSound = new Howl({
  src: ["audio/Cryostasis Kill 1.mp3"],
  volume: 0.15,
});

let cardsGame = [];

let isLocked = 0;
let inDeck = 0;
let container;
let dragged = false;
let buttonEnable = true;

let dropPlay = 0;

let activeCard = null;

let deckCards = [];

let deckCardsOponent = [];

let credsText = document.getElementById("money");
let creds = 50000;

const handhitbox = document.getElementById("bottomhitbox");
let cardSpacing = window.innerWidth * 0.06;

let cardOpenEnabled = true;
let canDrag = true;

let pressTimer = null;
let hasUpdatedZIndex = false;


function mouseDown(e, cardElement) {
  activeCard = cardElement;

  if (!canDrag) return;

  if (handDown === true) {
    return;
  }/* else {
    for (let i = 0; i < deckCards.length; i++) {
      deckCards[i].addEventListener("click", () => {
        if (handDown === false) {
          console.log("MOMMYYY");
        }
      });
    }
  }*/

  console.log("MouseDown:", cardElement.id, activeCard.id);

      //updateZIndex(activeCard.id);

    // Start a timer - update z-index after 150ms
    hasUpdatedZIndex = false;
    pressTimer = setTimeout(() => {
        updateZIndex(activeCard.id);
        hasUpdatedZIndex = true;
    }, 300); // Adjust this duration as needed (in milliseconds)


    whereCanPlace(cardElement);

  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  gsap.killTweensOf(activeCard);

  dragged = false;
}

function whereCanPlace(cardElement) {
    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter(el =>
        agentsChosen.includes(el.id)
    );
    const enemyAgentElements = enemyAgents.map(agentName =>
        document.getElementById("enemy_" + agentName)
    ).filter(el => el !== null);
console.log("card type: " + cardElement.type);
    if(cardElement.type === "gun"
        || cardElement.type === "barrier orb"
        || cardElement.type === "contigency"
        || cardElement.type === "double tap"
        || cardElement.type === "healing orb"
        || cardElement.type === "pick me up"
        || cardElement.type === "regrowth"
        || cardElement.type === "shrouded step"
        || cardElement.type === "tailwind"
        || cardElement.type === "updraft"
    ){
        myAgents.forEach(agentEl => {
            agentEl.classList.add("isPlaceable");
        });
        enemyAgentElements.forEach(enemyEl => {
            enemyEl.classList.remove("isPlaceable");
        });
        console.log("friendly");

    } else{
        enemyAgentElements.forEach(enemyEl => {
            enemyEl.classList.add("isPlaceable");
        });
        console.log("enemy");

        myAgents.forEach(agentEl => {
            agentEl.classList.remove("isPlaceable");
        });
        console.log("enemy");

    }
}


let agent0, agent1, agent2;




function mouseMove(e) {
  newX = startX - e.clientX;
  newY = startY - e.clientY;


    startX = e.clientX;
    startY = e.clientY;


    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);



  activeCard.style.top = activeCard.offsetTop - newY + "px";
  activeCard.style.left = activeCard.offsetLeft - newX + "px";

  inDeck = 0;
  dropPlay = 1;
  dragged = true;

  //console.log(agentsChosen);

  let purple = document.getElementById("luh");
  let purpleRect = purple.getBoundingClientRect();

  /* if(activeCard.infoAble === true){
    activeCard.infoBox.classList.toggle("visible");
    activeCard.infoAble = false;
  } */

  if (activeCard.deck === true) {
    //console.log("zoul  be mine");
    const index = deckCards.indexOf(activeCard); // find where it is in the array
    if (index !== -1) {
      deckCards.splice(index, 1); // remove that one item
    }
    gsap.killTweensOf(activeCard);

    activeCard.deck = false;
    updateDeckPositions(0.5);
  }

  activeCard.deck = false;

  activeCard.draggedAO = true;


  agent0.querySelector(".heart").textContent = agent0.health;
  agent1.querySelector(".heart").textContent = agent1.health;
  agent2.querySelector(".heart").textContent = agent2.health;

  agent0.querySelector(".heart").style.color = "white";
  agent1.querySelector(".heart").style.color = "white";
  agent2.querySelector(".heart").style.color = "white";


  //box1
  const domRect1 = activeCard.getBoundingClientRect();

  if (activeCard.spawning === true) {
    if (
      !(
        domRect1.top > purpleRect.bottom ||
        domRect1.right < purpleRect.left ||
        domRect1.bottom < purpleRect.top ||
        domRect1.left > purpleRect.right
      )
    ) {
      purple.style.backgroundColor = "rgba(141, 133, 171, 0.4)";
      isLocked = 0;
      container = null;
    } else {
      purple.style.backgroundColor = "initial";
      isLocked = 1;
      container = 0;
    }
  }

  if (activeCard.spawning === false) {
    if (
      !(domRect1.top > domRect2.bottom ||
          domRect1.right < domRect2.left ||
          domRect1.bottom < domRect2.top ||
          domRect1.left > domRect2.right
          ) && activeCard.type !== "gun"
        && activeCard.type !== "barrier orb"
        && activeCard.type !== "contigency"
        && activeCard.type !== "double tap"
        && activeCard.type !== "healing orb"
        && activeCard.type !== "pick me up"
        && activeCard.type !== "regrowth"
        && activeCard.type !== "shrouded step"
        && activeCard.type !== "tailwind"
        && activeCard.type !== "updraft"
    ) {
      isLocked = 1;
      container = 1;
      scale();
    }

    //box2
    else if (
      !(
        domRect1.top > domRect3.bottom ||
        domRect1.right < domRect3.left ||
        domRect1.bottom < domRect3.top ||
        domRect1.left > domRect3.right
      ) && activeCard.type !== "gun"
        && activeCard.type !== "barrier orb"
        && activeCard.type !== "contigency"
        && activeCard.type !== "double tap"
        && activeCard.type !== "healing orb"
        && activeCard.type !== "pick me up"
        && activeCard.type !== "regrowth"
        && activeCard.type !== "shrouded step"
        && activeCard.type !== "tailwind"
        && activeCard.type !== "updraft"
    )
    {
      isLocked = 1;
      container = 2;
      scale();
    }

    //box3
    else if (
      !(
        domRect1.top > domRect4.bottom ||
        domRect1.right < domRect4.left ||
        domRect1.bottom < domRect4.top ||
        domRect1.left > domRect4.right
      ) && activeCard.type !== "gun"
        && activeCard.type !== "barrier orb"
        && activeCard.type !== "contigency"
        && activeCard.type !== "double tap"
        && activeCard.type !== "healing orb"
        && activeCard.type !== "pick me up"
        && activeCard.type !== "regrowth"
        && activeCard.type !== "shrouded step"
        && activeCard.type !== "tailwind"
        && activeCard.type !== "updraft"
    ) {
      isLocked = 1;
      container = 3;
      scale();

    } else if (
      !(
        domRect1.top > domRect5.bottom ||
        domRect1.right < domRect5.left ||
        domRect1.bottom < domRect5.top ||
        domRect1.left > domRect5.right
      ) && activeCard.type !== "arc rose"
        && activeCard.type !== "cloudburst"
        && activeCard.type !== "dark cover"
        && activeCard.type !== "guiding light"
        && activeCard.type !== "meddle"
        && activeCard.type !== "owl drone"
        && activeCard.type !== "paranoia"
        && activeCard.type !== "razorvine"
        && activeCard.type !== "recon bolt"
        && activeCard.type !== "ruse"
        && activeCard.type !== "shear"
        && activeCard.type !== "shock bolt"
        && activeCard.type !== "slow orb"
        && activeCard.type !== "trailblazer"
        && activeCard.type !== "undercut"
    ) {
      isLocked = 1;
      container = 4;
      scale();
      agent0.querySelector(".heart").textContent = agent0.health - activeCard.dmg;
        agent0.querySelector(".heart").style.color = "red";
    } else if (
      !(
        domRect1.top > domRect6.bottom ||
        domRect1.right < domRect6.left ||
        domRect1.bottom < domRect6.top ||
        domRect1.left > domRect6.right
      ) && activeCard.type !== "arc rose"
        && activeCard.type !== "cloudburst"
        && activeCard.type !== "dark cover"
        && activeCard.type !== "guiding light"
        && activeCard.type !== "meddle"
        && activeCard.type !== "owl drone"
        && activeCard.type !== "paranoia"
        && activeCard.type !== "razorvine"
        && activeCard.type !== "recon bolt"
        && activeCard.type !== "ruse"
        && activeCard.type !== "shear"
        && activeCard.type !== "shock bolt"
        && activeCard.type !== "slow orb"
        && activeCard.type !== "trailblazer"
        && activeCard.type !== "undercut"
    ) {
      isLocked = 1;
      container = 5;
      scale();
      agent1.querySelector(".heart").textContent = agent1.health - activeCard.dmg;
        agent1.querySelector(".heart").style.color = "red";
    } else if (
      !(
        domRect1.top > domRect7.bottom ||
        domRect1.right < domRect7.left ||
        domRect1.bottom < domRect7.top ||
        domRect1.left > domRect7.right
      ) && activeCard.type !== "arc rose"
        && activeCard.type !== "cloudburst"
        && activeCard.type !== "dark cover"
        && activeCard.type !== "guiding light"
        && activeCard.type !== "meddle"
        && activeCard.type !== "owl drone"
        && activeCard.type !== "paranoia"
        && activeCard.type !== "razorvine"
        && activeCard.type !== "recon bolt"
        && activeCard.type !== "ruse"
        && activeCard.type !== "shear"
        && activeCard.type !== "shock bolt"
        && activeCard.type !== "slow orb"
        && activeCard.type !== "trailblazer"
        && activeCard.type !== "undercut"
    ) {
      isLocked = 1;
      container = 6;
      scale();
      agent2.querySelector(".heart").textContent = agent2.health - activeCard.dmg;
        agent2.querySelector(".heart").style.color = "red";
    } else {
      isLocked = 0;
      container = null;
      gsap.to(activeCard, {
        transform: "scale(1)",
        duration: "0.3",
      });
    }
  }

  // TODO [yell]: HERE IS THE THING
  if (handDown === false) {
    handhitbox.style.height = "5.5vw";
    handhitbox.style.zIndex = "99";
    //cardSpacing = 180;
    cardSpacing = window.innerWidth * 0.06;

    updateDeckPositions(0.5);
    handDown = true;
    //console.log(handDown)
  }
  // TODO [yell]: HERE IS THE THING

  distanceFind();
}

let endScreen = document.getElementById("endScreen");

function mouseUp() {
  console.log("MouseUp:", activeCard?.id);

    // Clear the timer in case mouseUp happens before the timeout
    clearTimeout(pressTimer);
    pressTimer = null;
    hasUpdatedZIndex = false;

    if (!dragged) {
        isLocked = null;
    }


  if (!dragged) {
    isLocked = null;
  }

  socket.emit("cardPos", {
    containerInfo: container,
    id: activeCard.id,
  });


    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter(el =>
        agentsChosen.includes(el.id)
    );
    const enemyAgentElements = enemyAgents.map(agentName =>
        document.getElementById("enemy_" + agentName)
    ).filter(el => el !== null);


    myAgents.forEach(agentEl => {
        agentEl.classList.remove("isPlaceable");
    });
    enemyAgentElements.forEach(enemyEl => {
        enemyEl.classList.remove("isPlaceable");
    });

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    if (activeCard.type === "gun" && (container === 1 || container === 2 || container === 3)) {
        console.log("gun card on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
        if (container === 1){

        }
    }else  if(activeCard.type === "arc rose" && (container === 4 || container === 5 || container === 6)){
        console.log("arc rose on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "barrier orb" && (container === 1 || container === 2 || container === 3)){
        console.log("barrier orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "cloudburst" && (container === 4 || container === 5 || container === 6)) {
        console.log("cloudburst on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "contigency" && (container === 1 || container === 2 || container === 3)){
        console.log("contigency on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "dark cover" && (container === 4 || container === 5 || container === 6)) {
        console.log("dark cover on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "double tap" && (container === 1 || container === 2 || container === 3)){
        console.log("double tap on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "guiding light" && (container === 4 || container === 5 || container === 6)) {
        console.log("guiding light on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "healing orb" && (container === 1 || container === 2 || container === 3)){
        console.log("healing orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "meddle" && (container === 4 || container === 5 || container === 6)) {
        console.log("meddle on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "owl drone" && (container === 4 || container === 5 || container === 6)) {
        console.log("owl drone on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "paranoia" && (container === 4 || container === 5 || container === 6)) {
        console.log("paranoia on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "pick me up" && (container === 1 || container === 2 || container === 3)){
        console.log("pick me up on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "razorvine" && (container === 4 || container === 5 || container === 6)) {
        console.log("razorvine on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "recon bolt" && (container === 4 || container === 5 || container === 6)) {
        console.log("recon bolt on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "regrowth" && (container === 1 || container === 2 || container === 3)){
        console.log("regrowth on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "ruse" && (container === 4 || container === 5 || container === 6)) {
        console.log("ruse on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "shear" && (container === 4 || container === 5 || container === 6)) {
        console.log("shear on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "shock bolt" && (container === 4 || container === 5 || container === 6)) {
        console.log("shock bolt on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "shrouded step" && (container === 1 || container === 2 || container === 3)){
        console.log("shrouded step on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "slow orb" && (container === 4 || container === 5 || container === 6)) {
        console.log("slow orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "tailwind" && (container === 1 || container === 2 || container === 3)){
        console.log("tailwind on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "trailblazer" && (container === 4 || container === 5 || container === 6)) {
        console.log("trailblazer on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "undercut" && (container === 4 || container === 5 || container === 6)) {
        console.log("undercut on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.type === "updraft" && (container === 1 || container === 2 || container === 3)){
        console.log("updraft on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }

    if (activeCard.type === "gun"){
        let agent = null;
        if (container === 4){
            agent = agent0;
        } else if (container === 5){
            agent = agent1;
        } else if (container === 6){
            agent = agent2;
        }

        // Only apply weapon if we have a valid agent
        if (agent) {
            agent.weapon = activeCard.weaponName; // Use the stored name!
            console.log("weapon applied: " + agent.weapon + " to " + agent.id);
        }
    }


  if (activeCard.spawning === true) {
    let purple = document.getElementById("luh");

    purple.style.backgroundColor = "initial";

    if (isLocked === 1) {
      activeCard.style.transition = "opacity 0.2s";
      activeCard.style.opacity = "0";

      setTimeout(() => {
        for (let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        activeCard.style.display = "none";
      }, 300);
    } else {
      creds = creds - activeCard.price;
      credsText.innerHTML = creds + "c";
      updateSpawnerButtons();
    }
  }

  let totalDistance = distanceFind();

  if (isLocked === 1) {
    let dropper;
    let agent;


        if (container === 1) {
            dropper = dropper1;
            agent = null;
        } else if (container === 2) {
            dropper = dropper2;
            agent = null;
        } else if (container === 3) {
            dropper = dropper3;
            agent = null;
        } else if (container === 4) {
            dropper = dropper4;
            agent = agent0;
        } else if (container === 5) {
            dropper = dropper5;
            agent = agent1;
        } else if (container === 6) {
            dropper = dropper6;
            agent = agent2;
        } else if (container === 0) {
            dropper = randBtn;
        }
    //}


    activeCard.style.setProperty("--border-animation", "none");

    gsap.to(activeCard, {
      left: dropper.offsetLeft + "px",
      top: dropper.offsetTop + "px",
      duration: totalDistance * 0.0013,
      ease: "power1.inOut",
      overwrite: "auto",
    });
    gsap.to(activeCard, {
      transform: "scale(1)",
      duration: "0.2",
    });

    if (activeCard.deleteTrigger === true) {
      activeCard.style.transition = "opacity 0.2s";
      activeCard.style.opacity = "0";
      for (let i = 0; i < cardsGame.length; i++) {
        cardsGame[i].style.pointerEvents = "none";
      }
      // activeCard.innerHTML = ""
      setTimeout(() => {
        for (let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        activeCard.style.display = "none";
      }, 300);
    }

    if (dragged && container !== 0) {
/*      let dmg;

      if (
        getComputedStyle(activeCard).backgroundImage.includes("Artual.jpeg")
      ) {
        dmg = 1;
      } else if (
        getComputedStyle(activeCard).backgroundImage.includes("tetoo.jpeg")
      ) {
        dmg = 2;
      } else {
        dmg = 3;
      }*/


      if (agent) {
        agent.health -= dmg;

        if (agent.health <= 0){
            agent.querySelector(".heart").textContent = 0;
            console.log(agent.id)
            gsap.to(agent, {
                filter: "grayscale(1)",
                duration:  0.5,
            });
            if(agent0.health <= 0 && agent1.health <= 0 && agent2.health <= 0){
                console.log("i love cock so fucking mch")
                endScreen.style.top = "0vh";
            }
        }
        else {
            agent.querySelector(".heart").textContent = agent.health;
        }
      }

      console.log("Health:", agent0.health, "Name:", agent0.id);
      console.log("Health:", agent1.health, "Name:", agent1.id);
      console.log("Health:", agent2.health, "Name:", agent2.id);

    }
  } else if (
    isLocked === 0 &&
    deckCardsOponent.includes(activeCard) === false
  ) {
    if (!deckCards.includes(activeCard)) {
      deckCards.push(activeCard);
      activeCard.deck = true;
      activeCard.deleteTrigger = true;
      activeCard.deckOponent = false; // Make sure it's not in opponent deck
    }

    // Remove from opponent's deck if it was there
    const oponentIndex = deckCardsOponent.indexOf(activeCard);
    if (oponentIndex !== -1) {
      deckCardsOponent.splice(oponentIndex, 1);
    }

    activeCard.style.setProperty(
      "--border-animation",
      "pulseBorder 1.7s ease-in-out infinite"
    );

    updateDeckPositions(totalDistance * 0.0008);

    gsap.to(activeCard, {
      duration: totalDistance * 0.0008,
      overwrite: "auto",
      onStart: () => {
        for (let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "none";
        }
        isLocked = null;
        buttonEnable = false;
        document.querySelectorAll(".spawnButtons").forEach((btn) => {
          btn.draggable = false;
          btn.style.cursor = "default";
        });
      },
      pointerEvents: "auto",
      onComplete: () => {
        inDeck = 1;
        if (activeCard.spawning === true) {
          activeCard.style.zIndex = activeCard.style.zIndex - 80;
        }
        activeCard.spawning = false;
        for (let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        buttonEnable = true;
        document.querySelectorAll(".spawnButtons").forEach((btn) => {
          btn.draggable = true;
          btn.style.cursor = "pointer";
        });
        //console.log(deckCards);
        // console.log(card.deck);
        // console.log(card2.deck);
      },
    });

    gsap.to(handhitbox, {
      duration: totalDistance * 0.0008,
      onStart: () => {
        handhitbox.removeEventListener("mousedown", handOpening);
        handhitbox.style.cursor = "default";
      },
      onComplete: () => {
        handhitbox.addEventListener("mousedown", handOpening);
        handhitbox.style.cursor = "pointer";
      },
    });
  }

  if (dropPlay === 1 && isLocked === 1 && container !== 0) {
    gsap.to(activeCard, {
      duration: totalDistance * 0.0013,
      onComplete: () => dropSound.play(),
    });
  } else if (dropPlay === 1 && isLocked === 0) {
    gsap.to(activeCard, {
      duration: totalDistance * 0.0008,
      onComplete: () => deckSound.play(),
    });
  }
  dropPlay = 0;

  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp); // Not mouseMove
}

function distanceFind(card = activeCard, cont = container) {
  if (!card) return 0;
  const domRect1 = card.getBoundingClientRect();
  let shoot = 0;
  let bang = 0;

  if (cont === 1) {
    shoot = dropper1.offsetLeft - domRect1.left;
    bang = dropper1.offsetTop - domRect1.top;
  } else if (cont === 2) {
    shoot = dropper2.offsetLeft - domRect1.left;
    bang = dropper2.offsetTop - domRect1.top;
  } else if (cont === 3) {
    shoot = dropper3.offsetLeft - domRect1.left;
    bang = dropper3.offsetTop - domRect1.top;
  } else if (cont === 4) {
    shoot = dropper4.offsetLeft - domRect1.left;
    bang = dropper4.offsetTop - domRect1.top;
  } else if (cont === 5) {
    shoot = dropper5.offsetLeft - domRect1.left;
    bang = dropper5.offsetTop - domRect1.top;
  } else if (cont === 6) {
    shoot = dropper6.offsetLeft - domRect1.left;
    bang = dropper6.offsetTop - domRect1.top;
  } else if (cont === null) {
    shoot = hand.offsetLeft - domRect1.left;
    bang = hand.offsetTop - domRect1.top;
  } else if (cont === 0) {
    shoot = randBtn.offsetLeft - domRect1.left;
    bang = randBtn.offsetTop - domRect1.top;
    if (card.deckOponent === true) {
      shoot = null;
      bang = null;
    }
  }

  return Math.hypot(shoot, bang);
}

/*window.onresize = function () {
location.replace(location.href);
};*/

//multiplayer receive
socket.on("playerMoved", (data) => {
  // Get the actual card element by ID
  let cardToMove = document.getElementById("opponent_" + data.id);
  if (!cardToMove) return; // Guard against null

  // Don't touch global activeCard/container here
  const cont = data.container;
  console.log(`Player ${data.playerId} moved ${data.id} to`, cont);

  // Always ensure this card is not accidentally present in the local deck
  const localIndex = deckCards.indexOf(cardToMove);
  if (localIndex !== -1) {
    deckCards.splice(localIndex, 1);
    cardToMove.deck = false;
  }

  // compute distance for animation using local card+container
  const totalDistance = distanceFind(cardToMove, cont);

  let dropper = null;
  if (cont === 1) dropper = dropper1;
  else if (cont === 2) dropper = dropper2;
  else if (cont === 3) dropper = dropper3;
  else if (cont === 4) dropper = dropper4;
  else if (cont === 5) dropper = dropper5;
  else if (cont === 6) dropper = dropper6;
  else if (cont === 0) dropper = randBtn;

  if (cont === null) {
    // Move into opponent deck (local representation)
    if (!deckCardsOponent.includes(cardToMove)) {
      deckCardsOponent.push(cardToMove);
    }
    cardToMove.deckOponent = true;
    cardToMove.deck = false;
    updateDeckPositionsOponent(0.5);
  } else {
    // Remove from opponent deck if present
    const index = deckCardsOponent.indexOf(cardToMove);
    if (index !== -1) {
      deckCardsOponent.splice(index, 1);
      updateDeckPositionsOponent(0.5);
    }
    cardToMove.deckOponent = false;

    // Animate to dropper if we have a dropper target
    if (dropper) {
      gsap.to(cardToMove, {
        left: dropper.offsetLeft + "px",
        top: dropper.offsetTop + "px",
        duration: totalDistance * 0.0013,
        ease: "power1.inOut",
        overwrite: true,
      });

      cardToMove.style.transition = "opacity 0.2s";
      cardToMove.style.opacity = "0";
      for (let i = 0; i < cardsGame.length; i++) {
        cardsGame[i].style.pointerEvents = "none";
      }
      setTimeout(() => {
        for (let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        cardToMove.style.display = "none";
      }, 300);
    }
  }
});

function scale() {
  gsap.to(activeCard, {
    transform: "scale(1.2)",
    duration: "0.2",
  });
}

function selectAbility(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

cardSymb = [
  'url("images/guns/shorty.png")',
  'url("images/guns/frenzy.png")',
  'url("images/guns/ghost.png")',
  'url("images/guns/sheriff.png")',
  'url("images/guns/stinger.png")',
  'url("images/guns/spectre.png")',
  'url("images/guns/bucky.png")',
  'url("images/guns/judge.png")',
  'url("images/guns/bulldog.png")',
  'url("images/guns/guardian.png")',
  'url("images/guns/phantom.png")',
  'url("images/guns/vandal.png")',
  'url("images/guns/marshal.png")',
  'url("images/guns/outlaw.png")',
  'url("images/guns/operator.png")',
  'url("images/guns/ares.png")',
  'url("images/guns/odin.png")'
];

const priceList = [
  300, 450, 500, 800, 1100, 1600, 850,
  1850, 2050, 2250, 2900, 2900, 950,
  2400, 4700, 1600, 3200
];

const abilitySymb = [
  'url("images/abilitycards/arc rose.png")', //0
  'url("images/abilitycards/barrier orb.png")', //1
  'url("images/abilitycards/cloudburst.png")', //2
  'url("images/abilitycards/contigency.png")', //3
  'url("images/abilitycards/dark cover.png")', //4
  'url("images/abilitycards/double tap.png")', //5
  'url("images/abilitycards/guiding light.png")', //6
  'url("images/abilitycards/healing orb.png")', //7
  'url("images/abilitycards/meddle.png")', //8
  'url("images/abilitycards/owl drone.png")', //9
  'url("images/abilitycards/paranoia.png")', //10
  'url("images/abilitycards/pick me up.png")', //11
  'url("images/abilitycards/razorvine.png")', //12
  'url("images/abilitycards/recon bolt.png")', //13
  'url("images/abilitycards/regrowth.png")', //14
  'url("images/abilitycards/ruse.png")',  //15
  'url("images/abilitycards/shear.png")', //16
  'url("images/abilitycards/shock bolt.png")', //17
  'url("images/abilitycards/slow orb.png")', //18
  'url("images/abilitycards/shrouded step.png")', //19
  'url("images/abilitycards/tailwind.png")', //20
  'url("images/abilitycards/trailblazer.png")', //21
  'url("images/abilitycards/undercut.png")', //22
  'url("images/abilitycards/updraft.png")' //23
];

const abilityIcon = [
    'url("images/abilityIcon/arc rose.webp")', //0
    'url("images/abilityIcon/barrier orb.webp")', //1
    'url("images/abilityIcon/cloudburst.webp")', //2
    'url("images/abilityIcon/contigency.webp")', //3
    'url("images/abilityIcon/dark cover.webp")', //4
    'url("images/abilityIcon/double tap.webp")', //5
    'url("images/abilityIcon/guiding light.webp")', //6
    'url("images/abilityIcon/healing orb.webp")', //7
    'url("images/abilityIcon/meddle.webp")', //8
    'url("images/abilityIcon/owl drone.webp")', //9
    'url("images/abilityIcon/paranoia.webp")', //10
    'url("images/abilityIcon/pick me up.webp")', //11
    'url("images/abilityIcon/razorvine.webp")', //12
    'url("images/abilityIcon/recon bolt.webp")', //13
    'url("images/abilityIcon/regrowth.webp")', //14
    'url("images/abilityIcon/ruse.webp")',  //15
    'url("images/abilityIcon/shear.webp")', //16
    'url("images/abilityIcon/shock bolt.webp")', //17
    'url("images/abilityIcon/slow orb.webp")', //18
    'url("images/abilityIcon/shrouded step.webp")', //19
    'url("images/abilityIcon/tailwind.webp")', //20
    'url("images/abilityIcon/trailblazer.webp")', //21
    'url("images/abilityIcon/undercut.webp")', //22
    'url("images/abilityIcon/updraft.webp")' //23
]

const abilityPrice = [
  150,300,200,200,150,200,250,250
  ,250,400,250,200,150,250,150,150
  ,200,150,200,100,200,300,300,150
]

let agentBtn = document.getElementById("agentBtn");


updateSpawnerButtons();
credsText.innerHTML = creds + "c";

let ab1 = document.getElementById("ab1");
let ab2 = document.getElementById("ab2");
let ab3 = document.getElementById("ab3");

function createCard(id, initialX, initialY, buttonId) {
  //Create the DOM element
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.id = id;
  cardElement.style.left = initialX + "px";
  cardElement.style.top = initialY + "px";

  // TODO [yell]: // FRONT IMAGES

  const bg = getComputedStyle(agentBtn).backgroundImage;

  let rndNum = selectAbility(0, 23);
  let imgSelect;

    // --- inside the function where you handle ability buttons (createCard block) ---
    let qIndex, eIndex, cIndex;

// choose indices per agent (use the same indices you've been using)
    if (bg.includes("skye_icon.webp")) {
        qIndex = 21; eIndex = 6;  cIndex = 14;
    } else if (bg.includes("sage_icon.webp")) {
        qIndex = 18; eIndex = 7;  cIndex = 1;
    } else if (bg.includes("jett_icon.webp")) {
        qIndex = 23; eIndex = 20; cIndex = 2;
    } else if (bg.includes("vyse_icon.webp")) {
        qIndex = 16; eIndex = 0;  cIndex = 12;
    } else if (bg.includes("omen_icon.webp")) {
        qIndex = 10; eIndex = 4;  cIndex = 19;
    } else if (bg.includes("clove_icon.webp")) {
        qIndex = 8;  eIndex = 15; cIndex = 11;
    } else if (bg.includes("iso_icon.webp")) {
        qIndex = 22; eIndex = 5;  cIndex = 3;
    } else if (bg.includes("sova_icon.webp")) {
        qIndex = 17; eIndex = 13; cIndex = 9;
    }

// assign the selected image like before
    if (buttonId === "randBtn") {
        imgSelect = abilitySymb[rndNum];
    } else if (buttonId === "ab1" || buttonId === "ab2" || buttonId === "ab3") {
        if (buttonId === "ab1") imgSelect = abilitySymb[qIndex];
        else if (buttonId === "ab2") imgSelect = abilitySymb[eIndex];
        else if (buttonId === "ab3") imgSelect = abilitySymb[cIndex];

        // set prices (dataset must be string)
        ab1.dataset.price = String(abilityPrice[qIndex]);
        ab2.dataset.price = String(abilityPrice[eIndex]);
        ab3.dataset.price = String(abilityPrice[cIndex]);

        // set button icons (use abilityIcon array)
        ab1.style.backgroundImage = abilityIcon[qIndex];
        ab2.style.backgroundImage = abilityIcon[eIndex];
        ab3.style.backgroundImage = abilityIcon[cIndex];
    } else {
        imgSelect = cardSymb[buttonMap[buttonId]];
    }

    const front = document.createElement("div");
    front.className = "face front";
    const back = document.createElement("div");
    back.className = "face back";


    front.style.backgroundImage = imgSelect;
    front.style.backgroundSize = "cover";
    front.style.backgroundPosition = "center";

  // TODO [yell]: // PRICES

  if (buttonId !== "randBtn" && buttonId !== "ab1" && buttonId !== "ab2" && buttonId !== "ab3") {
    const index = cardSymb.indexOf(imgSelect);
    cardElement.price = priceList[index];
    cardElement.type = "gun"

      cardElement.weaponName = imgSelect
          .replace('url("images/guns/', '')
          .replace('.png")', '');

      console.log("Created gun card:", cardElement.weaponName);



  } else if (buttonId === "randBtn"){
    cardElement.price = 0;
  } else {
      // Calculate the type directly from the index you already have
      if(buttonId === "ab1"){
          cardElement.type = abilitySymb[qIndex]
              .replace('url("images/abilitycards/', "")
              .replace('.png")', "");
          console.log(cardElement.type);
      }
      else if(buttonId === "ab2"){
          cardElement.type = abilitySymb[eIndex]
              .replace('url("images/abilitycards/', "")
              .replace('.png")', "");
          console.log(cardElement.type);
      }
      else if(buttonId === "ab3"){
          cardElement.type = abilitySymb[cIndex]
              .replace('url("images/abilitycards/', "")
              .replace('.png")', "");
          console.log(cardElement.type);
      }
      const abIndex = abilitySymb.indexOf(imgSelect);
      cardElement.price = abilityPrice[abIndex];
  }


  if (buttonId !== "randBtn" && buttonId !== "ab1" && buttonId !== "ab2" && buttonId !== "ab3"){
      back.style.backgroundImage = "url(images/guns/back.png)";
  } else {
      back.style.backgroundImage = imgSelect.replace('images/abilitycards', 'images/backs')
          .replace('.png', '.webp')
  }


  // TODO [yell]: // BACK INFO

  if (imgSelect === cardSymb[0]) {
    back.innerHTML = "THIS IS A SHORTY";
  } else if (imgSelect === cardSymb[1]) {
    back.innerHTML = "THIS IS A FRENZY";
  } else if (imgSelect === cardSymb[2]) {
    back.innerHTML = "THIS IS A GHOST";
  }

  // style faces with CSS backface-visibility like earlier
  cardElement.appendChild(front);
  cardElement.appendChild(back);
  console.log(cardElement.type);

  // keep flip state
  cardElement.flipped = false;

  cardElement.addEventListener("click", () => {
    if (handDown) return;
    if (!cardElement.flipped) {
      gsap.to(cardElement, {
        rotationY: 180,
        duration: 0.65,
        ease: "back.out(1.7)",
        transformOrigin: "50% 50%",
        onStart: () => {
          activeCard.style.cursor = "default";
          handhitbox.style.pointerEvents = "none";
          cardOpenEnabled = false;
          for (let i = 0; i < deckCards.length; i++) {
            deckCards[i].style.pointerEvents = "none";
          }
        },
        onComplete: () => {
          activeCard.style.cursor = "pointer";
          handhitbox.style.pointerEvents = "all";
          cardOpenEnabled = true;
          for (let i = 0; i < deckCards.length; i++) {
            deckCards[i].style.pointerEvents = "all";
          }
        },
      });
    } else {
      gsap.to(cardElement, {
        rotationY: 0,
        duration: 0.65,
        ease: "back.out(1.7)",
        transformOrigin: "50% 50%",
        onStart: () => {
          activeCard.style.cursor = "default";
          handhitbox.style.pointerEvents = "none";
          cardOpenEnabled = false;
          for (let i = 0; i < deckCards.length; i++) {
            deckCards[i].style.pointerEvents = "none";
          }
        },
        onComplete: () => {
          activeCard.style.cursor = "pointer";
          handhitbox.style.pointerEvents = "all";
          cardOpenEnabled = true;
          for (let i = 0; i < deckCards.length; i++) {
            deckCards[i].style.pointerEvents = "all";
          }
        },
      });
    }
    cardElement.flipped = !cardElement.flipped;
  });

  //Initialize the deck property
  cardElement.deck = false;
  cardElement.deleteTrigger = false;
  cardElement.draggedAO = false; //maybe useless
  cardElement.spawning = true;
  cardElement.dmg = 3;

  cardElement.addEventListener("mousedown", (e) => mouseDown(e, cardElement));

  //mouseDown(cardElement);
  //cardElement.addEventListener("mousemove", mouseMove);
  //cardElement.addEventListener("mouseup", mouseUp);

  //Add to the DOM
    document.querySelector(".container").appendChild(cardElement);

    cardElement.style.opacity = "0";
    cardElement.style.transform = "scale(0.7)";

    gsap.to(cardElement, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: "power2.out"
    });



// store and return
    allCards[id] = cardElement;
    return cardElement;
}

let nOfCards = 0;
function spawnCard(e) {
  if (!buttonEnable) {
    return; // stop the function from running
  }

  nOfCards += 1;

  const cardId = "card" + nOfCards;
  zIndexes.push(cardId);
  //console.log(zIndexes);

  const button = e.target.id;
  isLocked = 1;

  const x = e.clientX - (window.innerWidth * 0.1078125) / 2;
  const y = e.clientY - (window.innerWidth * 0.15) / 2;
  //const x = e.clientX - self.innerWidth / 2;
  //const y = e.clientY - self.innerHeight / 2;

  const newCard = createCard(cardId, x, y, button);
  document.getElementById(cardId).style.zIndex = zIndexes.indexOf(cardId) + 100;

  cardsGame.push(newCard);
  activeCard = newCard;
  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  /*    dragged = false;
  activeCard.deck = false;*/
  socket.emit("spawnedCard", {
    id: cardId,
  });
  //console.log("spawned and dragging card: " + cardId);
}
socket.on("enemySpawnedCard", (data) => {
  //console.log("enemy spawned card: " + data);

  const enemycard = document.createElement("div");
  enemycard.className = "card";
  enemycard.id = "opponent_" + data;
  enemycard.style.left = window.innerWidth/2 + "px";
  enemycard.style.top = window.innerHeight/2 + "px";

  enemycard.style.backgroundImage = "url(images/abilitycards/back.png)";
  enemycard.deckOponent = true;
  deckCardsOponent.push(enemycard);
  cardsGame.push(enemycard);
  document.querySelector(".container").appendChild(enemycard);
    updateDeckPositionsOponent(0.5);
});

// TODO [yell]: // PRICE KEEPERS

function updateSpawnerButtons() {
  for (let btn of spawnButtons) {
    const price = parseInt(btn.dataset.price) || 0;
    if (creds >= price) {
      // enable
      // we should add classlist here later
      btn.style.pointerEvents = "all";
    } else {
      // disable
      // we should add classlist here later
      btn.style.pointerEvents = "none";
    }
  }
}

let handDown = true;

function handOpening() {
  if (handDown === true && deckCards.length !== 0) {
    //console.log(deckCards);
    handhitbox.style.height = "15.5vw";
    handhitbox.style.zIndex = "1";
    //cardSpacing = 270;
      cardSpacing = window.innerWidth * 0.11;

    updateDeckPositions(0.5);
    handDown = false;
    //console.log("handown:" + handDown);

    canDrag = false;
    for (let i = 0; i < deckCards.length; i++) {
      deckCards[i].style.pointerEvents = "none";
      deckCards[i].style.cursor = "none";
    }
    handhitbox.style.pointerEvents = "none";
    cardOpenEnabled = false;

    setTimeout(() => {
      canDrag = true;

      for (let i = 0; i < deckCards.length; i++) {
        deckCards[i].style.pointerEvents = "all";
        deckCards[i].style.cursor = "pointer";
      }
      handhitbox.style.pointerEvents = "all";
      cardOpenEnabled = true;
    }, 500);
  } else if (handDown === false && deckCards.length !== 0) {
    //console.log(deckCards);
    handhitbox.style.height = "5.5vw";
    handhitbox.style.zIndex = "99";
    //cardSpacing = 180;
      cardSpacing = window.innerWidth * 0.06;
    updateDeckPositions(0.5);
    handDown = true;
  }
}

if (cardOpenEnabled === true) {
  //console.log("diameters");
  onMoveOutside(handhitbox, deckCards, () => handOpening());
}

function updateDeckPositions(speed) {
  // Only layout cards that are actually in our deck and not flagged as opponent's
  const activeDeck = deckCards.filter((c) => c && !c.deckOponent);
  const totalWidth = (activeDeck.length - 1) * cardSpacing;
  const centerX = hand.offsetLeft + hand.offsetWidth / 2;

  activeDeck.forEach((card, i) => {
    const targetX =
      centerX - totalWidth / 2 + i * cardSpacing - card.offsetWidth / 2;
    const targetY = hand.offsetTop;
    gsap.to(card, {
      left: targetX + "px",
      top: targetY + "px",
      duration: speed,
      ease: "power1.inOut",
    });
  });
}

function updateDeckPositionsOponent(speed) {
  // Only layout opponent cards that are flagged opponent-owned
  const activeOppDeck = deckCardsOponent.filter((c) => c && c.deckOponent);
  const totalWidth = (activeOppDeck.length - 1) * cardSpacing;
  const centerX = hand.offsetLeft + hand.offsetWidth / 2;

  activeOppDeck.forEach((card, i) => {
    const targetX =
      centerX - totalWidth / 2 + i * cardSpacing - card.offsetWidth / 2;
    const targetY = window.innerHeight - hand.offsetTop - 0.15 * window.innerWidth;
    gsap.to(card, {
      left: targetX + "px",
      top: targetY + "px",
      duration: speed,
      ease: "power1.inOut",
    });
  });
}

function onMoveOutside(element1, element2, callback) {
  document.addEventListener("mousedown", (e) => {
    if (!cardOpenEnabled) {
      return;
    }

    if (handDown === false) {
      let outsideAll = true;
      element2.forEach((element) => {
        if (element.contains(e.target)) {
          outsideAll = false;
        }
      });

      if (!element1.contains(e.target) && outsideAll) {
        callback();
      }
    }
  });
}

const menu = document.getElementById("shopMenu");
const menuExit = document.querySelector(".close");

let currentAgentIndex = 0;
let currentCircle = 0;

let circle1 = document.getElementById("left");
let circle2 = document.getElementById("middle");
let circle3 = document.getElementById("right");
let circles = [circle1, circle2, circle3];

function spawnMenu() {
  menu.style.top = "4vh";
  updateAgent();
}

agentBtn.addEventListener("click", () => {
  currentAgentIndex = (currentAgentIndex + 1) % agentsChosen.length;
  currentCircle = (currentCircle + 1) % circles.length;
  updateAgent();
  abNames();
});

function updateAgent() {
  const agentName = agentsChosen[currentAgentIndex]; // reliable source

  // Fade out image
  agentBtn.classList.add("fade-img");

  // Set ability texts immediately (no waiting for fade)
  abNames(agentName);

  // After the fade duration, switch the image and fade back in
  setTimeout(() => {
    agentBtn.style.backgroundImage = `url(images/agentIcon/${agentName}_icon.webp)`;
    console.log(`url(images/agentIcon/${agentName}_icon.webp)`);
    agentBtn.classList.remove("fade-img");
  }, 200); // matches your CSS transition

  for(let i = 0; i < circles.length; i++) {
    circles[i].style.backgroundColor = "white";
  }
  circles[currentCircle].style.backgroundColor = "#dca61e";


}

// Update abNames to take agentName as parameter
function abNames(agent) {
    let qIndex, eIndex, cIndex;

    if (agent === "skye") {
        qIndex = 21; eIndex = 6;  cIndex = 14;
        ab1.querySelector(".nameWpn").innerText = "TRAILBLAZER";
        ab2.querySelector(".nameWpn").innerText = "GUIDING LIGHT";
        ab3.querySelector(".nameWpn").innerText = "REGROWTH";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "2.3vw"
        ab2.style.backgroundSize = "2.9vw"
        ab3.style.backgroundSize = "2.8vw"

    } else if (agent === "sage") {
        qIndex = 18; eIndex = 7;  cIndex = 1;
        ab1.querySelector(".nameWpn").innerText = "SLOW ORB";
        ab2.querySelector(".nameWpn").innerText = "HEALING ORB";
        ab3.querySelector(".nameWpn").innerText = "BARRIER ORB";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "2.75vw"
        ab2.style.backgroundSize = "2.75vw"
        ab3.style.backgroundSize = "3.2vw"
    } else if (agent === "jett") {
        qIndex = 23; eIndex = 20; cIndex = 2;
        ab1.querySelector(".nameWpn").innerText = "UPDRAFT";
        ab2.querySelector(".nameWpn").innerText = "TAILWIND";
        ab3.querySelector(".nameWpn").innerText = "CLOUDBURST";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "2.2vw"
        ab2.style.backgroundSize = "3.2vw"
        ab3.style.backgroundSize = "2.7vw"
    } else if (agent === "vyse") {
        qIndex = 16; eIndex = 0;  cIndex = 12;
        ab1.querySelector(".nameWpn").innerText = "SHEAR";
        ab2.querySelector(".nameWpn").innerText = "ARC ROSE";
        ab3.querySelector(".nameWpn").innerText = "RAZORVINE";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "3.2vw"
        ab2.style.backgroundSize = "3vw"
        ab3.style.backgroundSize = "3.2vw"
    } else if (agent === "omen") {
        qIndex = 10; eIndex = 4;  cIndex = 19;
        ab1.querySelector(".nameWpn").innerText = "PARANOIA";
        ab2.querySelector(".nameWpn").innerText = "DARK COVER";
        ab3.querySelector(".nameWpn").innerText = "SHROUDED STEP";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "3vw"
        ab2.style.backgroundSize = "2.5vw"
        ab3.style.backgroundSize = "2.75vw"
    } else if (agent === "clove") {
        qIndex = 8;  eIndex = 15; cIndex = 11;
        ab1.querySelector(".nameWpn").innerText = "MEDDLE";
        ab2.querySelector(".nameWpn").innerText = "RUSE";
        ab3.querySelector(".nameWpn").innerText = "PICK-ME-UP";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "3.2vw"
        ab2.style.backgroundSize = "2.7vw"
        ab3.style.backgroundSize = "3vw"
    } else if (agent === "iso") {
        qIndex = 22; eIndex = 5;  cIndex = 3;
        ab1.querySelector(".nameWpn").innerText = "UNDERCUT";
        ab2.querySelector(".nameWpn").innerText = "DOUBLE TAP";
        ab3.querySelector(".nameWpn").innerText = "CONTINGENCY";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "2.8vw"
        ab2.style.backgroundSize = "2vw"
        ab3.style.backgroundSize = "3vw"
    } else if (agent === "sova") {
        qIndex = 17; eIndex = 13; cIndex = 9;
        ab1.querySelector(".nameWpn").innerText = "SHOCK BOLT";
        ab2.querySelector(".nameWpn").innerText = "RECON BOLT";
        ab3.querySelector(".nameWpn").innerText = "OWL DRONE";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";
        ab1.style.backgroundSize = "2.7vw"
        ab2.style.backgroundSize = "2.9vw"
        ab3.style.backgroundSize = "3.5vw"
    }


    ab1.style.backgroundImage = abilityIcon[qIndex];
    ab2.style.backgroundImage = abilityIcon[eIndex];
    ab3.style.backgroundImage = abilityIcon[cIndex];
}

menuExit.addEventListener("click", () => {
  menu.style.top = "100vh";
});

function updateZIndex(cardId) {
  zIndexes.splice(zIndexes.indexOf(cardId), 1);
  zIndexes.push(cardId);
  for (let i = 0; i < zIndexes.length; i++) {
    document.getElementById(zIndexes[i]).style.zIndex = i + 3;
  }
}

 window.onresize = function () {
     dropper1 = document.getElementById("drop1");
     dropper2 = document.getElementById("drop2");
     dropper3 = document.getElementById("drop3");
     dropper4 = document.getElementById("drop4");
     dropper5 = document.getElementById("drop5");
     dropper6 = document.getElementById("drop6");

     domRect2 = dropper1.getBoundingClientRect();
     domRect3 = dropper2.getBoundingClientRect();
     domRect4 = dropper3.getBoundingClientRect();
     domRect5 = dropper4.getBoundingClientRect();
     domRect6 = dropper5.getBoundingClientRect();
     domRect7 = dropper6.getBoundingClientRect();

     updateAgentPositionsOnResize();
     updateDeckPositionsOponent(0);
     updateDeckPositions(0);
};

function updateAgentPositionsOnResize() {
    // Make sure droppers exist
    const d4 = document.getElementById("drop4");
    const d5 = document.getElementById("drop5");
    const d6 = document.getElementById("drop6");
    const d1 = document.getElementById("drop1");
    const d2 = document.getElementById("drop2");
    const d3 = document.getElementById("drop3");
    if (!d4 || !d5 || !d6) return;

    // Helper to animate element to a dropper's current left/top
    function moveToDrop(el, dropper ) {
        if (el.classList.contains("animating")) return; // don't interfere
        const rect = dropper.getBoundingClientRect();
        gsap.to(el, {
            left: rect.left + "px",
            top: rect.top + "px",
            duration: 0,
            overwrite: true
        });
    }
    // Move player's locked-in agents (agentsChosen order -> drop4,drop5,drop6)

    const drops = [d4, d5, d6];
    for (let i = 0; i < 3; i++) {
        const nameOrEl = agentsChosen[i];
        let el = document.getElementById(nameOrEl);
        moveToDrop(el, drops[i]);
    }
}

function roundOver() {
  creds = creds + 200;
  credsText.innerHTML = creds;
  updateSpawnerButtons();
}
