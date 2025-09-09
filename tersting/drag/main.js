let startX= 0, startY = 0, newX = 0, newY = 0;

const card =  document.getElementById("card")
const dropper = document.getElementById("drop")

const domRect2 = dropper.getBoundingClientRect();

let isLocked = 0

card.addEventListener("mousedown", mouseDown)

function mouseDown(e){
    startX = e.clientX
    startY = e.clientY

    document.addEventListener("mousemove", mouseMove)
    document.addEventListener("mouseup", mouseUp)

}

function mouseMove(e){
    newX = startX - e.clientX
    newY = startY - e.clientY

    startX = e.clientX
    startY = e.clientY

    card.style.top = (card.offsetTop - newY) + "px"
    card.style.left = (card.offsetLeft - newX) + "px"

    console.log()

    const domRect1 = card.getBoundingClientRect();

    if (!(
        domRect1.top > domRect2.bottom ||
        domRect1.right < domRect2.left ||
        domRect1.bottom < domRect2.top ||
        domRect1.left > domRect2.right
    )) {
        console.log("meow")
        isLocked = 1
    }

    if ((
        domRect1.top > domRect2.bottom ||
        domRect1.right < domRect2.left ||
        domRect1.bottom < domRect2.top ||
        domRect1.left > domRect2.right
    )) {
        console.log("meowing")
        isLocked = 0
    }
}

function mouseUp(e){

    const domRect1 = card.getBoundingClientRect();

    if (isLocked == 1){
        gsap.fromTo(card, {
            x: domRect1.right,
            y: domRect1.top,
        }, {
            x: domRect2.left,
            y: domRect2.top,
            duration: 2,

        })
    }

    document.removeEventListener("mousemove", mouseMove)
}




