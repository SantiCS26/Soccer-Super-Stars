import { useEffect, useRef } from "react"

export function useGameInputs() {
	const keyState = useRef({})

	useEffect(() => {
		const handleKeyDown = (event) => {
			keyState.current[event.key.toLowerCase()] = true
		}

		const handleKeyUp = (event) => {
			keyState.current[event.key.toLowerCase()] = false
		}

		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("keyup", handleKeyUp) 

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("keyup", handleKeyUp)
		}
	}, [])

	return keyState
}
