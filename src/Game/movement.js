export function movePlayer(playerData, keyState, deltaTime, fieldWidth, fieldHeight, playerSpeed) {
	let moveX = 0
	let moveY = 0

	if (keyState.w) {
		moveY -= 1
	}

	if (keyState.s) {
		moveY += 1
	}

	if (keyState.a) {
		moveX -= 1
	}

	if (keyState.d) {
		moveX += 1
	}

	if (moveX && moveY) {
		const diagonalAdjust = 1 / Math.sqrt(2)
		moveX *= diagonalAdjust
		moveY *= diagonalAdjust
	}

	playerData.x += moveX * playerSpeed * deltaTime
	playerData.y += moveY * playerSpeed * deltaTime

	const maxX = fieldWidth - playerData.size
	const maxY = fieldHeight - playerData.size

	if (playerData.x < 0) {
		playerData.x = 0
	}

	if (playerData.y < 0) {
		playerData.y = 0
	}

	if (playerData.x > maxX) {
		playerData.x = maxX
	}

	if (playerData.y > maxY) {
		playerData.y = maxY
	}
}
