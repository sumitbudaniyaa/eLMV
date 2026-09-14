const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const qrcode = require("qrcode");

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

const ip = getLocalIp();
const expoUrl = `exp://${ip}:8081`;

// Print QR code after a short delay so it appears clearly after Metro initializes
setTimeout(() => {
  qrcode.toString(expoUrl, { type: "terminal", small: true, margin: 2 }, (err, qr) => {
    if (!err && qr) {
      console.log("\n\x1b[36m%s\x1b[0m", "========================================================");
      console.log("\x1b[36m%s\x1b[0m", "📱 MOBILE APP QR CODE (Expo Go)");
      console.log("\x1b[33m%s\x1b[0m", "Scan with iPhone Camera or Android Expo Go app:");
      console.log(qr);
      console.log("\x1b[32m%s\x1b[0m", `Metro URL: ${expoUrl}`);
      console.log("\x1b[37m%s\x1b[0m", "To launch in iOS Simulator: npm run mobile:ios");
      console.log("\x1b[37m%s\x1b[0m", "To launch in Android:       npm run mobile:android");
      console.log("\x1b[36m%s\x1b[0m", "========================================================\n");
    }
  });
}, 1200);

// Launch expo start --go
const mobileDir = path.resolve(__dirname, "../mobile");
const child = spawn("npx", ["expo", "start", "--go"], {
  cwd: mobileDir,
  stdio: "inherit",
  env: {
    ...process.env,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("[MOBILE ERROR]", err);
});
