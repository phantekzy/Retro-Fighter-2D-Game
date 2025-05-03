// utils.js

/**
 * Checks if two rectangles (e.g., attackBox and player/enemy) are colliding.
 * This function assumes both rectangles have a `position` and `width/height` properties.
 * 
 * @param {Object} param0 - The objects containing the rectangles to check.
 * @param {Object} param0.rectangle1 - The first rectangle, typically an attackBox.
 * @param {Object} param0.rectangle2 - The second rectangle, typically the opponent's position.
 * @returns {boolean} - Returns true if the rectangles collide, otherwise false.
 */
function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
	  rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
	  rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
	  rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
	  rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
	);
  }
  
  /**
   * Determines the winner of the match based on player and enemy health.
   * Displays the result on the screen by updating the inner HTML of the #displayText element.
   * 
   * @param {Object} param0 - The objects containing the player and enemy health information.
   * @param {Object} param0.player - The player object with health data.
   * @param {Object} param0.enemy - The enemy object with health data.
   * @param {number} param0.timerId - The ID of the timer that was running.
   */
  function determinWinner({ player, enemy, timerId }) {
	// Clear the timer when the game ends
	clearTimeout(timerId);
	
	// Show the result text on screen
	document.querySelector('#displayText').style.display = 'flex';
  
	if (player.health === enemy.health) {
	  document.querySelector('#displayText').innerHTML = 'DRAW'; // If both players have the same health
	} else if (player.health > enemy.health) {
	  document.querySelector('#displayText').innerHTML = 'PLAYER 1 WINS'; // Player wins
	} else {
	  document.querySelector('#displayText').innerHTML = 'PLAYER 2 WINS'; // Enemy wins
	}
  }
  
  // Timer-related variables
  let timer = 100;
  let timerId;
  
  /**
   * Decreases the timer each second and updates the timer display.
   * Once the timer reaches 0, it calls the determinWinner function to decide the winner.
   */
  function decreaseTimer() {
	// Continue decreasing the timer if it's not zero
	if (timer > 0) {
	  timerId = setTimeout(decreaseTimer, 1000); // Decreases the timer every second
	  timer--; // Reduce the timer by 1
	  document.querySelector('#timer').innerHTML = timer; // Update the timer display
	}
  
	// When timer reaches 0, determine the winner
	if (timer === 0) {
	  determinWinner({ player, enemy, timerId });
	}
  }
  