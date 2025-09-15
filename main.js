let startX = 0,
  startY = 0,
  newX = 0,
  newY = 0;

const card = document.getElementById("card");
gsap.to(card, {
      transform: "scale(1)",
            duration: "0.2"
});

const dropper = document.getElementById("drop");

const domRect2 = dropper.getBoundingClientRect();

let isLocked = 0;

card.addEventListener("mousedown", mouseDown);

function mouseDown(e) {
  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);
}

function mouseMove(e) {
  newX = startX - e.clientX;
  newY = startY - e.clientY;

  startX = e.clientX;
  startY = e.clientY;

  card.style.top = card.offsetTop - newY + "px";
  card.style.left = card.offsetLeft - newX + "px";

  console.log();

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
    gsap.to(card, {
      transform: "scale(1.2)",
      duration: "0.2"
    });
  }

  if (
    domRect1.top > domRect2.bottom ||
    domRect1.right < domRect2.left ||
    domRect1.bottom < domRect2.top ||
    domRect1.left > domRect2.right
  ) {
    isLocked = 0;
    gsap.to(card, {
      transform: "scale(1)",
            duration: "0.2"
    });
  }

  distanceFind()
}

function mouseUp(e) {
  let totalDistance = distanceFind()

  if (isLocked === 1) {
    gsap.to(card, {
      left: dropper.offsetLeft + "px",
      top: dropper.offsetTop + "px",
      duration: totalDistance * 0.0013,
      ease: "power1.inOut",
    });
    gsap.to(card, {
      transform: "scale(1)",
            duration: "0.2"
    });
  }

  document.removeEventListener("mousemove", mouseMove);
}

function distanceFind(e) {
  const domRect1 = card.getBoundingClientRect();

      let shoot = dropper.offsetLeft - domRect1.left;
      let bang = dropper.offsetTop - domRect1.top;

      console.log(bang, shoot);

      return (Math.hypot(shoot, bang));
}


