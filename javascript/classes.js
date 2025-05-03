/**
 * Represents a Sprite (an image-based object) in the game.
 */
class Sprite {
    /**
     * Creates an instance of Sprite.
     * @param {Object} params
     * @param {Object} params.position - The position of the sprite on the canvas.
     * @param {string} params.imageSrc - The image source for the sprite.
     * @param {number} [params.scale=1] - The scale factor for the sprite.
     * @param {number} [params.framesMax=1] - The total number of frames in the sprite animation.
     * @param {Object} [params.offset={x: 0, y: 0}] - The offset for drawing the sprite (optional).
     */
    constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.offset = offset;
    }

    /**
     * Draws the sprite on the canvas.
     */
    draw() {
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );
    }

    /**
     * Animates the sprite by advancing frames.
     */
    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    /**
     * Updates the sprite's state, drawing and animating frames.
     */
    update() {
        this.draw();
        this.animateFrames();
    }
}

/**
 * Represents a Fighter character in the game (extends Sprite).
 */
class Fighter extends Sprite {
    /**
     * Creates an instance of Fighter.
     * @param {Object} params
     * @param {Object} params.position - The position of the fighter.
     * @param {Object} params.velocity - The velocity of the fighter.
     * @param {string} params.imageSrc - The image source for the fighter.
     * @param {number} [params.scale=1] - The scale factor for the fighter.
     * @param {number} [params.framesMax=1] - The total number of frames in the fighter's animation.
     * @param {Object} [params.offset={x: 0, y: 0}] - The offset for drawing the fighter.
     * @param {Object} params.sprites - The sprite animations for different actions (e.g., idle, run, attack).
     * @param {Object} [params.attackBox={offset: {x: 0, y: 0}, width: 0, height: 0}] - The attack box for the fighter.
     */
    constructor({ position, velocity, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites, attackBox = { offset: { }, width: 0, height: 0 } }) {
        super({ position, imageSrc, scale, framesMax, offset });
        this.velocity = velocity;
        this.width = 45;
        this.height = 100;
        this.lastKey = '';
        this.attackBox = {
            position: { x: position.x, y: position.y },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        };
        this.isAttacking = false;
        this.isAttacking2 = false;
        this.health = 100;
        this.sprites = sprites;
        this.dead = false;

        // Initialize the sprites
        for (const sprite in this.sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    /**
     * Updates the fighter's state, including movement and gravity.
     */
    update() {
        this.draw();

        if (!this.dead) {
            this.animateFrames();
        }

        // Update attack box position
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // Handle movement
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Handle gravity
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 151) {
            this.velocity.y = 0;
            this.position.y = 330;
        } else {
            this.velocity.y += gravity;
        }
    }

    /**
     * Initiates the first attack animation.
     */
    attack() {
        this.switchSprites('attack1');
        this.isAttacking = true;
    }

    /**
     * Reduces health when the fighter takes damage.
     */
    takeHit() {
        this.health -= 3;

        if (this.health <= 0) {
            this.switchSprites('death');
        } else {
            this.switchSprites('takeHit');
        }
    }

    /**
     * Initiates the second attack animation.
     */
    attack2() {
        this.switchSprites('attack2');
        this.isAttacking2 = true;
    }

    /**
     * Switches the current sprite to the appropriate one based on the fighter's action.
     * @param {string} sprite - The name of the sprite action (e.g., 'idle', 'attack1', etc.)
     */
    switchSprites(sprite) {
        // Check if fighter is dead, don't switch sprites after death
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;
            return;
        }

        // Prevent interrupting ongoing attack animations
        if (
            (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) ||
            (this.image === this.sprites.attack2.image && this.framesCurrent < this.sprites.attack2.framesMax - 1)
        ) {
            return;
        }

        // Prevent interrupting the takeHit animation
        if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) {
            return;
        }

        // Switch to the appropriate sprite
        switch (sprite) {
            case 'idle':
                if (this.image !== this.sprites.idle.image) {
                    this.image = this.sprites.idle.image;
                    this.framesMax = this.sprites.idle.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'run':
                if (this.image !== this.sprites.run.image) {
                    this.image = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'jump':
                if (this.image !== this.sprites.jump.image) {
                    this.image = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'fall':
                if (this.image !== this.sprites.fall.image) {
                    this.image = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'attack1':
                if (this.image !== this.sprites.attack1.image) {
                    this.image = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'attack2':
                if (this.image !== this.sprites.attack2.image) {
                    this.image = this.sprites.attack2.image;
                    this.framesMax = this.sprites.attack2.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'takeHit':
                if (this.image !== this.sprites.takeHit.image) {
                    this.image = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'death':
                if (this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.framesCurrent = 0;
                }
                break;
        }
    }
}
