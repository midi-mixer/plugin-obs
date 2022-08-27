import { Assignment, ButtonType } from "midi-mixer-plugin";
import OBSWebSocket, { OBSWebSocketError, OBSEventTypes, OBSResponseTypes } from "obs-websocket-js";

interface Settings {
  address?: string;
  password?: string;
}

const obs = new OBSWebSocket();
let inputs: Record<string, Assignment> = {};
let scenes: Record<string, ButtonType> = {};
const settingsP: Promise<Settings> = $MM.getSettings();

const connect = async () => {
  const settings = await settingsP;

  return obs.connect(settings.address ?? "ws://localhost:4455", settings.password ?? "")
};


const registerListeners = () => {
  obs.on("InputVolumeChanged", (data) => {
    const source = inputs[data.inputName];
    if (!source) return;

    source.volume = data.inputVolumeMul;
  });

  obs.on("InputMuteStateChanged", (data) => {
    const source = inputs[data.inputName];
    if (!source) return;

    source.muted = data.inputMuted;
  });

  obs.on("CurrentProgramSceneChanged", (data) => {
    Object.values(scenes).forEach((button) => {
      button.active = data.sceneName === button.id;
    });
  });

  obs.on("ExitStarted", () => {
    disconnect();
    init();
  })
};

const mapSources = async () => {
  const data = await obs.call("GetInputList");

  // TODO: Would prefer this not be "any" but the actual type is "JsonObject" which sucks to use
  data.inputs?.forEach(async (input: any) => {
    try {
      const [volume, muted] = await Promise.all([
        obs
          .call("GetInputVolume", {
            inputName: input.inputName,
          })
          .then((res) => res.inputVolumeMul),
        obs
          .call("GetInputMute", {
            inputName: input.inputName,
          })
          .then((res) => res.inputMuted),
      ]);

      const assignment = new Assignment(input.inputName, {
        name: input.inputName,
        muted,
        volume,
      });

      assignment.on("volumeChanged", (level: number) => {
        assignment.volume = level;
        obs.call("SetInputVolume", {
          inputName: input.inputName,
          inputVolumeMul: level,
        });
      });

      assignment.on("mutePressed", () => {
        obs.call("SetInputMute", {
          inputName: input.inputName,
          inputMuted: !assignment.muted,
        });
      });

      inputs[input.inputName] = assignment;
    }
    catch (e: any) {
      if (e instanceof OBSWebSocketError) {
        if (e.code == 604) {
          // https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md#requeststatusinvalidresourcestate
          // Usual cause is that input does not support audio
        }
        else {
          console.log(e);
          console.log(input);
        }
      }
    }
  });
};

const mapScenes = async () => {
  const data = await obs.call("GetSceneList");

  // TODO: Would prefer this not be "any" but the actual type is "JsonObject" which sucks to use
  data.scenes.forEach((scene: any) => {

    const button = new ButtonType(scene.sceneName, {
      name: `OBS: Switch to "${scene.sceneName}" scene`,
      active: scene.sceneName === data.currentProgramSceneName,
    });

    button.on("pressed", () => {
      obs.call("SetCurrentProgramScene", {
        sceneName: scene.sceneName,
      });

      button.active = true;
    });

    scenes[scene.sceneName] = button;
  });
};

function disconnect() {
  console.log("Disconnecting");
  obs.disconnect();
  for (let k in inputs) {
    let s = inputs[k];
    s.remove();
  }

  for (let k in scenes) {
    let s = scenes[k];
    s.remove();
  }
}


const init = async () => {
  console.log("Initializing");
  obs.disconnect();
  inputs = {};
  scenes = {};

  try {
    $MM.setSettingsStatus("status", "Connecting...");

    await connect();
    registerListeners();
    await Promise.all([mapSources(), mapScenes()]);

    $MM.setSettingsStatus("status", "Connected");
  } catch (err: any) {
    console.warn("OBS error:", err);
    $MM.setSettingsStatus("status", err.description || err.message || err);
  }
};

$MM.onSettingsButtonPress("reconnect", init);

const fakeAssignment = new Assignment("FakeAssignment", {
  name: "Fake Assignment"
});

fakeAssignment.on("volumeChanged", (level: number) => {
  console.log(`Volume changed to ${level}`);
});

init();
