const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const root = process.cwd();
const output = path.join(root, "www");
const assets = path.join(root, "assets");

async function build() {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  const allowed = /\.(html|css|js|webmanifest|xml|txt)$/i;
  for (const file of fs.readdirSync(root)) {
    const source = path.join(root, file);
    if (fs.statSync(source).isFile() && allowed.test(file) && file !== "native-auth-entry.js") {
      fs.copyFileSync(source, path.join(output, file));
    }
  }
  if (fs.existsSync(assets)) {
    fs.cpSync(assets, path.join(output, "assets"), { recursive: true });
  }

  await esbuild.build({
    entryPoints: [path.join(root, "native-auth-entry.js")],
    outfile: path.join(output, "native-auth.bundle.js"),
    bundle: true,
    platform: "browser",
    format: "iife",
    target: ["es2020"],
    minify: false,
  });
  console.log("Website files and bundled Capacitor auth bridge copied to www successfully.");
}

build().catch((err) => { console.error(err); process.exit(1); });
