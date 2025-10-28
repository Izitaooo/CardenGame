const socket = io("http://localhost:3000");
const allCards = {}; // Track all cards
socket.on("updatePlayers", (players) => {
  console.log(players);
});

let startX = 0,
  startY = 0,
  newX = 0,
  newY = 0;


//const card = {

//}

let card = document.getElementById("card1");
gsap.to(card, {
  transform: "scale(1)",
  duration: "0.2",
});
let card2 = document.getElementById("card2");
gsap.to(card2, {
  transform: "scale(1)",
  duration: "0.2",
});

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

const hand = document.getElementById("hand");

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

let cardsGame = [card, card2]

let isLocked = 0;
let inDeck = 0;
let container;
let dragged = false;

let dropPlay = 0;

let activeCard = null;

let deckCards = [];

let health = 10;

const handhitbox = document.getElementById("bottomhitbox");
let cardSpacing = 180;
let dragAble = true;

card.addEventListener("mousedown", (e) => mouseDown(e, card));
card2.addEventListener("mousedown", (e) => mouseDown(e, card2));

card.deck = false;
card2.deck = false;

function mouseDown(e, cardElement) {
  activeCard = cardElement;

  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  gsap.killTweensOf(activeCard);

  dragged = false;

  if (activeCard.deck) {
    const index = deckCards.indexOf(activeCard); // find where it is in the array
    if (index !== -1) {
      deckCards.splice(index, 1); // remove that one item
    }
    activeCard.deck = false;
  }

  updateDeckPositions();
}

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

  activeCard.deck = false;


  //box1
  const domRect1 = activeCard.getBoundingClientRect();

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

  if(handDown === false){
    handhitbox.style.height = "5.5vw"
    handhitbox.style.zIndex = "99"
    cardSpacing = 180;
    updateDeckPositions();
    gsap.to(deckCards, {
      duration: 0.5,
      ease: "power1.inOut",
      top: hand.offsetTop + "px"
    });
    handDown = true;
    console.log(handDown)
  }

  console.log(activeCard)
  distanceFind();
}

