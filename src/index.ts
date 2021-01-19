import { Assignment } from "midi-mixer-plugin";

const example = new Assignment("foo", {
  name: "Example Plugin Entry",
});

example.on("volumeChanged", (level: number) => {
  example.volume = level;
});

example.on("mutePressed", () => {
  example.muted = !example.muted;
});

example.on("assignPressed", () => {
  example.assigned = !example.assigned;
});

example.on("runPressed", () => {
  example.running = !example.running;
});
