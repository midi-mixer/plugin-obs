"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midi_mixer_plugin_1 = require("midi-mixer-plugin");
const obs_websocket_js_1 = __importDefault(require("obs-websocket-js"));
const obs = new obs_websocket_js_1.default();
let sources = {};
let scenes = {};
const settingsP = $MM.getSettings();
let currentScene = "";
const connect = async () => {
    const settings = await settingsP;
    return obs.connect({
        address: settings.address ?? "localhost:4444",
        password: settings.password ?? "",
    });
};
const registerListeners = () => {
    obs.on("SourceVolumeChanged", (data) => {
        const source = sources[data.sourceName];
        if (!source)
            return;
        source.volume = data.volume;
    });
    obs.on("SourceMuteStateChanged", (data) => {
        const source = sources[data.sourceName];
        if (!source)
            return;
        source.muted = data.muted;
    });
    obs.on("SwitchScenes", (data) => {
        currentScene = data["scene-name"];
        Object.values(scenes).forEach((button) => {
            button.active = data["scene-name"] === button.id;
        });
    });
};
const mapSources = async () => {
    const data = await obs.send("GetSourcesList");
    data.sources?.forEach(async (source) => {
        const [volume, muted] = await Promise.all([
            obs
                .send("GetVolume", {
                source: source.name,
            })
                .then((res) => res.volume),
            obs
                .send("GetMute", {
                source: source.name,
            })
                .then((res) => res.muted),
        ]);
        const assignment = new midi_mixer_plugin_1.Assignment(source.name, {
            name: source.name,
            muted,
            volume,
        });
        assignment.on("volumeChanged", (level) => {
            obs.send("SetVolume", {
                source: source.name,
                volume: level,
            });
        });
        assignment.on("mutePressed", () => {
            obs.send("SetMute", {
                source: source.name,
                mute: !assignment.muted,
            });
        });
        sources[source.name] = assignment;
    });
};
const mapScenes = async () => {
    const data = await obs.send("GetSceneList");
    currentScene = data["current-scene"];
    data.scenes.forEach((scene) => {
        const button = new midi_mixer_plugin_1.ButtonType(scene.name, {
            name: `OBS: Switch to "${scene.name}" scene`,
            active: scene.name === currentScene,
        });
        button.on("pressed", () => {
            obs.send("SetCurrentScene", {
                "scene-name": scene.name,
            });
            button.active = true;
        });
        scenes[scene.name] = button;
    });
};
const init = async () => {
    obs.disconnect();
    sources = {};
    scenes = {};
    try {
        $MM.setSettingsStatus("status", "Connecting...");
        await connect();
        registerListeners();
        await Promise.all([mapSources(), mapScenes()]);
        $MM.setSettingsStatus("status", "Connected");
    }
    catch (err) {
        console.warn("OBS error:", err);
        $MM.setSettingsStatus("status", err.description || err.message || err);
    }
};
$MM.onSettingsButtonPress("reconnect", init);
init();
