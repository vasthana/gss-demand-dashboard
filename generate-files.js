// const fs = require("fs");
// const path = require("path");

// // ✅ Base synced SharePoint path
// const SHAREPOINT_BASE_PATH =
//   "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26";

// // Folders to scan
// const TRACKER_FOLDERS = ["Demand Tracker_New Transitions", "Ramp Down Tracker"];

// const PUBLIC_FOLDER = path.join(__dirname, "public/api/sharepoint");
// const OUTPUT_PATH = path.join(__dirname, "public/api/files.json");

// function updateFilesJson() {
//   try {
//     console.log("📂 Reading synced SharePoint folders...");

//     // Create public folder if not exists
//     if (!fs.existsSync(PUBLIC_FOLDER)) {
//       fs.mkdirSync(PUBLIC_FOLDER, { recursive: true });
//     }

//     const allFiles = [];

//     TRACKER_FOLDERS.forEach((folder) => {
//       const folderPath = path.join(SHAREPOINT_BASE_PATH, folder);

//       if (!fs.existsSync(folderPath)) {
//         console.warn(`⚠️ Folder not found: ${folderPath}`);
//         return;
//       }

//       const files = fs
//         .readdirSync(folderPath)
//         .filter(
//           (file) =>
//             file.endsWith(".csv") ||
//             file.endsWith(".xlsx") ||
//             file.endsWith(".xlsm"),
//         );

//       if (files.length === 0) {
//         console.warn(`⚠️ No CSV/Excel files in folder: ${folderPath}`);
//         return;
//       }

//       files.forEach((file) => {
//         const source = path.join(folderPath, file);
//         const destination = path.join(PUBLIC_FOLDER, file);
//         fs.copyFileSync(source, destination);
//         allFiles.push(`api/sharepoint/${file}`);
//       });
//     });

//     if (allFiles.length === 0) {
//       throw new Error("No files found in any tracker folder.");
//     }

//     // Write files.json
//     const filesJson = { files: allFiles };
//     fs.writeFileSync(OUTPUT_PATH, JSON.stringify(filesJson, null, 2));

//     console.log("✅ files.json updated successfully!");
//     console.log(filesJson);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// }

// updateFilesJson();

const fs = require("fs");
const path = require("path");

// 🔥 Automatically get OneDrive path from Windows
const ONE_DRIVE_BASE = process.env.OneDrive;

if (!ONE_DRIVE_BASE) {
  console.warn("⚠️ OneDrive environment variable not found.");
}

const SHAREPOINT_BASE_PATH = ONE_DRIVE_BASE
  ? path.join(ONE_DRIVE_BASE, "IN - OneAsia1 BPS PM - FY 25-26")
  : null;

// Folders to scan
const TRACKER_FOLDERS = ["Demand Tracker_New Transitions", "Ramp Down Tracker"];

const PUBLIC_FOLDER = path.join(__dirname, "public/api/sharepoint");
const OUTPUT_PATH = path.join(__dirname, "public/api/files.json");

function updateFilesJson() {
  try {
    if (!SHAREPOINT_BASE_PATH || !fs.existsSync(SHAREPOINT_BASE_PATH)) {
      console.warn("⚠️ SharePoint folder not found.");
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ files: [] }, null, 2));
      return;
    }

    if (!fs.existsSync(PUBLIC_FOLDER)) {
      fs.mkdirSync(PUBLIC_FOLDER, { recursive: true });
    }

    const allFiles = [];

    TRACKER_FOLDERS.forEach((folder) => {
      const folderPath = path.join(SHAREPOINT_BASE_PATH, folder);

      if (!fs.existsSync(folderPath)) {
        console.warn(`⚠️ Folder not found: ${folderPath}`);
        return;
      }

      const files = fs
        .readdirSync(folderPath)
        .filter(
          (file) =>
            file.endsWith(".csv") ||
            file.endsWith(".xlsx") ||
            file.endsWith(".xlsm"),
        );

      files.forEach((file) => {
        const source = path.join(folderPath, file);
        const destination = path.join(PUBLIC_FOLDER, file);

        fs.copyFileSync(source, destination);
        allFiles.push(`api/sharepoint/${file}`);
      });
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ files: allFiles }, null, 2));

    console.log("✅ files.json updated successfully!");
  } catch (err) {
    console.error("❌ Unexpected Error:", err.message);
  }
}

updateFilesJson();
