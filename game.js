const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// Set canvas size
canvas.width = 1024;
canvas.height = 576;

// Define gravity constant
const gravity = 0.8;

// Background sprite
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './assets/bg2.jpg'
});

// Shop sprite (placed on the screen)
const shop = new Sprite({
  position: { x: 720, y: 40 },
  imageSrc: './assets/shop.png',
  scale: 2.5,
  framesMax: 6
});

// Load sound effects
const jumpSound = new Audio('./audio/jump.mp3');
const hitSound = new Audio('./audio/hitt.mp3');
const countdownSound = new Audio('./audio/countdown.mp3');
const koSound = new Audio('./audio/ko.mp3');
const bgMusic = new Audio('./audio/background.mp3');
const attackSound = new Audio('./audio/hit.mp3');
const deathSound = new Audio('./audio/death.mp3'); // Add death sound

// Set sound effect volumes
koSound.volume = 1.0;
koSound.loop = false;
bgMusic.volume = 0.9;
bgMusic.loop = true;
bgMusic.play();
deathSound.volume = 1.0; // Set death sound volume to full

// Flag to ensure KO sound plays only once
let hasPlayedKO = false;

// Player character setup
const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: './assets/Idle.png',
  framesMax: 11,
  scale: 3,
  offset: { x: 210, y: 200 },
  sprites: {
    idle: { imageSrc: './assets/Idle.png', framesMax: 11 },
    run: { imageSrc: './assets/Run.png', framesMax: 8 },
    jump: { imageSrc: './assets/Jump.png', framesMax: 3 },
    fall: { imageSrc: './assets/Fall.png', framesMax: 3 },
    attack1: { imageSrc: './assets/Attack1.png', framesMax: 7 },
    attack2: { imageSrc: './assets/Attack2.png', framesMax: 7 },
    takeHit: { imageSrc: './assets/Take Hit.png', framesMax: 4 },
    death: { imageSrc: './assets/Death.png', framesMax: 11 },
  },
  attackBox: { offset: { x: 50, y: -40 }, width: 190, height: 80 }
});

// Enemy character setup
const enemy = new Fighter({
  position: { x: 950, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: './assets/Idle2.png',
  framesMax: 8,
  scale: 3,
  offset: { x: 210, y: 180 },
  sprites: {
    idle: { imageSrc: './assets/Idle2.png', framesMax: 8 },
    run: { imageSrc: './assets/Run2.png', framesMax: 8 },
    jump: { imageSrc: './assets/Jump2.png', framesMax: 2 },
    fall: { imageSrc: './assets/Fall2.png', framesMax: 2 },
    attack1: { imageSrc: './assets/Attack_2.png', framesMax: 4 },
    attack2: { imageSrc: './assets/Attack_3.png', framesMax: 4 },
    takeHit: { imageSrc: './assets/hit2.png', framesMax: 4 },
    death: { imageSrc: './assets/Death2.png', framesMax: 6 },
  },
  attackBox: { offset: { x: -200, y: -40 }, width: 300, height: 80 }
});

// Key press tracking
const keys = {
  q: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false }
};

// Initialize the countdown
let countdown = 3;
let countdownTimer = setInterval(() => {
  if (countdown === 0) {
    clearInterval(countdownTimer);
    startMatch(); // Start match after countdown
  } else {
    countdownSound.play();
    countdown--;
  }
}, 1000);

// Start match function
function startMatch() {
  console.log("Match started!");
  animate();
}

// Flash health bar when hit
function flashHealthBar(id) {
  const bar = document.getElementById(id);
  if (bar) {
    bar.classList.add('flashing');
    setTimeout(() => bar.classList.remove('flashing'), 150);
  }
}

// Main game loop
function animate() {
  window.requestAnimationFrame(animate);

  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);

  background.update();

  // Movement logic
  player.velocity.x = 0;
  if (keys.q.pressed && player.lastKey === 'q') player.velocity.x = -2;
  else if (keys.d.pressed && player.lastKey === 'd') player.velocity.x = 2;

  enemy.velocity.x = 0;
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') enemy.velocity.x = -2;
  else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') enemy.velocity.x = 2;

  // Sprite switching
  player.switchSprites(
    player.velocity.y < 0 ? 'jump' :
    player.velocity.y > 0 ? 'fall' :
    player.velocity.x !== 0 ? 'run' : 'idle'
  );

  enemy.switchSprites(
    enemy.velocity.y < 0 ? 'jump' :
    enemy.velocity.y > 0 ? 'fall' :
    enemy.velocity.x !== 0 ? 'run' : 'idle'
  );

  if (player.velocity.y < 0 || enemy.velocity.y < 0) jumpSound.play();

  player.update();
  enemy.update();

  // Player attacks enemy
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking && player.framesCurrent === 4
  ) {
    enemy.takeHit();
    hitSound.play();
    player.isAttacking = false;
    document.querySelector('#enemyHealth').style.width = enemy.health + '%';
    flashHealthBar('enemyHealth');
  }

  // Player second attack
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking2 && player.framesCurrent === 4
  ) {
    enemy.takeHit();
    hitSound.play();
    player.isAttacking2 = false;
    enemy.health -= 5;
    document.querySelector('#enemyHealth').style.width = enemy.health + '%';
    flashHealthBar('enemyHealth');
  }

  // Enemy attacks player
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking && player.framesCurrent === 3
  ) {
    player.takeHit();
    hitSound.play();
    enemy.isAttacking = false;
    player.health -= 2;
    document.querySelector('#playerHealth').style.width = player.health + '%';
    flashHealthBar('playerHealth');
  }

  // Enemy second attack
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking2 && player.framesCurrent === 3
  ) {
    player.takeHit();
    hitSound.play();
    enemy.isAttacking2 = false;
    player.health -= 5;
    document.querySelector('#playerHealth').style.width = player.health + '%';
    flashHealthBar('playerHealth');
  }

  // Reset attacks after animation
  if (player.isAttacking && player.framesCurrent === 4) player.isAttacking = false;
  if (enemy.isAttacking && enemy.framesCurrent === 3) enemy.isAttacking = false;
  if (player.isAttacking2 && player.framesCurrent === 4) player.isAttacking2 = false;
  if (enemy.isAttacking2 && enemy.framesCurrent === 4) enemy.isAttacking2 = false;

  // KO handling (once)
  if (!hasPlayedKO && (player.health <= 0 || enemy.health <= 0)) {
    hasPlayedKO = true;
    koSound.currentTime = 0;
    koSound.play();
    if (player.health <= 0) {
      deathSound.play(); // Play death sound for player
    } else {
      deathSound.play(); // Play death sound for enemy
    }
    determinWinner({ player, enemy, timerId });
  }
}

// Key down handler
window.addEventListener('keydown', event => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'q':
        keys.q.pressed = true;
        player.lastKey = 'q';
        break;
      case ' ':
        player.velocity.y = -15;
        jumpSound.play();
        break;
      case 'g':
        player.attack();
        attackSound.play();
        break;
      case 'h':
        player.attack2();
        attackSound.play();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = 'ArrowRight';
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = 'ArrowLeft';
        break;
      case '0':
        enemy.velocity.y = -15;
        jumpSound.play();
        break;
      case 'Enter':
        enemy.attack();
        attackSound.play();
        break;
      case '3':
        enemy.attack2();
        attackSound.play();
        break;
    }
  }
});

// Key up handler
window.addEventListener('keyup', event => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'q':
      keys.q.pressed = false;
      break;
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});
