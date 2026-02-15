[1mdiff --git a/src/components/pages/dashboard.jsx b/src/components/pages/dashboard.jsx[m
[1mindex bd11701..0296797 100644[m
[1m--- a/src/components/pages/dashboard.jsx[m
[1m+++ b/src/components/pages/dashboard.jsx[m
[36m@@ -51,7 +51,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
   );[m
   const [selectedRampYear, setSelectedRampYear] = React.useState(null);[m
   const [selectedQuarter, setSelectedQuarter] = React.useState("All Months");[m
[31m-  //const [quarterChangedByUser, setQuarterChangedByUser] = React.useState(false);[m
   const [quarterChangedByUser, setQuarterChangedByUser] = useState({});[m
 [m
   // For TrendView1 interactive legend[m
[36m@@ -61,19 +60,25 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
   const [showBgHC, setShowBgHC] = useState(true);[m
   const [stakeholderVisible, setStakeholderVisible] = useState([]);[m
   const [selectedFY2, setSelectedFY2] = useState(null);[m
[31m-  // const [selectedQuarter, setSelectedQuarter] = React.useState("Month-wise");[m
 [m
   const [activeTrendView, setActiveTrendView] = useState("TrendView1");[m
   const [trendView1Layout, setTrendView1Layout] = useState("1x2"); // default for TrendView1[m
   const [trendView2Layout, setTrendView2Layout] = useState("1x2"); // default for TrendView2[m
 [m
[31m-  // Detect if currently selected CSV is Ramp Down[m
[32m+[m[32m  // ---------- Column keys ----------[m
[32m+[m
[32m+[m[32m  const [selectedTableYear, setSelectedTableYear] = useState(null);[m
[32m+[m[32m  const [showQuarterlyLoss, setShowQuarterlyLoss] = useState(true);[m
[32m+[m[32m  const [showMonthlyRevenue, setShowMonthlyRevenue] = useState(true);[m
 [m
[32m+[m[32m  const monthKey = "Ramp down Month"; // Correct Month column[m
[32m+[m
[32m+[m[32m  // Detect if currently selected CSV is Ramp Down[m
   const chartSectionRef = React.useRef();[m
   const trackingPageCsvMap = useMemo([m
     () => ({[m
[31m-      "new-transitions": `${process.env.PUBLIC_URL}/api/sharepoint/Application_Data_Opportunity_Tracker.csv`,[m
[31m-      "ramp-down-project": `${process.env.PUBLIC_URL}/api/sharepoint/Application_Data_Ramp_Down.csv`,[m
[32m+[m[32m      "new-transitions": `Application_Data_Opportunity_Tracker.csv`,[m
[32m+[m[32m      "ramp-down-project": `Application_Data_Ramp_Down.csv`,[m
     }),[m
     [],[m
   );[m
[36m@@ -175,7 +180,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
       const totalYearly = totalAmount * 4;[m
 [m
       return [[m
[31m-        { title: "Total Opportunity", value: totalOpportunity },[m
[32m+[m[32m        { title: "Total RampDown", value: totalOpportunity },[m
         { title: "Total HC", value: totalHC },[m
         { title: "Total Amount (Monthly)", value: totalMonthly, isUSD: true },[m
         { title: "Total Amount (Yearly)", value: totalYearly, isUSD: true },[m
[36m@@ -341,129 +346,10 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
       .catch((err) => console.error("Error loading files.json:", err));[m
   }, []);[m
 [m
[31m-  // useEffect(() => {[m
[31m-  //   // Initialize first Trend CSV automatically[m
[31m-  //   if (!selectedTrendCsv && dynamicTrends.length > 0) {[m
[31m-  //     setSelectedTrendCsv(dynamicTrends[0].file);[m
[31m-  //     setSelectedTrendTitle(dynamicTrends[0].label); // ✅ Title now matches sidebar[m
[31m-  //     return;[m
[31m-  //   }[m
[31m-[m
[31m-  //   if (!selectedTrendCsv) return;[m
[31m-[m
[31m-  //   setLoading(true);[m
[31m-  //   setShowLoader(true);[m
[31m-  //   const startTime = Date.now();[m
[31m-[m
[31m-  //   fetch(`/${selectedTrendCsv}`)[m
[31m-  //     .then((res) => res.text())[m
[31m-  //     .then((csvText) => {[m
[31m-  //       Papa.parse(csvText, {[m
[31m-  //         header: true,[m
[31m-  //         skipEmptyLines: true,[m
[31m-  //         dynamicTyping: true,[m
[31m-  //         complete: (results) => {[m
[31m-  //           const cleanHeaders = Object.keys(results.data[0] || {}).filter([m
[31m-  //             (h) => h.trim() !== "",[m
[31m-  //           );[m
[31m-[m
[31m-  //           const cleanedData = results.data.map((row) => {[m
[31m-  //             const newRow = {};[m
[31m-  //             cleanHeaders.forEach((h) => (newRow[h] = row[h]));[m
[31m-  //             return newRow;[m
[31m-  //           });[m
[31m-[m
[31m-  //           setJsonData(cleanedData);[m
[31m-  //           setHeaders(cleanHeaders);[m
[31m-[m
[31m-  //           const elapsed = Date.now() - startTime;[m
[31m-  //           setTimeout([m
[31m-  //             () => {[m
[31m-  //               setLoading(false);[m
[31m-  //               setShowLoader(false);[m
[31m-  //             },[m
[31m-  //             Math.max(0, 1000 - elapsed),[m
[31m-  //           );[m
[31m-  //         },[m
[31m-  //       });[m
[31m-  //     })[m
[31m-  //     .catch((err) => {[m
[31m-  //       console.error("CSV load error:", err);[m
[31m-  //       setLoading(false);[m
[31m-  //       setShowLoader(false);[m
[31m-  //     });[m
[31m-  // }, [dynamicTrends, selectedTrendCsv]);[m
[31m-[m
[31m-  // useEffect(() => {[m
[31m-  //   // 1️⃣ Initialize first Trend CSV automatically[m
[31m-  //   if (!selectedTrendCsv && dynamicTrends.length > 0) {[m
[31m-  //     setSelectedTrendCsv(dynamicTrends[0].file);[m
[31m-  //     setSelectedTrendTitle(dynamicTrends[0].label); // Title now matches sidebar[m
[31m-  //     return;[m
[31m-  //   }[m
[31m-[m
[31m-  //   if (!selectedTrendCsv) return;[m
[31m-[m
[31m-  //   setLoading(true);[m
[31m-  //   setShowLoader(true);[m
[31m-  //   const startTime = Date.now();[m
[31m-[m
[31m-  //   // ✅ Build full CSV URL using PUBLIC_URL (works on GitHub Pages and localhost)[m
[31m-  //   const csvUrl = `${process.env.PUBLIC_URL}/api/sharepoint/${selectedTrendCsv}`;[m
[31m-[m
[31m-  //   fetch(csvUrl)[m
[31m-  //     .then((res) => {[m
[31m-  //       if (!res.ok) {[m
[31m-  //         throw new Error([m
[31m-  //           `Failed to fetch CSV: ${res.status} ${res.statusText}`,[m
[31m-  //         );[m
[31m-  //       }[m
[31m-  //       return res.text();[m
[31m-  //     })[m
[31m-  //     .then((csvText) => {[m
[31m-  //       Papa.parse(csvText, {[m
[31m-  //         header: true,[m
[31m-  //         skipEmptyLines: true,[m
[31m-  //         dynamicTyping: true,[m
[31m-  //         complete: (results) => {[m
[31m-  //           const cleanHeaders = Object.keys(results.data[0] || {}).filter([m
[31m-  //             (h) => h.trim() !== "",[m
[31m-  //           );[m
[31m-[m
[31m-  //           const cleanedData = results.data.map((row) => {[m
[31m-  //             const newRow = {};[m
[31m-  //             cleanHeaders.forEach((h) => (newRow[h] = row[h]));[m
[31m-  //             return newRow;[m
[31m-  //           });[m
[31m-[m
[31m-  //           setJsonData(cleanedData);[m
[31m-  //           setHeaders(cleanHeaders);[m
[31m-[m
[31m-  //           const elapsed = Date.now() - startTime;[m
[31m-  //           setTimeout([m
[31m-  //             () => {[m
[31m-  //               setLoading(false);[m
[31m-  //               setShowLoader(false);[m
[31m-  //             },[m
[31m-  //             Math.max(0, 1000 - elapsed),[m
[31m-  //           );[m
[31m-  //         },[m
[31m-  //         error: (err) => {[m
[31m-  //           console.error("Papa parse error:", err);[m
[31m-  //           setLoading(false);[m
[31m-  //           setShowLoader(false);[m
[31m-  //         },[m
[31m-  //       });[m
[31m-  //     })[m
[31m-  //     .catch((err) => {[m
[31m-  //       console.error("CSV load error:", err, "URL:", csvUrl);[m
[31m-  //       setLoading(false);[m
[31m-  //       setShowLoader(false);[m
[31m-  //     });[m
[31m-  // }, [dynamicTrends, selectedTrendCsv]);[m
   useEffect(() => {[m
     // 1️⃣ Initialize first Trend CSV automatically[m
     if (!selectedTrendCsv && dynamicTrends.length > 0) {[m
[32m+[m[32m      console.log("Initializing first trend CSV:", dynamicTrends[0].file);[m
       setSelectedTrendCsv(dynamicTrends[0].file);[m
       setSelectedTrendTitle(dynamicTrends[0].label);[m
       return;[m
[36m@@ -475,9 +361,35 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
     setShowLoader(true);[m
     const startTime = Date.now();[m
 [m
[31m-    // ✅ Build CSV URL for GitHub Pages / local[m
[31m-    const csvUrl = `${process.env.PUBLIC_URL}/api/sharepoint/${encodeURIComponent(selectedTrendCsv)}`;[m
[32m+[m[32m    // ---------------- Determine environment ----------------[m
[32m+[m[32m    const isGitHub = window.location.hostname.includes("github.io");[m
[32m+[m
[32m+[m[32m    // ---------------- Base CSV path ----------------[m
[32m+[m[32m    // Local dev: files in public/api/sharepoint/[m
[32m+[m[32m    // GitHub: files directly in public/[m
[32m+[m[32m    const csvBasePath = isGitHub ? "" : "/api/sharepoint";[m
[32m+[m
[32m+[m[32m    // ---------------- URL Mapping (if needed) ----------------[m
[32m+[m[32m    // Only needed if selectedTrendCsv still has old SharePoint-style paths[m
[32m+[m[32m    const urlMap = {[m
[32m+[m[32m      "Oppurtunity_Tracker/FY25/Month/Jan/Application Data_Opportunity Tracker.csv":[m
[32m+[m[32m        "Application_Data_Opportunity_Tracker.csv",[m
[32m+[m[32m      "Oppurtunity_Tracker/FY25/Month/Jan/Ramp_Down_Tracker.csv":[m
[32m+[m[32m        "Application_Data_Ramp_Down.csv",[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    const mappedFile = urlMap[selectedTrendCsv] || selectedTrendCsv;[m
 [m
[32m+[m[32m    // ---------------- Final fetch URL ----------------[m
[32m+[m[32m    const csvUrl = `${process.env.PUBLIC_URL}${csvBasePath}/${mappedFile}`;[m
[32m+[m
[32m+[m[32m    // ---------- Console logs for debugging ----------[m
[32m+[m[32m    console.log("Environment:", isGitHub ? "GitHub Pages" : "Local dev");[m
[32m+[m[32m    console.log("Selected CSV:", selectedTrendCsv);[m
[32m+[m[32m    console.log("Mapped CSV file:", mappedFile);[m
[32m+[m[32m    console.log("Final fetch URL:", csvUrl);[m
[32m+[m
[32m+[m[32m    // ---------------- Fetch CSV ----------------[m
     fetch(csvUrl)[m
       .then((res) => {[m
         if (!res.ok) {[m
[36m@@ -489,7 +401,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
       })[m
       .then((csvText) => {[m
         if (!csvText || csvText.trim() === "") {[m
[31m-          console.warn("CSV is empty:", selectedTrendCsv);[m
[32m+[m[32m          console.warn("CSV is empty:", mappedFile);[m
           setJsonData([]);[m
           setHeaders([]);[m
           setLoading(false);[m
[36m@@ -497,6 +409,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
           return;[m
         }[m
 [m
[32m+[m[32m        // ---------------- Parse CSV ----------------[m
         Papa.parse(csvText, {[m
           header: true,[m
           skipEmptyLines: true,[m
[36m@@ -544,6 +457,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
         setShowLoader(false);[m
       });[m
   }, [dynamicTrends, selectedTrendCsv]);[m
[32m+[m
   const formatUSD = (val) => {[m
     if (val >= 1e6) return `$${(val / 1e6).toFixed(1)} M`;[m
     if (val >= 1e3) return `$${(val / 1e3).toFixed(1)} K`;[m
[36m@@ -634,27 +548,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
       }[m
     });[m
 [m
[31m-    // Aggregate TrendView2 data[m
[31m-    // const aggregateRampDown = (key) => {[m
[31m-    //   if (!key || !filteredData.length)[m
[31m-    //     return { "No Data": { hc: 0, quarterlyLoss: 0, monthlyRev: 0 } };[m
[31m-[m
[31m-    //   const result = {};[m
[31m-    //   filteredData.forEach((row) => {[m
[31m-    //     const k = row[key] || "Unknown";[m
[31m-    //     if (!result[k]) result[k] = { hc: 0, quarterlyLoss: 0, monthlyRev: 0 };[m
[31m-[m
[31m-    //     result[k].hc += safeNumber(row[hcBillableKey]);[m
[31m-    //     result[k].quarterlyLoss += safeNumber(row[quarterlyLossKey]);[m
[31m-    //     result[k].monthlyRev += safeNumber(row[monthlyRevenueKey]);[m
[31m-    //   });[m
[31m-[m
[31m-    //   return result;[m
[31m-    // };[m
[31m-[m
[31m-    // Aggregate data by month[m
[31m-    // Aggregate data by Ramp Down Month[m
[31m-    // Find the Ramp Down Month column dynamically[m
     const rampDownMonthKey = headers.find((h) =>[m
       h.toLowerCase().includes("ramp down month"),[m
     );[m
[36m@@ -1273,6 +1166,404 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
             quarterlyLossKey &&[m
             monthlyRevenueKey &&[m
             (() => {[m
[32m+[m[32m              // 2️⃣ Compute years for dropdown from your data[m
[32m+[m[32m              const tableYearsOptions = [[m
[32m+[m[32m                ...new Set([m
[32m+[m[32m                  filteredData[m
[32m+[m[32m                    .map((row) => {[m
[32m+[m[32m                      const monthRaw = row[rampDownMonthKey]; // e.g., "Jan-25"[m
[32m+[m[32m                      if (!monthRaw) return null;[m
[32m+[m[32m                      return parseInt(monthRaw.split("-")[1], 10) + 2000;[m
[32m+[m[32m                    })[m
[32m+[m[32m                    .filter(Boolean),[m
[32m+[m[32m                ),[m
[32m+[m[32m              ].sort((a, b) => a - b);[m
[32m+[m
[32m+[m[32m              // 3️⃣ Filter table data based on selected year[m
[32m+[m[32m              const tableFilteredData = selectedTableYear[m
[32m+[m[32m                ? filteredData.filter((row) => {[m
[32m+[m[32m                    const monthRaw = row[rampDownMonthKey];[m
[32m+[m[32m                    if (!monthRaw) return false;[m
[32m+[m[32m                    const year = parseInt(monthRaw.split("-")[1], 10) + 2000;[m
[32m+[m[32m                    return year === selectedTableYear;[m
[32m+[m[32m                  })[m
[32m+[m[32m                : filteredData;[m
[32m+[m
[32m+[m[32m              // 4️⃣ Calculate dynamic column widths[m
[32m+[m[32m              const fixedFirstColumnWidth = 15; // % for first column[m
[32m+[m[32m              const baseColumns = 2; // Owner + HC always visible after first[m
[32m+[m[32m              const extraColumns =[m
[32m+[m[32m                (showQuarterlyLoss ? 1 : 0) + (showMonthlyRevenue ? 1 : 0);[m
[32m+[m[32m              const remainingColumns = baseColumns + extraColumns;[m
[32m+[m[32m              const remainingWidth = 100 - fixedFirstColumnWidth;[m
[32m+[m[32m              const otherColumnWidth = `${remainingWidth / remainingColumns}%`; // divide remaining equally[m
[32m+[m
[32m+[m[32m              // 5️⃣ Render table card[m
[32m+[m[32m              const combinedTableCard = ([m
[32m+[m[32m                <div className="chart-card" style={{ padding: 20 }}>[m
[32m+[m[32m                  <h3 style={{ marginBottom: 12, color: "#333" }}>[m
[32m+[m[32m                    Total RampDown[m
[32m+[m[32m                  </h3>[m
[32m+[m
[32m+[m[32m                  {/* Year dropdown and Column toggle */}[m
[32m+[m[32m                  <div[m
[32m+[m[32m                    style={{[m
[32m+[m[32m                      marginBottom: 12,[m
[32m+[m[32m                      display: "flex",[m
[32m+[m[32m                      gap: 20,[m
[32m+[m[32m                      alignItems: "center",[m
[32m+[m[32m                    }}[m
[32m+[m[32m                  >[m
[32m+[m[32m                    <div>[m
[32m+[m[32m                      <label style={{ marginRight: 8 }}>Select Year:</label>[m
[32m+[m[32m                      <select[m
[32m+[m[32m                        value={selectedTableYear || ""}[m
[32m+[m[32m                        onChange={(e) =>[m
[32m+[m[32m                          setSelectedTableYear([m
[32m+[m[32m                            e.target.value[m
[32m+[m[32m                              ? parseInt(e.target.value, 10)[m
[32m+[m[32m                              : null,[m
[32m+[m[32m                          )[m
[32m+[m[32m                        }[m
[32m+[m[32m                        style={{ padding: "4px 8px", fontSize: 14 }}[m
[32m+[m[32m                      >[m
[32m+[m[32m                        <option value="">All Years</option>[m
[32m+[m[32m                        {tableYearsOptions.map((y) => ([m
[32m+[m[32m                          <option key={y} value={y}>[m
[32m+[m[32m                            {y}[m
[32m+[m[32m                          </option>[m
[32m+[m[32m                        ))}[m
[32m+[m[32m                      </select>[m
[32m+[m[32m                    </div>[m
[32m+[m
[32m+[m[32m                    {/* Column show/hide dropdown */}[m
[32m+[m[32m                    <div>[m
[32m+[m[32m                      <label style={{ marginRight: 8 }}>Show Column:</label>[m
[32m+[m[32m                      <select[m
[32m+[m[32m                        value=""[m
[32m+[m[32m                        onChange={(e) => {[m
[32m+[m[32m                          const value = e.target.value;[m
[32m+[m[32m                          if (value === "quarterlyLoss")[m
[32m+[m[32m                            setShowQuarterlyLoss(!showQuarterlyLoss);[m
[32m+[m[32m                          if (value === "monthlyRevenue")[m
[32m+[m[32m                            setShowMonthlyRevenue(!showMonthlyRevenue);[m
[32m+[m[32m                        }}[m
[32m+[m[32m                        style={{ padding: "4px 8px", fontSize: 14 }}[m
[32m+[m[32m                      >[m
[32m+[m[32m                        <option value="">Select Column</option>[m
[32m+[m[32m                        <option value="quarterlyLoss">[m
[32m+[m[32m                          {showQuarterlyLoss[m
[32m+[m[32m                            ? "Hide Quarterly Loss"[m
[32m+[m[32m                            : "Show Quarterly Loss"}[m
[32m+[m[32m                        </option>[m
[32m+[m[32m                        <option value="monthlyRevenue">[m
[32m+[m[32m                          {showMonthlyRevenue[m
[32m+[m[32m                            ? "Hide Monthly Revenue"[m
[32m+[m[32m                            : "Show Monthly Revenue"}[m
[32m+[m[32m                        </option>[m
[32m+[m[32m                      </select>[m
[32m+[m[32m                    </div>[m
[32m+[m[32m                  </div>[m
[32m+[m
[32m+[m[32m                  {/* Table */}[m
[32m+[m[32m                  <table[m
[32m+[m[32m                    style={{[m
[32m+[m[32m                      width: "100%",[m
[32m+[m[32m                      borderCollapse: "collapse",[m
[32m+[m[32m                      fontSize: "14px",[m
[32m+[m[32m                      tableLayout: "fixed", // ensures equal width division for remaining columns[m
[32m+[m[32m                    }}[m
[32m+[m[32m                  >[m
[32m+[m[32m                    <thead>[m
[32m+[m[32m                      <tr[m
[32m+[m[32m                        style={{ backgroundColor: "#1e3a8a", color: "white" }}[m
[32m+[m[32m                      >[m
[32m+[m[32m                        <th[m
[32m+[m[32m                          style={{[m
[32m+[m[32m                            padding: 8,[m
[32m+[m[32m                            textAlign: "left",[m
[32m+[m[32m                            width: `${fixedFirstColumnWidth}%`,[m
[32m+[m[32m                          }}[m
[32m+[m[32m                        >[m
[32m+[m[32m                          Quarter[m
[32m+[m[32m                        </th>[m
[32m+[m[32m                        <th[m
[32m+[m[32m                          style={{[m
[32m+[m[32m                            padding: 8,[m
[32m+[m[32m                            textAlign: "left",[m
[32m+[m[32m                            width: otherColumnWidth,[m
[32m+[m[32m                          }}[m
[32m+[m[32m                        >[m
[32m+[m[32m                          Owner[m
[32m+[m[32m                        </th>[m
[32m+[m[32m                        <th[m
[32m+[m[32m                          style={{[m
[32m+[m[32m                            padding: 8,[m
[32m+[m[32m                            textAlign: "left",[m
[32m+[m[32m                            width: otherColumnWidth,[m
[32m+[m[32m                          }}[m
[32m+[m[32m                        >[m
[32m+[m[32m                          HC (Billable Only)[m
[32m+[m[32m                        </th>[m
[32m+[m[32m                        {showQuarterlyLoss && ([m
[32m+[m[32m                          <th[m
[32m+[m[32m                            style={{[m
[32m+[m[32m                              padding: 8,[m
[32m+[m[32m                              textAlign: "left",[m
[32m+[m[32m                              width: otherColumnWidth,[m
[32m+[m[32m                            }}[m
[32m+[m[32m                          >[m
[32m+[m[32m                            Quarterly Revenue Loss (USD)[m
[32m+[m[32m                          </th>[m
[32m+[m[32m                        )}[m
[32m+[m[32m                        {showMonthlyRevenue && ([m
[32m+[m[32m                          <th[m
[32m+[m[32m                            style={{[m
[32m+[m[32m                              padding: 8,[m
[32m+[m[32m                              textAlign: "left",[m
[32m+[m[32m                              width: otherColumnWidth,[m
[32m+[m[32m                            }}[m
[32m+[m[32m                          >[m
[32m+[m[32m                            Monthly Revenue (USD)[m
[32m+[m[32m                          </th>[m
[32m+[m[32m                        )}[m
[32m+[m[32m                      </tr>[m
[32m+[m[32m                    </thead>[m
[32m+[m
[32m+[m[32m                    <tbody>[m
[32m+[m[32m                      {["Q1", "Q2", "Q3", "Q4"].map((quarter) => {[m
[32m+[m[32m                        const uniqueOwners = [[m
[32m+[m[32m                          ...new Set(tableFilteredData.map((row) => row.Owner)),[m
[32m+[m[32m                        ];[m
[32m+[m
[32m+[m[32m                        const ownerRows = uniqueOwners.map((owner) => {[m
[32m+[m[32m                          const ownerQuarterData = tableFilteredData.filter([m
[32m+[m[32m                            (row) => {[m
[32m+[m[32m                              if (row.Owner !== owner) return false;[m
[32m+[m[32m                              const monthVal = row[monthKey];[m
[32m+[m[32m                              if (!monthVal) return false;[m
[32m+[m[32m                              const month =[m
[32m+[m[32m                                new Date(`1-${monthVal}`).getMonth() + 1;[m
[32m+[m[32m                              const rowQuarter =[m
[32m+[m[32m                                month >= 1 && month <= 3[m
[32m+[m[32m                                  ? "Q1"[m
[32m+[m[32m                                  : month >= 4 && month <= 6[m
[32m+[m[32m                                    ? "Q2"[m
[32m+[m[32m                                    : month >= 7 && month <= 9[m
[32m+[m[32m                                      ? "Q3"[m
[32m+[m[32m                                      : "Q4";[m
[32m+[m[32m                              return rowQuarter === quarter;[m
[32m+[m[32m                            },[m
[32m+[m[32m                          );[m
[32m+[m
[32m+[m[32m                          const totalHC = ownerQuarterData.reduce([m
[32m+[m[32m                            (sum, row) => sum + safeNumber(row[hcBillableKey]),[m
[32m+[m[32m                            0,[m
[32m+[m[32m                          );[m
[32m+[m
[32m+[m[32m                          const totalQuarterlyLoss = ownerQuarterData[m
[32m+[m[32m                            .reduce([m
[32m+[m[32m                              (sum, row) =>[m
[32m+[m[32m                                sum + safeNumber(row[quarterlyLossKey]),[m
[32m+[m[32m                              0,[m
[32m+[m[32m                            )[m
[32m+[m[32m                            .toFixed(2);[m
[32m+[m
[32m+[m[32m                          const totalMonthlyRevenue = ownerQuarterData[m
[32m+[m[32m                            .reduce([m
[32m+[m[32m                              (sum, row) =>[m
[32m+[m[32m                                sum + safeNumber(row[monthlyRevenueKey]),[m
[32m+[m[32m                              0,[m
[32m+[m[32m                            )[m
[32m+[m[32m                            .toFixed(2);[m
[32m+[m
[32m+[m[32m                          return {[m
[32m+[m[32m                            owner,[m
[32m+[m[32m                            hc: totalHC || 0,[m
[32m+[m[32m                            quarterlyLoss: totalQuarterlyLoss || "0.00",[m
[32m+[m[32m                            monthlyRevenue: totalMonthlyRevenue || "0.00",[m
[32m+[m[32m                          };[m
[32m+[m[32m                        });[m
[32m+[m
[32m+[m[32m                        const quarterTotalHC = ownerRows.reduce([m
[32m+[m[32m                          (sum, row) => sum + row.hc,[m
[32m+[m[32m                          0,[m
[32m+[m[32m                        );[m
[32m+[m[32m                        const quarterTotalLoss = ownerRows[m
[32m+[m[32m                          .reduce([m
[32m+[m[32m                            (sum, row) => sum + parseFloat(row.quarterlyLoss),[m
[32m+[m[32m                            0,[m
[32m+[m[32m                          )[m
[32m+[m[32m                          .toFixed(2);[m
[32m+[m[32m                        const quarterTotalMonthlyRevenue = ownerRows[m
[32m+[m[32m                          .reduce([m
[32m+[m[32m                            (sum, row) => sum + parseFloat(row.monthlyRevenue),[m
[32m+[m[32m                            0,[m
[32m+[m[32m                          )[m
[32m+[m[32m                          .toFixed(2);[m
[32m+[m
[32m+[m[32m                        return ([m
[32m+[m[32m                          <React.Fragment key={quarter}>[m
[32m+[m[32m                            {/* Quarter subtotal row */}[m
[32m+[m[32m                            <tr[m
[32m+[m[32m                              style={{[m
[32m+[m[32m                                backgroundColor: "#e0f2fe",[m
[32m+[m[32m                                fontWeight: "bold",[m
[32m+[m[32m                                textAlign: "left",[m
[32m+[m[32m                              }}[m
[32m+[m[32m                            >[m
[32m+[m[32m                              <td[m
[32m+[m[32m                                style={{[m
[32m+[m[32m                                  padding: 8,[m
[32m+[m[32m                                  width: `${fixedFirstColumnWidth}%`,[m
[32m+[m[32m                                }}[m
[32m+[m[32m                              >[m
[32m+[m[32m                                {quarter}[m
[32m+[m[32m                              </td>[m
[32m+[m[32m                              <td[m
[32m+[m[32m                                style={{ padding: 8, width: otherColumnWidth }}[m
[32m+[m[32m                              >[m
[32m+[m[32m                                --[m
[32m+[m[32m                              </td>[m
[32m+[m[32m                              <td[m
[32m+[m[32m                                style={{ padding: 8, width: otherColumnWidth }}[m
[32m+[m[32m                              >[m
[32m+[m[32m                                {quarterTotalHC}[m
[32m+[m[32m                              </td>[m
[32m+[m[32m                              {showQuarterlyLoss && ([m
[32m+[m[32m                                <td[m
[32m+[m[32m                                  style={{[m
[32m+[m[32m                                    padding: 8,[m
[32m+[m[32m                                    width: otherColumnWidth,[m
[32m+[m[32m                                  }}[m
[32m+[m[32m                                >[m
[32m+[m[32m                                  {quarterTotalLoss}[m
[32m+[m[32m                                </td>[m
[32m+[m[32m                              )}[m
[32m+[m[32m                              {showMonthlyRevenue && ([m
[32m+[m[32m                                <td[m
[32m+[m[32m                                  style={{[m
[32m+[m[32m                                    padding: 8,[m
[32m+[m[32m                                    width: otherColumnWidth,[m
[32m+[m[32m                                  }}[m
[32m+[m[32m                                >[m
[32m+[m[32m                                  {quarterTotalMonthlyRevenue}[m
[32m+[m[32m                                </td>[m
[32m+[m[32m                              )}[m
[32m+[m[32m                            </tr>[m
[32m+[m
[32m+[m[32m                            {/* Owner rows */}[m
[32m+[m[32m                            {ownerRows.map((row, idx) => ([m
[32m+[m[32m                              <tr[m
[32m+[m[32m                                key={`${quarter}-owner-${idx}`}[m
[32m+[m[32m                                style={{[m
[32m+[m[32m                                  backgroundColor:[m
[32m+[m[32m                                    idx % 2 === 0 ? "#ffffff" : "#f9fafb",[m
[32m+[m[32m                                  textAlign: "left",[m
[32m+[m[32m                                }}[m
[32m+[m[32m                              >[m
[32m+[m[32m                                <td[m
[32m+[m[32m                                  style={{[m
[32m+[m[32m                                    padding: 8,[m
[32m+[m[32m                                    width: `${fixedFirstColumnWidth}%`,[m
[32m+[m[32m                                  }}[m
[32m+[m[32m                                ></td>[m
[32m+[m[32m                                <td[m
[32m+[m[32m                                  style={{[m
[32m+[m[32m                                    padding: 8,[m
[32m+[m[32m                                    width: otherColumnWidth,[m
[32m+[m[32m                                  }}[m
[32m+[m[32m                                >[m
[32m+[m[32m                                  {row.owner}[m
[32m+[m[32m                                </td>[m
[32m+[m[32m                                <td[m
[32m+[m[32m                                  style={{[m
[32m+[m[32m                                    padding: 8,[m
[32m+[m[32m                                    width: otherColumnWidth,[m
[32m+[m[32m                                  }}[m
[32m+[m[32m                                >[m
[32m+[m[32m                                  {row.hc}[m
[32m+[m[32m                                </td>[m
[32m+[m[32m                                {showQuarterlyLoss && ([m
[32m+[m[32m                                  <td[m
[32m+[m[32m                                    style={{[m
[32m+[m[32m                                      padding: 8,[m
[32m+[m[32m                                      width: otherColumnWidth,[m
[32m+[m[32m                                    }}[m
[32m+[m[32m                                  >[m
[32m+[m[32m                                    {row.quarterlyLoss}[m
[32m+[m[32m                                  </td>[m
[32m+[m[32m                                )}[m
[32m+[m[32m                                {showMonthlyRevenue && ([m
[32m+[m[32m                                  <td[m
[32m+[m[32m                                    style={{[m
[32m+[m[32m                                      padding: 8,[m
[32m+[m[32m                                      width: otherColumnWidth,[m
[32m+[m[32m                                    }}[m
[32m+[m[32m                                  >[m
[32m+[m[32m                                    {row.monthlyRevenue}[m
[32m+[m[32m                                  </td>[m
[32m+[m[32m                                )}[m
[32m+[m[32m                              </tr>[m
[32m+[m[32m                            ))}[m
[32m+[m[32m                          </React.Fragment>[m
[32m+[m[32m                        );[m
[32m+[m[32m                      })}[m
[32m+[m
[32m+[m[32m                      {/* Grand total row */}[m
[32m+[m[32m                      <tr[m
[32m+[m[32m                        style={{[m
[32m+[m[32m                          backgroundColor: "#1e3a8a",[m
[32m+[m[32m                          color: "white",[m
[32m+[m[32m                          fontWeight: "bold",[m
[32m+[m[32m                          textAlign: "left",[m
[32m+[m[32m                        }}[m
[32m+[m[32m                      >[m
[32m+[m[32m                        <td[m
[32m+[m[32m                          style={{[m
[32m+[m[32m                            padding: 8,[m
[32m+[m[32m                            width: `${fixedFirstColumnWidth}%`,[m
[32m+[m[32m                          }}[m
[32m+[m[32m                        >[m
[32m+[m[32m                          Grand Total[m
[32m+[m[32m                        </td>[m
[32m+[m[32m                        <td style={{ padding: 8, width: otherColumnWidth }}>[m
[32m+[m[32m                          --[m
[32m+[m[32m                        </td>[m
[32m+[m[32m                        <td style={{ padding: 8, width: otherColumnWidth }}>[m
[32m+[m[32m                          {tableFilteredData.reduce([m
[32m+[m[32m                            (sum, row) => sum + safeNumber(row[hcBillableKey]),[m
[32m+[m[32m                            0,[m
[32m+[m[32m                          )}[m
[32m+[m[32m                        </td>[m
[32m+[m[32m                        {showQuarterlyLoss && ([m
[32m+[m[32m                          <td style={{ padding: 8, width: otherColumnWidth }}>[m
[32m+[m[32m                            {tableFilteredData[m
[32m+[m[32m                              .reduce([m
[32m+[m[32m                                (sum, row) =>[m
[32m+[m[32m                                  sum + safeNumber(row[quarterlyLossKey]),[m
[32m+[m[32m                                0,[m
[32m+[m[32m                              )[m
[32m+[m[32m                              .toFixed(2)}[m
[32m+[m[32m                          </td>[m
[32m+[m[32m                        )}[m
[32m+[m[32m                        {showMonthlyRevenue && ([m
[32m+[m[32m                          <td style={{ padding: 8, width: otherColumnWidth }}>[m
[32m+[m[32m                            {tableFilteredData[m
[32m+[m[32m                              .reduce([m
[32m+[m[32m                                (sum, row) =>[m
[32m+[m[32m                                  sum + safeNumber(row[monthlyRevenueKey]),[m
[32m+[m[32m                                0,[m
[32m+[m[32m                              )[m
[32m+[m[32m                              .toFixed(2)}[m
[32m+[m[32m                          </td>[m
[32m+[m[32m                        )}[m
[32m+[m[32m                      </tr>[m
[32m+[m[32m                    </tbody>[m
[32m+[m[32m                  </table>[m
[32m+[m[32m                </div>[m
[32m+[m[32m              );[m
[32m+[m
               const rampCharts = [[m
                 { title: "Project-wise Ramp Down", key: projectKey },[m
                 { title: "Process-wise Ramp Down", key: processKey },[m
[36m@@ -1310,7 +1601,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
               ];[m
               const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];[m
 [m
[31m-              // ---------- Aggregate data ----------[m
[32m+[m[32m              // ---------- Aggregate ramp data ----------[m
               const rampData = rampCharts[m
                 .map(({ title, key }) => {[m
                   const rampDataByMonth = {};[m
[36m@@ -1319,7 +1610,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                   filteredData.forEach((row) => {[m
                     const monthRaw = row[rampDownMonthKey];[m
                     if (!monthRaw) return;[m
[31m-[m
                     const [monthName, yearPart] = monthRaw.split("-");[m
                     const yearFull = parseInt(yearPart, 10) + 2000;[m
                     const quarter = monthToQuarter[monthName] || "Unknown";[m
[36m@@ -1362,8 +1652,8 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                 );[m
               }[m
 [m
[31m-              // ---------- Render charts ----------[m
[31m-              return rampData.map([m
[32m+[m[32m              // ---------- Render Ramp Down charts ----------[m
[32m+[m[32m              const rampChartsRendered = rampData.map([m
                 ({ title, rampDataByMonth, rampDataByQuarter }, chartIndex) => {[m
                   if (!rampChartRefs.current[chartIndex])[m
                     rampChartRefs.current[chartIndex] = React.createRef();[m
[36m@@ -1375,7 +1665,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                     ),[m
                   ].sort((a, b) => a - b);[m
 [m
[31m-                  // ---------- Validation ----------[m
                   // ---------- Validation ----------[m
                   if ([m
                     quarterChangedByUser[title] &&[m
[36m@@ -1389,7 +1678,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                         style={{ padding: 20 }}[m
                       >[m
                         <h3>{title}</h3>[m
[31m-[m
                         <select[m
                           value={selectedRampYear || ""}[m
                           onChange={(e) =>[m
[36m@@ -1413,7 +1701,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                             </option>[m
                           ))}[m
                         </select>[m
[31m-[m
                         <p style={{ color: "red", marginTop: 8 }}>[m
                           Please select a year from the dropdown to view the[m
                           chart.[m
[36m@@ -1513,7 +1800,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                     const updatedAll = [...rampActiveDatasets];[m
                     updatedAll[chartIndex] = newActive;[m
                     setRampActiveDatasets(updatedAll);[m
[31m-[m
                     const chart = rampChartRefs.current[chartIndex].current;[m
                     if (chart) {[m
                       chart.data.datasets[i].hidden = !newActive[i];[m
[36m@@ -1521,7 +1807,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                     }[m
                   };[m
 [m
[31m-                  // ---------- Render ----------[m
[32m+[m[32m                  // ---------- Render Chart ----------[m
                   return ([m
                     <div className="chart-card large-chart" key={title}>[m
                       <h3>{title}</h3>[m
[36m@@ -1556,8 +1842,6 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                           value={selectedQuarter || "All Months"}[m
                           onChange={(e) => {[m
                             setSelectedQuarter(e.target.value);[m
[31m-[m
[31m-                            // 👇 make validation chart-specific using title[m
                             setQuarterChangedByUser((prev) => ({[m
                               ...prev,[m
                               [title]: true,[m
[36m@@ -1647,14 +1931,7 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                           options={{[m
                             responsive: true,[m
                             maintainAspectRatio: false,[m
[31m-                            layout: {[m
[31m-                              padding: {[m
[31m-                                top: 15,[m
[31m-                                bottom: 0,[m
[31m-                                left: 0,[m
[31m-                                right: 0,[m
[31m-                              },[m
[31m-                            },[m
[32m+[m[32m                            layout: { padding: { top: 15 } },[m
                             plugins: {[m
                               legend: { display: false },[m
                               datalabels: {[m
[36m@@ -1689,6 +1966,14 @@[m [mconst Dashboard = ({ user, onLogout }) => {[m
                   );[m
                 },[m
               );[m
[32m+[m
[32m+[m[32m              // ---------- Return all Ramp charts + new table ----------[m
[32m+[m[32m              return ([m
[32m+[m[32m                <>[m
[32m+[m[32m                  {combinedTableCard}[m
[32m+[m[32m                  {rampChartsRendered}[m
[32m+[m[32m                </>[m
[32m+[m[32m              );[m
             })()}[m
         </div>[m
       </>[m
