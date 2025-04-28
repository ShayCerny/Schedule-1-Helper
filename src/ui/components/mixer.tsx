import { useEffect, useState } from "react";
import "../styles/mixer.scss";
import { EffectCode, EffectData, Product, ProductData, Substance, SubstanceData } from "@schedule1-tools/mixer";
import { CustomSelect, Option } from "./selection";
import TrashIcon from "../../assets/trash-solid.svg?react";
import { getAddictionColor } from "./utils";
import { useDataContext } from "../dataContext";

export const MixerPage = () => {
	const [selectedBase, setSelectedBase] = useState<Product>("" as Product);
	const [selectedIngredients, setSelectedIngredients] = useState<Substance[]>(["" as Substance]);
	const [mixResult, setMixResult] = useState<ComputedMix | null>(null);
	const [substances, setSubstances] = useState<Record<Substance, SubstanceData>>({} as Record<Substance, SubstanceData>);
	const [effects, setEffects] = useState<Record<EffectCode, EffectData>>({} as Record<EffectCode, EffectData>);
	const [products, setProducts] = useState<Record<Product, ProductData>>({} as Record<Product, ProductData>);
	const [openSelect, setOpenSelect] = useState<number | null>(null);

	const { settings } = useDataContext();

	const handleCheckMix = async (base: Product, ingredients: Substance[]) => {
		// Ensure that both a base and at least one ingredient are selected
		if (base === ("" as Product) || ingredients.length === 0 || ingredients[0] === ("" as Substance)) {
			setMixResult(null);
		} else {
			const result = await window.electron.testMix({ base: base, ingredients: ingredients });
			console.log(result);
			setMixResult(result);
		}
	};

	const handleSelectBase = (value: Product) => {
		setSelectedBase(value);
		handleCheckMix(value, selectedIngredients);
	};

	const handleIngredientSelect = (index: number, value: Substance) => {
		const newSelectedIngredients = [...selectedIngredients];
		newSelectedIngredients[index] = value;

		// Only add a new empty substance if the last selected ingredient is filled
		if (index === selectedIngredients.length - 1 && value !== ("" as Substance) && selectedIngredients.length <= 11) {
			newSelectedIngredients.push("" as Substance);
		}

		setSelectedIngredients(newSelectedIngredients);
		handleCheckMix(selectedBase, newSelectedIngredients);
	};

	const handleRemoveIngredient = (index: number) => {
		const newIngredients = [...selectedIngredients];
		newIngredients.splice(index, 1); // Remove the ingredient at the given index
		setSelectedIngredients(newIngredients); // Update the state with the new array

		handleCheckMix(selectedBase, newIngredients);
	};

	const renderIngredientSelects = () => {
		return selectedIngredients.map((ingredient, index) => {
			const isLast = index === selectedIngredients.length - 1;
			const removeButton = (selectedIngredients.length === 12 && isLast) || (selectedIngredients.length !== 1 && !isLast);

			return (
				<div key={index} className="ingredient-select">
					<CustomSelect
						value={ingredient}
						onChange={(value) => handleIngredientSelect(index, value as Substance)}
						placeholder={`Select Ingredient`}
						isOpen={openSelect === index} // Pass open state to determine if this select is open
						onOpen={() => setOpenSelect(index)} // Set this select as open when clicked
						onClose={() => setOpenSelect(null)} // Close all selects when this one is closed
					>
						{Object.entries(substances)
							.sort((a, b) => Number(a[1].rank) - Number(b[1].rank))
							.map(([key, value]) => {
								const l = (
									<>
										{key} -{" "}
										<span className="small-effect" style={{ color: effects[value.effect[0] as EffectCode].color }}>
											{effects[value.effect[0] as EffectCode].name}
										</span>
									</>
								);
								return <Option key={key} value={key} label={l} name={key.replace(" ", "").toLowerCase()} />;
							})}
					</CustomSelect>
					<div
						className={removeButton ? "remove" : "disabled remove"}
						onClick={() => {
							removeButton ? handleRemoveIngredient(index) : null;
						}}
					>
						<TrashIcon />
					</div>
				</div>
			);
		});
	};

	const handleGetData = async () => {
		const prods = await window.electron.getProducts();
		const eff = await window.electron.getEffects();
		const subs = await window.electron.getSubstances();

		setProducts(prods);
		setEffects(eff);
		setSubstances(subs);
	};

	useEffect(() => {
		handleGetData();
	}, []);

	return (
		<div className="page" id="mixer-page" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<h1>Mixer</h1>
			<div className="calculator">
				<div className="ingredient-wrapper">
					<h2>Ingredients</h2>
					<div className="ingredients">
						<CustomSelect
							value={selectedBase}
							onChange={(value) => handleSelectBase(value as Product)}
							placeholder="Select a Base"
							className="base"
							isOpen={openSelect === -1} // Use -1 to represent the base select
							onOpen={() => setOpenSelect(-1)} // Set -1 as open when clicked
							onClose={() => setOpenSelect(null)} // Close all selects when this one is closed
						>
							{Object.entries(products).map(([key, value]) => {
								let l;
								if (value.effects.length >= 1) {
									l = (
										<>
											{key} -{" "}
											<span className="small-effect" style={{ color: effects[value.effects[0] as EffectCode].color }}>
												{effects[value.effects[0] as EffectCode].name}
											</span>
										</>
									);
								} else {
									l = key;
								}
								return <Option key={key} value={key} label={l} name={key.replace(" ", "").toLowerCase()} />;
							})}
						</CustomSelect>
						{renderIngredientSelects()}
					</div>
				</div>
				<div className="output">
					<h2>Results</h2>
					{mixResult ? (
						<>
							<div className="result-mix">
								<div className="prices">
									<p>
										Cost:{" "}
										{mixResult.cost.map((c, index) => (
											<span key={index}>
												<span className="price">
													{mixResult.cost.length > 1 ? <span>&tilde;</span> : ""}${c}
												</span>
												{index < mixResult.cost.length - 1 && " to "}
											</span>
										))}
									</p>
									<p>
										Sell Price: <span className="price">${mixResult.sellPrice}</span>
									</p>
									<p>
										Batch Profit:{" "}
										<span>
											{mixResult.cost.map((c, index) => (
												<span key={index}>
													<span className="price">
														{mixResult.cost.length > 1 ? <span>&tilde;</span> : ""}${mixResult.sellPrice * 8 - c}
													</span>
													{index < mixResult.cost.length - 1 && " to "}
												</span>
											))}
										</span>
									</p>
									<p>
										Addiction: <span style={{ color: getAddictionColor(mixResult.addiction) }}>{mixResult.addiction}</span>
									</p>
								</div>
								<p>
									Effects:{" "}
									{mixResult.effects.map((e) => (
										<span key={e} style={{ color: effects[e as EffectCode].color }}>
											{effects[e as EffectCode].name}{" "}
										</span>
									))}
								</p>
							</div>
						</>
					) : (
						<>
							<div className="result-mix">
								<div className="prices">
									<p>
										Cost:<span className="price"> $0</span>
									</p>
									<p>
										Sell Price: <span className="price"> $0</span>
									</p>
									<p>
										Batch Profit: <span className="price"> $0</span>
									</p>
									<p>
										Addiction: <span style={{ color: getAddictionColor(0) }}>0</span>
									</p>
								</div>
								<p>Effects: </p>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
