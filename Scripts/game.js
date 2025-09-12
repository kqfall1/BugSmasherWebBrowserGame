//Quinn Keenan, 301504914 - Assignment 3, Beetle Smasher Game - 23/06/2025

class Game
{
	//Static fields that should remain constant: 
	static CANVAS = document.getElementsByTagName("canvas")[0];
	static 
	{
		Game.CANVAS.width = Game.CANVAS.clientWidth; 
		Game.CANVAS.height = Game.CANVAS.clientHeight;
	}
	
	static BEETLE = new Image();
	static { Game.BEETLE.src = "Images/ScarabBeetle.png"; }
	static BEETLE_INITIAL_WIDTH = 225; 
	static BEETLE_INITIAL_HEIGHT = 300; 
	
	static OVERFLOW_INITIAL_VALUE = 100; 
	static SPEED_INITIAL_VALUE = 2500; 
	static MAX_MISSES = 5; 
	
	static SCORE_LABEL = document.getElementById("score");
	static MISSES_LABEL = document.getElementById("misses");
	
	static SMASH_SFX = new Audio("SFX/smash.wav");
	static MISS_SFX = new Audio("SFX/miss.wav");
	
	constructor() 
	{
		//Used to hold the event listener for the canvas so that it can be removed when the game ends to prevent bugs:
		this.canvasEventListener = (event) => this.checkSmash(event);  
		Game.CANVAS.addEventListener("click", this.canvasEventListener);
		this.context = Game.CANVAS.getContext("2d");  
		
		this.beetleWidth = Game.BEETLE_INITIAL_WIDTH; 
		this.beetleHeight = Game.BEETLE_INITIAL_HEIGHT; 
		this.beetleTopLeftCoord = null; 
		this.isClickable = false; //Used to determine if the score should be incremented if the user clicks within the beetle's boundaries. 
		
		this.overflow = Game.OVERFLOW_INITIAL_VALUE; //The amount of pixels the beetle can go offscreen in any direction 
		this.speed = Game.SPEED_INITIAL_VALUE; //The speed assigned to the moveTimer. 
		this.score = 0;  
		this.misses = 0; //The number of times the player has failed to smash a beetle before it disappears. 
		
		this.moveTimer = window.setInterval(() => { this.updateBeetleTopLeftCoord(), this.drawBeetle() }, this.speed )
	}
	
	updateBeetleTopLeftCoord()
	{	
		const maxX = Game.CANVAS.width - this.beetleWidth + this.overflow; 
		const maxY = Game.CANVAS.height - this.beetleHeight + this.overflow; 
		
		const randomX = Math.random() * (maxX + this.overflow) - this.overflow; //Allows the beetle to be drawn slightly offscreen in all directions
		const randomY = Math.random() * (maxY + this.overflow) - this.overflow;
		
		this.beetleTopLeftCoord = { x: randomX, y: randomY };
	}
	
	drawBeetle()
	{
		this.erase(); //Clears the beetle from the canvas if the user fails to smash it (or the red screen indicating a miss).
		
		if (this.isClickable) //If there is a beetle on the canvas that the player has failed to smash.
		{ 
			this.miss(); 
			return; 
		}
		 
		this.context.drawImage(Game.BEETLE, this.beetleTopLeftCoord.x, this.beetleTopLeftCoord.y, this.beetleWidth, this.beetleHeight); 
		this.isClickable = true; 
	}
	
	drawBeetleAnimations(width, height) //Used for the smashAnimation() method, because isClickable must remain false during the animations. Otherwise, 
	{ 						  			//the player could score multiple points by clicking rapidly during the smash animations. 
		this.erase(); 
		this.context.drawImage(Game.BEETLE, this.beetleTopLeftCoord.x, this.beetleTopLeftCoord.y, width, height);
	}
	
	erase() { this.context.clearRect(0, 0, Game.CANVAS.width, Game.CANVAS.height); }
	
