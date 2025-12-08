const container = document.getElementById("container");

container.addEventListener("mousemove", (e) => {
    parallaxIt(e, "#backgroundIndex2", -50);
    parallaxIt(e, "#backgroundIndex", -25);
    parallaxIt(e, "#create", -15);
    parallaxIt(e, "#playerInput", -15);
});

function parallaxIt(e, target, movement) {
    const rect = container.getBoundingClientRect();

    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    gsap.to(target, {
        duration: 1,
        x: ((relX - rect.width / 2) / rect.width) * movement,
        y: ((relY - rect.height / 2) / rect.height) * movement,
        ease: "power2.out"
    });
}