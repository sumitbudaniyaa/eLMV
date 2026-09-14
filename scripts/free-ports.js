const { execSync } = require("child_process");

const ports = [5001, 5173, 5174, 5175, 8081, 4040, 4041, 4042];

// Kill lingering ngrok tunnel processes if any
try {
  if (process.platform === "win32") {
    execSync("taskkill /F /IM ngrok.exe", { stdio: "ignore" });
  } else {
    execSync("pkill -9 -f 'ngrok'", { stdio: "ignore" });
  }
} catch (_) {}

for (const port of ports) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ["pipe", "pipe", "ignore"] }).toString();
      const lines = output.trim().split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0" && Number(pid) !== process.pid) {
          try { execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" }); } catch (_) {}
        }
      }
    } else {
      const output = execSync(`lsof -t -i:${port}`, { stdio: ["pipe", "pipe", "ignore"] }).toString();
      const pids = output.trim().split("\n").filter(Boolean);
      for (const pid of pids) {
        const numPid = Number(pid);
        if (numPid && numPid !== process.pid) {
          try {
            process.kill(numPid, "SIGTERM");
          } catch (_) {
            try { process.kill(numPid, "SIGKILL"); } catch (__) {}
          }
        }
      }
    }
  } catch (_) {
    // Port is already free
  }
}

