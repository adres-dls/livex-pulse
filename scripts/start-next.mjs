#!/usr/bin/env node
// Runs `next dev`/`next start` on the given port, falling back to the next
// free one instead of dying with EADDRINUSE — never touches whatever already
// holds the busy port, it just picks around it.
import { createServer } from "node:net"
import { spawn } from "node:child_process"

const [, , mode = "dev", portArg = "3006"] = process.argv
const preferredPort = Number(portArg)

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = createServer()
    tester.once("error", () => resolve(false))
    tester.once("listening", () => tester.close(() => resolve(true)))
    tester.listen(port)
  })
}

async function findAvailablePort(start) {
  let port = start
  while (!(await isPortFree(port))) {
    port += 1
  }
  return port
}

const port = await findAvailablePort(preferredPort)
if (port !== preferredPort) {
  console.log(`Port ${preferredPort} is already in use — starting on ${port} instead.`)
}

const child = spawn("next", [mode, "--port", String(port)], {
  stdio: "inherit",
  shell: process.platform === "win32",
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal))
}

child.on("exit", (code) => process.exit(code ?? 0))
