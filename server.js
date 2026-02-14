const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate-chart", (req, res) => {
  const { financialYear, month } = req.body;

  const csvPath = path.join(
    __dirname,
    `public/Oppurtunity_Tracker/${financialYear}/Month/${month}/sample.csv`,
  );

  const chartJsonPath = path.join(
    __dirname,
    "public/api/Chart_Json/chart.json",
  );

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ success: false, message: "CSV not found" });
  }

  const cards = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      cards.push({
        title: row.KPI,
        value: Number(row.Value),
      });
    })
    .on("end", () => {
      fs.writeFileSync(chartJsonPath, JSON.stringify({ cards }, null, 2));
      res.json({ success: true, chartJson: cards });
    });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
