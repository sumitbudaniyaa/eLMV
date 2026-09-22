const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const qrcode = require("qrcode");

const TUNNEL_URL = "https://vapouringly-nonallegoric-teodora.ngrok-free.dev";
const mobileDir = path.resolve(__dirname, "../mobile");
const qrImagePath = path.resolve(__dirname, "../expo-qr.png");

// Only use Expo Metro tunnel if explicitly requested via EXPO_TUNNEL=true,
// because free Ngrok accounts allow only 1 simultaneous tunnel session (reserved for backend API).
const initialUseTunnel = process.env.EXPO_TUNNEL === "true";

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();
const apiUrl = `${TUNNEL_URL}/api/v1`;

let qrPrinted = false;

function printQr(finalUrl, isTunnel) {
  if (qrPrinted) return;
  qrPrinted = true;

  qrcode.toString(finalUrl, { type: "terminal", small: true, margin: 2 }, (err, qr) => {
    if (!err && qr) {
      console.log("\n\x1b[36m%s\x1b[0m", "========================================================");
      console.log("\x1b[32m%s\x1b[0m", "📱  EXPO GO QR CODE");
      console.log(
        "\x1b[33m%s\x1b[0m",
        isTunnel
          ? "🌐  Scan with Camera (iPhone) or Expo Go (Android) [Cellular / Any Network]:"
          : "🏠  Scan on same Wi-Fi network (or via USB):"
      );
      console.log(qr);
      console.log("\x1b[35m%s\x1b[0m", `🔗  Expo URL: ${finalUrl}`);
      console.log("\x1b[37m%s\x1b[0m", `🖼️   Saved QR Image: ${qrImagePath}`);
      console.log("\x1b[36m%s\x1b[0m", "========================================================\n");
    }
  });

  try {
    qrcode.toFile(qrImagePath, finalUrl, { width: 400, margin: 2 }, (err) => {
      if (err) console.warn("Could not write QR image:", err.message);
    });
  } catch (_) {}
}

async function findTunnelUrl() {
  for (const port of [4040, 4041, 4042, 4043]) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/tunnels`);
      if (res.ok) {
        const data = await res.json();
        const t = data.tunnels?.find(
          (tun) => tun.config?.addr?.includes("8081") && tun.proto === "https"
        );
        if (t && t.public_url) {
          return t.public_url.replace(/^https?:\/\//, "exp://");
        }
      }
    } catch (_) {}
  }
  return null;
}

function startMetro(useTunnel) {
  console.log("\x1b[36m%s\x1b[0m", "\n========================================================");
  console.log("\x1b[32m%s\x1b[0m", "📱  MOBILE APP LAUNCHER (Expo Go)");
  if (useTunnel) {
    console.log("\x1b[33m%s\x1b[0m", "🌐  Network Mode: TUNNEL (Expo Metro Bundler via Tunnel)");
  } else {
    console.log("\x1b[33m%s\x1b[0m", "🏠  Network Mode: LOCAL LAN (Metro on local Wi-Fi / USB)");
  }
  console.log("\x1b[35m%s\x1b[0m", `🔗  Backend API:  ${apiUrl}`);
  console.log("\x1b[36m%s\x1b[0m", "========================================================\n");

  const expoArgs = ["expo", "start", "--go", "-c"];
  if (useTunnel) {
    expoArgs.push("--tunnel");
  }

  const child = spawn("npx", expoArgs, {
    cwd: mobileDir,
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_PUBLIC_API_URL: apiUrl,
    },
  });

  if (useTunnel) {
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      const tunnelUrl = await findTunnelUrl();
      if (tunnelUrl) {
        clearInterval(pollInterval);
        printQr(tunnelUrl, true);
      } else if (attempts >= 15) {
        clearInterval(pollInterval);
        printQr(`exp://${localIp}:8081`, false);
      }
    }, 1000);
  } else {
    setTimeout(() => {
      printQr(`exp://${localIp}:8081`, false);
    }, 1500);
  }

  child.on("exit", (code) => {
    if (useTunnel && code !== 0) {
      console.warn(
        "\n\x1b[33m%s\x1b[0m",
        "⚠️  Expo tunnel failed (Ngrok free tier single-session limit reached)."
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "🔄  Falling back automatically to Local LAN mode so dev server stays alive...\n"
      );
      qrPrinted = false;
      startMetro(false);
      return;
    }
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error("[MOBILE ERROR]", err);
  });
}

startMetro(initialUseTunnel);
