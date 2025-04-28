import { app, BrowserWindow } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

app.on("ready", () => {
	const mainWindow = new BrowserWindow({
		width: 1000,
		height: 800,
		title: "Schedule 1 Helper",
		frame: false,
		maximizable: false,
		resizable: false,
		webPreferences: {
			preload: getPreloadPath(),
		},
	});

	if (isDev()) {
		mainWindow.loadURL("http://localhost:5123");
		mainWindow.webContents.openDevTools({ mode: "detach" });
	} else {
		mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
	}
});

import "./events.js";
