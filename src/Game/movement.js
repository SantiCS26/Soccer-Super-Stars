export function movePlayer(playerData, keyState, deltaTime, fieldWidth, fieldHeight, playerSpeed) {
	let moveX = 0
	let moveY = 0

	//TODO: Keybinding to be done later
	if (keyState.w || keyState.arrowup) {
		moveY -= 1
	}

	if (keyState.s || keyState.arrowdown) {
		moveY += 1
	}

	if (keyState.a || keyState.arrowleft) {
		moveX -= 1
	}

	if (keyState.d || keyState.arrowright) {
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
