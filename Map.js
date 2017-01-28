'use strict';

// @param teams Optional. If supplied, teams[i] is the team for player i.
function Map(width, height, teams) {
	this.width = width;
	this.height = height;
	if (teams) this.teams = teams;

	this._map = [];
	this._armies = [];
	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			this._map.push(Map.TILE_EMPTY);
			this._armies.push(0);
		}
	}
}

Map.prototype.size = function() {
	return this.width * this.height;
};

Map.prototype.indexFrom = function(row, col) {
	return row * this.width + col;
};

// Returns whether index 1 is adjacent to index 2.
Map.prototype.isAdjacent = function(i1, i2) {
	var r1 = Math.floor(i1 / this.width);
	var c1 = Math.floor(i1 % this.width);
	var r2 = Math.floor(i2 / this.width);
	var c2 = Math.floor(i2 % this.width);
	return (
		Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
	);
};

Map.prototype.isValidTile = function(index) {
	return index >= 0 && index < this._map.length;
};

Map.prototype.tileAt = function(index) {
	return this._map[index];
};

Map.prototype.armyAt = function(index) {
	return this._armies[index];
};

Map.prototype.setTile = function(index, val) {
	this._map[index] = val;
};

Map.prototype.setArmy = function(index, val) {
	this._armies[index] = val;
};

Map.prototype.incrementArmyAt = function(index) {
	this._armies[index]++;
};

// Attacks from start to end. Always leaves 1 unit left at start.
Map.prototype.attack = function(start, end, is50, generals) {
	// Verify that the attack starts from a valid tile.
	if (!this.isValidTile(start)) {
		console.error('Attack has invalid start position ' + start);
		return false;
	}

	// Verify that the attack ends at a valid tile.
	if (!this.isValidTile(end)) {
		console.error('Attack has invalid end position ' + end);
		return false;
	}

	// Verify that the attack goes to an adjacent tile.
	if (!this.isAdjacent(start, end)) {
		console.error('Attack for non-adjacent tiles ' + start + ', ' + end);
		return false;
	}

	// Check if the attack goes to a mountain.
	if (this.tileAt(end) === Map.TILE_MOUNTAIN) {
		return false;
	}

	var reserve = is50 ? Math.ceil(this._armies[start] / 2) : 1;

	// Attacking an Enemy.
	if (!this.teams || this.teams[this.tileAt(start)] !== this.teams[this.tileAt(end)]) {
		// If the army at the start tile is <= 1, the attack fails.
		if (this._armies[start] <= 1) return false;

		if (this.tileAt(end) === this.tileAt(start)) {
			// player -> player
			this._armies[end] += this._armies[start] - reserve;
		} else {
			// player -> enemy
			if (this._armies[end] >= this._armies[start] - reserve) {
				// Non-takeover
				this._armies[end] -= this._armies[start] - reserve;
			} else {
				// Takeover
				this._armies[end] = this._armies[start] - reserve - this._armies[end];
				this.setTile(end, this.tileAt(start));
			}
		}
	}

	// Attacking an Ally.
	else {
		this._armies[end] += this._armies[start] - reserve;
		if (generals.indexOf(end) < 0) {
			// Attacking a non-general allied tile.
			// Steal ownership of the tile.
			this.setTile(end, this.tileAt(start));
		}
	}

	this._armies[start] = reserve;

	return true;
};

// Replaces all tiles of value val1 with val2.
// @param scale Optional. If provided, scales replaced armies down using scale as a multiplier.
Map.prototype.replaceAll = function(val1, val2, scale) {
	scale = scale || 1;
	for (var i = 0; i < this._map.length; i++) {
		if (this._map[i] === val1) {
			this._map[i] = val2;
			this._armies[i] = Math.round(this._armies[i] * scale);
		}
	}
};

// Returns the Manhattan distance between index1 and index2.
Map.prototype.distance = function(index1, index2) {
	var r1 = Math.floor(index1 / this.width);
	var c1 = index1 % this.width;
	var r2 = Math.floor(index2 / this.width);
	var c2 = index2 % this.width;
	return Math.abs(r1 - r2) + Math.abs(c1 - c2);
};

// Nonnegative numbers represent player indices.
Map.TILE_EMPTY = -1;
Map.TILE_MOUNTAIN = -2;
Map.TILE_FOG = -3;
Map.TILE_FOG_OBSTACLE = -4;

module.exports = Map;