import React, { useState, ReactNode, useEffect } from "react";
import { ImageLoader } from "./imageLoader";
import "../styles/selection.scss";

interface OptionProps {
	value: string;
	label: ReactNode | string;
	name?: string;
}

interface CustomSelectProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	children: ReactNode;
	className?: string;
	isOpen: Boolean;
	onOpen: () => void;
	onClose: () => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, placeholder, className, children, isOpen, onOpen, onClose }) => {
	const [selectedOption, setSelectedOption] = useState<OptionProps | null>(null);

	// Update selectedOption when the value prop changes
	useEffect(() => {
		const options = React.Children.toArray(children)
			.filter((child): child is React.ReactElement<OptionProps> => {
				return (
					React.isValidElement(child) &&
					typeof child.props === "object" &&
					child.props !== null &&
					"value" in child.props &&
					"label" in child.props
				);
			})
			.map((child) => child.props);

		const selected = options.find((option) => option.value === value);
		setSelectedOption(selected || null);
	}, [value, children]);

	const handleOptionClick = (option: OptionProps) => {
		setSelectedOption(option);
		onChange(option.value); // Pass selected value to parent
		onClose(); // Close the select when an option is chosen
	};

	const options = React.Children.toArray(children)
		.filter((child): child is React.ReactElement<OptionProps> => {
			return (
				React.isValidElement(child) &&
				typeof child.props === "object" &&
				child.props !== null &&
				"value" in child.props &&
				"label" in child.props
			);
		})
		.map((child) => child.props);

	return (
		<div className={(!className ? "" : className + "-custom-select ") + "custom-select"}>
			<div
				className={(!className ? "" : className + "-select-header ") + "select-header"}
				onClick={() => (isOpen ? onClose() : onOpen())} // Toggle open/close state
			>
				{selectedOption ? (
					<div className={(!className ? "" : className + "-selected-option ") + "selected-option"}>
						{selectedOption.name && (
							<ImageLoader
								name={selectedOption.name}
								alt={selectedOption.name}
								className={(!className ? "" : className + "-option-image ") + "option-image"}
							/>
						)}
						<p className={(!className ? "" : className + "-option-label ") + "option-label"}>{selectedOption.label}</p>
					</div>
				) : (
					<p className={(!className ? "" : className + "-placeholder ") + "placeholder"}>{placeholder || "Select an option"}</p>
				)}
			</div>
			{isOpen && (
				<div className={(!className ? "" : className + "-options-list ") + "options-list"}>
					{options
						.filter((o) => o.name !== selectedOption?.name) // Prevent showing selected option again
						.map((option) => (
							<div
								key={option.value}
								className={(!className ? "" : className + "-option-item ") + "option-item"}
								onClick={() => handleOptionClick(option)}
							>
								{option.name && (
									<ImageLoader
										name={option.name}
										alt={option.name}
										className={(!className ? "" : className + "-option-image ") + "option-image"}
									/>
								)}
								<p className={(!className ? "" : className + "-option-label ") + "option-label"}>{option.label}</p>
							</div>
						))}
				</div>
			)}
		</div>
	);
};

const Option: React.FC<OptionProps> = (_props: any) => {
	return null; // Only used for props
};

Option.displayName = "Option"; // <- important!

export { CustomSelect, Option };
