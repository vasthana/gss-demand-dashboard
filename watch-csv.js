// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const chokidar = require("chokidar");
// const path = require("path");
// const fs = require("fs");

// // ----------------------------
// // CONFIGURATION
// // ----------------------------

// // OneDrive CSV folders to monitor
// const folders = [
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Demand Tracker_New Transitions",
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Ramp Down Tracker",
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Project Member Detail Tracker",
// ];

// // React public folder
// const publicFolder = path.resolve(__dirname, "public");
// const filesJsonPath = path.join(publicFolder, "files.json");

// // ----------------------------
// // DELETE ALL TXT FILES IN PUBLIC FOLDER
// // ----------------------------
// function deleteTxtFiles() {
//   try {
//     const files = fs.readdirSync(publicFolder);
//     files.forEach((file) => {
//       const ext = path.extname(file).toLowerCase();
//       if (ext === ".txt" || ext === ".notepad") {
//         const filePath = path.join(publicFolder, file);
//         fs.unlinkSync(filePath);
//         console.log(
//           `[${new Date().toLocaleTimeString()}] 🗑 Permanently deleted TXT: ${file}`,
//         );
//       }
//     });
//   } catch (err) {
//     console.error("❌ Error deleting TXT files:", err);
//   }
// }

// // ----------------------------
// // COPY CSV TO PUBLIC (Atomic + Retry)
// // ----------------------------
// function copyCsv(filePath) {
//   const fileName = path.basename(filePath);
//   const dest = path.join(publicFolder, fileName);

//   try {
//     const tempDest = dest + ".tmp";
//     fs.copyFileSync(filePath, tempDest); // copy to temp first
//     fs.renameSync(tempDest, dest); // atomic rename
//     console.log(
//       `[${new Date().toLocaleTimeString()}] 📄 Copied → public/${fileName}`,
//     );
//   } catch (err) {
//     console.error("❌ Error copying CSV file:", err);
//   }
// }

// // ----------------------------
// // UPDATE files.json
// // ----------------------------
// function updateFilesJson() {
//   try {
//     // Delete TXT files first
//     deleteTxtFiles();

//     const files = fs
//       .readdirSync(publicFolder)
//       .filter((f) => f.endsWith(".csv"));

//     const timestamp = Date.now();
//     const jsonData = {};
//     jsonData[`files[${timestamp}]`] = files;

//     fs.writeFileSync(filesJsonPath, JSON.stringify(jsonData, null, 2));
//     console.log(
//       `[${new Date().toLocaleTimeString()}] 🆕 Updated files.json with timestamp ${timestamp}`,
//     );
//   } catch (err) {
//     console.error("❌ Error updating files.json:", err);
//   }
// }

// // ----------------------------
// // HANDLE CSV CHANGE (Debounced + CSV ONLY)
// // ----------------------------
// const lastRunMap = new Map();

// function handleCsvChange(filePath) {
//   const ext = path.extname(filePath).toLowerCase();
//   if (ext !== ".csv") {
//     console.log(
//       `[${new Date().toLocaleTimeString()}] ⛔ Skipped non-CSV: ${path.basename(filePath)}`,
//     );
//     return; // skip non-CSV
//   }

//   const now = Date.now();
//   const lastRun = lastRunMap.get(filePath) || 0;
//   if (now - lastRun < 500) return; // ignore rapid changes
//   lastRunMap.set(filePath, now);

//   console.log(`\n====================================`);
//   console.log(`[${new Date().toLocaleTimeString()}] ✅ CSV MODIFIED`);
//   console.log(`File: ${filePath}`);
//   console.log(`====================================`);

//   const tryCopy = () => {
//     try {
//       const stats = fs.statSync(filePath);
//       if (stats.size === 0) {
//         console.warn(`⚠️ File is empty, retrying in 500ms: ${filePath}`);
//         setTimeout(tryCopy, 500);
//         return;
//       }

//       // Copy CSV and update files.json
//       copyCsv(filePath);
//       updateFilesJson();
//     } catch (err) {
//       console.error(
//         `❌ Error accessing file, retrying in 500ms: ${filePath}`,
//         err,
//       );
//       setTimeout(tryCopy, 500);
//     }
//   };

//   tryCopy();
// }

// // ----------------------------
// // START WATCHER FOR CSV FOLDERS
// // ----------------------------
// const watcher = chokidar.watch(folders, {
//   persistent: true,
//   ignoreInitial: true,
//   depth: 1,
// });

