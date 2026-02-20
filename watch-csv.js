process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

// ----------------------------
// CONFIGURATION
// ----------------------------

// OneDrive CSV folders to monitor
const folders = [
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Demand Tracker_New Transitions",
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Ramp Down Tracker",
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Project Member Detail Tracker",
];

// React public folder
const publicFolder = path.resolve(__dirname, "public");
const filesJsonPath = path.join(publicFolder, "files.json");

// ----------------------------
// DELETE ALL TXT FILES IN PUBLIC FOLDER
// ----------------------------
function deleteTxtFiles() {
  try {
    const files = fs.readdirSync(publicFolder);
    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".txt" || ext === ".notepad") {
        const filePath = path.join(publicFolder, file);
        fs.unlinkSync(filePath);
        console.log(
          `[${new Date().toLocaleTimeString()}] 🗑 Permanently deleted TXT: ${file}`,
        );
      }
    });
  } catch (err) {
    console.error("❌ Error deleting TXT files:", err);
  }
}

// ----------------------------
// COPY CSV TO PUBLIC (Atomic + Retry)
// ----------------------------
function copyCsv(filePath) {
  const fileName = path.basename(filePath);
  const dest = path.join(publicFolder, fileName);

  try {
    const tempDest = dest + ".tmp";
    fs.copyFileSync(filePath, tempDest); // copy to temp first
    fs.renameSync(tempDest, dest); // atomic rename
    console.log(
      `[${new Date().toLocaleTimeString()}] 📄 Copied → public/${fileName}`,
    );
  } catch (err) {
    console.error("❌ Error copying CSV file:", err);
  }
}

// ----------------------------
// UPDATE files.json
// ----------------------------
function updateFilesJson() {
  try {
    // Delete TXT files first
    deleteTxtFiles();

    const files = fs
      .readdirSync(publicFolder)
      .filter((f) => f.endsWith(".csv"));

    const timestamp = Date.now();
    const jsonData = {};
    jsonData[`files[${timestamp}]`] = files;

    fs.writeFileSync(filesJsonPath, JSON.stringify(jsonData, null, 2));
    console.log(
      `[${new Date().toLocaleTimeString()}] 🆕 Updated files.json with timestamp ${timestamp}`,
    );
  } catch (err) {
    console.error("❌ Error updating files.json:", err);
  }
}

// ----------------------------
// HANDLE CSV CHANGE (Debounced + CSV ONLY)
// ----------------------------
const lastRunMap = new Map();

function handleCsvChange(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".csv") {
    console.log(
      `[${new Date().toLocaleTimeString()}] ⛔ Skipped non-CSV: ${path.basename(filePath)}`,
    );
    return; // skip non-CSV
  }

  const now = Date.now();
  const lastRun = lastRunMap.get(filePath) || 0;
  if (now - lastRun < 500) return; // ignore rapid changes
  lastRunMap.set(filePath, now);

  console.log(`\n====================================`);
  console.log(`[${new Date().toLocaleTimeString()}] ✅ CSV MODIFIED`);
  console.log(`File: ${filePath}`);
  console.log(`====================================`);

  const tryCopy = () => {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        console.warn(`⚠️ File is empty, retrying in 500ms: ${filePath}`);
        setTimeout(tryCopy, 500);
        return;
      }

      // Copy CSV and update files.json
      copyCsv(filePath);
      updateFilesJson();
    } catch (err) {
      console.error(
        `❌ Error accessing file, retrying in 500ms: ${filePath}`,
        err,
      );
      setTimeout(tryCopy, 500);
    }
  };

  tryCopy();
}

// ----------------------------
// START WATCHER FOR CSV FOLDERS
// ----------------------------
const watcher = chokidar.watch(folders, {
  persistent: true,
  ignoreInitial: true,
  depth: 1,
});

watcher.on("add", handleCsvChange);
watcher.on("change", handleCsvChange);

console.log("📂 Watching OneDrive CSV folders for changes...");
console.log("📁 React public folder:", publicFolder);
console.log("🚀 Waiting for CSV updates...\n");

// ----------------------------
// WATCH PUBLIC FOLDER FOR TXT FILES (Instant Deletion)
// ----------------------------
const publicWatcher = chokidar.watch(publicFolder, {
  persistent: true,
  ignoreInitial: true,
  depth: 0,
});

publicWatcher.on("add", (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt" || ext === ".notepad") {
    try {
      fs.unlinkSync(filePath);
      console.log(
        `[${new Date().toLocaleTimeString()}] 🗑 Instantly deleted TXT: ${path.basename(filePath)}`,
      );
    } catch (err) {
      console.error("❌ Error deleting TXT instantly:", err);
    }
  }
});

// ----------------------------
// INITIAL CLEANUP: DELETE ALL TXT FILES
// ----------------------------
deleteTxtFiles();

// ----------------------------
// OPTIONAL: PERIODIC CLEANUP EVERY 30 SECONDS
// ----------------------------
setInterval(deleteTxtFiles, 30 * 1000);
