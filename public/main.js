const socket = io("http://localhost:3000");

socket.on("updatePlayers", (players) => {
  console.log(players);
});

let startX = 0,
  startY = 0,
  newX = 0,
  newY = 0;

let card = document.getElementById("card");
gsap.to(card, {
  transform: "scale(1)",
  duration: "0.2",
});

const dropper1 = document.getElementById("drop1");
const dropper2 = document.getElementById("drop2");
const dropper3 = document.getElementById("drop3");

const domRect2 = dropper1.getBoundingClientRect();
const domRect3 = dropper2.getBoundingClientRect();
const domRect4 = dropper3.getBoundingClientRect();

const hand = document.getElementById("hand");

const dropSound = new Howl({
  src: ['audio/Mystbloom Kill 4.mp3'], volume: 0.1
});
const deckSound = new Howl({
  src: ['audio/Cryostasis Kill 1.mp3'], volume: 0.2
});

let isLocked = 0;
let inDeck = 0;
let container;


let dropPlay = 0;

card.addEventListener("mousedown", mouseDown);

function mouseDown(e) {
  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  gsap.killTweensOf(card);
}

function mouseMove(e) {
  newX = startX - e.clientX;
  newY = startY - e.clientY;

  startX = e.clientX;
  startY = e.clientY;

  card.style.top = card.offsetTop - newY + "px";
  card.style.left = card.offsetLeft - newX + "px";

  inDeck = 0;
  dropPlay = 1;

  //box1
  const domRect1 = card.getBoundingClientRect();

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
    console.log(container);
    gsap.to(card, {
      transform: "scale(1.2)",
      duration: "0.2",
    });
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
    gsap.to(card, {
      transform: "scale(1.2)",
      duration: "0.2",
    });
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
    gsap.to(card, {
      transform: "scale(1.2)",
      duration: "0.2",
    });
  } else {
    isLocked = 0;
    container = null;
    gsap.to(card, {
      transform: "scale(1)",
      duration: "0.3",
    });
  }

  distanceFind();
}

function mouseUp() {
    socket.emit("cardPos", {
        containerInfo: container,
    });
  let totalDistance = distanceFind();

  if (isLocked === 1) {
    let dropper;
    //box1
    if (container === 1) {
      dropper = dropper1;
    } else if (container === 2) {
      dropper = dropper2;
    } else if (container === 3) {
      dropper = dropper3;
    }

    gsap.to(card, {
      left: dropper.offsetLeft + "px",
      top: dropper.offsetTop + "px",
      duration: totalDistance * 0.0013,
      ease: "power1.inOut",
    });
    gsap.to(card, {
      transform: "scale(1)",
      duration: "0.2",
    });
  }

  else if (isLocked === 0) {
    gsap.to(card, {
      left: hand.offsetLeft + "px",
      top: hand.offsetTop + "px",
      duration: totalDistance * 0.001,
      ease: "power1.inOut",
      onComplete: () => (inDeck = 1),
    });
    console.log(inDeck);
  }

  if (dropPlay === 1 && isLocked  === 1){
    gsap.to(card, {
      duration: totalDistance * 0.0013,
      onComplete: () => (dropSound.play()),
    })
  }
  else if (dropPlay === 1 && isLocked === 0){
    gsap.to(card, {
      duration: totalDistance * 0.001,
      onComplete: () => (deckSound.play()),
    })
  }
  dropPlay = 0;

  document.removeEventListener("mousemove", mouseMove);
}

function distanceFind() {
  const domRect1 = card.getBoundingClientRect();
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
  } else if (container === null) {
    shoot = hand.offsetLeft - domRect1.left;
    bang = hand.offsetTop - domRect1.top;
  }

  return Math.hypot(shoot, bang);
}

window.onresize = function () {
  location.replace(location.href);
};

card.addEventListener("mouseenter", () => {
  if (inDeck === 1) {
    gsap.to(card, {
      top: window.innerHeight - card.offsetHeight + "px",
      duration: 0.4,
      ease: "power1.inOut",
    });
  }
});

card.addEventListener("mouseleave", () => {
  let totalDistance = distanceFind();

  if (inDeck === 1) {
    gsap.to(card, {
      left: hand.offsetLeft + "px",
      top: hand.offsetTop + "px",
      duration: totalDistance * 0.0016,
      ease: "power1.inOut",
      overwrite: true,
    });
  }
});

//multiplayer receive
socket.on("playerMoved", (data) => {
  container = data.container;
  console.log(`Player ${data.id} moved to`, data.container);
  console.log("container " + container);
  toContainer();
});
