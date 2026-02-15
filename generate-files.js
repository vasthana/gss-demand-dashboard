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

// Destination folders
const PUBLIC_FOLDER = path.join(__dirname, "public");
const API_FOLDER = path.join(PUBLIC_FOLDER, "api");
const OUTPUT_PATH = path.join(API_FOLDER, "files.json");

function updateFilesJson() {
  try {
    if (!SHAREPOINT_BASE_PATH || !fs.existsSync(SHAREPOINT_BASE_PATH)) {
      console.warn("⚠️ SharePoint folder not found.");
      if (!fs.existsSync(API_FOLDER))
        fs.mkdirSync(API_FOLDER, { recursive: true });
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ files: [] }, null, 2));
      return;
    }

    if (!fs.existsSync(PUBLIC_FOLDER)) {
      fs.mkdirSync(PUBLIC_FOLDER, { recursive: true });
    }
    if (!fs.existsSync(API_FOLDER)) {
      fs.mkdirSync(API_FOLDER, { recursive: true });
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

        // ✅ Store only filename in JSON
        allFiles.push(file);
      });
    });

    // ✅ Final JSON
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ files: allFiles }, null, 2));

    console.log("✅ flex.json updated successfully!");
  } catch (err) {
    console.error("❌ Unexpected Error:", err.message);
  }
}

updateFilesJson();
