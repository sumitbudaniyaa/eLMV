const { spawn } = require("child_process");
const fs = require("fs");

const TUNNEL_URL = "https://vapouringly-nonallegoric-teodora.ngrok-free.dev";
const PORT = 5173;

console.log("\x1b[32m%s\x1b[0m", `\n========================================================`);
console.log("\x1b[32m%s\x1b[0m", `🚀  Legal Metrology Full Stack Ecosystem Active!`);
console.log("\x1b[35m%s\x1b[0m", `🛒  Consumer Web App (Port 5173): http://localhost:5173`);
console.log("\x1b[34m%s\x1b[0m", `🏛️   Admin Web App    (Port 5174): http://localhost:5174`);
console.log("\x1b[33m%s\x1b[0m", `📋  Field Web Suite  (Port 5175): http://localhost:5175`);
console.log("\x1b[36m%s\x1b[0m", `📱  Mobile Metro Dev (Port 8081): http://localhost:8081`);
console.log("\x1b[37m%s\x1b[0m", `    ↳ To run on iOS Simulator:    npm run mobile:ios`);
console.log("\x1b[37m%s\x1b[0m", `    ↳ To run on Android:          npm run mobile:android`);
console.log("\x1b[37m%s\x1b[0m", `    ↳ To scan QR in Expo Go:      npm run mobile:start`);
console.log("\x1b[36m%s\x1b[0m", `🌐  Public Tunnel    (Web & API): ${TUNNEL_URL}`);
console.log("\x1b[32m%s\x1b[0m", `========================================================\n`);

function resolveNgrok() {
  const candidates = [
    "/opt/homebrew/bin/ngrok",
    "/usr/local/bin/ngrok",
    process.env.NGROK_BIN,
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return "ngrok";
}

const ngrokBin = resolveNgrok();

const child = spawn(
  ngrokBin,
  ["http", PORT.toString(), "--url", TUNNEL_URL, "--log=stdout"],
  {
    stdio: ["ignore", "pipe", "pipe"],
  }
);

child.stdout.on("data", (data) => {
  const str = data.toString();
  if (!str.includes("join connections")) {
    process.stdout.write(str);
  }
});

child.stderr.on("data", (data) => {
  process.stderr.write(data);
});

child.on("error", (err) => {
  console.error(
    "\x1b[33m%s\x1b[0m",
    `[TUNNEL WARNING] ngrok could not be started: ${err.message}`
  );
});

child.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      `[TUNNEL] ngrok exited with code ${code}. Local dev servers remain active.`
    );
  }
});

const cleanup = () => {
  try {
    child.kill("SIGTERM");
  } catch (_) {}
  process.exit(0);
};

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
