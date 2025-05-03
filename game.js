/**
 * @fileOverview Main game logic, including the game loop, player/enemy interaction, and sprite management.
 * Handles movement, attacks, collision detection, health updates, and game-over condition.
 */

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Set canvas size
canvas.width = 1024
canvas.height = 576

// Define gravity constant
const gravity = 0.8

// Background sprite
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './assets/bg2.jpg'
})



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
})

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
})

// Key press tracking
const keys = {
  q: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false }
}

// Initialize timer for the game
decreaseTimer()

/**
 * Flash the health bar when a hit occurs.
 * @param {string} id - The ID of the health bar element.
 */
function flashHealthBar(id) {
  const bar = document.getElementById(id)
  if (bar) {
    bar.classList.add('flashing')
    setTimeout(() => bar.classList.remove('flashing'), 150)
  }
}

/**
 * Main animation loop, updating game state each frame.
 */
function animate() {
  window.requestAnimationFrame(animate)

  // Clear the screen
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Update background
  background.update()

  // Update player velocity based on key inputs
  player.velocity.x = 0
  if (keys.q.pressed && player.lastKey === 'q') {
    player.velocity.x = -4
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 4
  }

  // Update enemy velocity based on key inputs
  enemy.velocity.x = 0
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -4
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 4
  }

  // Update sprite state for player (running, jumping, etc.)
  if (player.velocity.y < 0) {
    player.switchSprites('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprites('fall')
  } else if (player.velocity.x !== 0) {
    player.switchSprites('run')
  } else {
    player.switchSprites('idle')
  }

  // Update sprite state for enemy (running, jumping, etc.)
  if (enemy.velocity.y < 0) {
    enemy.switchSprites('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprites('fall')
  } else if (enemy.velocity.x !== 0) {
    enemy.switchSprites('run')
  } else {
    enemy.switchSprites('idle')
  }

  // Update player and enemy
  player.update()
  enemy.update()

  // Handle player attacks on enemy
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking && player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false
    document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    flashHealthBar('enemyHealth')
  }

  // Handle player second attack on enemy
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking2 && player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking2 = false
    enemy.health -= 5
    document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    flashHealthBar('enemyHealth')
  }

  // Handle enemy attacks on player
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking && player.framesCurrent === 3
  ) {
    player.takeHit()
    enemy.isAttacking = false
    player.health -= 2
    document.querySelector('#playerHealth').style.width = player.health + '%'
    flashHealthBar('playerHealth')
  }

  // Handle enemy second attack on player
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking2 && player.framesCurrent === 3
  ) {
    player.takeHit()
    enemy.isAttacking2 = false
    player.health -= 5
    document.querySelector('#playerHealth').style.width = player.health + '%'
    flashHealthBar('playerHealth')
  }

  // Reset attack states if attack animation frames are finished
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }
  if (enemy.isAttacking && enemy.framesCurrent === 3) {
    enemy.isAttacking = false
  }
  if (player.isAttacking2 && player.framesCurrent === 4) {
    player.isAttacking2 = false
  }
  if (enemy.isAttacking2 && enemy.framesCurrent === 4) {
    enemy.isAttacking2 = false
  }

  // End game if either player's health reaches 0
  if (player.health <= 0 || enemy.health <= 0) {
    determinWinner({ player, enemy, timerId })
  }
}

// Start the animation loop
animate()

/**
 * Handle keydown events for controlling player and enemy actions.
 */
window.addEventListener('keydown', event => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'q':
        keys.q.pressed = true
        player.lastKey = 'q'
        break
      case ' ':
        player.velocity.y = -15
        break
      case 'g':
        player.attack()
        break
      case 'h':
        player.attack2()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case '0':
        enemy.velocity.y = -15
        break
      case 'Enter':
        enemy.attack()
        break
      case '3':
        enemy.attack2()
        break
    }
  }
})

/**
 * Handle keyup events to stop movement when keys are released.
 */
window.addEventListener('keyup', event => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'q':
      keys.q.pressed = false
      break
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
