import { Assignment } from "midi-mixer-plugin";
import OBSWebSocket from "obs-websocket-js";

interface Settings {
  address?: string;
  password?: string;
}

const obs = new OBSWebSocket();
const sources: Record<string, Assignment> = {};

(async () => {
  const settings = (await $MM.getSettings()) as Settings;

  await obs.connect({
    address: settings.address ?? "localhost:4444",
    password: settings.password ?? "",
  });

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

    sources[source.name] = new Assignment(source.name, {
      name: source.name,
      muted,
      volume,
    });

    sources[source.name].on("volumeChanged", (level: number) => {
      obs.send("SetVolume", {
        source: source.name,
        volume: level,
      });
    });

    sources[source.name].on("mutePressed", () => {
      obs.send("SetMute", {
        source: source.name,
        mute: !sources[source.name].muted,
      });
    });
  });
})().catch((err) => {
  console.warn("OBS error:", err);
});
