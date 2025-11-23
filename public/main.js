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

const dropper1 = document.getElementById("drop1");
const dropper2 = document.getElementById("drop2");
const dropper3 = document.getElementById("drop3");
const dropper4 = document.getElementById("drop4");
const dropper5 = document.getElementById("drop5");
const dropper6 = document.getElementById("drop6");


const domRect2 = dropper1.getBoundingClientRect();
const domRect3 = dropper2.getBoundingClientRect();
const domRect4 = dropper3.getBoundingClientRect();
const domRect5 = dropper4.getBoundingClientRect();
const domRect6 = dropper5.getBoundingClientRect();
const domRect7 = dropper6.getBoundingClientRect();


const randBtn = document.getElementById("randBtn")
const shortyBtn = document.getElementById("shortyBtn")
const frenzyBtn = document.getElementById("frenzyBtn")
const ghostBtn = document.getElementById("ghostBtn")
const sheriffBtn = document.getElementById("sheriffBtn")
const stingerBtn = document.getElementById("stingerBtn")
const spectreBtn = document.getElementById("spectreBtn")
const buckyBtn = document.getElementById("buckyBtn")
const judgeBtn = document.getElementById("judgeBtn")
const bulldogBtn = document.getElementById("bulldogBtn")
const guardianBtn = document.getElementById("guardianBtn")
const phantomBtn = document.getElementById("phantomBtn")
const vandalBtn = document.getElementById("vandalBtn")
const marshalBtn = document.getElementById("marshalBtn")
const outlawBtn = document.getElementById("outlawBtn")
const operatorBtn = document.getElementById("operatorBtn")
const aresBtn = document.getElementById("aresBtn")
const odinBtn = document.getElementById("odinBtn")

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
  if (agentsChosen.length === 3) {
    document.getElementById("lockIn").classList.add("full");
  } else {
    document.getElementById("lockIn").classList.remove("full");
  }

  console.log("Selected agents:", agentsChosen);
}

function lockIn() {
  console.log("lock in");
  if (agentsChosen.length === 3) {
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

        console.log("is there");
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

        console.log("not there");
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
          }
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
}

