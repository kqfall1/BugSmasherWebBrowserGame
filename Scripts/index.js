//Quinn Keenan, 301504914 - Assignment 3, Beetle Smasher Game - 22/06/2025

let game; 

loadPage(); 

function loadPage()
{
	const newGame = document.getElementById("newGame"); 
	newGame.addEventListener("click", play);
	
	const resetDifficulty = document.getElementById("resetDifficulty"); 
	resetDifficulty.addEventListener("click", resetGameDifficulty);
}

function play()
{
	if (game != null) { window.clearInterval(game.moveTimer); } //Clears the moveTimer of the existing Game before creating a new Game in its place. 
	
	game = new Game(); 
	Game.SCORE_LABEL.textContent = `Score: ${game.score}`;
	Game.MISSES_LABEL.textContent = `Misses: ${game.misses}`;
}

function resetGameDifficulty()
{
	if (game != null && game.moveTimer != null) //Prevents the function from doing anything if no active Game exists. 
	{ 
		game.beetleWidth = Game.BEETLE_INITIAL_WIDTH; 
		game.beetleHeight = Game.BEETLE_INITIAL_HEIGHT; 
		game.overflow = Game.OVERFLOW_INITIAL_VALUE; 
		game.speed = Game.SPEED_INITIAL_VALUE; 
		game.updateMoveTimer();
	} 
}