// watcher.on("add", handleCsvChange);
// watcher.on("change", handleCsvChange);

// console.log("📂 Watching OneDrive CSV folders for changes...");
// console.log("📁 React public folder:", publicFolder);
// console.log("🚀 Waiting for CSV updates...\n");

// // ----------------------------
// // WATCH PUBLIC FOLDER FOR TXT FILES (Instant Deletion)
// // ----------------------------
// const publicWatcher = chokidar.watch(publicFolder, {
//   persistent: true,
//   ignoreInitial: true,
//   depth: 0,
// });

// publicWatcher.on("add", (filePath) => {
//   const ext = path.extname(filePath).toLowerCase();
//   if (ext === ".txt" || ext === ".notepad") {
//     try {
//       fs.unlinkSync(filePath);
//       console.log(
//         `[${new Date().toLocaleTimeString()}] 🗑 Instantly deleted TXT: ${path.basename(filePath)}`,
//       );
//     } catch (err) {
//       console.error("❌ Error deleting TXT instantly:", err);
//     }
//   }
// });

// // ----------------------------
// // INITIAL CLEANUP: DELETE ALL TXT FILES
// // ----------------------------
// deleteTxtFiles();

// // ----------------------------
// // OPTIONAL: PERIODIC CLEANUP EVERY 30 SECONDS
// // ----------------------------
// setInterval(deleteTxtFiles, 30 * 1000);

// Auto Build Start//
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// ----------------------------
// CONFIG
// ----------------------------

// OneDrive CSV folders
const csvFolders = [
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Demand Tracker_New Transitions",
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Ramp Down Tracker",
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Project Member Detail Tracker",
];

// React folders
const reactFolders = [path.resolve(__dirname, "src")];

// React public folder
const publicFolder = path.resolve(__dirname, "public");
const filesJsonPath = path.join(publicFolder, "files.json");

// Repo root
const REPO_PATH = __dirname;

// ----------------------------
// DELETE TXT FILES
// ----------------------------
function deleteTxtFiles() {
  try {
    fs.readdirSync(publicFolder).forEach((file) => {
      if (file.endsWith(".txt") || file.endsWith(".notepad")) {
        fs.unlinkSync(path.join(publicFolder, file));
        console.log("🗑 Deleted TXT:", file);
      }
    });
  } catch {}
}

// ----------------------------
// COPY CSV
// ----------------------------
function copyCsv(filePath) {
  const name = path.basename(filePath);
  const dest = path.join(publicFolder, name);

  const tmp = dest + ".tmp";
  fs.copyFileSync(filePath, tmp);
  fs.renameSync(tmp, dest);

  console.log("📄 Copied CSV:", name);
}

// ----------------------------
// UPDATE files.json
// ----------------------------
function updateFilesJson() {
  deleteTxtFiles();

  const files = fs.readdirSync(publicFolder).filter((f) => f.endsWith(".csv"));

  const obj = {};
  obj[`files[${Date.now()}]`] = files;

  fs.writeFileSync(filesJsonPath, JSON.stringify(obj, null, 2));
  console.log("🆕 files.json updated");
}

// ----------------------------
// GIT PUSH
// ----------------------------
function gitPush(callback) {
  console.log("🔄 Git auto push...");

  exec("git pull", { cwd: REPO_PATH }, () => {
    exec("git add .", { cwd: REPO_PATH }, () => {
      exec(
        'git commit -m "Auto update from watcher"',
        { cwd: REPO_PATH },
        (err) => {
          if (err) {
            console.log("ℹ Nothing to commit");
          } else {
            console.log("✅ Git committed");
          }

          exec("git push", { cwd: REPO_PATH }, (err2) => {
            if (err2) console.log("❌ Push failed");
            else console.log("🚀 Git pushed successfully");

            if (callback) callback();
          });
        },
      );
    });
  });
}

// ----------------------------
// INITIAL PUSH BEFORE WATCHER
// ----------------------------
function initialGitPush(callback) {
  console.log("🔹 Initial Git push of existing changes...");

  exec("git add .", { cwd: REPO_PATH }, () => {
    exec(
      'git commit -m "Initial auto push before watcher start"',
      { cwd: REPO_PATH },
      (err) => {
        if (err) {
          console.log("ℹ Nothing to commit");
        } else {
          console.log("✅ Initial commit done");
        }

        exec("git push", { cwd: REPO_PATH }, (err2) => {
          if (err2) console.log("❌ Initial push failed");
          else console.log("🚀 Initial push completed");

          if (callback) callback();
        });
      },
    );
  });
}

