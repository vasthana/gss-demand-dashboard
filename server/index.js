const express = require("express");
const cors = require("cors");
const path = require("path");

const generateChartRoute = require("./routes/generateChart");

const app = express();

// ✅ Middleware
app.use(cors()); // Allow frontend to call API
app.use(express.json()); // Parse JSON requests

// ✅ Routes
app.use("/api/generate-chart", generateChartRoute);

// ✅ Serve static files (React build) if needed
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
