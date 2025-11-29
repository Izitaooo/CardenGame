$("#container").mousemove(function(e) {
    parallaxIt(e, "#backgroundIndex2", -50);
    parallaxIt(e, "#backgroundIndex", -25);
    parallaxIt(e, "#create", -15);
    parallaxIt(e, "#playerInput", -15);
});

function parallaxIt(e, target, movement) {
    var $this = $("#container");
    var relX = e.pageX - $this.offset().left;
    var relY = e.pageY - $this.offset().top;

    TweenMax.to(target, 1, {
        x: (relX - $this.width() / 2) / $this.width() * movement,
        y: (relY - $this.height() / 2) / $this.height() * movement
    });
}