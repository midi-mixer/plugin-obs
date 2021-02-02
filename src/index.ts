import { Assignment, ButtonType } from "midi-mixer-plugin";
import OBSWebSocket from "obs-websocket-js";

interface Settings {
  address?: string;
  password?: string;
}

const obs = new OBSWebSocket();
const sources: Record<string, Assignment> = {};
const scenes: Record<string, ButtonType> = {};
const settingsP: Promise<Settings> = $MM.getSettings();
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
    if (!source) return;

    source.volume = data.volume;
  });

  obs.on("SourceMuteStateChanged", (data) => {
    const source = sources[data.sourceName];
    if (!source) return;

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

  data.sources?.forEach(async (source: any) => {
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

    const assignment = new Assignment(source.name, {
      name: source.name,
      muted,
      volume,
    });

    assignment.on("volumeChanged", (level: number) => {
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
    const button = new ButtonType(scene.name, {
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

(async () => {
  await connect();
  registerListeners();

  await Promise.all([mapSources(), mapScenes()]);
})().catch((err) => {
  console.warn("OBS error:", err);
});
