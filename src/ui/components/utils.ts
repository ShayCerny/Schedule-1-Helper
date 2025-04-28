export const getProductTypeCost = (name: string) => {
	switch (name) {
		case "OG Kush":
			return { type: "weed", cost: [30] };
		case "Green Crack":
			return { type: "weed", cost: [40] };
		case "Sour Diesel":
			return { type: "weed", cost: [35] };
		case "Grandaddy Purple":
			return { type: "weed", cost: [45] };
		case "Meth":
			return { type: "meth", cost: [140, 190] };
		case "Cocaine":
			return { type: "coke", cost: [455] };
		default:
			return null;
	}
};

export const getAddictionColor = (addiction: number) => {
	const grey = { r: 204, g: 204, b: 204 }; // your $green
	const red = { r: 168, g: 58, b: 58 }; // your $red

	const r = Math.round(grey.r + (red.r - grey.r) * addiction);
	const g = Math.round(grey.g + (red.g - grey.g) * addiction);
	const b = Math.round(grey.b + (red.b - grey.b) * addiction);

	return `rgb(${r}, ${g}, ${b})`;
};
