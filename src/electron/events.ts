import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { extractOrgName, getProductData } from "./data.js";
import Store from "electron-store";
import { effectRulesBySubstance, effects, mixSubstances, products, substances } from "@schedule1-tools/mixer";
import { getSeedCost } from "./dataUtils.js";
import fs from "fs";
import os from "os";
import path from "path";

export const store = new Store();

let currentWatcher: fs.FSWatcher | null = null;

function updateMixes() {
	const path = store.get("savePath") as string;
	const newRecipes = getProductData(path) as Recipe[];
	const oldRecipes = store.get("recipes", []) as Recipe[];
	const temp = [...oldRecipes, ...newRecipes];

	store.set("recipes", temp);
}

function watchFileChanges() {
	const savePath = store.get("savePath", null) as string;
	if (!savePath) return;

	if (currentWatcher) {
		currentWatcher.close();
		currentWatcher = null;
	}

	try {
		currentWatcher = fs.watch(savePath, (eventType, fileName) => {
			if (eventType === "change") {
				console.log(`File: ${fileName} has changed`);
				ipcMain.emit("file-updated");
				updateMixes();
			}
		});

		console.log(`Watching for changes`);
	} catch (err) {
		console.error("Error watching file:", err);
	}
}

const defaultSettings = {
	displayDisclaimer: true,
	useCustomFont: true,
	directoryPath: path.join(os.homedir(), "AppData", "LocalLow", "TVGS", "Schedule I", "Saves"),
} as Settings;

app.on("ready", () => {
	if (store.get("settings", null) === null) {
		store.set("settings", defaultSettings);
	}

	watchFileChanges();

	ipcMain.on("app-close", () => {
		const window = BrowserWindow.getFocusedWindow();
		if (window) window.close();
	});

	ipcMain.on("app-minimize", () => {
		const window = BrowserWindow.getFocusedWindow();
		if (window) window.minimize();
	});

	ipcMain.handle("get-saves", () => {
		return extractOrgName();
	});

	ipcMain.on("select-save", (event, savePath) => {
		store.clear();
		store.set("savePath", savePath);
		updateMixes();
		watchFileChanges();
	});

	ipcMain.handle("get-saved-path", () => {
		return store.get("savePath", "");
	});

	ipcMain.handle("get-recipes", () => {
		const recipes = store.get("recipes") as Recipe[];
		return recipes;
	});

	ipcMain.handle("test-mix", (event, data: { base: any; ingredients: any[] }) => {
		const mixed = mixSubstances(data.base, data.ingredients);
		const computed = {
			cost: [mixed.cost],
			effects: mixed.effects,
			sellPrice: mixed.sellPrice,
			addiction: mixed.addiction,
		} as ComputedMix;

		const seedCost = getSeedCost(data.base);
		computed.cost = seedCost.map((costItem, index) => costItem + computed.cost[0]);
		return computed;
	});

	ipcMain.handle("get-helper-data", () => {
		return { effects, products, substances, effectRulesBySubstance };
	});

	ipcMain.handle("get-guide-info", () => {
		return { rules: effectRulesBySubstance, effects };
	});

	ipcMain.handle("get-substances", () => {
		return substances;
	});
	ipcMain.handle("get-products", () => {
		return products;
	});
	ipcMain.handle("get-effects", () => {
		return effects;
	});

	ipcMain.handle("get-settings", () => {
		return store.get("settings", defaultSettings) as Settings;
	});

	ipcMain.on("update-settings", (event, data: Settings) => {
		store.set("settings", data);
	});

	ipcMain.handle("dialog:openDirectory", async () => {
		const result = await dialog.showOpenDialog({
			properties: ["openDirectory"],
		});

		return result.filePaths[0]; // Return the selected directory path
	});
});
