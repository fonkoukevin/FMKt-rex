import { updateGround, setupGround } from "./ground.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector("[data-world]")
const scoreElem =  document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const scoreListElem = document.querySelector("[data-score-list]")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleStart, { once: true })

let lastTime
let speedScale
let score
let playing = false

function update(time) {
  if (!playing) return
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  updateCactus(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)
  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const dinoRect = getDinoRect()
  return getCactusRects().some(rect => isCollision(rect, dinoRect))
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)
}

function handleStart() {
  playing = true
  lastTime = null
  speedScale = 1
  score = 0
  setupGround()
  setupDino()
  setupCactus()
  startScreenElem.classList.add("hide")
  scoreListElem.classList.add("hide") // Cacher la liste des scores au début
  window.requestAnimationFrame(update)
}

function handleLose() {
  playing = false
  setDinoLose()
  startScreenElem.classList.remove("hide")
  document.addEventListener("keydown", handleStart, { once: true })

  // Ajouter le score à la base de données
  const scoreToSend = Math.floor(score); // Convertir le score en entier
  fetch('score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'score=' + scoreToSend // Envoyer le score au backend
  }).then(response => {
    // Une fois que le score est enregistré, récupérer les scores depuis la base de données
    fetchScores();
  }).catch(error => {
    console.error('Erreur lors de l\'envoi du score au backend :', error);
  });
}
function fetchScores() {
  fetch('score.php')
    .then(response => response.json())
    .then(scores => {
      const scoreListElem = document.querySelector("[data-score-list]");
      scoreListElem.innerHTML = ''; // Effacer la liste des scores

      // Ajouter chaque score à la liste avec un numéro
      scores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.textContent = `${index + 1}. ${score}`; // Ajouter le numéro avant le score
        scoreListElem.appendChild(scoreItem);
      });

      // Afficher la liste des scores
      scoreListElem.classList.remove("hide");
    })
    .catch(error => console.error('Erreur lors de la récupération des scores:', error));
}



function setPixelToWorldScale() {
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT 
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}
