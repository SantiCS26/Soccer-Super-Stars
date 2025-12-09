import {
	FIELD_WIDTH,
	FIELD_HEIGHT,
	PLAYER_SIZE,
	PLAYER_DRIBBLE_RADIUS,
	PLAYER_KICK_RADIUS,
	BALL_SIZE,
	DRIBBLE_ACCELERATION,
	KICK_ACCELERATION,
	BALL_FRICTION,
	BALL_MAX_SPEED,
	GOAL_TOP_FACTOR,
	GOAL_BOTTOM_FACTOR,
	GOAL_DEPTH
} from "./game_config.js";

const GOAL_DELAY_MS = 2000;
const PLAYER_BODY_RADIUS = PLAYER_SIZE / 2;
const KICK_SLOW_DAMP = 0.9;
const DRIBBLE_NUDGE_MULT = 5;

const POWERUP_MIN_INTERVAL_MS = 15000;
const POWERUP_MAX_INTERVAL_MS = 30000;
const MAX_POWERUPS_ON_FIELD = 2;
const POWERUP_RADIUS = 16;

const POWERUP_DEFS = [
	{
		id: "speed_boost",
		label: "4x Speed",
		durationSec: 8,
		effects: {
			speedMultiplier: 4
		}
	},
	{
		id: "mega_kick",
		label: "8x Kick Power",
		durationSec: 8,
		effects: {
			kickPowerMultiplier: 8
		}
	}
];

function getRandomPowerupInterval() {
	const span = POWERUP_MAX_INTERVAL_MS - POWERUP_MIN_INTERVAL_MS;
	return POWERUP_MIN_INTERVAL_MS + Math.floor(Math.random() * span);
}

function getRandomPowerupType() {
	if (!POWERUP_DEFS.length) {
		return null;
	}
	const idx = Math.floor(Math.random() * POWERUP_DEFS.length);
	return POWERUP_DEFS[idx];
}

function ensurePlayerPowerupState(game, playerId) {
	if (!game.playerPowerups) {
		game.playerPowerups = {};
	}
	if (!game.playerPowerups[playerId]) {
		game.playerPowerups[playerId] = {
			heldTypeId: null,
			active: null
		};
	}
	return game.playerPowerups[playerId];
}

function updateActivePowerups(game, now) {
	if (!game.playerPowerups) {
		return;
	}

	for (const [playerId, state] of Object.entries(game.playerPowerups)) {
		if (state.active && state.active.expiresAt <= now) {
			state.active = null;
		}
	}
}

function spawnPowerupIfNeeded(game, now) {
	if (!game.powerupsOnField) {
		game.powerupsOnField = [];
	}

	if (game.powerupsOnField.length >= MAX_POWERUPS_ON_FIELD) {
		return;
	}

	if (!game.nextPowerupSpawnAt || now < game.nextPowerupSpawnAt) {
		return;
	}

	const type = getRandomPowerupType();
	if (!type) {
		game.nextPowerupSpawnAt = now + getRandomPowerupInterval();
		return;
	}

	const margin = 50;
	const x = margin + Math.random() * (FIELD_WIDTH - margin * 2);
	const y = margin + Math.random() * (FIELD_HEIGHT - margin * 2);

	const instance = {
		id: `${type.id}_${now}_${Math.floor(Math.random() * 100000)}`,
		typeId: type.id,
		x,
		y
	};

	game.powerupsOnField.push(instance);
	game.nextPowerupSpawnAt = now + getRandomPowerupInterval();
}

function handlePowerupPickup(game, playerId) {
	if (!game || !game.isPlaying) {
		return;
	}
	if (!game.powerupsOnField || !game.powerupsOnField.length) {
		return;
	}

	const playerPos = game.playerPositions[playerId];
	if (!playerPos) {
		return;
	}

	const state = ensurePlayerPowerupState(game, playerId);
	if (state.heldTypeId || state.active) {
		return;
	}

	const playerCenterX = playerPos.x + PLAYER_BODY_RADIUS;
	const playerCenterY = playerPos.y + PLAYER_BODY_RADIUS;
	const pickupRadius = PLAYER_BODY_RADIUS + POWERUP_RADIUS;

	for (let i = 0; i < game.powerupsOnField.length; i++) {
		const p = game.powerupsOnField[i];
		const dx = p.x - playerCenterX;
		const dy = p.y - playerCenterY;
		const distSq = dx * dx + dy * dy;

		if (distSq <= pickupRadius * pickupRadius) {
			state.heldTypeId = p.typeId;
			game.powerupsOnField.splice(i, 1);
			break;
		}
	}
}

