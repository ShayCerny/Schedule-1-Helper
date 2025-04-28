import { EffectCode, EffectData, EffectRule } from "@schedule1-tools/mixer";
import { useEffect, useState } from "react";
import "../styles/guide.scss";
import { useDataContext } from "../dataContext";

export const Guide = () => {
	const [effects, setEffects] = useState({} as Record<string, EffectData>);
	const [rules, setRules] = useState([] as EffectRule[]);
	
	const { settings } = useDataContext();

	const handleGetGuideData = async () => {
		const guideData = await window.electron.getGuideInfo();

		setEffects(guideData.effects);
		setRules(guideData.rules);
	};

	const formatRules = (rule: EffectRule) => {
		const presentNames = rule.ifPresent.map((key) => effects[key] ?? key);
		const notPresent = rule.ifNotPresent.map((key) => effects[key] ?? key);
		const replacer = effects[rule.replace[rule.ifPresent[0]] as EffectCode];

		const notPresentMatch = rule.ifNotPresent.some((key) => effects[key].name !== replacer.name);

		return (
			<p>
				If{" "}
				{presentNames?.map((pN, index) => (
					<span key={index} style={{ color: pN.color }}>
						{pN.name}
					</span>
				))}
				{" is present "}
				{notPresentMatch && (
					<>
						{" and "}
						{notPresent.map((nP, index) => (
							<span key={nP.name}>
								{nP.name}
								{index < notPresent.length - 1 ? ", " : " "}
							</span>
						))}
						{"not present "}
					</>
				)}
				{"replace it with "}
				<span style={{ color: replacer.color }}>{replacer.name}</span>
			</p>
		);
	};

	useEffect(() => {
		handleGetGuideData();
	}, []);

	return (
		<div className="page" id="guide" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<div className="explaination">
				<h1>How It Works</h1>
				<p className="paragraph">
					Mixing is one of the most important parts of Schedule 1. In order to get more profitable products and grow your empire you need to
					know how to mix your buds with other substances.
				</p>
				<p>
					Each <b>product</b> type has a base price. <span className="weed">Weed: $35</span> <span className="meth">Meth: $70</span>{" "}
					<span className="coke">Cocaine: $150</span>
				</p>
				<p>
					Each <b>Effect</b> has a multiplier that it applies to the sale cost.
				</p>
				<p>
					The formula for this is: <span className="formula">Base Cost * (1 + All Effect Multipliers)</span>
				</p>
				<p>
					Example: Any Weed Strain with the Zombifying Effect is <span className="formula">$35 * (1 + 0.58) = $55</span>
				</p>
			</div>
			<h1>Effects</h1>
			<div className="effects">
				{Object.entries(effects)
					.sort(([, a], [, b]) => b.price - a.price)
					.map(([abbr, effect]: [string, EffectData]) => (
						<div key={abbr} className="effect">
							<p style={{ color: effect.color }}>{effect.name}</p>
							<p>{effect.price}</p>
						</div>
					))}
			</div>
			<h1>Rules</h1>
			<div className="rules">
				{Object.entries(rules as unknown as Record<string, EffectRule[]>)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([product, rulesArray]) => (
						<div key={product} className="rule">
							<h1>{product == "Viagra" ? "Viagor" : product}</h1>
							{rulesArray.map((rule, i) => (
								<div key={i} className="replace-rule">
									{formatRules(rule)}
								</div>
							))}
						</div>
					))}
			</div>
		</div>
	);
};
