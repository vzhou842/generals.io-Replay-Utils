'use strict';

// This file reads in example.gioreplay and runs a full game simulation from the replay.

var fs = require('fs');
var Game = require('./Game');

// Read in the replay file.
var replay = JSON.parse(fs.readFileSync('./example.gioreplay', 'utf8'));

// Create a game from the replay.
var game = Game.createFromReplay(replay);

var currentMoveIndex = 0;
var currentAFKIndex = 0;

// Simulates the next turn.
function nextTurn() {
	// Put moves in the move queue.
	while (replay.moves.length > currentMoveIndex && replay.moves[currentMoveIndex].turn <= game.turn) {
		var move = replay.moves[currentMoveIndex++];
		game.handleAttack(move.index, move.start, move.end, move.is50);
	}

	// Check for AFKs.
	while (replay.afks.length > currentAFKIndex && replay.afks[currentAFKIndex].turn <= game.turn) {
		var afk = replay.afks[currentAFKIndex++];
		var index = afk.index;

		// If already dead, mark as dead general and neutralize if needed.
		if (game.deaths.indexOf(game.sockets[index]) >= 0) {
			game.tryNeutralizePlayer(index);
		}
		// Mark as AFK if not already dead.
		else {
			game.deaths.push(game.sockets[index]);
			game.alivePlayers--;
		}
	}

	game.update();
}

// Simulate the game!
while (!game.isOver() && game.turn < 2000) {
	nextTurn();
	console.log(
		'Simulated turn ' + game.turn + '. ' + game.alivePlayers + ' players left alive. ' +
		'Leader has ' + game.scores[0].total + ' army.'
	);

	// Do whatever you want with the current game state. Some useful fields are:
	// game.turn: The current turn.
	// game.sockets: The array of players. Player game.sockets[i] has playerIndex i.
	// game.map: A Map object representing the current game state. See Map.js.
	// game.scores: An ordered (decreasing) array of scores. Each score object can be tied to a player by its .i field.
	// game.alivePlayers: The number of players left alive.
	// game.deaths: Dead players in chronological order: game.deaths[0] is the first player to die.
}

console.log('Simulation ended.');