export function createInitialGameState(room) {
	const playerIds = Object.keys(room.players || {});
	const hostId =
		playerIds.find((id) => room.players[id].isHost) || playerIds[0] || null;
	const otherId = playerIds.find((id) => id !== hostId) || null;

	const leftX = FIELD_WIDTH / 4;
	const rightX = (FIELD_WIDTH / 4) * 3;
	const centerY = FIELD_HEIGHT / 2 - PLAYER_SIZE / 2;

	const playerPositions = {};

	if (hostId) {
		playerPositions[hostId] = { x: leftX, y: centerY };
	}
	if (otherId) {
		playerPositions[otherId] = { x: rightX, y: centerY };
	}

	return {
		leftPlayerId: hostId,
		rightPlayerId: otherId,
		playerPositions,
		ball: {
			x: FIELD_WIDTH / 2,
			y: FIELD_HEIGHT / 2,
			vx: 0,
			vy: 0,
			radius: BALL_SIZE
		},
		score: { left: 0, right: 0 },
		round: 0,
		isPlaying: true,
		pendingGoal: null,
		powerupsOnField: [],
		playerPowerups: {},
		nextPowerupSpawnAt: null
	};
}

export function updatePlayerPosition(game, playerId, x, y) {
	if (!game || !playerId) {
		return;
	}

	const isLeftPlayer = playerId === game.leftPlayerId;
	const isRightPlayer = playerId === game.rightPlayerId;

	let clampedY = Math.max(0, Math.min(FIELD_HEIGHT - PLAYER_SIZE, y));

	const goalTop = FIELD_HEIGHT * GOAL_TOP_FACTOR;
	const goalBottom = FIELD_HEIGHT * GOAL_BOTTOM_FACTOR;
	const playerTop = clampedY;
	const playerBottom = clampedY + PLAYER_SIZE;
	const inGoalMouth = playerBottom > goalTop && playerTop < goalBottom;

	let minX = 0;
	let maxX = FIELD_WIDTH - PLAYER_SIZE;

	if (inGoalMouth) {
		if (isLeftPlayer) {
			minX = -GOAL_DEPTH;
		} else if (isRightPlayer) {
			maxX = FIELD_WIDTH - PLAYER_SIZE + GOAL_DEPTH;
		}
	}

	const clampedX = Math.max(minX, Math.min(maxX, x));

	game.playerPositions[playerId] = { x: clampedX, y: clampedY };

	handlePowerupPickup(game, playerId);
}

export function applyKick(game, playerId) {
	if (!game || !game.isPlaying) {
		return;
	}

	const ball = game.ball;
	const playerPos = game.playerPositions[playerId];
	if (!playerPos) {
		return;
	}

	const ballRadius = ball.radius;
	const playerCenterX = playerPos.x + PLAYER_SIZE / 2;
	const playerCenterY = playerPos.y + PLAYER_SIZE / 2;

	const dx = ball.x - playerCenterX;
	const dy = ball.y - playerCenterY;
	const distSq = dx * dx + dy * dy;
	const dist = Math.sqrt(distSq) || 1;
	const maxKickDistance = PLAYER_KICK_RADIUS + ballRadius;

	if (dist > maxKickDistance) {
		return;
	}

	const nx = dx / dist;
	const ny = dy / dist;

	const powerState = game.playerPowerups && game.playerPowerups[playerId];
	const kickMult = powerState && powerState.active && powerState.active.effects && powerState.active.effects.kickPowerMultiplier
		? powerState.active.effects.kickPowerMultiplier
		: 1;
	const kickAccel = KICK_ACCELERATION * kickMult;

	ball.vx += nx * kickAccel;
	ball.vy += ny * kickAccel;
}

