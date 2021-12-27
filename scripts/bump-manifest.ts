import { writeFileSync } from "fs";
import { version } from "../package.json";
import manifest from "../plugin.json";

writeFileSync("plugin.json", JSON.stringify({ ...manifest, version }, null, 2));