	updateMoveTimer()
	{ 
		window.clearInterval(this.moveTimer); 
		this.moveTimer = window.setInterval(() => { this.updateBeetleTopLeftCoord(), this.drawBeetle() }, this.speed )
	}
	
	checkSmash(event) 
	{
		if (this.beetleTopLeftCoord != null) //Prevents this function from doing anything if beetleTopLeftCoord is null
		{ 
			const rect = Game.CANVAS.getBoundingClientRect(); 
			const clickX = event.clientX - rect.left; 
			const clickY = event.clientY - rect.top; 
		
			if ((clickX >= this.beetleTopLeftCoord.x && clickX <= this.beetleTopLeftCoord.x + this.beetleWidth) && 
			(clickY >= this.beetleTopLeftCoord.y && clickY <= this.beetleTopLeftCoord.y + this.beetleHeight) && this.isClickable)
			{ 
				this.isClickable = false; 
				this.updateGameUponSmash()
			}	
		}
	}
	
	updateGameUponSmash()
	{ 
		this.erase(); 
		
		Game.SMASH_SFX.currentTime = 0; //Sets the currentTime of the sound effect to zero if it happens to be playing upon this line of code executing
		Game.SMASH_SFX.play(); 
		
		this.smashAnimation(); 
		
		this.score++; 
		Game.SCORE_LABEL.textContent = `Score: ${this.score}`;
		
		if (this.speed > 650) { this.speed -= 25; } //Prevents the speed from ever becoming less than 650ms. 
		if (this.beetleWidth > 60) { this.beetleWidth -= 2.5; } //Prevents the beetle from ever becoming unfairly small. 
		if (this.beetleHeight > 100) { this.beetleHeight -= 2.5; } 
		if (this.overflow > 50) { this.overflow -= 2; } //Prevents the beetle from being drawn unfairly far off screen as it changes size. 
		
		this.updateMoveTimer(); 
	}
	
	smashAnimation()
	{ 
		let currentFrame = 0;
		const animationFrames = 10;
		const originalWidth = this.beetleWidth;
		const originalHeight = this.beetleHeight;

		const animationInterval = window.setInterval(() => 
		{
			currentFrame++;
			const fadeFactor = 1 - currentFrame / animationFrames; //Used to determine the transparency of the following beetle frame. 
			
			this.erase(); //Clears any beetle image on the canvas. 

			this.context.globalAlpha = fadeFactor; //Makes the beetle frames more and more transparent as they appear on the screen. 
			
			this.drawBeetleAnimations(originalWidth * fadeFactor, originalHeight * fadeFactor);
			
			this.context.globalAlpha = 1; //Must reset the transparency of the context back to 1 after drawing each frame so as to avoid compound transparency. 

			if (currentFrame == animationFrames) 
			{
				window.clearInterval(animationInterval); //Removes the interval used for animation. 
				this.beetleTopLeftCoord = null;  
			}
		}, 16); // ~60fps
	}
	
	miss()
	{
		this.isClickable = false; 
		this.misses++; 
			
		Game.MISS_SFX.currentTime = 0; //Sets the currentTime of the sound effect to zero if it happens to be playing upon this line of code executing
		Game.MISS_SFX.play(); 
			
		Game.MISSES_LABEL.textContent = `Misses: ${this.misses}`;
		
		this.context.fillStyle = "rgba(255, 0, 0, 0.3)";
		this.context.fillRect(0, 0, Game.CANVAS.width, Game.CANVAS.height); //Draws a red screen so as to indicate a miss. 
		
		window.setTimeout(() => this.erase(), 50); //Delays erasing the red screen for 50ms. 
			
		if (this.misses == Game.MAX_MISSES) { this.gameOver(); }
	}
	
	gameOver()
	{
		window.clearInterval(this.moveTimer); 
		this.beetleTopLeftCoord = null; 
		Game.CANVAS.removeEventListener("click", this.canvasEventListener); //This may be unecessary but is good practice to prevent bugs.
		Game.SCORE_LABEL.textContent = `Game over! Score: ${this.score}`; 
	}
}