socket.on("enemyChose", (data) => {
  let enemyAgents = data.agentsChosen;
  console.log("Enemy chose agents:", data.agentsChosen);
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

  const glint = document.createElement("div");
  glint.className = "glint";
  enemyAgent.appendChild(glint);

  document.body.appendChild(enemyAgent);

  return enemyAgent;
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

let health = 10;
let healthtext = document.getElementById("health");
let credsText = document.getElementById("money")
let creds = 100000;

const handhitbox = document.getElementById("bottomhitbox");
let cardSpacing = 180;

let cardOpenEnabled = true;
let canDrag = true;
function mouseDown(e, cardElement) {
  activeCard = cardElement;

  if (!canDrag) return;

  if(handDown === true){
    return;
  } else {
      for(let i = 0; i < deckCards.length; i++) {
        deckCards[i].addEventListener("click", () => {
          if(handDown === false){
            console.log("MOMMYYY")
          }
        });
      }
  }


  console.log("MouseDown:", cardElement.id, activeCard.id);

  updateZIndex(activeCard.id);

  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  gsap.killTweensOf(activeCard);

  dragged = false;
}

let agent0, agent1, agent2;

function mouseMove(e) {
  newX = startX - e.clientX;
  newY = startY - e.clientY;

  startX = e.clientX;
  startY = e.clientY;

  activeCard.style.top = activeCard.offsetTop - newY + "px";
  activeCard.style.left = activeCard.offsetLeft - newX + "px";

  inDeck = 0;
  dropPlay = 1;
  dragged = true;

  let purple = document.getElementById("luh");
  let purpleRect = purple.getBoundingClientRect();

  /* if(activeCard.infoAble === true){
    activeCard.infoBox.classList.toggle("visible");
    activeCard.infoAble = false;
  } */

  if (activeCard.deck === true) {
    console.log("zoul  be mine");
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

  console.log(isLocked);


  //box1
  const domRect1 = activeCard.getBoundingClientRect();



  if(activeCard.spawning === true){
    if(!(
        domRect1.top > purpleRect.bottom ||
        domRect1.right < purpleRect.left ||
        domRect1.bottom < purpleRect.top ||
        domRect1.left > purpleRect.right
    )){
      purple.style.backgroundColor = "rgba(141, 133, 171, 0.4)"
      isLocked = 0
      container = null;
    } else{
      purple.style.backgroundColor = "initial"
      isLocked = 1;
      container = 0;
    }
  }

  if(activeCard.spawning === false){
    if (
        !(
            domRect1.top > domRect2.bottom ||
            domRect1.right < domRect2.left ||
            domRect1.bottom < domRect2.top ||
            domRect1.left > domRect2.right
        )
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
        )
    ) {
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
        )
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
        )
    ) {
      isLocked = 1;
      container = 4;
      scale();
    } else if (
        !(
            domRect1.top > domRect6.bottom ||
            domRect1.right < domRect6.left ||
            domRect1.bottom < domRect6.top ||
            domRect1.left > domRect6.right
        )
    ) {
      isLocked = 1;
      container = 5;
      scale();
    } else if (
        !(
            domRect1.top > domRect7.bottom ||
            domRect1.right < domRect7.left ||
            domRect1.bottom < domRect7.top ||
            domRect1.left > domRect7.right
        )
    ) {
      isLocked = 1;
      container = 6;
      scale();
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
    cardSpacing = 180;
    updateDeckPositions(0.5);
    handDown = true;
    //console.log(handDown)
  }
  // TODO [yell]: HERE IS THE THING

  distanceFind();
}


function mouseUp() {
  console.log("MouseUp:", activeCard?.id);
  if (!dragged) {
    isLocked = null;
  }

  socket.emit("cardPos", {
    containerInfo: container,
    id: activeCard.id,
  });

  if(activeCard.spawning ===  true){
    let purple = document.getElementById("luh");


    purple.style.backgroundColor = "initial"

    if(isLocked === 1){
      activeCard.style.transition = "opacity 0.2s";
      activeCard.style.opacity = "0";

      setTimeout(() => {
        for(let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        activeCard.style.display = "none";
      }, 300);
    }
    else {
        creds = creds - activeCard.price;
        credsText.innerHTML = creds;
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
        for(let i = 0; i < cardsGame.length; i++) {
          cardsGame[i].style.pointerEvents = "all";
        }
        activeCard.style.display = "none";
      }, 300);
    }

    if(dragged && container !== 0) {
      let dmg;

      if (getComputedStyle(activeCard).backgroundImage.includes("Artual.jpeg")) {
        dmg = 1;
      } else if (getComputedStyle(activeCard).backgroundImage.includes("tetoo.jpeg")) {
        dmg = 2;
      } else {
        dmg = 3;
      }

      health -= dmg;

      if (agent) {
        agent.health -= dmg;
        agent.querySelector(".agentHealth").textContent = agent.health;
      }

      console.log("Health:", agent0.health, "Name:", agent0.id);
      console.log("Health:", agent1.health, "Name:", agent1.id);
      console.log("Health:", agent2.health, "Name:", agent2.id);
      healthtext.innerHTML = health;
      console.log(health);
    }
  }
  else if (isLocked === 0 && deckCardsOponent.includes(activeCard) === false) {
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

    activeCard.style.setProperty("--border-animation", "pulseBorder 1.7s ease-in-out infinite");

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
        document.querySelectorAll(".spawnButtons").forEach(btn => {
          btn.draggable = false;
          btn.style.cursor = "default";
        });
      },
      pointerEvents: "auto",
      onComplete: () => {
        inDeck = 1;
        if(activeCard.spawning === true){
          activeCard.style.zIndex = activeCard.style.zIndex - 80;
        }
        activeCard.spawning = false;
        for(let i = 0; i < cardsGame.length; i++) {
              cardsGame[i].style.pointerEvents = "all";
          }
        buttonEnable = true;
        document.querySelectorAll(".spawnButtons").forEach(btn => {
          btn.draggable = true;
          btn.style.cursor = "pointer";
        });
        console.log(deckCards);
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
    bang = hand.offsetTop - domRect1.top; }
    else if (cont === 0) {
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
  let cardToMove = document.getElementById(data.id);
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

updateSpawnerButtons();
credsText.innerHTML = creds;

function createCard(id, initialX, initialY, buttonId) {
  //Create the DOM element
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.id = id;
  cardElement.style.left = initialX + "px";
  cardElement.style.top = initialY + "px";

  // TODO [yell]: // FRONT IMAGES

  let rndNum = selectAbility(0, 3);
  let imgSelect;
  if (buttonId === "randBtn") {
    imgSelect = cardSymb[rndNum];
  } else if (buttonId === "shortyBtn") {
    imgSelect = cardSymb[0];
  } else if (buttonId === "frenzyBtn") {
    imgSelect = cardSymb[1];
  }  else if (buttonId === "ghostBtn") {
    imgSelect = cardSymb[2];
  } else if (buttonId === "sheriffBtn") {
    imgSelect = cardSymb[3];
  } else if (buttonId === "stingerBtn") {
    imgSelect = cardSymb[4];
  } else if (buttonId === "spectreBtn") {
    imgSelect = cardSymb[5];
  } else if (buttonId === "buckyBtn") {
    imgSelect = cardSymb[6];
  } else if (buttonId === "judgeBtn") {
    imgSelect = cardSymb[7];
  } else if (buttonId === "bulldogBtn") {
    imgSelect = cardSymb[8];
  } else if (buttonId === "guardianBtn") {
    imgSelect = cardSymb[9];
  } else if (buttonId === "phantomBtn") {
    imgSelect = cardSymb[10];
  } else if (buttonId === "vandalBtn") {
    imgSelect = cardSymb[11];
  } else if (buttonId === "marshalBtn") {
    imgSelect = cardSymb[12];
  } else if (buttonId === "outlawBtn") {
    imgSelect = cardSymb[13];
  } else if (buttonId === "operatorBtn") {
    imgSelect = cardSymb[14];
  } else if (buttonId === "aresBtn") {
    imgSelect = cardSymb[15];
  } else if (buttonId === "odinBtn") {
    imgSelect = cardSymb[16];
  }

  cardElement.style.backgroundImage = imgSelect;

  // TODO [yell]: // PRICES

  if(imgSelect === cardSymb[0] && buttonId !== "randBtn"){
    cardElement.price = 300
  }
  else if(imgSelect === cardSymb[1] && buttonId !== "randBtn"){
    cardElement.price = 450
  }
  else if(imgSelect === cardSymb[2] && buttonId !== "randBtn"){
    cardElement.price = 500
  }
  else if(imgSelect === cardSymb[3] && buttonId !== "randBtn"){
    cardElement.price = 800
  }
  else if(imgSelect === cardSymb[4] && buttonId !== "randBtn"){
    cardElement.price = 1100
  }
  else if(imgSelect === cardSymb[5] && buttonId !== "randBtn"){
    cardElement.price = 1600
  }
  else if(imgSelect === cardSymb[6] && buttonId !== "randBtn"){
    cardElement.price = 850
  }
  else if(imgSelect === cardSymb[7] && buttonId !== "randBtn"){
    cardElement.price = 1850
  }
  else if(imgSelect === cardSymb[8] && buttonId !== "randBtn"){
    cardElement.price = 2050
  }
  else if(imgSelect === cardSymb[9] && buttonId !== "randBtn"){
    cardElement.price = 2250
  }
  else if(imgSelect === cardSymb[10] && buttonId !== "randBtn"){
    cardElement.price = 2900
  }
  else if(imgSelect === cardSymb[11] && buttonId !== "randBtn"){
    cardElement.price = 2900
  }
  else if(imgSelect === cardSymb[12] && buttonId !== "randBtn"){
    cardElement.price = 950
  }
  else if(imgSelect === cardSymb[13] && buttonId !== "randBtn"){
    cardElement.price = 2400
  }
  else if(imgSelect === cardSymb[14] && buttonId !== "randBtn"){
    cardElement.price = 4700
  }
  else if(imgSelect === cardSymb[15] && buttonId !== "randBtn"){
    cardElement.price = 1600
  }
  else if(imgSelect === cardSymb[16] && buttonId !== "randBtn"){
    cardElement.price = 3200
  }
  else {
    cardElement.price = 0
  }

  /* cardElement.infoAble = false

  const ib = document.createElement("div");
  ib.className = "cardInfo"; // hidden by default
  ib.innerHTML = `I love cock`;
  cardElement.appendChild(ib);
  cardElement.infoBox = ib;

  cardElement.addEventListener("click", (e) => {
    if (handDown) return; // ignore if hand is down
    e.stopPropagation(); // prevent bubbling if needed
    cardElement.infoBox.classList.toggle("visible");

    cardElement.infoAble = cardElement.infoAble !== true;

    console.log("make it happen" + cardElement.infoAble);
  }); */

  const front = document.createElement("div");
  front.className = "face front";
  const back = document.createElement("div");
  back.className = "face back";

  // TODO [yell]: // BACK INFO

  if(imgSelect === cardSymb[0]){
    back.innerHTML = "THIS IS A SHORTY";
  } else if(imgSelect === cardSymb[1]) {
    back.innerHTML = "THIS IS A FRENZY";
  } else if(imgSelect === cardSymb[2]) {
    back.innerHTML = "THIS IS A GHOST";
  }


  // style faces with CSS backface-visibility like earlier
  cardElement.appendChild(front);
  cardElement.appendChild(back);

  // keep flip state
  cardElement.flipped = false;

  cardElement.addEventListener("click", () => {
    if (handDown) return;
      if (!cardElement.flipped) {
        gsap.to(cardElement,
            { rotationY: 180,
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
              }
            });
        } else
        {gsap.to(cardElement,
            { rotationY: 0,
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
              }
            });
       }
    cardElement.flipped = !cardElement.flipped;
  });

  //Initialize the deck property
  cardElement.deck = false;
  cardElement.deleteTrigger = false;
  cardElement.draggedAO = false; //maybe useless
  cardElement.spawning = true;

  cardElement.addEventListener("mousedown", (e) => mouseDown(e, cardElement));

  //mouseDown(cardElement);
  //cardElement.addEventListener("mousemove", mouseMove);
  //cardElement.addEventListener("mouseup", mouseUp);

  //Add to the DOM
  document.querySelector(".container").appendChild(cardElement);

  allCards[id] = cardElement;
  //Initial GSAP
  /*    gsap.to(cardElement, {
      transform: "scale(1)",
      duration: "0.2",
  });*/
  //activeCard = cardElement;
  return cardElement;
}

