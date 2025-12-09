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

const spawnButtons = document.querySelectorAll(".spawnButtons");

const buttonMap = {
    shortyBtn: 0,
    frenzyBtn: 1,
    ghostBtn: 2,
    sheriffBtn: 3,
    stingerBtn: 4,
    spectreBtn: 5,
    buckyBtn: 6,
    judgeBtn: 7,
    bulldogBtn: 8,
    guardianBtn: 9,
    phantomBtn: 10,
    vandalBtn: 11,
    marshalBtn: 12,
    outlawBtn: 13,
    operatorBtn: 14,
    aresBtn: 15,
    odinBtn: 16,
};

let playersInRoom = 2;

socket.on("roomPlayerCount", (data) => {
    playersInRoom = data.count;
    console.log(`Players in room ${data.roomName}: ${playersInRoom}`);

    if (playersInRoom === 2) {
        document.getElementById("waitForPlayerText").classList = "playersThere";
    } else {
        document
            .getElementById("waitForPlayerText")
            .classList.remove("playersThere");
    }
});

socket.on("crash", (data) => {
    // Disconnect the socket before redirecting
    socket.disconnect();

    alert("your diddyblud friend has disconnected!");

    window.location.href = `index.html`;
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
let agent0;
let agent1;
let agent2;
let enemyAgent0;
let enemyAgent1;
let enemyAgent2;

let lockInPressed = false;
let wpn = document.querySelectorAll(".wpn");
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

        agent0.effects = [];
        agent1.effects = [];
        agent2.effects = [];

        for (let agent of agents) {
            if (agentsChosen.includes(agent)) {
                const el = document.getElementById(agent);
                el.health = 40; // Add custom property here
                el.isSelectable = true;

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
                        data.element.style.pointerEvents = "";

                        wpn.forEach((weapon) => {
                            weapon.style.opacity = "100%";
                        });
                        // revert to stylesheet default
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

    if (!lockInPressed) {
        socket.emit("agentsLockedIn", {
            agentsChosen,
        });
        ImPlaying = false;
        MainGameLoop();
        lockInPressed = true;
    }
    }
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
    const enemyAgentElements = enemyAgents
        .map(name => document.getElementById("enemy_" + name));

    enemyAgent0 = enemyAgentElements[0];
    enemyAgent1 = enemyAgentElements[1];
    enemyAgent2 = enemyAgentElements[2];

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
    enemyAgent.health = 40;
    enemyAgent.effects = [];

    const glint = document.createElement("div");
    glint.className = "glint";
    enemyAgent.appendChild(glint);

    // Add health display element
    const healthDisplay = document.createElement("div");
    healthDisplay.className = "heart";
    healthDisplay.textContent = "40";
    enemyAgent.appendChild(healthDisplay);

    // Add wpn div (empty, no apShow)
    const wpn = document.createElement("div");
    wpn.className = "wpn";
    wpn.style.opacity = "100%";
    enemyAgent.appendChild(wpn);

    const effects = document.createElement("div");
    effects.className = "effects";
    enemyAgent.appendChild(effects);

    const ef1 = document.createElement("div");
    ef1.className = "ef1";
    effects.appendChild(ef1);

    const ef2 = document.createElement("div");
    ef2.className = "ef2";
    effects.appendChild(ef2);

    const ef3 = document.createElement("div");
    ef3.className = "ef3";
    effects.appendChild(ef3);

    const ef4 = document.createElement("div");
    ef4.className = "ef4";
    effects.appendChild(ef4);

    const ef5 = document.createElement("div");
    ef5.className = "ef5";
    effects.appendChild(ef5);

    effects.classList.add("enemyEF");

    document.body.appendChild(enemyAgent);

    return enemyAgent;
}
let ImPlaying;
let gameLoopStarted = false;
let agentClickHandlers = {}; // Move this outside so it persists

function MainGameLoop() {
    if (
        agentsChosen.length === 3 &&
        enemyAgents.length === 3 &&
        !gameLoopStarted
    ) {
        gameLoopStarted = true;

        const agentElements = document.querySelectorAll(".agentSelect");
        const myAgents = Array.from(agentElements).filter((el) =>
            agentsChosen.includes(el.id)
        );

        // Create handlers ONCE and store them globally
        myAgents.forEach((agentEl) => {
            agentClickHandlers[agentEl.id] = () => SelectToAttack(agentEl.id);
        });

        // Initial setup
        updateTurnState(myAgents);
    }
}

function updateTurnState(myAgents) {
    if (ImPlaying) {
        // Enable my agents
        myAgents.forEach((agentEl) => {
            //console.log("is selectable??: " + agentEl.isSelectable);
            //if (agentEl.health > 0 && agentEl.isSelectable){
            if (agentEl.health > 0 && agentEl.isSelectable !== false) {
                agentEl.classList.add("selectable");
                // Use the globally stored handler
                if (agentClickHandlers[agentEl.id]) {
                    agentEl.removeEventListener("click", agentClickHandlers[agentEl.id]);
                    agentEl.addEventListener("click", agentClickHandlers[agentEl.id]);
                }
            } else {
                // dead agents are not selectable
                agentEl.classList.remove("selectable");
                agentEl.style.pointerEvents = "none";
            }
            myAgents.forEach((agentEl) => {
                agentEl.damageMultiplier = 1;
                agentEl.hitChanceMultiplier = 1;
                agentEl.enemyHitChanceMultiplier = 1;
                agentEl.damageWhenAttacking = false;
                agentEl.isSelectable = true;
                agentEl.healOnAttacking = false;
                agentEl.damageMitigation = false;
                agentEl.shootTwoTimes = false;
                agentEl.effects.forEach((effect) => {
                    effectLUT(agentEl, effect);
                });
            });
        });
        document.getElementById("youPlaying").classList.add("active");
        document.getElementById("enemyPlaying").classList.remove("active");
    } else {
        // Disable my agents
        myAgents.forEach((agentEl) => {
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
    //console.log(ImPlaying);

    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter((el) =>
        agentsChosen.includes(el.id)
    );

    document.querySelectorAll(".agentSelect").forEach((el) => {
        el.classList.remove("selected");
    });
    if (ImPlaying) {
        agentElements.forEach((agent) => {
            // Check if the agent has effects array
            if (agent.effects && agent.effects.length > 0) {
                // Loop through each effect
                deleteEffects(agent);
            }
        });

        agentElements.forEach((agentEl) => {
            agentEl.damageMultiplier = 1;
            agentEl.hitChanceMultiplier = 1;
            agentEl.enemyHitChanceMultiplier = 1;
            agentEl.damageWhenAttacking = false;
            agentEl.isSelectable = true;
            agentEl.healOnAttacking = false;
            agentEl.damageMitigation = false;
            agentEl.shootTwoTimes = false;
            agentEl.effects.forEach((effect) => {
                effectLUT(agentEl, effect);
            });
        });
    }

    // Don't recreate handlers - just use the existing ones
    updateTurnState(myAgents);

    console.log("Switched to:", ImPlaying ? "You" : "Enemy");
});

function effectLUT(agent, effect) {
    // Only handle stats/permissions here
    if (
        effect.name === "arc rose" ||
        effect.name === "guiding light" ||
        effect.name === "paranoia"
    ) {
        agent.hitChanceMultiplier *= 0.5;
    } else if (
        effect.name === "barrier orb" ||
        effect.name === "contingency" ||
        effect.name === "shear"
    ) {
        agent.isSelectable = false;
        agent.classList.remove("selectable");
        agent.style.pointerEvents = "none";
    } else if (
        effect.name === "cloudburst" ||
        effect.name === "dark cover" ||
        effect.name === "ruse"
    ) {
        agent.enemyHitChanceMultiplier *= 0.5;
        agent.hitChanceMultiplier *= 0.5;
    } else if (effect.name === "meddle" || effect.name === "undercut") {
        agent.damageMultiplier *= 1.5;
    } else if (effect.name === "owl drone" || effect.name === "recon bolt") {
        agent.enemyHitChanceMultiplier *= 1.5;
    } else if (effect.name === "slow orb" || effect.name === "trailblazer") {
        agent.isSelectable = false;
        agent.classList.remove("selectable");
        agent.style.pointerEvents = "none";
    } else if (effect.name === "razorvine") {
        agent.damageWhenAttacking = true;
    }
    else if( effect.name === "double tap") {
        agent.damageMitigation = true;
    }
    else if( effect.name === "pick me up") {
        agent.healOnAttacking = true;
    }
    else if( effect.name === "shrouded step" || effect.name === "updraft" ) {
        agent.hitChanceMultiplier *= 2;
    }
    else if( effect.name === "tailwind" ) {
        agent.shootTwoTimes = true;
    } else{
    }

    // Removed shock bolt from here - it's now only in executeTurnAbilities
}
// Executes the logic for turn-based abilities (Healing, Regrowth, etc.)
function executeTurnAbilities(agent, effect) {
    // Don't execute if already executed
    if (effect.executed) return;

    if (effect.name === "healing orb") {
        console.log(`Executing Healing Orb on ${agent.id}`);
        if (agent.health < 38) {
            agent.health += 2;
        } else {
            agent.health = 40;
        }
        updateHealthUI(agent);
    } else if (effect.name === "regrowth") {
        console.log(`Executing Regrowth on ${agent.id}`);
        if (agent.health < 40) {
            agent.health += 1;
            updateHealthUI(agent);
        }
    } else if (effect.name === "shock bolt") {
        console.log(`Executing Shock Bolt on ${agent.id}`);
        if (agent.health > 2) {
            agent.health -= 2;
        } else {
            agent.health = 0;
        }
        updateHealthUI(agent);


        if (agent.health <= 0) {
            console.log("Agent defeated!");
            agent.health = 0;
            gsap.to(agent, {
                filter: "grayscale(1)",
                duration: 0.5,
            });
            if (
                enemyAgent0.health <= 0 &&
                enemyAgent1.health <= 0 &&
                enemyAgent2.health <= 0
            ) {
                console.log("YESS, HELL YEAH, I WOONNNN YEYYYY ðŸ˜ƒ");
                endText.innerHTML = "I won let's goooo!";
                backgroundEnd.style.opacity = "100%";
                endScreen.style.top = "0vh";
            }
            if (
                agent0.health <= 0 &&
                agent1.health <= 0 &&
                agent2.health <= 0
            ) {
                console.log("😭😭😭 I lost");
                backgroundEnd.style.opacity = "100%";
                endScreen.style.top = "0vh";
            }
        }
    }

    // Mark as executed so it won't run again
    effect.executed = true;
}

// Updates the visual heart text on the agent card
function updateHealthUI(agent) {
    const heartText = agent.querySelector(".heart");
    let healthText;
    if (heartText) {
        // Ensure we update just the text node if possible, or reset innerHTML safely
        if (
            heartText.childNodes.length > 0 &&
            heartText.childNodes[0].nodeType === 3
        ) {
            healthText = heartText.childNodes[0].textContent;
            heartText.childNodes[0].nodeValue = agent.health;
        } else {
            // Fallback if structure is different
            healthText = heartText.innerText;
            heartText.innerText = agent.health;
        }

        if (healthText > agent.health) {
            // Add a red flash
            gsap.fromTo(
                heartText,
                { color: "#ff0000" },
                { color: "white", duration: 1 }
            );
        }else if(healthText < agent.health) {
            // Add a green flash
            gsap.fromTo(
                heartText,
                {color: "#00ff00"},
                {color: "white", duration: 1}
            );
        }
    }
}

function switchPlayer() {
    ImPlaying = !ImPlaying;
    console.log(ImPlaying);

    const agentElements = document.querySelectorAll(".agentSelect");
    const myAgents = Array.from(agentElements).filter((el) =>
        agentsChosen.includes(el.id)
    );

    document.querySelectorAll(".agentSelect").forEach((el) => {
        el.classList.remove("selected");
    });
    if (ImPlaying) {
        agentElements.forEach((agent) => {
            // Check if the agent has effects array
            if (agent.effects && agent.effects.length > 0) {
                // Loop through each effect
                deleteEffects(agent);
            }
        });

        agentElements.forEach((agentEl) => {
            agentEl.damageMultiplier = 1;
            agentEl.hitChanceMultiplier = 1;
            agentEl.enemyHitChanceMultiplier = 1;
            agentEl.damageWhenAttacking = false;
            agentEl.isSelectable = true;
            agentEl.healOnAttacking = false;
            agentEl.damageMitigation = false;
            agentEl.shootTwoTimes = false;
            agentEl.effects.forEach((effect) => {
                effectLUT(agentEl, effect);
            });
        });
    }

    // Remove damageable from ALL enemy agents and clean up their listeners
    document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
        el.classList.remove("damageable");
        el.style.pointerEvents = "none";

        // Remove old listener if it exists
        if (enemyClickHandlers[el.id]) {
            el.removeEventListener("click", enemyClickHandlers[el.id]);
            delete enemyClickHandlers[el.id];
        }
        if (enemyHoverHandlers[el.id]) {
            el.removeEventListener("mouseover", enemyHoverHandlers[el.id]);
            delete enemyHoverHandlers[el.id];
        }
        if (enemyMouseLeaveHandlers[el.id]) {
            el.removeEventListener("mouseleave", enemyMouseLeaveHandlers[el.id]);
            delete enemyMouseLeaveHandlers[el.id];
        }
        if (enemySelfDamageHoverHandlers[el.id]) {
            el.removeEventListener("mouseover", enemySelfDamageHoverHandlers[el.id]);
            delete enemySelfDamageHoverHandlers[el.id];
        }
        if (enemySelfDamageLeaveHandlers[el.id]) {
            el.removeEventListener("mouseleave", enemySelfDamageLeaveHandlers[el.id]);
            delete enemySelfDamageLeaveHandlers[el.id];
        }
        damageDisplayHide(el.id);
    });
    shootingFlag = false;

    // Don't recreate handlers - just use the existing ones
    updateTurnState(myAgents);

    console.log("Switched to:", ImPlaying ? "You" : "Enemy");

    socket.emit("switchRoles");
}
function deleteEffects(agent) {
    for (let i = agent.effects.length - 1; i >= 0; i--) {
        const effect = agent.effects[i]; // store reference so splice won't break us
        if (!effect) continue;

        executeTurnAbilities(agent, effect);

        effect.duration--;
        console.log(`${agent.id} - ${effect.name}: ${effect.duration} rounds left`);

        // Re-enable selection for wall effects when they expire
        if (effect.duration <= 0) {
            const effectName = effect.name.trim().replace(/["')]/g, "");
            if (["barrier orb", "contingency", "shear", "slow orb"].includes(effectName)) {
                agent.isSelectable = true;
                agent.style.pointerEvents = "auto";
            }

            // clear UI slot that matches this effect
            const slots = document.querySelectorAll(`#${agent.id} .effects > div`);
            for (const slot of slots) {
                if (slot.style.backgroundImage && slot.style.backgroundImage.includes(`${effectName}.webp`)) {
                    slot.style.backgroundImage = "";
                    slot.style.opacity = "0";
                    break;
                }
            }

            // remove the effect from the array
            agent.effects.splice(i, 1);
            console.log("deleted expired effect:", effectName);
            continue; // next iteration (effect at i removed)
        }

        console.log("deleteing📦");
        console.log(effect);
        console.log(agent.damageMitigation);

        // Special case for double tap: check name string, not the object equality
        if (effect.name && effect.name.trim().toLowerCase() === "double tap" && agent.damageMitigation === false) {
            console.log("deleteing double tap 📦📦📦");
            const effectName = effect.name.trim().replace(/["')]/g, "");

            const slots = document.querySelectorAll(`#${agent.id} .effects > div`);
            for (const slot of slots) {
                if (slot.style.backgroundImage && slot.style.backgroundImage.includes(`${effectName}.webp`)) {
                    slot.style.backgroundImage = "";
                    slot.style.opacity = "0";
                    break;
                }
            }
            agent.effects.splice(i, 1);
            console.log("removed double tap for", agent.id);
        }

        if (effect.name && effect.name.trim().toLowerCase() === "tailwind" && agent.shootTwoTimes === false) {
            console.log("deleteing tailwind 📦📦📦");
            const effectName = effect.name.trim().replace(/["')]/g, "");

            const slots = document.querySelectorAll(`#${agent.id} .effects > div`);
            for (const slot of slots) {
                if (slot.style.backgroundImage && slot.style.backgroundImage.includes(`${effectName}.webp`)) {
                    slot.style.backgroundImage = "";
                    slot.style.opacity = "0";
                    break;
                }
            }
            agent.effects.splice(i, 1);
            console.log("removed tailwind for", agent.id);
        }
        updateAllDurationCounters(agent)
    }
}
// Store enemy click handlers globally
const enemyClickHandlers = {};
const enemyHoverHandlers = {};
const enemyMouseLeaveHandlers = {};

const enemySelfDamageHoverHandlers = {};
const enemySelfDamageLeaveHandlers = {};

let agentSelectedToAttack;
function SelectToAttack(agent) {
    const agentEl = document.getElementById(agent);

    if (
        agentEl.health <= 0 ||
        agentEl.isSelectable === false /*||
        agentEl.effects.some(effect =>
            effect.name === "barrier orb")*/
    ) {
        console.log(`Cannot select: ${agent}`);
        return; // Stop the function!! if blocked or dead
    }
    agentSelectedToAttack = document.getElementById(agent);
    const wasSelected = agentEl.classList.contains("selected");

    // Remove selected from all agents
    document.querySelectorAll(".agentSelect").forEach((el) => {
        el.classList.remove("selected");
    });

    // Remove damageable from ALL enemy agents and clean up their listeners
    // Remove damageable from ALL enemy agents and clean up their listeners
    document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
        el.classList.remove("damageable");
        el.style.pointerEvents = "none";

        // Remove old listener if it exists
        if (enemyClickHandlers[el.id]) {
            el.removeEventListener("click", enemyClickHandlers[el.id]);
            delete enemyClickHandlers[el.id];
        }
        if (enemyHoverHandlers[el.id]) {
            el.removeEventListener("mouseover", enemyHoverHandlers[el.id]);
            delete enemyHoverHandlers[el.id];
        }
        if (enemyMouseLeaveHandlers[el.id]) {
            el.removeEventListener("mouseleave", enemyMouseLeaveHandlers[el.id]);
            delete enemyMouseLeaveHandlers[el.id];
        }

        // --- ADD THIS BLOCK ---
        if (enemySelfDamageHoverHandlers[el.id]) {
            el.removeEventListener("mouseover", enemySelfDamageHoverHandlers[el.id]);
            delete enemySelfDamageHoverHandlers[el.id];
        }
        if (enemySelfDamageLeaveHandlers[el.id]) {
            el.removeEventListener("mouseleave", enemySelfDamageLeaveHandlers[el.id]);
            delete enemySelfDamageLeaveHandlers[el.id];
        }
        // ---------------------

        // Also ensure visuals are reset immediately
        if (agentEl && agentEl.damageWhenAttacking) {
            displaySelfDamageHide(agentEl);
        }
    });

    // If it wasn't selected, select it now and make enemies damageable
    if (!wasSelected) {
        agentEl.classList.add("selected");
        console.log("selected to attack:", agent);

        document.querySelectorAll(".agentSelect.enemy").forEach((el) => {
            // Only make them interactive if they are alive
            if (
                el.health > 0 &&
                !el.effects.some(
                    (effect) =>
                        effect.name === "barrier orb" ||
                        effect.name === "contingency" ||
                        effect.name === "shear" /* ||
                effect.name === "slow orb"*/
                )
            ) {
                console.log("making damageable:", el.id);
                el.classList.add("damageable");
                el.style.pointerEvents = "auto";

                console.log("damageWhenAttacking??:", agentEl.damageWhenAttacking);
                enemyHoverHandlers[el.id] = () => damageDisplay(el.id);
                el.addEventListener("mouseover", enemyHoverHandlers[el.id]);

                if (agentEl.damageWhenAttacking) {
                    enemySelfDamageHoverHandlers[el.id] = () =>
                        displaySelfDamage(agentEl);
                    el.addEventListener("mouseover", enemySelfDamageHoverHandlers[el.id]);
                }

                enemyMouseLeaveHandlers[el.id] = () => damageDisplayHide(el.id);
                el.addEventListener("mouseleave", enemyMouseLeaveHandlers[el.id]);

                if (agentEl.damageWhenAttacking) {
                    enemySelfDamageLeaveHandlers[el.id] = () =>
                        displaySelfDamageHide(agentEl);
                    el.addEventListener(
                        "mouseleave",
                        enemySelfDamageLeaveHandlers[el.id]
                    );
                }
                // Create and store the handler
                enemyClickHandlers[el.id] = () => damageAgent(el.id);
                el.addEventListener("click", enemyClickHandlers[el.id]);
            }
        });
    }
}
function displaySelfDamage(agent) {
    let damageCalc = agent.health - 2;
    agent.querySelector(".heart").textContent = damageCalc.toString();
    agent.querySelector(".heart").style.color = "red";
}
function displaySelfDamageHide(agent) {
    let damageCalc = agent.health;
    agent.querySelector(".heart").textContent = damageCalc.toString();
    agent.querySelector(".heart").style.color = "white";
}

let chanceShow = document.createElement("div");
chanceShow.className = "chancing";

function damageDisplay(agentId) {
    let agent = document.getElementById(agentId);




    if (
        agentSelectedToAttack.hitChanceMultiplier === 0 ||
        agentSelectedToAttack.hitChanceMultiplier === null ||
        agentSelectedToAttack.hitChanceMultiplier === undefined ||
        agent.damageMultiplier === 0 ||
        agent.damageMultiplier === null ||
        agent.damageMultiplier === undefined
    ) {
        agentSelectedToAttack.damageMultiplier = 1;
        agentSelectedToAttack.hitChanceMultiplier = 1;
        agentSelectedToAttack.enemyHitChanceMultiplier = 1;
        agentSelectedToAttack.damageWhenAttacking = false;
        agentSelectedToAttack.isSelectable = true;
        agentSelectedToAttack.healOnAttacking = false;
        agentSelectedToAttack.damageMitigation = false;
        agentSelectedToAttack.shootTwoTimes = false;
        agent.damageMultiplier = 1;
        agent.hitChanceMultiplier = 1;
        agent.enemyHitChanceMultiplier = 1;
        agent.damageWhenAttacking = false;
        agent.isSelectable = true;
        agent.healOnAttacking = false;
        agent.damageMitigation = false;
        agent.shootTwoTimes = false;
    }

    weaponDamageLUT(agentSelectedToAttack.weapon);

    console.log("damage: "+damage);
    console.log("ammo: "+ammo);
    console.log("hit chance mult: "+agentSelectedToAttack.hitChanceMultiplier);
    console.log("damage mult: "+agent.damageMultiplier);
    let damageCalcShow = agent.health - (damage * agent.damageMultiplier) * ammo;
    let damageChanceShow =
        `${ammo}shots × ${chanceToHit * agentSelectedToAttack.hitChanceMultiplier}% `;
    console.log("damage calculated:  "+damageCalcShow);
    console.log("damage percent:  "+damageChanceShow);

    chanceShow.style.display = "initial";

    chanceShow.textContent = damageChanceShow.toString();
    agent.appendChild(chanceShow);

    agent.querySelector(".heart").textContent = damageCalcShow.toString();
    agent.querySelector(".heart").style.color = "red";
}
function damageDisplayHide(agentId) {
    let agent = document.getElementById(agentId);
    let damageCalc = agent.health;
    chanceShow.style.display = "none";
    agent.querySelector(".heart").textContent = damageCalc.toString();
    agent.querySelector(".heart").style.color = "white";
}
let damageDealt = 0;

const weaponAP = {
    classic: 2,
    shorty: 3,
    frenzy: 3,
    ghost: 3,
    sheriff: 3,
    stinger: 4,
    spectre: 4,
    bucky: 4,
    judge: 4,
    bulldog: 4,
    guardian: 4,
    phantom: 4,
    vandal: 4,
    marshal: 3,
    outlaw: 4,
    operator: 5,
    ares: 3,
    odin: 5,
};

const abilityAP = {
    arcRose: 2,
    barrierOrb: 2,
    cloudburst: 1,
    contingency: 2,
    darkCover: 2,
    doubleTap: 3,
    guidingLight: 3,
    healingOrb: 2,
    meddle: 2,
    owlDrone: 2,
    paranoia: 3,
    pickMeUp: 3,
    razorvine: 3,
    reconBolt: 2,
    regrowth: 2,
    ruse: 2,
    shear: 3,
    shockBolt: 2,
    slowOrb: 3,
    shroudedStep: 2,
    tailwind: 3,
    trailblazer: 3,
    undercut: 3,
    updraft: 2,
};

const dropSound = new Howl({
    src: ["audio/Mystbloom Kill 4.mp3"],
    volume: 0.1,
});
const deckSound = new Howl({
    src: ["audio/Cryostasis Kill 1.mp3"],
    volume: 0.15,
});
const shopSound = new Howl({
    src: ["audio/shopSound.mp3"],
    volume: 6,
    preload: true,
});
const gunSounds = {
    classic: new Howl({ src: ["audio/Pistols/classicTap.mp3"], volume: 2 }),
    shorty: new Howl({ src: ["audio/Shotguns/shortyTap.mp3"], volume: 2 }),
    frenzy: new Howl({ src: ["audio/Pistols/frenzyTap.mp3"], volume: 2 }),
    ghost: new Howl({ src: ["audio/Pistols/ghostTap.mp3"], volume: 2 }),
    sheriff: new Howl({ src: ["audio/Pistols/sheriffTap.mp3"], volume: 2 }),
    bucky: new Howl({ src: ["audio/Shotguns/buckyTap.mp3"], volume: 2 }),
    judge: new Howl({ src: ["audio/Shotguns/judgeTap.mp3"], volume: 2 }),
    marshal: new Howl({ src: ["audio/Snipers/marshalTap.mp3"], volume: 2 }),
    operator: new Howl({ src: ["audio/Snipers/operatorTap.mp3"], volume: 1.5 }),
    bulldog: new Howl({ src: ["audio/Rifles/bulldogTap.mp3"], volume: 2 }),
    guardian: new Howl({ src: ["audio/Rifles/guardianTap.mp3"], volume: 2 }),
    phantom: new Howl({ src: ["audio/Rifles/phantomTap.mp3"], volume: 2 }),
    vandal: new Howl({ src: ["audio/Rifles/vandalTap.mp3"], volume: 2 }),
    ares: new Howl({ src: ["audio/LMGs/aresTap.mp3"], volume: 2 }),
    outlaw: new Howl({ src: ["audio/Snipers/outlawTap.mp3"], volume: 5.5 }),
    stinger: new Howl({ src: ["audio/SMGs/stingerTap.mp3"], volume: 5.5 }),
    spectre: new Howl({ src: ["audio/SMGs/spectreTap.mp3"], volume: 5.5 }),
    odin: new Howl({ src: ["audio/LMGs/odinTap.mp3"], volume: 5.5 }),
};
const missSound = new Howl({
    src: ["audio/90784__kmoon__bullet_flyby_4.mp3"],
    volume: 0.3,
    preload: true,
});

let shootingFlag = false;

let endText = document.getElementById("endText")
let backgroundEnd = document.getElementById("background2");

function damageAgent(agentId) {
    let agent = document.getElementById(agentId); // This is the TARGET (enemy being hit)
    console.log("damaging agent:", agent.id);

    shootingFlag = true;


    // Get the weapon from the ATTACKER (agentSelectedToAttack), not the target!
    let weaponName = agentSelectedToAttack.weapon ?? "classic";

    console.log(`Attacker: ${agentSelectedToAttack.id}, Weapon: ${weaponName}`);

    // Get weapon damage/ammo/hit chance based on attacker's weapon
    weaponDamageLUT(weaponName);

    console.log(
        `Firing ${ammo} shots with ${weaponName}. Damage: ${damage}, Hit Chance: ${chanceToHit}%`
    );

    // Get AP cost for this weapon
    let apCostW = weaponAP[weaponName];

    if (apCostW === undefined) {
        console.error(`No AP cost defined for weapon: ${weaponName}`);
        apCostW = 2; // Fallback
    }

    console.log(
        `AP cost for ${weaponName}: ${apCostW}, Current AP: ${currentAP}`
    );

    if (!canAfford(apCostW)) {
        flashNotEnoughAP();
        return;
    }

    // else we can afford: spend AP now
    spendAP(apCostW);


/*    if (agent.damageMitigation){
        console.log("Damage mitigated by Double Tap!");
        agent.damageMitigation = false;
        deleteEffects(agent);
        return;
    }*/



    damageDealt = 0;
    console.log(weaponName);
    console.log(
        "agent.enemyHitChanceMultiplier: " + agent.enemyHitChanceMultiplier
    );
    console.log(
        "agentSelectedToAttack.hitChanceMultiplier: " +
        agentSelectedToAttack.hitChanceMultiplier
    );
    console.log("agent.damageMultiplier: " + agent.damageMultiplier);
    console.log("enemychancetohit: " + agent.enemyHitChanceMultiplier);

    for (let i = 0; i < ammo; i++) {
        setTimeout(() => {

            let randomChance = Math.floor(Math.random() * 100);

            if (agent.damageMitigation){
                randomChance = 101; // automatic miss
            }

            console.log(
                `Firing shot ${i + 1}/${ammo} with ${
                    agentSelectedToAttack.weapon
                }. Damage: ${damage}, Hit Chance: ${
                    chanceToHit * agentSelectedToAttack.hitChanceMultiplier
                }%`
            );


            if (
                randomChance <
                chanceToHit * agentSelectedToAttack.hitChanceMultiplier
            ) {
                // HIT confirmed!
                if (
                    weaponName !== "shorty" &&
                    weaponName !== "bucky" &&
                    weaponName !== "judge"
                ) {
                    gunSounds[weaponName].play();
                }

                agent.health -= damage * agent.damageMultiplier;
                damageDealt += damage * agent.damageMultiplier;
                console.log(`Shot ${i + 1}: HIT! Health remaining: ${agent.health}`);

                const healthDisplay = agent.querySelector(".heart");
                if (healthDisplay) {
                    healthDisplay.textContent = agent.health;
                }

                // Check if the agent is defeated
                if (agent.health <= 0) {
                    console.log("Agent defeated!");
                    agent.health = 0;
                    gsap.to(agent, {
                        filter: "grayscale(1)",
                        duration: 0.5,
                    });
                    if (
                        enemyAgent0.health <= 0 &&
                        enemyAgent1.health <= 0 &&
                        enemyAgent2.health <= 0
                    ) {
                        console.log("YESS, HELL YEAH, I WOONNNN YEYYYY ðŸ˜ƒ");
                        endText.innerHTML = "I won let's goooo!";
                        backgroundEnd.style.opacity = "100%";
                        endScreen.style.top = "0vh";
                    }
                }
            } else {
                // MISS confirmed!
                missSound.play();
                console.log(`Shot ${i + 1}: MISS. Health remaining: ${agent.health}`);
            }

            // On last shot, emit damage and switch player
            if (i === ammo - 1) {
                console.log("New health:", agent.health);
                if (agentSelectedToAttack.damageWhenAttacking) {

                    if (agentSelectedToAttack.health - 2 < 0) {

                        agentSelectedToAttack.health = 0;
                        gsap.to(agentSelectedToAttack, {
                            filter: "grayscale(1)",
                            duration: 0.5,
                        });

                    } else {

                        agentSelectedToAttack.health -= 2;
                    }
                    const healthDisplayAttacking =
                        agentSelectedToAttack.querySelector(".heart");
                    if (healthDisplayAttacking) {
                        healthDisplayAttacking.textContent = agentSelectedToAttack.health;
                        healthDisplayAttacking.style.color = "white";
                    }
                    if (agent0.health <= 0 &&
                        agent1.health <= 0 &&
                        agent2.health <= 0)
                    {
                        console.log("I lost 😭😭😭😭😭");
                        backgroundEnd.style.opacity = "100%";
                        endScreen.style.top = "0vh";
                    }
                    console.log("sending update to server about Dealing 2 self damage due to Razorvine");
                    socket.emit("selfDamageAgent", agentSelectedToAttack.id);

                }
                /*socket.emit("damageAgent", agentId, damageDealt);*/

                if(agentSelectedToAttack.healOnAttacking){
                    if (agentSelectedToAttack.health > 38){
                        agentSelectedToAttack.health = 40;
                    }else{
                        agentSelectedToAttack.health += 2;
                    }
                    console.log("Healing attacker for 2 HP due to Pick Me Up!");
                    const healthDisplayAttacking =
                        agentSelectedToAttack.querySelector(".heart");

                    if (healthDisplayAttacking) {

                        healthDisplayAttacking.textContent = agentSelectedToAttack.health;
                        gsap.fromTo(
                            healthDisplayAttacking,
                            {color: "#00ff00"},
                            {color: "white", duration: 1}
                        );
                    }
                }
                if (agent.damageMitigation){
                    console.log("Damage mitigated by Double Tap!");
                    agent.damageMitigation = false;
                    deleteEffects(agent);
                    console.log(agent.effects);
                    socket.emit("removeDoubleTap", agentId);
                }
                socket.emit("damageAgent", agentId, damageDealt);
                if (agentSelectedToAttack.shootTwoTimes){
                    console.log("Shooting two times due to Tailwind!");
                    agentSelectedToAttack.shootTwoTimes = false;
                    deleteEffects(agentSelectedToAttack);
                    socket.emit("removeTailwind", agentSelectedToAttack.id);

                }else{
                    switchPlayer();
                    playerRoundOverPressed = false;
                    socket.emit("playerRoundOverSetFalse");

                }
            }

        }, i * 150 * gunSpeed);
    }
    if (
        weaponName === "shorty" ||
        weaponName === "bucky" ||
        weaponName === "judge"
    ) {
        gunSounds[weaponName].play();
    }
    //socket.emit("damageAgent", agentId, damageDealt);
}
socket.on("selfDamageAgent", (agentId) => {
    let agent = document.getElementById("enemy_"+agentId);
    console.log("Self damaging your agent:", agent.id);
    console.log("old health:", agent.health);
    agent.health -= 2;
    // Check if the agent is defeated
    if (agent.health <= 0) {
        console.log("Agent defeated!");
        agent.health = 0;
        console.log("agent health should be zero:    "+agent.health);
        agent.classList.remove("selectable");
        agent.classList.remove("selected");
        agent.style.pointerEvents = "none";
        gsap.to(agent, {
            filter: "grayscale(1)",
            duration: 0.5,
        });
        if (enemyAgent0.health <= 0 &&
            enemyAgent1.health <= 0 &&
            enemyAgent2.health <= 0)
        {
            console.log("YESS, HELL YEAH, I WOONNNN YEYYYY ðŸ˜ƒ");
            endScreen.style.top = "0vh";
        }
    }
    updateHealthUI(agent);
})

socket.on("removeDoubleTap", (agentId) => {
    console.log("removing Double Tap!");
    let agent = document.getElementById(agentId.replace("enemy_", ""));
    agent.damageMitigation = false;
    deleteEffects(agent);
    console.log(agent.effects);
})
socket.on("removeTailwind", (agentId) => {
    console.log("removing Tailwind!");
    let agent = document.getElementById("enemy_" + agentId);
    agent.shootTwoTimes = false;
    deleteEffects(agent);
    console.log(agent.effects);
})
let damage = 0;
let ammo = 0;
let chanceToHit = 0;
let gunSpeed = 0;
function weaponDamageLUT(weapon) {
      if (weapon === "shorty") {
        damage = 1;
        ammo = 5;
        chanceToHit = 45;
        gunSpeed = 0.5;
    } else if (weapon === "frenzy") {
        damage = 1;
        ammo = 4;
        chanceToHit = 55;
        gunSpeed = 1;
    } else if (weapon === "ghost") {
        damage = 2;
        ammo = 2;
        chanceToHit = 65;
        gunSpeed = 1.3; // nmarizuje damageAgent funkci jak rychle zbran ma strilet, pouzito pro upravu jak rychle opakovat sound effect
    } else if (weapon === "sheriff") {
        damage = 4;
        ammo = 2;
        chanceToHit = 50;
        gunSpeed = 2;
    } else if (weapon === "bucky") {
        damage = 1;
        ammo = 12;
        chanceToHit = 30;
        gunSpeed = 0.5;
    } else if (weapon === "judge") {
        damage = 1;
        ammo = 16;
        chanceToHit = 55;
        gunSpeed = 0.5;
    } else if (weapon === "stinger") {
        damage = 1;
        ammo = 7;
        chanceToHit = 60;
        gunSpeed = 0.9;
    } else if (weapon === "spectre") {
        damage = 1;
        ammo = 5;
        chanceToHit = 70;
        gunSpeed = 1.1;
    } else if (weapon === "bulldog") {
        damage = 2;
        ammo = 4;
        chanceToHit = 75;
        gunSpeed = 1.4;
    } else if (weapon === "guardian") {
        damage = 4;
        ammo = 2;
        chanceToHit = 75;
        gunSpeed = 1.8;
    } else if (weapon === "phantom") {
        damage = 3;
        ammo = 3;
        chanceToHit = 75;
        gunSpeed = 1.3;
    } else if (weapon === "vandal") {
        damage = 4;
        ammo = 3;
        chanceToHit = 70;
        gunSpeed = 1.4;
    } else if (weapon === "ares") {
        damage = 1;
        ammo = 10;
        chanceToHit = 40;
        gunSpeed = 0.8;
    } else if (weapon === "odin") {
        damage = 1;
        ammo = 15;
        chanceToHit = 60;
        gunSpeed = 1;
    } else if (weapon === "marshal") {
        damage = 3;
        ammo = 1;
        chanceToHit = 80;
        gunSpeed = 1;
    } else if (weapon === "outlaw") {
        damage = 4;
        ammo = 2;
        chanceToHit = 80;
        gunSpeed = 3;
    } else if (weapon === "operator") {
        damage = 9;
        ammo = 1;
        chanceToHit = 90;
        gunSpeed = 1;
    } else {
        // Default values
        damage = 1;
        ammo = 2;
        chanceToHit = 60;
        gunSpeed = 1;
    }
}

socket.on("damageAgent", (agentId, damage) => {
    let agent = document.getElementById(agentId.replace("enemy_", ""));
    console.log("Enemy damaging your agent:", agent.id);
    console.log("old health:", agent.health);
    agent.health -= damage;
    // Check if the agent is defeated
    if (agent.health <= 0) {
        console.log("Agent defeated!");
        agent.health = 0;
        console.log("agent health should be zero:    "+agent.health);
        agent.classList.remove("selectable");
        agent.classList.remove("selected");
        agent.style.pointerEvents = "none";
        gsap.to(agent, {
            filter: "grayscale(1)",
            duration: 0.5,
        });
        if (agent0.health <= 0 &&
            agent1.health <= 0 &&
            agent2.health <= 0)
        {
            console.log("I lost 😭😭😭😭😭");
            backgroundEnd.style.opacity = "100%";
            endScreen.style.top = "0vh";
        }
    }
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
let creds = 800;

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
    }

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
    const myAgents = Array.from(agentElements).filter((el) =>
        agentsChosen.includes(el.id)
    );
    const enemyAgentElements = enemyAgents
        .map((agentName) => document.getElementById("enemy_" + agentName))
        .filter((el) => el !== null);
    enemyAgent0 = enemyAgentElements[0];
    enemyAgent1 = enemyAgentElements[1];
    enemyAgent2 = enemyAgentElements[2];

    console.log("card type: " + cardElement.type);
    if (
        cardElement.type === "gun" ||
        //|| cardElement.ability === "barrier orb"
        //|| cardElement.ability === "contigency"
        //cardElement.ability === "double tap" ||
        cardElement.ability === "healing orb" ||
        //cardElement.ability === "pick me up" ||
        cardElement.ability === "regrowth"
        //||
        //cardElement.ability === "shrouded step" ||
        //cardElement.ability === "tailwind" ||
        //cardElement.ability === "updraft"
    ) {
        myAgents.forEach((agentEl) => {
            agentEl.classList.add("isPlaceable");
        });
        enemyAgentElements.forEach((enemyEl) => {
            enemyEl.classList.remove("isPlaceable");
        });
        console.log("friendly");
    } else {
        enemyAgentElements.forEach((enemyEl) => {
            enemyEl.classList.add("isPlaceable");
        });
        console.log("enemy");

        myAgents.forEach((agentEl) => {
            agentEl.classList.remove("isPlaceable");
        });
        console.log("enemy");
    }
    if (
        cardElement.ability === "barrier orb" ||
        cardElement.ability === "contigency" ||
        cardElement.ability === "shear" ||
        cardElement.ability === "cloudburst" ||
        cardElement.ability === "dark cover" ||
        cardElement.ability === "ruse"
    ) {
        myAgents.forEach((agentEl) => {
            agentEl.classList.add("isPlaceable");
        });
        enemyAgentElements.forEach((enemyEl) => {
            enemyEl.classList.add("isPlaceable");
        });
    }
    if (cardElement.ability === "double tap" ||
        cardElement.ability === "pick me up" ||
        cardElement.ability === "shrouded step" ||
        cardElement.ability === "tailwind" ||
        cardElement.ability === "updraft" ){

        myAgents.forEach((agentEl) => {
            agentEl.classList.remove("isPlaceable");
        });
        enemyAgentElements.forEach((enemyEl) => {
            enemyEl.classList.remove("isPlaceable");
        });

        switch (cardElement.ability) {
            case "double tap":
                document.getElementById("iso").classList.add("isPlaceable");
                break;
            case "pick me up":
                document.getElementById("clove").classList.add("isPlaceable");
                break;
            case "shrouded step":
                document.getElementById("omen").classList.add("isPlaceable");
                break;
            case "tailwind":
                document.getElementById("jett").classList.add("isPlaceable");
                break;
            case "updraft":
                document.getElementById("jett").classList.add("isPlaceable");
                break;
        }
    }
}

//let agent0, agent1, agent2;

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

    console.log(isLocked);

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
            !(
                domRect1.top > domRect2.bottom ||
                domRect1.right < domRect2.left ||
                domRect1.bottom < domRect2.top ||
                domRect1.left > domRect2.right
            ) &&
            activeCard.type !== "gun" &&
            /*        && activeCard.ability !== "barrier orb"
              && activeCard.ability !== "contigency"
              && activeCard.ability !== "shear"*/
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"&&
            activeCard.ability !== "healing orb" &&
            activeCard.ability !== "regrowth"

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
            ) &&
            activeCard.type !== "gun" &&
            /*        && activeCard.ability !== "barrier orb"
              && activeCard.ability !== "contigency"
              && activeCard.ability !== "shear"*/
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "healing orb" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "regrowth" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"
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
            ) &&
            activeCard.type !== "gun" &&
            /*        && activeCard.ability !== "barrier orb"
              && activeCard.ability !== "contigency"
              && activeCard.ability !== "shear"*/
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "healing orb" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "regrowth" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"
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
            ) &&
            activeCard.ability !== "arc rose" &&
            /*        && activeCard.ability !== "cloudburst"
                      && activeCard.ability !== "dark cover"*/
            activeCard.ability !== "guiding light" &&
            activeCard.ability !== "meddle" &&
            activeCard.ability !== "owl drone" &&
            activeCard.ability !== "paranoia" &&
            activeCard.ability !== "razorvine" &&
            activeCard.ability !== "recon bolt" &&
            /*        && activeCard.ability !== "ruse"*/
            /*        && activeCard.ability !== "barrier orb"
                      && activeCard.ability !== "contingency"
                      && activeCard.ability !== "shear"*/
            activeCard.ability !== "shock bolt" &&
            activeCard.ability !== "slow orb" &&
            activeCard.ability !== "trailblazer" &&
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"&&
            activeCard.ability !== "undercut"

        ) {
            isLocked = 1;
            container = 4;
            scale();
            /* agent0.querySelector(".heart").textContent = agent0.health - activeCard.dmg;
              agent0.querySelector(".heart").style.color = "red"; */
        } else if (
            !(
                domRect1.top > domRect6.bottom ||
                domRect1.right < domRect6.left ||
                domRect1.bottom < domRect6.top ||
                domRect1.left > domRect6.right
            ) &&
            activeCard.ability !== "arc rose" &&
            /*        && activeCard.ability !== "cloudburst"
                      && activeCard.ability !== "dark cover"*/
            activeCard.ability !== "guiding light" &&
            activeCard.ability !== "meddle" &&
            activeCard.ability !== "owl drone" &&
            activeCard.ability !== "paranoia" &&
            activeCard.ability !== "razorvine" &&
            activeCard.ability !== "recon bolt" &&
            /*        && activeCard.ability !== "ruse"*/
            /*        && activeCard.ability !== "barrier orb"
                      && activeCard.ability !== "contingency"
                      && activeCard.ability !== "shear"*/
            activeCard.ability !== "shock bolt" &&
            activeCard.ability !== "slow orb" &&
            activeCard.ability !== "trailblazer" &&
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"&&
            activeCard.ability !== "undercut"
        ) {
            isLocked = 1;
            container = 5;
            scale();
            /* agent1.querySelector(".heart").textContent = agent1.health - activeCard.dmg;
              agent1.querySelector(".heart").style.color = "red"; */
        } else if (
            !(
                domRect1.top > domRect7.bottom ||
                domRect1.right < domRect7.left ||
                domRect1.bottom < domRect7.top ||
                domRect1.left > domRect7.right
            ) &&
            activeCard.ability !== "arc rose" &&
            /*        && activeCard.ability !== "cloudburst"
              && activeCard.ability !== "dark cover"*/
            activeCard.ability !== "guiding light" &&
            activeCard.ability !== "meddle" &&
            activeCard.ability !== "owl drone" &&
            activeCard.ability !== "paranoia" &&
            activeCard.ability !== "razorvine" &&
            activeCard.ability !== "recon bolt" &&
            /*        && activeCard.ability !== "ruse"*/
            /*        && activeCard.ability !== "barrier orb"
              && activeCard.ability !== "contingency"
              && activeCard.ability !== "shear"*/
            activeCard.ability !== "shock bolt" &&
            activeCard.ability !== "slow orb" &&
            activeCard.ability !== "trailblazer" &&
            activeCard.ability !== "double tap" &&
            activeCard.ability !== "pick me up" &&
            activeCard.ability !== "shrouded step" &&
            activeCard.ability !== "tailwind" &&
            activeCard.ability !== "updraft"&&
            activeCard.ability !== "undercut"
        ) {
            isLocked = 1;
            container = 6;
            scale();
            /* agent2.querySelector(".heart").textContent = agent2.health - activeCard.dmg;
              agent2.querySelector(".heart").style.color = "red"; */
        }else if(activeCard.ability === "double tap" ||
            activeCard.ability === "pick me up" ||
            activeCard.ability === "shrouded step" ||
            activeCard.ability === "tailwind" ||
            activeCard.ability === "updraft")
        {
            let rectId;
            switch (activeCard.ability) {
                case "double tap":
                    rectId = agentsChosen.indexOf("iso");
                    break;
                case "pick me up":
                    rectId = agentsChosen.indexOf("clove");
                    break;
                case "shrouded step":
                    rectId = agentsChosen.indexOf("omen");
                    break;
                case "tailwind":
                    rectId = agentsChosen.indexOf("jett");
                    break;
                case "updraft":
                    rectId = agentsChosen.indexOf("jett");
                    break;
            }

            let targetRect;
            switch (rectId) {
                case 0:
                    targetRect = domRect5;
                    break;
                case 1:
                    targetRect = domRect6;
                    break;
                case 2:
                    targetRect = domRect7;
                    break;

            }


            if (!(
                domRect1.top > targetRect.bottom ||
                domRect1.right < targetRect.left ||
                domRect1.bottom < targetRect.top ||
                domRect1.left > targetRect.right
            )) {
                isLocked = 1;
                container = rectId + 4;
                scale();
            }else {
                isLocked = 0;
                container = null;
                gsap.to(activeCard, {
                    transform: "scale(1)",
                    duration: "0.3",
                });
            }
        }
        else {
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
        cardSpacing = window.innerWidth * 0.06;

        updateDeckPositions(0.5);
        handDown = true;
        //console.log(handDown)
    }
    // TODO [yell]: HERE IS THE THING

    distanceFind();
}

let endScreen = document.getElementById("endScreen");

let enemyAgentElements;

let apShow = document.querySelectorAll(".apShow");

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
    const myAgents = Array.from(agentElements).filter((el) =>
        agentsChosen.includes(el.id)
    );
    enemyAgentElements = enemyAgents
        .map((agentName) => document.getElementById("enemy_" + agentName))
        .filter((el) => el !== null);

    myAgents.forEach((agentEl) => {
        agentEl.classList.remove("isPlaceable");
    });
    enemyAgentElements.forEach((enemyEl) => {
        enemyEl.classList.remove("isPlaceable");
    });

    //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    if (
        activeCard.type === "gun" &&
        (container === 1 || container === 2 || container === 3)
    ) {
        console.log("gun card on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
        if (container === 1) {
        }
    } else if (
        activeCard.ability === "arc rose" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("arc rose on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } /*else if (activeCard.ability === "barrier orb" && (container === 1 || container === 2 || container === 3)){
        console.log("barrier orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ /*else if (activeCard.ability === "cloudburst" && (container === 4 || container === 5 || container === 6)) {
        console.log("cloudburst on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ /*else if (activeCard.ability === "contigency" && (container === 1 || container === 2 || container === 3)){
        console.log("contigency on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ /*else if (activeCard.ability === "dark cover" && (container === 4 || container === 5 || container === 6)) {
        console.log("dark cover on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ else if (
        activeCard.ability === "double tap" &&
        (container !== agentsChosen.indexOf("iso") + 4)
        && activeCard.spawning === false    // fixuje bug ktery delal ze karta se pri koupi da do decku i kdyz nebyla v buy zone
    ) {
        console.log("double tap on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "guiding light" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("guiding light on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "healing orb" &&
        (container === 1 || container === 2 || container === 3)
    ) {
        console.log("healing orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "meddle" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("meddle on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "owl drone" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("owl drone on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "paranoia" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("paranoia on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "pick me up" &&
        (container !== agentsChosen.indexOf("clove") + 4)
        && activeCard.spawning === false    // fixuje bug ktery delal ze karta se pri koupi da do decku i kdyz nebyla v buy zone
    ) {
        console.log("index of clove:", agentsChosen.indexOf("clove"));
        console.log("container:", container);
        console.log("pick me up on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "razorvine" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("razorvine on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "recon bolt" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("recon bolt on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "regrowth" &&
        (container === 1 || container === 2 || container === 3)
    ) {
        console.log("regrowth on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } /*else if (activeCard.ability === "ruse" && (container === 4 || container === 5 || container === 6)) {
        console.log("ruse on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ /*else if (activeCard.ability === "shear" && (container === 4 || container === 5 || container === 6)) {
        console.log("shear on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    }*/ else if (
        activeCard.ability === "shock bolt" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("shock bolt on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "shrouded step" &&
        (container !== agentsChosen.indexOf("omen") + 4)
        && activeCard.spawning === false    // fixuje bug ktery delal ze karta se pri koupi da do decku i kdyz nebyla v buy zone
    ) {
        console.log("shrouded step on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "slow orb" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("slow orb on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "tailwind" &&
        (container !== agentsChosen.indexOf("jett") + 4)
        && activeCard.spawning === false    // fixuje bug ktery delal ze karta se pri koupi da do decku i kdyz nebyla v buy zone
    ) {
        console.log("tailwind on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "trailblazer" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("trailblazer on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "undercut" &&
        (container === 4 || container === 5 || container === 6)
    ) {
        console.log("undercut on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (
        activeCard.ability === "updraft" &&
        (container !== agentsChosen.indexOf("jett") + 4)
        && activeCard.spawning === false    // fixuje bug ktery delal ze karta se pri koupi da do decku i kdyz nebyla v buy zone
    ) {
        console.log("updraft on invalid container - forcing return to deck");
        container = null;
        isLocked = 0;
    } else if (activeCard.spawning === false && isLocked === 1) {
        if (activeCard.type === "ability") {
            let agent = null;
            let agentIndex = null; // Track which agent (0, 1, or 2)

            if (container === 1) {
                agent = enemyAgentElements[0];
                agentIndex = 0;
            } else if (container === 2) {
                agent = enemyAgentElements[1];
                agentIndex = 1;
            } else if (container === 3) {
                agent = enemyAgentElements[2];
                agentIndex = 2;
            } else if (container === 4) {
                agent = agent0;
                agentIndex = 0;
            } else if (container === 5) {
                agent = agent1;
                agentIndex = 1;
            } else if (container === 6) {
                agent = agent2;
                agentIndex = 2;
            }

            if (agent) {
                const effectObj = {
                    name: activeCard.ability,
                    duration: 4,
                    ap: 0,
                };

                agent.effects.unshift(effectObj);

                executeTurnAbilities(agent, effectObj);

                //updateEffects(agent, true);
                let effectName = agent.effects[0].name.trim();
                effectName = effectName.replace(/["')]/g, "");

                if (effectName === "arc rose") {
                    effectObj.ap = 2;
                } else if (effectName === "barrier orb") {
                    effectObj.ap = 2;
                } else if (effectName === "cloudburst") {
                    effectObj.ap = 1;
                } else if (effectName === "contigency") {
                    effectObj.ap = 2;
                } else if (effectName === "dark cover") {
                    effectObj.ap = 2;
                } else if (effectName === "double tap") {
                    effectObj.ap = 3;
                } else if (effectName === "guiding light") {
                    effectObj.ap = 3;
                } else if (effectName === "healing orb") {
                    effectObj.ap = 2;
                    effectObj.duration = 1;
                } else if (effectName === "meddle") {
                    effectObj.ap = 2;
                } else if (effectName === "owl drone") {
                    effectObj.ap = 2;
                } else if (effectName === "paranoia") {
                    effectObj.ap = 3;
                } else if (effectName === "pick me up") {
                    effectObj.ap = 3;
                } else if (effectName === "razorvine") {
                    effectObj.ap = 3;
                } else if (effectName === "recon bolt") {
                    effectObj.ap = 2;
                } else if (effectName === "regrowth") {
                    effectObj.ap = 2;
                } else if (effectName === "ruse") {
                    effectObj.ap = 2;
                } else if (effectName === "shear") {
                    effectObj.ap = 3;
                } else if (effectName === "shock bolt") {
                    effectObj.ap = 2;
                } else if (effectName === "slow orb") {
                    effectObj.ap = 3;
                    effectObj.duration = 1;
                } else if (effectName === "shrouded step") {
                    effectObj.ap = 2;
                } else if (effectName === "tailwind") {
                    effectObj.ap = 3;
                } else if (effectName === "trailblazer") {
                    effectObj.ap = 3;
                } else if (effectName === "undercut") {
                    effectObj.ap = 3;
                } else if (effectName === "updraft") {
                    effectObj.ap = 2;
                }

                const apCost = effectObj.ap;

                if (apCost > 0) {
                    if (!canAfford(apCost)) {
                        flashNotEnoughAP();
                        isLocked = 0;

                        // RETURN CARD TO DECK

                        document.querySelectorAll(".isPlaceable").forEach((el) => {
                            el.classList.remove("isPlaceable");
                        });

                        gsap.to(activeCard, {
                            scale: 1,
                            duration: 0.2,
                        });
                        activeCard.deck = true;
                        deckCards.push(activeCard);
                        updateDeckPositions(0.3);

                        document.removeEventListener("mousemove", mouseMove);
                        document.removeEventListener("mouseup", mouseUp);
                        return;
                    }
                    // else we can afford: spend AP now
                    spendAP(apCost);
                    // optionally emit AP change / sync to server:
                    // socket.emit("updateAP", { playerId: myId, currentAP });
                }

                agentElements.forEach((agentEl) => {
                    agentEl.damageMultiplier = 1;
                    agentEl.hitChanceMultiplier = 1;
                    agentEl.enemyHitChanceMultiplier = 1;
                    agentEl.damageWhenAttacking = false;
                    agentEl.isSelectable = true;
                    agentEl.healOnAttacking = false;
                    agentEl.damageMitigation = false;
                    agentEl.shootTwoTimes = false;
                    agentEl.effects.forEach((effect) => {
                        effectLUT(agentEl, effect);
                    });
                });
                socket.emit("effectApplied", {
                    agentIndex: agentIndex,
                    effectName: activeCard.ability,
                    duration: effectObj.duration + 1,
                    isFriendly: container >= 4, // true if 4,5,6 (your agents), false if 1,2,3 (enemies)
                });

                console.log(
                    "effect applied: " + activeCard.ability + " to " + agent.id
                );
                console.log("Current effects:", agent.effects);

                updateEffects(agent, true);
            }
        }
    }

    if (activeCard.type === "gun") {
        let agent = null;
        if (container === 4) {
            agent = agent0;
        } else if (container === 5) {
            agent = agent1;
        } else if (container === 6) {
            agent = agent2;
        }

        // Only apply weapon if we have a valid agent
        if (agent) {
            agent.weapon = activeCard.weaponName; // Use the stored name!
            console.log("weapon applied: " + agent.weapon + " to " + agent.id);

            document.querySelector(`#${agent.id} .wpn`).style.backgroundImage =
                `url('images/gunIcon/${agent.weapon}_killfeed.webp')`;
            document.querySelector(`#${agent.id} .wpn`).className = "wpn";
            document.querySelector(`#${agent.id} .wpn`).classList.add(agent.weapon);

            document.querySelector(`#${agent.id} .apShow`).textContent = weaponAP[activeCard.weaponName];

            document.removeEventListener("mousemove", mouseMove);
            document.removeEventListener("mouseup", mouseUp);
            dropSound.play();
            socket.emit("weaponApplied", {
                agentId: agent.id,
                weaponName: activeCard.weaponName,
            })
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
            shopSound.play();
            creds = creds - activeCard.price;
            credsText.innerHTML = creds + "c";
            updateSpawnerButtons();
        }
    } else  {
        if (activeCard.type === "ability") {
            if (isLocked === 1 && activeCard.spawning === false) {
            switchPlayer();
            }
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
            dropper = agent1;
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
                for (let i = 0; i < cardsGame.length; i++) {
                    cardsGame[i].style.pointerEvents = "all";
                }
                activeCard.style.display = "none";
            }, 300);
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
            //onComplete: () => dropSound.play(),
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

socket.on("weaponAppliedEnemy", (data) => {
    console.log("Enemy applied weapon:", data);



    const agent = document.getElementById("enemy_"+data.agentId);

        agent.weapon = data.weaponName;
        console.log("weapon applied: " + agent.weapon + " to " + agent.id);
        document.querySelector(`#${agent.id} .wpn`).style.backgroundImage = `url('images/gunIcon/${agent.weapon}_killfeed.webp')`;
        document.querySelector(`#${agent.id} .wpn`).className = "wpn";
        document.querySelector(`#${agent.id} .wpn`).classList.add(agent.weapon);
/*        document.querySelector(`#${agent.id} .apShow`).textContent =
            weaponAP[data.weaponName];*/

})

function updateEffects(agent, doneWithCard) {
    let effectName = agent.effects[0].name.trim();
    effectName = effectName.replace(/["')]/g, "");
    console.log(effectName);

    if (doneWithCard) {
        activeCard.style.transition = "opacity 0.2s";
        activeCard.style.opacity = "0";

        setTimeout(() => {
            for (let i = 0; i < cardsGame.length; i++) {
                cardsGame[i].style.pointerEvents = "all";
            }
            activeCard.style.display = "none";
        }, 300);

        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
        dropSound.play();
    }

    for (let i = 1; i <= 5; i++) {
        const slot = document.querySelector(`#${agent.id} .ef${i}`);

        // check if empty
        if (!slot.style.backgroundImage || slot.style.backgroundImage === "none") {
            slot.style.opacity = "100%";
            slot.style.backgroundImage = `url('images/abilityIcon/${effectName}.webp')`;

            // Add duration counter
            let durationCounter = slot.querySelector('.duration-counter');
            if (!durationCounter) {
                durationCounter = document.createElement('div');
                durationCounter.className = 'duration-counter';
                slot.appendChild(durationCounter);
            }
            durationCounter.textContent = agent.effects[0].duration;
            durationCounter.style.display = 'block';

            break; // stop after filling the first empty one
        }
    }
}

function updateAllDurationCounters(agent) {
    const slots = document.querySelectorAll(`#${agent.id} .effects > div`);

    slots.forEach((slot, index) => {
        if (slot.style.backgroundImage && slot.style.backgroundImage !== "none") {
            const effect = agent.effects[index];
            if (effect) {
                let durationCounter = slot.querySelector('.duration-counter');
                if (!durationCounter) {
                    durationCounter = document.createElement('div');
                    durationCounter.className = 'duration-counter';
                    slot.appendChild(durationCounter);
                }
                durationCounter.textContent = effect.duration;
                durationCounter.style.display = 'block';
            }
        }
    });
}

socket.on("enemyAppliedEffect", (data) => {
    console.log("Enemy applied effect:", data);

    let agent;

    // Reverse the target! AAAAAAAAAAAAAAAA
    if (data.isFriendly) {
        // They applied to their agent at your enemy
        const enemyAgentElements = enemyAgents
            .map((agentName) => document.getElementById("enemy_" + agentName))
            .filter((el) => el !== null);

        agent = enemyAgentElements[data.agentIndex];
    } else {
        // They applied to their enemy â†’ your agent
        const myAgents = [agent0, agent1, agent2];
        agent = myAgents[data.agentIndex];
    }

    if (agent) {
        const effectObj = {
            name: data.effectName,
            duration: data.duration,
        };

        agent.effects.unshift(effectObj);
        console.log(`Effect ${data.effectName} applied to ${agent.id}`);

        executeTurnAbilities(agent, effectObj);

        updateEffects(agent, false);
    }
    const agentElements = document.querySelectorAll(".agentSelect");

    agentElements.forEach((agentEl) => {
        agentEl.damageMultiplier = 1;
        agentEl.hitChanceMultiplier = 1;
        agentEl.enemyHitChanceMultiplier = 1;
        agentEl.damageWhenAttacking = false;
        agentEl.isSelectable = true;
        agentEl.healOnAttacking = false;
        agentEl.damageMitigation = false;
        agentEl.shootTwoTimes = false;
        agentEl.effects.forEach((effect) => {
            effectLUT(agentEl, effect);
        });
    });

    console.log(agent.effects);
});

let maxAP = 7;
let currentAP = maxAP;

const apGems = Array.from(document.querySelectorAll("#APhold .AP"));

function updateAPGems() {
    for (let i = 0; i < apGems.length; i++) {
        if (i < currentAP) {
            apGems[i].classList.remove("used");
        } else {
            apGems[i].classList.add("used");
        }
    }
}

function canAfford(cost) {
    return currentAP >= cost;
}

function spendAP(cost) {
    currentAP = Math.max(0, currentAP - cost);
    updateAPGems();
}

function refillAP(amount = maxAP) {
    currentAP = Math.min(maxAP, amount);
    updateAPGems();
}

function flashNotEnoughAP() {
    // example: add a 'shake' to APhold or briefly flash
    const holder = document.getElementById("APhold");
    if (!holder) return;
    holder.classList.add("not-enough");
    setTimeout(() => holder.classList.remove("not-enough"), 350);
}

function onCardSelected(cardElement) {
    const apCost = activeCard.ap(cardElement); // your method to get required AP
    if (!canAfford(apCost)) {
        // add class to indicate disabled (and skip applying isPlaceable)
        cardElement.classList.add("disabled-by-ap");
        // don't mark agents as isPlaceable
    } else {
        cardElement.classList.remove("disabled-by-ap");
        // continue your isPlaceable logic
    }
}

function distanceFind(card = activeCard, cont = container) {
    if (!card) return 0;
    const domRect1 = card.getBoundingClientRect();
    let distanceX = 0;
    let distanceY = 0;

    if (cont === 1) {
        distanceX = dropper1.offsetLeft - domRect1.left;
        distanceY = dropper1.offsetTop - domRect1.top;
    } else if (cont === 2) {
        distanceX = dropper2.offsetLeft - domRect1.left;
        distanceY = dropper2.offsetTop - domRect1.top;
    } else if (cont === 3) {
        distanceX = dropper3.offsetLeft - domRect1.left;
        distanceY = dropper3.offsetTop - domRect1.top;
    } else if (cont === 4) {
        distanceX = dropper4.offsetLeft - domRect1.left;
        distanceY = dropper4.offsetTop - domRect1.top;
    } else if (cont === 5) {
        distanceX = dropper5.offsetLeft - domRect1.left;
        distanceY = dropper5.offsetTop - domRect1.top;
    } else if (cont === 6) {
        distanceX = dropper6.offsetLeft - domRect1.left;
        distanceY = dropper6.offsetTop - domRect1.top;
    } else if (cont === null) {
        distanceX = hand.offsetLeft - domRect1.left;
        distanceY = hand.offsetTop - domRect1.top;
    } else if (cont === 0) {
        distanceX = dropper1.offsetLeft - domRect1.left;
        distanceY = dropper1.offsetTop - domRect1.top;
        if (card.deckOponent === true) {
            distanceX = null;
            distanceY = null;
        }
    }

    return Math.hypot(distanceX, distanceY);
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
    else if (cont === 0) dropper = dropper1;

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
    'url("images/guns/shorty.webp")',
    'url("images/guns/frenzy.webp")',
    'url("images/guns/ghost.webp")',
    'url("images/guns/sheriff.webp")',
    'url("images/guns/stinger.webp")',
    'url("images/guns/spectre.webp")',
    'url("images/guns/bucky.webp")',
    'url("images/guns/judge.webp")',
    'url("images/guns/bulldog.webp")',
    'url("images/guns/guardian.webp")',
    'url("images/guns/phantom.webp")',
    'url("images/guns/vandal.webp")',
    'url("images/guns/marshal.webp")',
    'url("images/guns/outlaw.webp")',
    'url("images/guns/operator.webp")',
    'url("images/guns/ares.webp")',
    'url("images/guns/odin.webp")',
];

const priceList = [
    300, 450, 500, 800, 1100, 1600, 850, 1850, 2050, 2250, 2900, 2900, 950, 2400,
    4700, 1600, 3200,
];

const abilitySymb = [
    'url("images/abilitycards/arc rose.webp")', //0
    'url("images/abilitycards/barrier orb.webp")', //1
    'url("images/abilitycards/cloudburst.webp")', //2
    'url("images/abilitycards/contigency.webp")', //3
    'url("images/abilitycards/dark cover.webp")', //4
    'url("images/abilitycards/double tap.webp")', //5
    'url("images/abilitycards/guiding light.webp")', //6
    'url("images/abilitycards/healing orb.webp")', //7
    'url("images/abilitycards/meddle.webp")', //8
    'url("images/abilitycards/owl drone.webp")', //9
    'url("images/abilitycards/paranoia.webp")', //10
    'url("images/abilitycards/pick me up.webp")', //11
    'url("images/abilitycards/razorvine.webp")', //12
    'url("images/abilitycards/recon bolt.webp")', //13
    'url("images/abilitycards/regrowth.webp")', //14
    'url("images/abilitycards/ruse.webp")', //15
    'url("images/abilitycards/shear.webp")', //16
    'url("images/abilitycards/shock bolt.webp")', //17
    'url("images/abilitycards/slow orb.webp")', //18
    'url("images/abilitycards/shrouded step.webp")', //19
    'url("images/abilitycards/tailwind.webp")', //20
    'url("images/abilitycards/trailblazer.webp")', //21
    'url("images/abilitycards/undercut.webp")', //22
    'url("images/abilitycards/updraft.webp")', //23
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
    'url("images/abilityIcon/ruse.webp")', //15
    'url("images/abilityIcon/shear.webp")', //16
    'url("images/abilityIcon/shock bolt.webp")', //17
    'url("images/abilityIcon/slow orb.webp")', //18
    'url("images/abilityIcon/shrouded step.webp")', //19
    'url("images/abilityIcon/tailwind.webp")', //20
    'url("images/abilityIcon/trailblazer.webp")', //21
    'url("images/abilityIcon/undercut.webp")', //22
    'url("images/abilityIcon/updraft.webp")', //23
];

const abilityPrice = [
    150, 300, 200, 200, 150, 200, 250, 250, 250, 400, 250, 200, 150, 250, 150,
    150, 200, 150, 200, 100, 200, 300, 300, 150,
];

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
        qIndex = 21;
        eIndex = 6;
        cIndex = 14;
    } else if (bg.includes("sage_icon.webp")) {
        qIndex = 18;
        eIndex = 7;
        cIndex = 1;
    } else if (bg.includes("jett_icon.webp")) {
        qIndex = 23;
        eIndex = 20;
        cIndex = 2;
    } else if (bg.includes("vyse_icon.webp")) {
        qIndex = 16;
        eIndex = 0;
        cIndex = 12;
    } else if (bg.includes("omen_icon.webp")) {
        qIndex = 10;
        eIndex = 4;
        cIndex = 19;
    } else if (bg.includes("clove_icon.webp")) {
        qIndex = 8;
        eIndex = 15;
        cIndex = 11;
    } else if (bg.includes("iso_icon.webp")) {
        qIndex = 22;
        eIndex = 5;
        cIndex = 3;
    } else if (bg.includes("sova_icon.webp")) {
        qIndex = 17;
        eIndex = 13;
        cIndex = 9;
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

    if (
        buttonId !== "randBtn" &&
        buttonId !== "ab1" &&
        buttonId !== "ab2" &&
        buttonId !== "ab3"
    ) {
        const index = cardSymb.indexOf(imgSelect);
        cardElement.price = priceList[index];
        cardElement.type = "gun";

        cardElement.weaponName = imgSelect
            .replace('url("images/guns/', "")
            .replace('.webp")', "");

        console.log("Created gun card:", cardElement.weaponName);

        const apValue = document.createElement("div");
        apValue.className = "apValue";

        cardElement.appendChild(apValue);          //nastaveni ap value na predek karty zbrane

        apValue.textContent = weaponAP[cardElement.weaponName];
    } else if (buttonId === "randBtn") {
        cardElement.price = 0;
    } else {
        cardElement.type = "ability";

        let abilityApShow = document.createElement("div");
        abilityApShow.className = "apValue";

        cardElement.appendChild(abilityApShow);

        // Calculate the type directly from the index you already have
        if (buttonId === "ab1") {
            const abNameQ = abilitySymb[qIndex]
                .replace('url("images/abilitycards/', "")
                .replace('.webp")', "");

            if (abNameQ === "meddle") {
                abilityApShow.textContent = "2";
                back.innerHTML = "1.5x damage on your shots.";
            } else if (abNameQ === "slow orb") {
                abilityApShow.textContent = "3";
                back.innerHTML = "Enemy cant play the game for one round.";
            } else if (abNameQ === "trailblazer") {
                abilityApShow.textContent = "3";
                back.innerHTML = "1.5x damage on your shots.";
            } else if (abNameQ === "shear") {
                abilityApShow.textContent = "3";
                back.innerHTML = "Tanks damage while active.";
            } else if (abNameQ === "shock bolt") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Deals 2 damage.";
            } else if (abNameQ === "paranoia") {
                abilityApShow.textContent = "3";
                back.innerHTML = "Lowers enemies chances to hit a shot.";
            } else if (abNameQ === "updraft") {
                abilityApShow.textContent = "2";
                back.innerHTML =
                    "Gains better positioning, slightly higher chance to hit your shots.";
            } else if (abNameQ === "undercut") {
                abilityApShow.textContent = "3";
                back.innerHTML = "1.5x damage on your shots.";
            }

            cardElement.ability = abNameQ;
            console.log(cardElement.type);
        } else if (buttonId === "ab2") {
            const abNameE = abilitySymb[eIndex]
                .replace('url("images/abilitycards/', "")
                .replace('.webp")', "");

            if (abNameE === "ruse") {
                abilityApShow.textContent = "2";
                back.innerHTML =
                    "Lowers chances of hitting a shot on both the agent affected and the agents shooting at the affected agent.";
            } else if (abNameE === "guiding light") {
                abilityApShow.textContent = "3";
                back.innerHTML = "Lowers enemies chances to hit a shot.";
            } else if (abNameE === "double tap") {
                abilityApShow.textContent = "3";
                back.innerHTML = "ignores first bullet which hit Iso.";
            } else if (abNameE === "healing orb") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Heals agent for 4 hp, 2 hp added each turn.";
            } else if (abNameE === "dark cover") {
                abilityApShow.textContent = "2";
                back.innerHTML =
                    "Lowers chances of hitting a shot on both the agent affected and the agents shooting at the affected agent.";
            } else if (abNameE === "recon bolt") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Significantly higher chance to hit your shots.";
            } else if (abNameE === "tailwind") {
                abilityApShow.textContent = "3";
                back.innerHTML = "A jett ability to shoot 2 times.";
            } else if (abNameE === "arc rose") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Lowers enemies chances to hit a shot.";
            }

            cardElement.ability = abNameE;
            console.log(cardElement.type);
        } else if (buttonId === "ab3") {
            const abNameC = abilitySymb[cIndex]
                .replace('url("images/abilitycards/', "")
                .replace('.webp")', "");

            if (abNameC === "razorvine") {
                abilityApShow.textContent = "3";
                back.innerHTML =
                    "When applied, opponents which shoot get damaged for 2hp";
            } else if (abNameC === "cloudburst") {
                abilityApShow.textContent = "1";
                back.innerHTML =
                    "Lowers chances of hitting a shot on both the agent affected and the agents shooting at the affected agent.";
            } else if (abNameC === "contigency") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Agent cant be shot but also cant shoot";
            } else if (abNameC === "owl drone") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Significantly higher chance to hit your shots.";
            } else if (abNameC === "regrowth") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Heals agent for 4 hp, 1 hp added each turn.";
            } else if (abNameC === "barrier orb") {
                abilityApShow.textContent = "2";
                back.innerHTML = "Tanks damage while active.";
            } else if (abNameC === "pick me up") {
                abilityApShow.textContent = "2";
                back.innerHTML = "When clove shoots it heals them.";
            } else if (abNameC === "shrouded step") {
                abilityApShow.textContent = "2";
                back.innerHTML =
                    "Gains better positioning, slightly higher chance to hit your shots.";
            }

            cardElement.ability = abNameC;
            console.log(cardElement.type);
        }
        const abIndex = abilitySymb.indexOf(imgSelect);
        cardElement.price = abilityPrice[abIndex];
    }

    if (
        buttonId !== "randBtn" &&
        buttonId !== "ab1" &&
        buttonId !== "ab2" &&
        buttonId !== "ab3"
    ) {
        back.style.backgroundImage = "url(images/guns/back.webp)";
    } else {
        back.style.backgroundImage = imgSelect.replace(
            "images/abilitycards",
            "images/backs"
        );
    }

    // TODO [yell]: // BACK INFO

    if (imgSelect === cardSymb[0]) {
        back.innerHTML =
            "Sometimes all someone needs is a shorty. Fires 5 bullets with heavy spread";
    } else if (imgSelect === cardSymb[1]) {
        back.innerHTML =
            "The frenzy is a beast. Make sure to handle it with care. Shoots 4 times";
    } else if (imgSelect === cardSymb[2]) {
        back.innerHTML =
            "This is a ghost. It shoots only 2 times but packs quite a punch.";
    } else if (imgSelect === cardSymb[3]) {
        back.innerHTML =
            "A heavy duty revolver called the sheriff. 2 shots, 2 bodies.";
    } else if (imgSelect === cardSymb[4]) {
        back.innerHTML = "An extremly fast firing SMG. 7 shots.";
    } else if (imgSelect === cardSymb[5]) {
        back.innerHTML = "The spectre is a spectacle to watch. Fires 5 shots";
    } else if (imgSelect === cardSymb[6]) {
        back.innerHTML = "Pump action shotgun. Many such cases";
    } else if (imgSelect === cardSymb[7]) {
        back.innerHTML = "Automatic shotgun with high damage.";
    } else if (imgSelect === cardSymb[8]) {
        back.innerHTML = "Ruff up your enemies with the bulldog.";
    } else if (imgSelect === cardSymb[9]) {
        back.innerHTML = "Patience twin, just take your time.";
    } else if (imgSelect === cardSymb[10]) {
        back.innerHTML = "Balanced. Accurate. Spicy.";
    } else if (imgSelect === cardSymb[11]) {
        back.innerHTML = "Rebel against the status quo with the vandal.";
    } else if (imgSelect === cardSymb[12]) {
        back.innerHTML = "BOOM HEADSHOT!";
    } else if (imgSelect === cardSymb[13]) {
        back.innerHTML = "2 shots, 2 bodies... deja vu?";
    } else if (imgSelect === cardSymb[14]) {
        back.innerHTML =
            "A weapon of mass destruction. 1 shot is all that is needed.";
    } else if (imgSelect === cardSymb[15]) {
        back.innerHTML = "Ares almost sounds like a god lol.";
    } else if (imgSelect === cardSymb[16]) {
        back.innerHTML = "The odin is definitely a god.";
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
    cardElement.deck = false;   // jestli je karta v decku
    cardElement.deleteTrigger = false;  // trigger ktery oddela kartu, kdzy kartu upustite v shopu
    cardElement.spawning = true;   // if card is in buy menu
    cardElement.dmg = 25; // testing  stuff, ignore  this

    cardElement.addEventListener("mousedown", (e) => mouseDown(e, cardElement));

    //Add to the DOM
    document.querySelector(".container").appendChild(cardElement);

    cardElement.style.opacity = "0";
    cardElement.style.transform = "scale(0.7)";

    gsap.to(cardElement, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
    });

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
    console.log("🃏🃏🃏EMITED CARD SPAWN ")
    //console.log("spawned and dragging card: " + cardId);
}
socket.on("enemySpawnedCard", (data) => {
    console.log(" ♦️♦️♦️RECIEVED CARD SPAWN ")
    //console.log("enemy spawned card: " + data);

    const enemycard = document.createElement("div");
    enemycard.className = "card";
    enemycard.id = "opponent_" + data;
    enemycard.style.left = window.innerWidth / 2 + "px";
    enemycard.style.top = window.innerHeight / 2 + "px";

    enemycard.style.backgroundImage = "url(images/abilitycards/back.webp)";
    enemycard.deckOponent = true;
    deckCardsOponent.push(enemycard);
    cardsGame.push(enemycard);
    document.querySelector(".container").appendChild(enemycard);
    gsap.fromTo(enemycard, {
        opacity: 0,
        scale: 0.01,
    }, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "ease.out",
    })
    updateDeckPositionsOponent(0.5);
});

// TODO [yell]: // PRICE KEEPERS

function updateSpawnerButtons() {
    for (let btn of spawnButtons) {
        const price = parseInt(btn.dataset.price) || 1;
        if (creds >= price) {
            btn.style.pointerEvents = "all";
        } else {
            btn.style.pointerEvents = "none";
        }
    }
}

let handDown = true;

function handOpening() {
    if (handDown === true && deckCards.length !== 0 && ImPlaying === true) {
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
        const targetY =
            window.innerHeight - hand.offsetTop - 0.15 * window.innerWidth;
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

    for (let i = 0; i < circles.length; i++) {
        circles[i].style.backgroundColor = "white";
    }
    circles[currentCircle].style.backgroundColor = "#dca61e";
}

// Update abNames to take agentName as parameter
function abNames(agent) {
    let qIndex, eIndex, cIndex;

    if (agent === "skye") {
        qIndex = 21;
        eIndex = 6;
        cIndex = 14;
        ab1.querySelector(".nameWpn").innerText = "TRAILBLAZER";
        ab2.querySelector(".nameWpn").innerText = "GUIDING LIGHT";
        ab3.querySelector(".nameWpn").innerText = "REGROWTH";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "2.3vw";
        ab2.style.backgroundSize = "2.9vw";
        ab3.style.backgroundSize = "2.8vw";
    } else if (agent === "sage") {
        qIndex = 18;
        eIndex = 7;
        cIndex = 1;
        ab1.querySelector(".nameWpn").innerText = "SLOW ORB";
        ab2.querySelector(".nameWpn").innerText = "HEALING ORB";
        ab3.querySelector(".nameWpn").innerText = "BARRIER ORB";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "2.75vw";
        ab2.style.backgroundSize = "2.75vw";
        ab3.style.backgroundSize = "3.2vw";
    } else if (agent === "jett") {
        qIndex = 23;
        eIndex = 20;
        cIndex = 2;
        ab1.querySelector(".nameWpn").innerText = "UPDRAFT";
        ab2.querySelector(".nameWpn").innerText = "TAILWIND";
        ab3.querySelector(".nameWpn").innerText = "CLOUDBURST";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "2.2vw";
        ab2.style.backgroundSize = "3.2vw";
        ab3.style.backgroundSize = "2.7vw";
    } else if (agent === "vyse") {
        qIndex = 16;
        eIndex = 0;
        cIndex = 12;
        ab1.querySelector(".nameWpn").innerText = "SHEAR";
        ab2.querySelector(".nameWpn").innerText = "ARC ROSE";
        ab3.querySelector(".nameWpn").innerText = "RAZORVINE";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "3.2vw";
        ab2.style.backgroundSize = "3vw";
        ab3.style.backgroundSize = "3.2vw";
    } else if (agent === "omen") {
        qIndex = 10;
        eIndex = 4;
        cIndex = 19;
        ab1.querySelector(".nameWpn").innerText = "PARANOIA";
        ab2.querySelector(".nameWpn").innerText = "DARK COVER";
        ab3.querySelector(".nameWpn").innerText = "SHROUDED STEP";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "3vw";
        ab2.style.backgroundSize = "2.5vw";
        ab3.style.backgroundSize = "2.75vw";
    } else if (agent === "clove") {
        qIndex = 8;
        eIndex = 15;
        cIndex = 11;
        ab1.querySelector(".nameWpn").innerText = "MEDDLE";
        ab2.querySelector(".nameWpn").innerText = "RUSE";
        ab3.querySelector(".nameWpn").innerText = "PICK-ME-UP";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "3.2vw";
        ab2.style.backgroundSize = "2.7vw";
        ab3.style.backgroundSize = "3vw";
    } else if (agent === "iso") {
        qIndex = 22;
        eIndex = 5;
        cIndex = 3;
        ab1.querySelector(".nameWpn").innerText = "UNDERCUT";
        ab2.querySelector(".nameWpn").innerText = "DOUBLE TAP";
        ab3.querySelector(".nameWpn").innerText = "CONTINGENCY";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "2.8vw";
        ab2.style.backgroundSize = "2vw";
        ab3.style.backgroundSize = "3vw";
    } else if (agent === "sova") {
        qIndex = 17;
        eIndex = 13;
        cIndex = 9;
        ab1.querySelector(".nameWpn").innerText = "SHOCK BOLT";
        ab2.querySelector(".nameWpn").innerText = "RECON BOLT";
        ab3.querySelector(".nameWpn").innerText = "OWL DRONE";
        ab1.querySelector(".priceWpn").innerText = abilityPrice[qIndex] + "c";
        ab2.querySelector(".priceWpn").innerText = abilityPrice[eIndex] + "c";
        ab3.querySelector(".priceWpn").innerText = abilityPrice[cIndex] + "c";

        ab1.style.backgroundSize = "2.7vw";
        ab2.style.backgroundSize = "2.9vw";
        ab3.style.backgroundSize = "3.5vw";
    }

    ab1.style.backgroundImage = abilityIcon[qIndex];
    ab2.style.backgroundImage = abilityIcon[eIndex];
    ab3.style.backgroundImage = abilityIcon[cIndex];

    updateSpawnerButtons();
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
    function moveToDrop(el, dropper) {
        if (el.classList.contains("animating")) return; // don't interfere
        const rect = dropper.getBoundingClientRect();
        gsap.to(el, {
            left: rect.left + "px",
            top: rect.top + "px",
            duration: 0,
            overwrite: true,
        });
    }
    // Move player's locked-in agents (agentsChosen order -> drop4,drop5,drop6)

    const drops = [d4, d5, d6];
    for (let i = 0; i < 3; i++) {
        const nameOrEl = agentsChosen[i];
        let el = document.getElementById(nameOrEl);
        moveToDrop(el, drops[i]);
    }

    // Move enemy agents if present (enemy_<name> -> drop1/2/3 in array order)
    // If you spawn enemies in the same order, adapt as needed
    const enemyEls = [];
    // gather existing enemy elements in DOM order (drop1..3)
    if (d1)
        enemyEls.push({
            el: document.getElementById("enemy_" + (agentsChosen[0] || "")),
            drop: d1,
        });
    if (d2)
        enemyEls.push({
            el: document.getElementById("enemy_" + (agentsChosen[1] || "")),
            drop: d2,
        });
    if (d3)
        enemyEls.push({
            el: document.getElementById("enemy_" + (agentsChosen[2] || "")),
            drop: d3,
        });
    // But more robust: move any #enemy_* elements found to the earliest free droppers
    const allEnemyNodes = Array.from(document.querySelectorAll("[id^='enemy_']"));
    const enemyDroppers = [d1, d2, d3].filter(Boolean);
    allEnemyNodes.forEach((node, idx) => {
        moveToDrop(node, enemyDroppers[idx]);
    });
}

let playerRoundOverPressed = false;
let enemyRoundOverPressed = false;
let roundCount = 1;

function roundOver() {
    if (ImPlaying && shootingFlag === false) {
        bothRound();
        if (playerRoundOverPressed && enemyRoundOverPressed) {
            creds = creds + (500 + (roundCount * 100));
            credsText.innerHTML = creds + "C";
            updateSpawnerButtons();
            refillAP(7);
            textShowUp();
            moneyShowUp();
            if (roundCount <= 6) {
                roundCount = roundCount + 1;
            }
            playerRoundOverPressed = false;
            enemyRoundOverPressed = false;
        }
        switchPlayer();
        // console.log(endAgree)
    }
}

function bothRound(){
    playerRoundOverPressed = true;
    socket.emit("playerRoundOver", {});
}

socket.on("enemyRoundOver", (data) => {
    enemyRoundOverPressed = true;
    if(playerRoundOverPressed && enemyRoundOverPressed){
        creds = creds + (500 + (roundCount * 100));
        credsText.innerHTML = creds + "C";
        updateSpawnerButtons();
        refillAP(7);
        textShowUp();
        moneyShowUp();
        if (roundCount <= 6) {
            roundCount = roundCount + 1;
        }
        playerRoundOverPressed = false;
        enemyRoundOverPressed = false;
    }
});

socket.on("enemyRoundOverSetFalse", (data) => {
    enemyRoundOverPressed = false;
})

function textShowUp() {
    const roundText = document.createElement("div");
    roundText.textContent = "New Round!";
    roundText.className = "round-announcement";

    document.body.appendChild(roundText);


    // GSAP animation timeline
    const tl = gsap.timeline({
        onComplete: () => {
            // Remove element after animation completes
            roundText.remove();
        },
    });

    // Animate: right -> center -> left
    tl.fromTo(
        roundText,
        {
            x: window.innerWidth, // Start from right off-screen
            opacity: 0,
        },
        {
            x: window.innerWidth / 2 - roundText.offsetWidth / 2, // Move to center
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
        }
    )
        .to(roundText, {
            duration: 0.8, // Stay in center
            ease: "none",
        })
        .to(roundText, {
            x: -roundText.offsetWidth, // Move left off-screen
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
        });
}

function moneyShowUp() {
    const moneyText = document.createElement("div");
    moneyText.textContent = 500+ (roundCount * 100) + "C Added";
    moneyText.className = "money-announcement";
    moneyText.style.zIndex = "4";

    document.body.appendChild(moneyText);


    // GSAP animation timeline
    const tl = gsap.timeline({
        onComplete: () => {
            // Remove element after animation completes
            moneyText.remove();
        },
    });

    // Animate: right -> center -> left
    tl.fromTo(
        moneyText,
        {
            x: -window.innerWidth, // Start from right off-screen
            opacity: 0,
        },
        {
            x: window.innerWidth / 10 - moneyText.offsetWidth / 10, // Move to center
            opacity: 1,
            duration: 1.5,
            ease: "power2.out",
        }
    )
        .to(moneyText, {
            duration: 4, // Stay in center
            ease: "none",
        })
        .to(moneyText, {
            x: -moneyText.offsetWidth, // Move left off-screen
            opacity: 0,
            duration: 1.5,
            ease: "power2.in",
        });
}