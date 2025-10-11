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

/*const dropSound = new Howl({
  src: ["audio/meopw.mp3"],
  volume: 0.1,
});*/

let isLocked = 0;
let inDeck = 0;
let container;

card.addEventListener("mousedown", mouseDown);

function mouseDown(e) {
  startX = e.clientX;
  startY = e.clientY;

  // Add these as named functions so we can remove them properly
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);

  gsap.killTweensOf(card);
}

// Add this cleanup function
function cleanup() {
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp);
}

function mouseMove(e) {
  newX = startX - e.clientX;
  newY = startY - e.clientY;

  startX = e.clientX;
  startY = e.clientY;

  card.style.top = card.offsetTop - newY + "px";
  card.style.left = card.offsetLeft - newX + "px";

  inDeck = 0;
  checkCollisions();
}

// Add this new function to handle collision detection
function checkCollisions() {
  const domRect1 = card.getBoundingClientRect();

  // Check collision with dropper1
  if (isColliding(domRect1, domRect2)) {
    handleCollision(1);
  }
  // Check collision with dropper2
  else if (isColliding(domRect1, domRect3)) {
    handleCollision(2);
  }
  // Check collision with dropper3
  else if (isColliding(domRect1, domRect4)) {
    handleCollision(3);
  } else {
    isLocked = 0;
    container = null;
    gsap.to(card, {
      transform: "scale(1)",
      duration: "0.3",
    });
  }
}

function isColliding(rect1, rect2) {
  return !(
    rect1.top > rect2.bottom ||
    rect1.right < rect2.left ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right
  );
}

function handleCollision(containerNum) {
  isLocked = 1;
  container = containerNum;
  gsap.to(card, {
    transform: "scale(1.2)",
    duration: "0.2",
  });
}

// Move mouseUp outside of mouseMove
function mouseUp() {
  socket.emit("cardPos", {
    containerInfo: container,
  });

  let totalDistance = distanceFind();

  if (isLocked === 1) {
    let dropper =
      container === 1 ? dropper1 : container === 2 ? dropper2 : dropper3;

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
    dropSound.play();
  } else {
    gsap.to(card, {
      left: hand.offsetLeft + "px",
      top: hand.offsetTop + "px",
      duration: totalDistance * 0.001,
      ease: "power1.inOut",
      onComplete: () => (inDeck = 1),
    });
  }

  // Call cleanup to remove event listeners
  cleanup();
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
function toContainer() {
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
}

card.addEventListener("mouseleave", () => {
  toContainer();
});

//multiplayer receive
socket.on("playerMoved", (data) => {
  container = data.container;
  console.log(`Player ${data.id} moved to`, data.container);
  console.log("container " + container);
  toContainer();
});
