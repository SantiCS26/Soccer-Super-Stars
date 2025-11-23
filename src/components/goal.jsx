import { 
    FIELD_HEIGHT, 
    GOAL_TOP_FACTOR, 
    GOAL_BOTTOM_FACTOR, 
    GOAL_DEPTH 
} from "../Game/game_config.js";

export default function Goal({ side }) {
	const isLeft = side === "left";
    const goalTop = FIELD_HEIGHT * GOAL_TOP_FACTOR;
	const goalHeight = FIELD_HEIGHT * (GOAL_BOTTOM_FACTOR - GOAL_TOP_FACTOR);

	const style = {
		position: "absolute",
		top: goalTop,
		height: goalHeight,
		width: GOAL_DEPTH,
		border: "1px solid #ccc",
        background: "rgba(43, 123, 152, 0.3)",
		boxSizing: "border-box",
		left: isLeft ? -GOAL_DEPTH : "auto",
		right: isLeft ? "auto" : -GOAL_DEPTH
	};

	return <div style={style}></div>;
}
