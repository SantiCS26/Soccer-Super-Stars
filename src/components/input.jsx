export default function Input({ label, type, value, onChange }) {
	return (
		<div className="mb-4">
			<label className="block text-gray-700 text-sm mb-1">{label}</label>
			<input
				type={type}
				value={value}
				onChange={onChange}
				className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
				required
			/>
		</div>
	);
}