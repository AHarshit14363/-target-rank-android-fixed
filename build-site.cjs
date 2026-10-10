
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const output = path.join(root, "www");
const outputAssets = path.join(output, "assets");

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(outputAssets, { recursive: true });

const allowed = /\.(html|css|js|webmanifest|xml|txt)$/i;

// Copy website files into www.
for (const file of fs.readdirSync(root)) {
  const source = path.join(root, file);

  if (
    fs.statSync(source).isFile() &&
    allowed.test(file)
  ) {
    fs.copyFileSync(source, path.join(output, file));
  }
}

// Ensure the website logo and PWA icons are available.
const requiredImages = [
  "logo.png",
  "app-icon-192.png",
  "app-icon-512.png"
];

for (const file of requiredImages) {
  const source = path.join(root, file);

  if (!fs.existsSync(source)) {
    throw new Error("Required image missing: " + file);
  }

  fs.copyFileSync(
    source,
    path.join(outputAssets, file)
  );
}

// Copy any existing additional assets.
const sourceAssets = path.join(root, "assets");

if (fs.existsSync(sourceAssets)) {
  fs.cpSync(sourceAssets, outputAssets, {
    recursive: true,
    force: true
  });
}

console.log("Website files, logo and PWA icons copied successfully.");
