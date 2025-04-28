import { effectRulesBySubstance, effects, Product, Substance } from "@schedule1-tools/mixer";
import { ipcRenderer } from "electron";

const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
	close: () => electron.ipcRenderer.send("app-close"),
	minimize: () => electron.ipcRenderer.send("app-minimize"),

	getSaves: () => electron.ipcRenderer.invoke("get-saves"),
	selectSave: (save: string) => electron.ipcRenderer.send("select-save", save),
	getHelperData: () => electron.ipcRenderer.invoke("get-helper-data"),
	testMix: (data: { base: Product; ingredients: Substance[] }) => electron.ipcRenderer.invoke("test-mix", data),
	getSavedPath: () => electron.ipcRenderer.invoke("get-saved-path"),
	getRecipes: () => electron.ipcRenderer.invoke("get-recipes"),
	onFileUpdated: (callback: () => any) => ipcRenderer.on("file-updated", callback),
	getGuideInfo: () => electron.ipcRenderer.invoke("get-guide-info"),
	getSubstances: () => electron.ipcRenderer.invoke("get-substances"),
	getProducts: () => electron.ipcRenderer.invoke("get-products"),
	getEffects: () => electron.ipcRenderer.invoke("get-effects"),

	getSettings: () => electron.ipcRenderer.invoke("get-settings"),
	updateSettings: (s: Settings) => electron.ipcRenderer.send("update-settings", s),

	openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
});