// ----------------------------
// HANDLE FILE CHANGE
// ----------------------------
let timer = null;

function handleFileChange(filePath) {
  console.log("\n📌 File changed:", filePath);

  // debounce pushes (wait 5 sec)
  clearTimeout(timer);
  timer = setTimeout(() => {
    gitPush(() => {
      // After push, handle CSV-specific logic
      if (filePath.toLowerCase().endsWith(".csv")) {
        copyCsv(filePath);
        updateFilesJson();
      }
      // JSX or other files → no extra handling needed
    });
  }, 5000);
}

// ----------------------------
// START WATCHER AFTER INITIAL PUSH
// ----------------------------
initialGitPush(() => {
  console.log("📂 Starting watcher after initial push...");

  const watcher = chokidar.watch([...csvFolders, ...reactFolders], {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("add", handleFileChange);
  watcher.on("change", handleFileChange);

  deleteTxtFiles();
});

// Local CSV change//
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const chokidar = require("chokidar");
// const path = require("path");
// const fs = require("fs");

// // ----------------------------
// // CONFIG
// // ----------------------------
// const csvFolders = [
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Demand Tracker_New Transitions",
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Ramp Down Tracker",
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Project Member Detail Tracker",
// ];

// const publicFolder = path.resolve(__dirname, "public");
// const filesJsonPath = path.join(publicFolder, "files.json");

// // ----------------------------
// // DELETE TXT FILES
// // ----------------------------
// function deleteTxtFiles() {
//   try {
//     fs.readdirSync(publicFolder).forEach((file) => {
//       if (file.endsWith(".txt") || file.endsWith(".notepad")) {
//         fs.unlinkSync(path.join(publicFolder, file));
//         console.log("🗑 Deleted TXT:", file);
//       }
//     });
//   } catch {}
// }

// // ----------------------------
// // COPY CSV FILE (async)
// // ----------------------------
// function copyCsv(filePath) {
//   return new Promise((resolve, reject) => {
//     const fileName = path.basename(filePath);
//     const tmp = path.join(publicFolder, fileName + ".tmp");
//     const dest = path.join(publicFolder, fileName);

//     fs.copyFile(filePath, tmp, (err) => {
//       if (err) return reject(err);
//       fs.rename(tmp, dest, (err2) => {
//         if (err2) return reject(err2);
//         console.log("📄 CSV copied:", fileName);
//         resolve();
//       });
//     });
//   });
// }

// // ----------------------------
// // UPDATE files.json WITH TIMESTAMP
// // ----------------------------
// function updateFilesJson() {
//   try {
//     const files = fs
//       .readdirSync(publicFolder)
//       .filter((f) => f.toLowerCase().endsWith(".csv"));
//     const timestamp = Date.now(); // numeric timestamp
//     const obj = {};
//     obj[`files[${timestamp}]`] = files;

//     fs.writeFileSync(filesJsonPath, JSON.stringify(obj, null, 2));
//     console.log(`🆕 files.json updated with key files[${timestamp}]`);
//   } catch (err) {
//     console.error("❌ Failed to update files.json:", err);
//   }
// }

// // ----------------------------
// // HANDLE CSV CHANGE
// // ----------------------------
// let timer = null;

// function handleFileChange(filePath) {
//   clearTimeout(timer);
//   timer = setTimeout(async () => {
//     if (filePath.toLowerCase().endsWith(".csv")) {
//       try {
//         await copyCsv(filePath); // ensure copy completes
//         updateFilesJson(); // then update files.json
//       } catch (err) {
//         console.error("❌ Error processing CSV:", err);
//       }
//     }
//   }, 1000); // 1 second debounce to account for OneDrive write delays
// }

// // ----------------------------
// // START WATCHER
// // ----------------------------
// console.log("📂 Starting CSV watcher...");
// deleteTxtFiles();

// const watcher = chokidar.watch(csvFolders, {
//   persistent: true,
//   ignoreInitial: true,
// });

// watcher.on("add", handleFileChange);
// watcher.on("change", handleFileChange);
