'use strict';

// This file reads in input.gior, parses/deserializes it, and writes the result to output.gioreplay.

var fs = require('fs');
var LZString = require('lz-string');

// fs.readFileSync returns a Buffer since we didn't specify an option.
var input = fs.readFileSync('./input.gior');

// Returns an object that represents the replay.
// @param serialized A serialized replay Buffer.
function deserialize(serialized) {
	var obj = JSON.parse(
		LZString.decompressFromUint8Array(
			new Uint8Array(serialized)
		)
	);

	var replay = {};
	var i = 0;
	replay.version = obj[i++];
	replay.id = obj[i++];
	replay.mapWidth = obj[i++];
	replay.mapHeight = obj[i++];
	replay.usernames = obj[i++];
	replay.stars = obj[i++];
	replay.cities = obj[i++];
	replay.cityArmies = obj[i++]
	replay.generals = obj[i++];
	replay.mountains = obj[i++];
	replay.moves = obj[i++].map(deserializeMove);
	replay.afks = obj[i++].map(deserializeAFK);
	replay.teams = obj[i++];

	return replay;
};

function deserializeMove(serialized) {
	return {
		index: serialized[0],
		start: serialized[1],
		end: serialized[2],
		is50: serialized[3],
		turn: serialized[4],
	};
}

function deserializeAFK(serialized) {
	return {
		index: serialized[0],
		turn: serialized[1],
	};
}

// Write the converted file.
try {
	fs.writeFileSync('./output.gioreplay', JSON.stringify(deserialize(input)));
	console.log('Conversion successful!');
} catch (e) {
	console.error('Failed to write output file', e);
}