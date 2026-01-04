import { spawn } from "node:child_process";
import process from "node:process";

const example = process.argv[2] || "01.01-hello";
const viteCmd = process.platform === "win32" ? "vite.cmd" : "vite";


const child = spawn(viteCmd, [], {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_EXAMPLE: example

  }
});

child.on("exit", (code) => process.exit(code ?? 0));
