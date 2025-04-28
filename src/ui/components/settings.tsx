import { useState, useEffect } from "react";
import { useDataContext } from "../dataContext";
import "../styles/settings.scss";

const renderCheckboxSetting = (name: string, label: string, value: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
	return (
		<div className="bool">
			<p className="bool-text">{label}</p>
			<input type="checkbox" id={name} name={name} checked={value} onChange={onChange} />
		</div>
	);
};

const FileSelector = (handleFileSelect: () => void, defaultValue: string) => {
	return (
		<div className="file-selector">
			<div className="file-selector-label-wrapper">
				<label htmlFor="fileInput" className="file-selector-label">
					Select Saves Directory
				</label>
				<p className="description">This should be set to the /Saves directory. You normally don't need to change this.</p>
			</div>
			<button onClick={handleFileSelect} className="file-selector-button">
				Select Directory
			</button>
			<p className="selected-path">Selected: {defaultValue}</p>
		</div>
	);
};

export const SettingsPage = () => {
	const { settings, setSettings } = useDataContext();
	const [selectedPath, setSelectedPath] = useState<string>();

	const saveUpdatedSettings = async (s: Settings) => {
		await window.electron.updateSettings(s); // Save to Electron store
	};

	const updateSetting = (name: string, value: any) => {
		const updatedSettings = { ...settings, [name]: value };

		setSettings(updatedSettings as Settings);
		saveUpdatedSettings(updatedSettings as Settings);
	};

	// Load settings from Electron on mount
	useEffect(() => {
		if (settings) {
			setSelectedPath(settings.directoryPath);
		}
	}, [setSettings]); // Run only once on mount

	const handleFileSelect = async () => {
		const path = await window.electron.openDirectory(); // Open directory dialog
		if (path) {
			updateSetting("directoryPath", path);
			setSelectedPath(path);
		}
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newCheckedValue = e.target.checked;
		updateSetting("useCustomFont", newCheckedValue);
	};

	return (
		<div className="page" id="settings-page" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<h1>Settings</h1>
			<div className="accessibility">
				<h2>Accessibility</h2>
				{renderCheckboxSetting("useCustomFont", "Use Custom Font?", settings?.useCustomFont ?? false, handleCheckboxChange)}
			</div>
			<div className="saves">
				<h2>Save Settings</h2>
				{FileSelector(handleFileSelect, selectedPath as string)}
			</div>
		</div>
	);
};
