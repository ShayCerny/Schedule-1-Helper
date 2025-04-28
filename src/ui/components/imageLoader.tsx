// Automatically import all .png files inside /src/assets
const images: Record<string, string> = import.meta.glob("/src/assets/icons/*.png", { eager: true, import: "default" });

type ImageLoaderProps = {
	name: string;
	alt: string;
	className: string;
};

export const ImageLoader = ({ name, alt, className }: ImageLoaderProps) => {
	const imagePath = `/src/assets/icons/${name}_icon.png`; // dynamic path
	const srcPath = images[imagePath];

	if (!srcPath) {
		return null; // fallback if image doesn't exist
	}

	return <img src={srcPath} alt={alt} className={className} />;
};