let nOfCards = 0;
function spawnCard(e) {
  if (!buttonEnable ) {
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
    initialX: x,
    initialY: y,
    type: imgSelect,
  });
  //console.log("spawned and dragging card: " + cardId);
}

// TODO [yell]: // PRICE KEEPERS

function updateSpawnerButtons() {
  if(creds < 300){
    shortyBtn.style.pointerEvents = "none";
  } else{
    shortyBtn.style.pointerEvents = "all";
  }

  if(creds < 450){
    frenzyBtn.style.pointerEvents = "none";
  } else{
    frenzyBtn.style.pointerEvents = "all";
  }

  if(creds < 500){
    ghostBtn.style.pointerEvents = "none";
  } else{
    ghostBtn.style.pointerEvents = "all";
  }

  if(creds < 800){
    sheriffBtn.style.pointerEvents = "none";
  } else{
    sheriffBtn.style.pointerEvents = "all";
  }

  if(creds < 1100){
    stingerBtn.style.pointerEvents = "none";
  } else{
    stingerBtn.style.pointerEvents = "all";
  }

  if(creds < 1600){
    spectreBtn.style.pointerEvents = "none";
  } else{
    spectreBtn.style.pointerEvents = "all";
  }

  if(creds < 850){
    buckyBtn.style.pointerEvents = "none";
  } else{
    buckyBtn.style.pointerEvents = "all";
  }

  if(creds < 1850){
    judgeBtn.style.pointerEvents = "none";
  } else{
    judgeBtn.style.pointerEvents = "all";
  }

  if(creds < 2050){
    bulldogBtn.style.pointerEvents = "none";
  } else{
    bulldogBtn.style.pointerEvents = "all";
  }

  if(creds < 2250){
    guardianBtn.style.pointerEvents = "none";
  } else{
    guardianBtn.style.pointerEvents = "all";
  }

  if(creds < 2900){
    vandalBtn.style.pointerEvents = "none";
    phantomBtn.style.pointerEvents = "none";
  } else{
    vandalBtn.style.pointerEvents = "all";
    phantomBtn.style.pointerEvents = "none";
  }

  if(creds < 950){
    marshalBtn.style.pointerEvents = "none";
  } else{
    marshalBtn.style.pointerEvents = "all";
  }

  if(creds < 2400){
    outlawBtn.style.pointerEvents = "none";
  } else{
    outlawBtn.style.pointerEvents = "all";
  }

  if(creds < 4700){
    operatorBtn.style.pointerEvents = "none";
  } else{
    operatorBtn.style.pointerEvents = "all";
  }

  if(creds < 1600){
    aresBtn.style.pointerEvents = "none";
  } else{
    aresBtn.style.pointerEvents = "all";
  }

  if(creds < 3200){
    odinBtn.style.pointerEvents = "none";
  } else{
    odinBtn.style.pointerEvents = "all";
  }

}

