// ----------------------------
// CSV Watcher & GitHub Trigger
// ----------------------------

// Allow self-signed certificates (fix corporate SSL issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const chokidar = require("chokidar");
const fetch = require("node-fetch"); // npm install node-fetch@2
const path = require("path");

// ----------------------------
// CONFIGURATION
// ----------------------------

// OneDrive CSV folders to monitor (update paths if different)
const folders = [
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Demand Tracker_New Transitions",
  "D:/One drive/OneDrive - FUJITSU/IN - OneAsia1 BPS PM - FY 25-26/Ramp Down Tracker",
];

// GitHub workflow dispatch info
const owner = "vasthana"; // GitHub username
const repo = "gss-demand-dashboard"; // repository name
const workflow_id = "deploy.yml"; // workflow file in .github/workflows/
const ref = "main"; // branch where workflow exists
const token = process.env.GITHUB_TOKEN; // must be set in environment

if (!token) {
  console.error("❌ ERROR: GITHUB_TOKEN is not set in your environment.");
  process.exit(1);
}

// ----------------------------
// FUNCTION TO TRIGGER WORKFLOW
// ----------------------------
async function triggerWorkflow(fileName) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] Detected change in ${fileName}`);
  console.log(`[${time}] Triggering GitHub workflow...`);

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;
  console.log(`[DEBUG] API URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref }),
    });

    if (response.ok) {
      console.log(`[${time}] ✅ Workflow triggered successfully!\n`);
    } else {
      const text = await response.text();
      console.error(`[${time}] ❌ Failed to trigger workflow:`, text);
    }
  } catch (err) {
    console.error(`[${time}] ❌ Error triggering workflow:`, err);
  }
}

// ----------------------------
// SET UP WATCHER
// ----------------------------
const watcher = chokidar.watch(folders, {
  persistent: true,
  ignoreInitial: true, // don't trigger for existing files on start
  depth: 1,
});

watcher.on("add", triggerWorkflow);
watcher.on("change", triggerWorkflow);

console.log("📂 Watching OneDrive CSV folders for changes...");