export function usePowerup(game, playerId, now = Date.now()) {
	if (!game || !game.isPlaying) {
		return;
	}

	const state = ensurePlayerPowerupState(game, playerId);
	if (!state.heldTypeId) {
		return;
	}

	const def = POWERUP_DEFS.find((p) => p.id === state.heldTypeId);
	if (!def) {
		state.heldTypeId = null;
		return;
	}

	const durationMs = (def.durationSec || 0) * 1000;
	state.active = {
		typeId: def.id,
		effects: def.effects || {},
		expiresAt: now + durationMs
	};
	state.heldTypeId = null;
}

export function discardPowerup(game, playerId) {
	if (!game || !game.isPlaying) {
		return;
	}
	const state = ensurePlayerPowerupState(game, playerId);
	state.heldTypeId = null;
}

export function stepGame(game, deltaTime, settings, now = Date.now()) {
	const result = { roundReset: null, matchEnded: null };
	if (!game || !game.isPlaying) {
		return result;
	}

	if (!game.powerupsOnField) {
		game.powerupsOnField = [];
	}
	if (!game.playerPowerups) {
		game.playerPowerups = {};
	}
	if (!game.nextPowerupSpawnAt) {
		game.nextPowerupSpawnAt = now + getRandomPowerupInterval();
	}

	updateActivePowerups(game, now);
	spawnPowerupIfNeeded(game, now);

	const ball = game.ball;
	const rad = ball.radius;

	if (game.pendingGoal && now < game.pendingGoal.resolveAt) {
		return result;
	}

	if (game.pendingGoal && now >= game.pendingGoal.resolveAt) {
		const scoredFor = game.pendingGoal.scoredFor;
		game.pendingGoal = null;

		if (scoredFor === "left") {
			game.score.left += 1;
		} else if (scoredFor === "right") {
			game.score.right += 1;
		}

		game.round += 1;

		let goalLimit;
		if (settings && typeof settings.goalLimit === "number") {
			goalLimit = settings.goalLimit;
		} else {
			goalLimit = 5;
		}

		if (game.score.left >= goalLimit || game.score.right >= goalLimit) {
			game.isPlaying = false;

			let winnerSide = null;
			if (game.score.left > game.score.right) {
				winnerSide = "left";
			} else if (game.score.right > game.score.left) {
				winnerSide = "right";
			}

			result.matchEnded = {
				score: { ...game.score },
				winnerSide
			};
		} else {
			resetForKickoff(game);
			result.roundReset = {
				ball: { ...game.ball },
				score: { ...game.score },
				round: game.round,
				playerPositions: { ...game.playerPositions }
			};
		}

		return result;
	}

	ball.x += ball.vx * deltaTime;
	ball.y += ball.vy * deltaTime;

	const frictionFactor = Math.pow(BALL_FRICTION, deltaTime * 60);
	ball.vx *= frictionFactor;
	ball.vy *= frictionFactor;

	const speedSq = ball.vx * ball.vx + ball.vy * ball.vy;
	const maxSpeedSq = BALL_MAX_SPEED * BALL_MAX_SPEED;
	if (speedSq > maxSpeedSq) {
		const speed = Math.sqrt(speedSq) || 1;
		const scale = BALL_MAX_SPEED / speed;
		ball.vx *= scale;
		ball.vy *= scale;
	}

	const goalTop = FIELD_HEIGHT * GOAL_TOP_FACTOR;
	const goalBottom = FIELD_HEIGHT * GOAL_BOTTOM_FACTOR;
	const inGoalWindow = ball.y > goalTop && ball.y < goalBottom;

	const ballTop = ball.y - rad;
	const ballBottom = ball.y + rad;
	const ballFullyInGoalVertical = ballTop >= goalTop && ballBottom <= goalBottom;

	if (inGoalWindow) {
		if (ball.x < -GOAL_DEPTH) {
			ball.x = -GOAL_DEPTH;
			ball.vx = Math.abs(ball.vx);
		}
	} else if (ball.x < rad) {
		ball.x = rad;
		ball.vx = Math.abs(ball.vx);
	}

	if (inGoalWindow) {
		if (ball.x > FIELD_WIDTH + GOAL_DEPTH) {
			ball.x = FIELD_WIDTH + GOAL_DEPTH;
			ball.vx = -Math.abs(ball.vx);
		}
	} else if (ball.x > FIELD_WIDTH - rad) {
		ball.x = FIELD_WIDTH - rad;
		ball.vx = -Math.abs(ball.vx);
	}

	if (ball.y < rad) {
		ball.y = rad;
		ball.vy = Math.abs(ball.vy);
	} else if (ball.y > FIELD_HEIGHT - rad) {
		ball.y = FIELD_HEIGHT - rad;
		ball.vy = -Math.abs(ball.vy);
	}

	let anyFullyInsideKick = false;

	for (const [, pos] of Object.entries(game.playerPositions)) {
		const playerCenterX = pos.x + PLAYER_SIZE / 2;
		const playerCenterY = pos.y + PLAYER_SIZE / 2;

		let dx = ball.x - playerCenterX;
		let dy = ball.y - playerCenterY;
		let distSq2 = dx * dx + dy * dy;

		if (distSq2 === 0) {
			dx = 0.0001;
			dy = 0;
			distSq2 = dx * dx + dy * dy;
		}

		let dist2 = Math.sqrt(distSq2);
		const ballRadius = rad;

		const bodyContactDist = PLAYER_BODY_RADIUS + ballRadius;
		const dribbleContactDist = PLAYER_DRIBBLE_RADIUS + ballRadius;

		if (dist2 < bodyContactDist) {
			const nx = dx / dist2;
			const ny = dy / dist2;

			ball.x = playerCenterX + nx * bodyContactDist;
			ball.y = playerCenterY + ny * bodyContactDist;

			ball.vx = 0;
			ball.vy = 0;

			dx = ball.x - playerCenterX;
			dy = ball.y - playerCenterY;
			distSq2 = dx * dx + dy * dy;
			dist2 = Math.sqrt(distSq2) || bodyContactDist;
		}

		const anyPartInDribble = dist2 <= dribbleContactDist;
		const fullyInsideKick = dist2 + ballRadius <= PLAYER_KICK_RADIUS;

		if (anyPartInDribble) {
			const nx = dx / dist2;
			const ny = dy / dist2;

			ball.vx += nx * DRIBBLE_ACCELERATION * DRIBBLE_NUDGE_MULT * deltaTime;
			ball.vy += ny * DRIBBLE_ACCELERATION * DRIBBLE_NUDGE_MULT * deltaTime;
		}

		if (fullyInsideKick) {
			anyFullyInsideKick = true;
		}
	}

	if (anyFullyInsideKick) {
		ball.vx *= KICK_SLOW_DAMP;
		ball.vy *= KICK_SLOW_DAMP;
	}

	let scoredFor = null;

	if (ballFullyInGoalVertical && ball.x - rad >= -GOAL_DEPTH && ball.x + rad <= 0) {
		scoredFor = "right";
	} else if (ballFullyInGoalVertical && ball.x - rad >= FIELD_WIDTH && ball.x + rad <= FIELD_WIDTH + GOAL_DEPTH) {
		scoredFor = "left";
	}

	if (scoredFor) {
		game.pendingGoal = {
			scoredFor,
			resolveAt: now + GOAL_DELAY_MS
		};
		ball.vx = 0;
		ball.vy = 0;
	}

	return result;
}

function resetForKickoff(game) {
	const ball = game.ball;

	ball.x = FIELD_WIDTH / 2;
	ball.y = FIELD_HEIGHT / 2;
	ball.vx = 0;
	ball.vy = 0;

	const leftX = FIELD_WIDTH / 4;
	const rightX = (FIELD_WIDTH / 4) * 3;
	const centerY = FIELD_HEIGHT / 2 - PLAYER_SIZE / 2;

	if (game.leftPlayerId) {
		game.playerPositions[game.leftPlayerId] = { x: leftX, y: centerY };
	}
	if (game.rightPlayerId) {
		game.playerPositions[game.rightPlayerId] = { x: rightX, y: centerY };
	}
}
