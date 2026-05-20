import { spawn } from "node:child_process";

const processes = [
  {
    name: "backend",
    command: "npm",
    args: ["run", "dev", "-w", "@rankflow/backend"],
    env: { PORT: "4000", CORS_ORIGIN: "http://127.0.0.1:3000" }
  },
  {
    name: "frontend",
    command: "npm",
    args: ["run", "dev", "-w", "@rankflow/frontend"],
    env: { RANKFLOW_API_URL: "http://127.0.0.1:4000" }
  }
];

const children = processes.map((processConfig) => {
  const child = spawn(processConfig.command, processConfig.args, {
    env: { ...process.env, ...processConfig.env },
    stdio: "pipe"
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${processConfig.name}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${processConfig.name}] ${chunk}`);
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${processConfig.name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