let handDown = true;

  function handOpening(){

    if(handDown === true && deckCards.length !== 0 ){
      console.log(deckCards)
      handhitbox.style.height = "15.5vw"
      handhitbox.style.zIndex = "1"
      cardSpacing = 270;
      updateDeckPositions(0.5);
      handDown = false;
      console.log("handown:" + handDown);

      canDrag = false;
      for(let i = 0; i < deckCards.length; i++) {
        deckCards[i].style.pointerEvents = "none";
        deckCards[i].style.cursor = "none";
      }
      handhitbox.style.pointerEvents = "none";
      cardOpenEnabled = false;

      setTimeout(() => {
        canDrag = true;

        for(let i = 0; i < deckCards.length; i++) {
          deckCards[i].style.pointerEvents = "all";
          deckCards[i].style.cursor = "pointer";
        }
        handhitbox.style.pointerEvents = "all";
        cardOpenEnabled = true;
      }, 500);
    }

    else if(handDown === false && deckCards.length !== 0 ){
      console.log(deckCards)
      handhitbox.style.height = "5.5vw"
      handhitbox.style.zIndex = "99"
      cardSpacing = 180;
      updateDeckPositions(0.5);
      handDown = true;
    }
  }

if(cardOpenEnabled === true){
  console.log("diameters");
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
    const targetY = -100;
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

      let outsideAll= true;
      element2.forEach(element =>{
        if (element.contains(e.target)) {
          outsideAll = false;
        }
      })

      if(!element1.contains(e.target) && outsideAll) {
        callback();
      }
    }
  });
}

const menu = document.getElementById("shopMenu");
const menuExit = document.getElementById("exit");
function spawnMenu() {
  menu.style.top = "4vh";
}

menuExit.addEventListener("click", () => {
  menu.style.top = "100vh";
});

function updateZIndex(cardId) {
    zIndexes.splice(zIndexes.indexOf(cardId), 1);
    zIndexes.push(cardId);
    for(let i = 0; i < zIndexes.length; i++) {
        document.getElementById(zIndexes[i]).style.zIndex = i+3;
    }
}

window.onresize = function () {
  location.replace(location.href);
};

function roundOver() {
  creds = creds + 200;
  credsText.innerHTML = creds;
  updateSpawnerButtons();
}