function mouseUp() {
  if (!dragged) {
    isLocked = null;
  }

  socket.emit("cardPos", {
    containerInfo: container,
    id: activeCard.id,
  });
  console.log(activeCard.id);
  let totalDistance = distanceFind();

  if (isLocked === 1) {
    let dropper;

    if (container === 1) {
      dropper = dropper1;
    } else if (container === 2) {
      dropper = dropper2;
    } else if (container === 3) {
      dropper = dropper3;
    } else if (container === 4) {
      dropper = dropper4;
    } else if (container === 5) {
      dropper = dropper5;
    } else if (container === 6) {
      dropper = dropper6;
    }

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


    if(getComputedStyle(activeCard).backgroundImage.includes("Artual.jpeg")){
      health = health - 3;
    }
    else if(getComputedStyle(activeCard).backgroundImage.includes("tetoo.jpeg")){
      health = health - 1;
    }
    else{
      health = health -2;
    }
    console.log(health);
  }

  else if (isLocked === 0) {
    dragAble = false;
    if (!deckCards.includes(activeCard)) {
      deckCards.push(activeCard);
      activeCard.deck = true;
    }

    gsap.to(activeCard, {
      updateDeckPositions,
      overwrite: "auto",
      onStart: () => {
          for(let i = 0; i < cardsGame.length; i++) {
              cardsGame[i].style.pointerEvents = "none";
          }
        isLocked = null;
      },
      pointerEvents: "auto",
      onComplete: () => {
        inDeck = 1;
        for(let i = 0; i < cardsGame.length; i++) {
              cardsGame[i].style.pointerEvents = "all";
          }
        console.log(deckCards);
        console.log(card.deck);
        console.log(card2.deck);
      },
    });

  }

  if (dropPlay === 1 && isLocked === 1) {
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
  document.removeEventListener("mouseup", mouseMove);
}



function distanceFind() {
  const domRect1 = activeCard.getBoundingClientRect();
  let shoot;
  let bang;
  //box1
  if (container === 1) {
    shoot = dropper1.offsetLeft - domRect1.left;
    bang = dropper1.offsetTop - domRect1.top;
  }
  //box2
  else if (container === 2) {
    shoot = dropper2.offsetLeft - domRect1.left;
    bang = dropper2.offsetTop - domRect1.top;
  }
  //box3
  else if (container === 3) {
    shoot = dropper3.offsetLeft - domRect1.left;
    bang = dropper3.offsetTop - domRect1.top;
  } else if (container === 4) {
    shoot = dropper4.offsetLeft - domRect1.left;
    bang = dropper4.offsetTop - domRect1.top;
  } else if (container === 5) {
    shoot = dropper5.offsetLeft - domRect1.left;
    bang = dropper5.offsetTop - domRect1.top;
  } else if (container === 6) {
    shoot = dropper6.offsetLeft - domRect1.left;
    bang = dropper6.offsetTop - domRect1.top;
  } else if (container === null) {
    shoot = hand.offsetLeft - domRect1.left;
    bang = hand.offsetTop - domRect1.top;
  }

  return Math.hypot(shoot, bang);
}

window.onresize = function () {
  location.replace(location.href);
};

function updateDeckPositions() {
  let totalDistance = distanceFind();
   // horizontal spacing between cards
  const totalWidth = (deckCards.length - 1) * cardSpacing;
  const centerX = hand.offsetLeft + hand.offsetWidth / 2;

  deckCards.forEach((card, i) => {
    const targetX = centerX - totalWidth / 2 + i * cardSpacing - card.offsetWidth / 2;
    const targetY = hand.offsetTop;
    gsap.to(card, {
      left: targetX + "px",
      top: targetY + "px",
      duration: totalDistance * 0.0008,
      ease: "power1.inOut",
    });
  });
}

//multiplayer receive
socket.on("playerMoved", (data) => {
  // Get the actual card element by ID
  let cardToMove = document.getElementById(data.id);
  if (!cardToMove) return; // Guard against null
  container = data.container;
  console.log(`Player ${data.playerId} moved ${data.id} to`, data.container);
  console.log("container " + container);
  let totalDistance = distanceFind();
  let dropper;

  if (container === 1) dropper = dropper1;
  else if (container === 2) dropper = dropper2;
  else if (container === 3) dropper = dropper3;
  else if (container === 4) dropper = dropper4;
  else if (container === 5) dropper = dropper5;
  else if (container === 6) dropper = dropper6;

  // Set the active card temporarily for distance calculation
  activeCard = cardToMove;

  if (container === null) {
    gsap.to(cardToMove, {
      left: hand.offsetLeft + "px",
      top: hand.offsetTop + "px",
      duration: totalDistance * 0.0016,
      ease: "power1.inOut",
      overwrite: true,
    });
  } else {
    gsap.to(cardToMove, {
      left: dropper.offsetLeft + "px",
      top: dropper.offsetTop + "px",
      duration: totalDistance * 0.0013,
      ease: "power1.inOut",
      overwrite: true,
    });
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

cardSymb = ["url(images/luant-s-artworks-comm-avocadocat-megu.jpg)", "url(images/Artual.jpeg)", "url(images/tetoo.jpeg)"]

function createCard(id, initialX, initialY) {


    //Create the DOM element
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.id = id;
    cardElement.style.left = initialX + 'px';
    cardElement.style.top = initialY + 'px';

    let rndNum = selectAbility(0,3);

    let imgSelect;
    imgSelect = cardSymb[rndNum];
    cardElement.style.backgroundImage = imgSelect;

    //Initialize the deck property
    cardElement.deck = false;

    cardElement.addEventListener("mousedown", (e) => mouseDown(e, cardElement));

    //mouseDown(cardElement);
    //cardElement.addEventListener("mousemove", mouseMove);
    //cardElement.addEventListener("mouseup", mouseUp);

    //Add to the DOM
    document.querySelector('.container').appendChild(cardElement);

    allCards[id] = cardElement;
    //Initial GSAP
/*    gsap.to(cardElement, {
        transform: "scale(1)",
        duration: "0.2",
    });*/
    //activeCard = cardElement;
    return cardElement;
}

let nOfCards = 2;
function spawnCard(e) {
    nOfCards += 1;

    const cardId = 'card' + nOfCards;

    const x = e.clientX - (window.innerWidth * 0.1078125 /2);
    const y = e.clientY - (window.innerWidth * 0.15 /2);
    //const x = e.clientX - self.innerWidth / 2;
    //const y = e.clientY - self.innerHeight / 2;

    const newCard = createCard(cardId, x, y);

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
        type: imgSelect
    });
    console.log("spawned and dragging card: " + cardId);
}

let handDown = true;

handhitbox.addEventListener("mousedown", function(){

  if(handDown === true && deckCards.length !== 0){
    console.log(deckCards)
    cardSpacing = 270;
    updateDeckPositions();
    handhitbox.style.height = "15.5vw"
    handhitbox.style.zIndex = "1"
    gsap.to(deckCards, {
      duration: 0.5,
      ease: "power1.inOut",
      top: hand.offsetTop + "px"
    });
    handDown = false;
    dragAble = true
  }

  else if(handDown === false && deckCards.length !== 0){
    console.log(deckCards)
    handhitbox.style.height = "5.5vw"
    handhitbox.style.zIndex = "99"
    cardSpacing = 180;
    updateDeckPositions();
    gsap.to(deckCards, {
      duration: 0.5,
      ease: "power1.inOut",
      top: hand.offsetTop + "px"
    });
    handDown = true;
    dragAble = false;
  }
});