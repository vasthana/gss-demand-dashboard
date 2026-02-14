import React, { useEffect, useState, useMemo, useRef } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import Sidebar from "../organisms/sidebar/sidebar";
import "../../css/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels,
);

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("trends");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [showLoader, setShowLoader] = useState(true);
  const [filesList, setFilesList] = useState([]);
  const [selectedFY, setSelectedFY] = React.useState(null); // null means "All Years"
  // At the top of your component
  const rampChartRefs = useRef([]); // array of refs for Ramp Down charts
  const [rampActiveDatasets, setRampActiveDatasets] = useState(
    Array(4).fill([true, true, true]), // 4 charts, each with 3 datasets initially active
  );
  const [selectedRampYear, setSelectedRampYear] = React.useState(null);
  const [selectedQuarter, setSelectedQuarter] = React.useState("All Months");
  //const [quarterChangedByUser, setQuarterChangedByUser] = React.useState(false);
  const [quarterChangedByUser, setQuarterChangedByUser] = useState({});

  // For TrendView1 interactive legend
  const trend1ChartRef = React.createRef();
  const [trend1Visible, setTrend1Visible] = useState([true, true]);
  const [showStartMonthHC, setShowStartMonthHC] = useState(true);
  const [showBgHC, setShowBgHC] = useState(true);
  const [stakeholderVisible, setStakeholderVisible] = useState([]);
  const [selectedFY2, setSelectedFY2] = useState(null);
  // const [selectedQuarter, setSelectedQuarter] = React.useState("Month-wise");

  const [activeTrendView, setActiveTrendView] = useState("TrendView1");
  const [trendView1Layout, setTrendView1Layout] = useState("1x2"); // default for TrendView1
  const [trendView2Layout, setTrendView2Layout] = useState("1x2"); // default for TrendView2

  // Detect if currently selected CSV is Ramp Down

  const chartSectionRef = React.useRef();
  const trackingPageCsvMap = useMemo(
    () => ({
      "new-transitions":
        "api/sharepoint/Application_Data_Opportunity_Tracker.csv",
      "ramp-down-project": "api/sharepoint/Application_Data_Ramp_Down.csv",
    }),
    [],
  );

  const pageTitles = useMemo(
    () => ({
      trends: "📈 Portfolio Health",
      "new-transitions": "New Transitions / Opportunity Tracker",
      "ramp-down-project": "Ramp Down Project",
      "new-joiner-list": "New Joiner List",
      attrition: "Attrition / Resignation",
      "project-details": "Project Details",
      "orm-demand": "ORM Demand Tracker",
      "bt-tracker": "BT Tracker",
      kakushin: "Kakushin",
      automation: "Automation",
      rewards: "Rewards and Recognition",
      revenue: "Revenue",
    }),
    [],
  );

  // ================== DYNAMIC TREND NAVIGATION ==================
  // based on CSVs selected by user at login

  // ================= DOWNLOAD SECTION =================
  const handleDownloadFullSection = async (type) => {
    if (!chartSectionRef.current) return;

    const canvas = await html2canvas(chartSectionRef.current, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `dashboard.${type}`;
    link.href =
      type === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 1.0);
    link.click();
  };

  // ================= OWNER FILTER =================
  const ownerList = useMemo(() => {
    if (!jsonData.length) return [];
    const ownerKey = headers.find((h) => h.toLowerCase().includes("owner"));
    if (!ownerKey) return [];
    const owners = Array.from(
      new Set(jsonData.map((row) => row[ownerKey]).filter(Boolean)),
    ).sort();
    return ["All", ...owners];
  }, [jsonData, headers]);

  const filteredData = useMemo(() => {
    if (selectedOwner === "All") return jsonData;
    const ownerKey = headers.find((h) => h.toLowerCase().includes("owner"));
    return jsonData.filter((row) => row[ownerKey] === selectedOwner);
  }, [jsonData, selectedOwner, headers]);

  const kpiValues = useMemo(() => {
    if (!filteredData || !filteredData.length) return [];

    const safeNumber = (val) => {
      if (!val) return 0;
      const cleaned = Number(String(val).replace(/[$,]/g, "").trim());
      return isNaN(cleaned) ? 0 : cleaned;
    };

    const firstCol = headers[0];

    // =====================================================
    // 🔹 DYNAMIC TRENDS PAGE
    // =====================================================
    if (activePage === "trends") {
      const totalOpportunity = filteredData.filter(
        (row) => row[firstCol] && String(row[firstCol]).trim() !== "",
      ).length;

      const hcKey = headers.find((h) => h.toLowerCase().includes("hc"));

      const amountKey = headers.find(
        (h) =>
          h.toLowerCase().includes("amount") ||
          h.toLowerCase().includes("revenue") ||
          h.toLowerCase().includes("contract"),
      );

      const totalHC = hcKey
        ? filteredData.reduce((sum, row) => sum + safeNumber(row[hcKey]), 0)
        : 0;

      const totalAmount = amountKey
        ? filteredData.reduce((sum, row) => sum + safeNumber(row[amountKey]), 0)
        : 0;

      const totalMonthly = totalAmount / 3; // approximate
      const totalYearly = totalAmount * 4;

      return [
        { title: "Total Opportunity", value: totalOpportunity },
        { title: "Total HC", value: totalHC },
        { title: "Total Amount (Monthly)", value: totalMonthly, isUSD: true },
        { title: "Total Amount (Yearly)", value: totalYearly, isUSD: true },
      ];
    }

    // =====================================================
    // 🟢 NEW TRANSITIONS (Opportunity Tracker)
    // =====================================================
    if (activePage === "new-transitions") {
      const contractKey = headers.find(
        (h) => h.trim().toLowerCase() === "quarterly contract value",
      );

      const hcKey = headers.find(
        (h) =>
          h.toLowerCase().includes("actual") && h.toLowerCase().includes("hc"),
      );

      const totalOpportunity = filteredData.filter(
        (row) => row[firstCol] && String(row[firstCol]).trim() !== "",
      ).length;

      const totalHC = hcKey
        ? filteredData.reduce((sum, row) => sum + safeNumber(row[hcKey]), 0)
        : 0;

      const totalQuarterly = contractKey
        ? filteredData.reduce(
            (sum, row) => sum + safeNumber(row[contractKey]),
            0,
          )
        : 0;

      const totalMonthly = totalQuarterly / 3;
      const totalYearly = totalQuarterly * 4;

      return [
        { title: "Total Opportunity", value: totalOpportunity },
        { title: "Total HC", value: totalHC },
        { title: "Total Amount (Monthly)", value: totalMonthly, isUSD: true },
        { title: "Total Amount (Yearly)", value: totalYearly, isUSD: true },
      ];
    }

    // =====================================================
    // 🔵 RAMP DOWN PROJECT
    // =====================================================
    if (activePage === "ramp-down-project") {
      const hcKey = headers.find(
        (h) => h.trim().toLowerCase() === "hc( billable only)",
      );

      const monthlyRevenueKey = headers.find(
        (h) => h.trim().toLowerCase() === "monthly revenue",
      );

      const totalHC = hcKey
        ? filteredData.reduce((sum, row) => sum + safeNumber(row[hcKey]), 0)
        : 0;

      const totalMonthly = monthlyRevenueKey
        ? filteredData.reduce(
            (sum, row) => sum + safeNumber(row[monthlyRevenueKey]),
            0,
          )
        : 0;

      const totalYearly = totalMonthly * 12;

      return [
        { title: "Total Projects", value: filteredData.length },
        { title: "Total HC", value: totalHC },
        { title: "Total Amount (Monthly)", value: totalMonthly, isUSD: true },
        { title: "Total Amount (Yearly)", value: totalYearly, isUSD: true },
      ];
    }

    return [];
  }, [filteredData, headers, activePage]);

  // ================= AREA CHART =================
  // const areaChartData = useMemo(() => {
  //   if (!filteredData.length) return null;
  //   const monthMap = {};
  //   filteredData.forEach((row) => {
  //     const month = row["Start Month"];
  //     if (!month) return;
  //     monthMap[month] = monthMap[month] || { hc: 0, contract: 0 };
  //     const hcVal = Number(
  //       (row["Actual HC"] || 0).toString().replace(/,/g, ""),
  //     );
  //     const contractVal = Number(
  //       (row["Monthly Contract Value"] || 0).toString().replace(/,/g, ""),
  //     );
  //     monthMap[month].hc += isNaN(hcVal) ? 0 : hcVal;
  //     monthMap[month].contract += isNaN(contractVal) ? 0 : contractVal;
  //   });
  //   const months = Object.keys(monthMap);
  //   const hcValues = months.map((m) => monthMap[m].hc);
  //   const contractValues = months.map((m) => monthMap[m].contract);
  //   return { months, hcValues, contractValues };
  // }, [filteredData]);

  const areaChartData = useMemo(() => {
    if (!filteredData.length) return null;

    const monthMap = {};

    filteredData.forEach((row) => {
      let monthRaw = row["Start Month"];
      if (!monthRaw) return;

      monthRaw = monthRaw.toString().trim();

      // Aggregate HC & Contract
      const hcVal = Number(
        (row["Actual HC"] || 0).toString().replace(/,/g, ""),
      );
      const contractVal = Number(
        (row["Monthly Contract Value"] || 0).toString().replace(/,/g, ""),
      );

      monthMap[monthRaw] = monthMap[monthRaw] || { hc: 0, contract: 0 };
      monthMap[monthRaw].hc += isNaN(hcVal) ? 0 : hcVal;
      monthMap[monthRaw].contract += isNaN(contractVal) ? 0 : contractVal;
    });

    // Convert month strings to Date objects for sorting
    const monthEntries = Object.entries(monthMap).map(([label, value]) => {
      const [monthStr, yearStr] = label.split("-");
      const monthIndex = new Date(`${monthStr} 1, 20${yearStr}`).getMonth(); // get 0-11 month index
      const yearNum = 2000 + parseInt(yearStr); // convert "25" -> 2025
      return { label, value, date: new Date(yearNum, monthIndex, 1) };
    });

    // Sort by date
    monthEntries.sort((a, b) => a.date - b.date);

    const months = monthEntries.map((e) => e.label);
    const hcValues = monthEntries.map((e) => e.value.hc);
    const contractValues = monthEntries.map((e) => e.value.contract);

    return { months, hcValues, contractValues };
  }, [filteredData]);

  const [selectedTrendTitle, setSelectedTrendTitle] = useState("");

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login", { replace: true });
  };

  // ----------------- Dynamic Trend Setup -----------------
  // Update onTrendClick to receive trend type

  const dynamicTrends = useMemo(() => {
    return filesList.map((file, idx) => ({
      id: `trend${idx + 1}`,
      label: `Trend View ${idx + 1}`, // 👈 DISPLAY NAME
      file, // 👈 REAL CSV PATH (unchanged)
    }));
  }, [filesList]);

  // ----------------- Selected CSV State -----------------
  const [selectedTrendCsv, setSelectedTrendCsv] = useState(null);

  useEffect(() => {
    if (activePage === "trends") return;

    const csvPath = trackingPageCsvMap[activePage];
    if (csvPath) {
      setSelectedTrendCsv(csvPath);
      setSelectedTrendTitle(pageTitles[activePage]);
    }
  }, [activePage, trackingPageCsvMap, pageTitles]);

  useEffect(() => {
    fetch("/api/files.json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.files?.length) {
          setFilesList(data.files);
        }
      })
      .catch((err) => console.error("Error loading files.json:", err));
  }, []);

  useEffect(() => {
    // Initialize first Trend CSV automatically
    if (!selectedTrendCsv && dynamicTrends.length > 0) {
      setSelectedTrendCsv(dynamicTrends[0].file);
      setSelectedTrendTitle(dynamicTrends[0].label); // ✅ Title now matches sidebar
      return;
    }

    if (!selectedTrendCsv) return;

    setLoading(true);
    setShowLoader(true);
    const startTime = Date.now();

    fetch(`/${selectedTrendCsv}`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            const cleanHeaders = Object.keys(results.data[0] || {}).filter(
              (h) => h.trim() !== "",
            );

            const cleanedData = results.data.map((row) => {
              const newRow = {};
              cleanHeaders.forEach((h) => (newRow[h] = row[h]));
              return newRow;
            });

            setJsonData(cleanedData);
            setHeaders(cleanHeaders);

            const elapsed = Date.now() - startTime;
            setTimeout(
              () => {
                setLoading(false);
                setShowLoader(false);
              },
              Math.max(0, 1000 - elapsed),
            );
          },
        });
      })
      .catch((err) => {
        console.error("CSV load error:", err);
        setLoading(false);
        setShowLoader(false);
      });
  }, [dynamicTrends, selectedTrendCsv]);

  const formatUSD = (val) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)} M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)} K`;
    return `$${val}`;
  };

  const handleTrendClick = (csvFile, label) => {
    setSelectedTrendCsv(csvFile);
    setSelectedTrendTitle(label);

    if (csvFile.toLowerCase().includes("ramp")) {
      setActiveTrendView("TrendView2");
    } else {
      setActiveTrendView("TrendView1");
    }
  };

  // ================== TABLE ==================
  const renderTable = () => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.slice(0, 20).map((row, i) => (
            <tr key={i}>
              {headers.map((h, j) => (
                <td key={j}>{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAllCharts = () => {
    if (!filteredData.length)
      return <p style={{ padding: 20 }}>No data available.</p>;

    const getKey = (keywords) =>
      headers.find((h) => keywords.every((kw) => h.toLowerCase().includes(kw)));

    // TrendView1 keys
    const startMonthKey = getKey(["start", "month"]);
    const actualHcKey = getKey(["actual", "hc"]);
    const bgKey = getKey(["business"]);
    const stakeholderKey = getKey(["stakeholder"]);
    const projectKey = getKey(["project"]) || "dummyProject";
    const processKey = getKey(["process"]) || "dummyProcess";

    // TrendView2 keys
    const hcBillableKey = getKey(["hc", "billable"]) || "HC( Billable Only)";
    const quarterlyLossKey =
      getKey(["quarterly", "loss"]) || "Quaterly revenue loss in USD";
    const monthlyRevenueKey =
      getKey(["monthly", "revenue"]) || "Monthly Revenue";

    const safeNumber = (val) => {
      const n = Number(val);
      return isNaN(n) ? 0 : parseFloat(n.toFixed(2));
    };

    // Aggregate TrendView1 data
    const hcByStartMonth = {};
    const hcByBG = {};
    const hcByStakeholder = {};

    filteredData.forEach((row) => {
      if (startMonthKey && actualHcKey) {
        const month = row[startMonthKey];
        const hcVal = safeNumber(row[actualHcKey]);
        if (month) hcByStartMonth[month] = (hcByStartMonth[month] || 0) + hcVal;
      }
      if (bgKey && actualHcKey) {
        const bg = row[bgKey] || "Unknown";
        hcByBG[bg] = (hcByBG[bg] || 0) + safeNumber(row[actualHcKey]);
      }
      if (stakeholderKey && actualHcKey) {
        const sh = row[stakeholderKey] || "Unknown";
        hcByStakeholder[sh] =
          (hcByStakeholder[sh] || 0) + safeNumber(row[actualHcKey]);
      }
    });

    // Aggregate TrendView2 data
    // const aggregateRampDown = (key) => {
    //   if (!key || !filteredData.length)
    //     return { "No Data": { hc: 0, quarterlyLoss: 0, monthlyRev: 0 } };

    //   const result = {};
    //   filteredData.forEach((row) => {
    //     const k = row[key] || "Unknown";
    //     if (!result[k]) result[k] = { hc: 0, quarterlyLoss: 0, monthlyRev: 0 };

    //     result[k].hc += safeNumber(row[hcBillableKey]);
    //     result[k].quarterlyLoss += safeNumber(row[quarterlyLossKey]);
    //     result[k].monthlyRev += safeNumber(row[monthlyRevenueKey]);
    //   });

    //   return result;
    // };

    // Aggregate data by month
    // Aggregate data by Ramp Down Month
    // Find the Ramp Down Month column dynamically
    const rampDownMonthKey = headers.find((h) =>
      h.toLowerCase().includes("ramp down month"),
    );

    // Aggregate data by Ramp Down Month
    const rampDataByMonth = {};

    filteredData.forEach((row) => {
      const month = row[rampDownMonthKey] || "Unknown"; // safer
      if (!rampDataByMonth[month]) {
        rampDataByMonth[month] = { hc: 0, quarterlyLoss: 0, monthlyRev: 0 };
      }

      rampDataByMonth[month].hc += safeNumber(row[hcBillableKey]);
      rampDataByMonth[month].quarterlyLoss += safeNumber(row[quarterlyLossKey]);
      rampDataByMonth[month].monthlyRev += safeNumber(row[monthlyRevenueKey]);
    });

    // Determine layout and grid columns separately
    const getGridColumns = (layout) =>
      layout === "1x2"
        ? "repeat(2, 1fr)"
        : layout === "1x3"
          ? "repeat(3, 1fr)"
          : "1fr"; // 3x1

    return (
      <>
        {/* ---------- TrendView1 Layout Dropdown ---------- */}
        {activeTrendView === "TrendView1" && (
          <div
            style={{ marginBottom: 20, display: "flex", alignItems: "center" }}
          >
            <label htmlFor="trendView1Layout">Select TrendView1 Layout: </label>
            <select
              id="trendView1Layout"
              value={trendView1Layout}
              onChange={(e) => setTrendView1Layout(e.target.value)}
              style={{ padding: "5px 10px", marginLeft: 10 }}
            >
              <option value="1x2">1 Row, 2 Columns</option>
              <option value="3x1">Single Row</option>
              <option value="1x3">1 Row, 3 Columns</option>
            </select>
          </div>
        )}

        {/* ---------- TrendView2 Layout Dropdown ---------- */}
        {activeTrendView === "TrendView2" && (
          <div
            style={{ marginBottom: 20, display: "flex", alignItems: "center" }}
          >
            <label htmlFor="trendView2Layout">Select TrendView2 Layout: </label>
            <select
              id="trendView2Layout"
              value={trendView2Layout}
              onChange={(e) => setTrendView2Layout(e.target.value)}
              style={{ padding: "5px 10px", marginLeft: 10 }}
            >
              <option value="1x2">1 Row, 2 Columns</option>
              <option value="3x1">Single Row</option>
              <option value="1x3">1 Row, 3 Columns</option>
            </select>
          </div>
        )}

        {/* ---------- Charts Grid ---------- */}
        <div
          className="charts-grid"
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: getGridColumns(
              activeTrendView === "TrendView1"
                ? trendView1Layout
                : trendView2Layout,
            ),
          }}
        >
          {/* ---------- TrendView1 Charts ---------- */}
          {activeTrendView === "TrendView1" && (
            <>
              {/* ===================== 1️⃣ Actual HC by Start Month ===================== */}
              {startMonthKey &&
                actualHcKey &&
                (() => {
                  // 1️⃣ Convert hcByStartMonth keys into Date objects
                  const monthsWithDates = Object.keys(hcByStartMonth)
                    .filter((m) => m && m !== "Unknown")
                    .map((m) => {
                      const [, yr] = m.split("-"); // eslint: ignore unused month
                      const fullYear = parseInt(yr, 10) + 2000; // "25" -> 2025
                      const monthIndex = new Date(
                        `${m.split("-")[0]} 1, ${fullYear}`,
                      ).getMonth();
                      return {
                        label: m,
                        year: fullYear,
                        date: new Date(fullYear, monthIndex, 1),
                        value: hcByStartMonth[m] || 0,
                      };
                    });

                  // 2️⃣ Filter by selected FY if applicable
                  const filteredMonths = selectedFY
                    ? monthsWithDates.filter((m) => m.year === selectedFY)
                    : monthsWithDates;

                  // 3️⃣ Sort by date
                  filteredMonths.sort((a, b) => a.date - b.date);

                  // 4️⃣ Extract sorted labels and values
                  const sortedMonths = filteredMonths.map((m) => m.label);
                  const dataValues = filteredMonths.map((m) => m.value);

                  // 5️⃣ Get unique financial years for dropdown
                  const fyOptions = [
                    ...new Set(monthsWithDates.map((m) => m.year)),
                  ].sort((a, b) => a - b);

                  return (
                    <div className="chart-card large-chart">
                      <h3>Actual Head Count by Start Month</h3>

                      {/* Financial Year Dropdown */}
                      <select
                        value={selectedFY || ""}
                        onChange={(e) =>
                          setSelectedFY(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : null,
                          )
                        }
                        style={{
                          marginBottom: 12,
                          width: "20%", // Adjust as needed
                          padding: "4px 8px",
                          fontSize: 14,
                        }}
                      >
                        <option value="">All Years</option>
                        {fyOptions.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>

                      {/* Toggle Actual HC */}
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginBottom: 8,
                          cursor: "pointer",
                          alignItems: "center",
                        }}
                        onClick={() => setShowStartMonthHC(!showStartMonthHC)}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: "#46b0e9",
                            opacity: showStartMonthHC ? 1 : 0.3,
                            borderRadius: 3,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 12,
                            opacity: showStartMonthHC ? 1 : 0.5,
                          }}
                        >
                          Actual HC (
                          {filteredMonths
                            .reduce((a, b) => a + b.value, 0)
                            .toFixed(2)}
                          )
                        </span>
                      </div>

                      {/* Bar Chart */}
                      <div className="chart-container">
                        <Bar
                          data={{
                            labels: sortedMonths,
                            datasets: showStartMonthHC
                              ? [
                                  {
                                    label: "Actual HC",
                                    data: dataValues,
                                    backgroundColor: "#46b0e9",
                                    borderRadius: 6,
                                  },
                                ]
                              : [],
                          }}
                          plugins={[ChartDataLabels]}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              datalabels: {
                                anchor: "end",
                                align: "end",
                                color: "#000",
                                font: { weight: "bold", size: 11 },
                                formatter: (value) => value.toFixed(2),
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

              {/* ===================== 2️⃣ HC vs Contract Line Chart ===================== */}
              {areaChartData && (
                <div className="chart-card large-chart">
                  <h3>Head Count vs Contract Value</h3>

                  {/* Year Dropdown */}
                  {(() => {
                    // 1️⃣ Extract years from areaChartData.months
                    const years = [
                      ...new Set(
                        areaChartData.months.map((m) => {
                          const [, yr] = m.split("-"); // Ignore month
                          return parseInt(yr, 10) + 2000; // "25" -> 2025
                        }),
                      ),
                    ].sort((a, b) => a - b);

                    return (
                      <select
                        value={selectedFY2 || ""}
                        onChange={(e) =>
                          setSelectedFY2(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : null,
                          )
                        }
                        style={{
                          marginBottom: 12,
                          width: "20%", // Adjust as needed
                          padding: "4px 8px",
                          fontSize: 14,
                        }}
                      >
                        <option value="">All Years</option>
                        {years.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    );
                  })()}

                  {/* Toggle datasets */}
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        label: "Head Count",
                        color: "#af4c96",
                        data: areaChartData.hcValues.map(Number),
                      },
                      {
                        label: "Contract Value",
                        color: "#4caf50",
                        data: areaChartData.contractValues
                          ? areaChartData.contractValues.map(Number)
                          : [],
                      },
                    ].map((ds, i) => {
                      const filteredIndices = selectedFY2
                        ? areaChartData.months
                            .map((m, idx) => {
                              const [, yr] = m.split("-");
                              const fullYear = parseInt(yr, 10) + 2000;
                              return fullYear === selectedFY2 ? idx : null;
                            })
                            .filter((idx) => idx !== null)
                        : areaChartData.months.map((_, idx) => idx);

                      const filteredData = filteredIndices.map(
                        (idx) => ds.data[idx],
                      );
                      const total = filteredData.reduce((sum, v) => sum + v, 0);
                      const isActive = trend1Visible[i];

                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const updated = [...trend1Visible];
                            updated[i] = !updated[i];
                            setTrend1Visible(updated);
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: ds.color,
                              opacity: isActive ? 1 : 0.3,
                              borderRadius: 3,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: 12,
                              opacity: isActive ? 1 : 0.5,
                            }}
                          >
                            {ds.label} ({total.toFixed(2)})
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Line Chart */}
                  <div className="chart-container">
                    <Line
                      ref={trend1ChartRef}
                      data={{
                        labels: selectedFY2
                          ? areaChartData.months
                              .map((m, idx) => {
                                const [, yr] = m.split("-");
                                const fullYear = parseInt(yr, 10) + 2000;
                                return fullYear === selectedFY2 ? m : null;
                              })
                              .filter(Boolean)
                          : areaChartData.months,
                        datasets: [
                          trend1Visible[0] && {
                            label: "Head Count",
                            data: selectedFY2
                              ? areaChartData.hcValues.filter((_, idx) => {
                                  const [, yr] =
                                    areaChartData.months[idx].split("-");
                                  return (
                                    parseInt(yr, 10) + 2000 === selectedFY2
                                  );
                                })
                              : areaChartData.hcValues,
                            borderColor: "#af4c96",
                            backgroundColor: "rgba(114,1,75,0.3)",
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                          },
                          trend1Visible[1] && {
                            label: "Contract Value",
                            data: selectedFY2
                              ? areaChartData.contractValues.filter(
                                  (_, idx) => {
                                    const [, yr] =
                                      areaChartData.months[idx].split("-");
                                    return (
                                      parseInt(yr, 10) + 2000 === selectedFY2
                                    );
                                  },
                                )
                              : areaChartData.contractValues,
                            borderColor: "#4caf50",
                            backgroundColor: "rgba(76,175,80,0.3)",
                            fill: false,
                            tension: 0.3,
                            pointRadius: 4,
                          },
                        ].filter(Boolean),
                      }}
                      plugins={[ChartDataLabels]}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                          padding: { top: 20, right: 30, bottom: 10, left: 0 },
                        },
                        plugins: {
                          legend: { display: false },
                          datalabels: {
                            anchor: "end",
                            align: "top",
                            offset: 4,
                            color: "#000",
                            font: { weight: "bold", size: 11 },
                            formatter: (value) =>
                              value !== undefined ? value.toFixed(2) : "0.00",
                          },
                        },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ===================== 3️⃣ HC by Business Group ===================== */}
              {Object.keys(hcByBG).length > 0 && (
                <div className="chart-card large-chart">
                  <h3>Head Count by Business Group</h3>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 8,
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                    onClick={() => setShowBgHC(!showBgHC)}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FF9800",
                        opacity: showBgHC ? 1 : 0.3,
                        borderRadius: 3,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        opacity: showBgHC ? 1 : 0.5,
                      }}
                    >
                      HC (
                      {Object.values(hcByBG)
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2)}
                      )
                    </span>
                  </div>

                  <div className="chart-container">
                    <Bar
                      data={{
                        labels: Object.keys(hcByBG),
                        datasets: showBgHC
                          ? [
                              {
                                label: "HC",
                                data: Object.values(hcByBG),
                                backgroundColor: "#FF9800",
                                borderRadius: 6,
                              },
                            ]
                          : [],
                      }}
                      plugins={[ChartDataLabels]}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          datalabels: {
                            anchor: "end",
                            align: "end",
                            color: "#000",
                            font: { weight: "bold", size: 11 },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ===================== 4️⃣ HC by Stakeholder (Doughnut) ===================== */}
              {Object.keys(hcByStakeholder).length > 0 && (
                <div className="chart-card large-chart">
                  <h3>Head Count by Stakeholder</h3>

                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {Object.entries(hcByStakeholder)
                      .filter(([k]) => k && k !== "Unknown")
                      .map(([label, value], i) => {
                        const safeVal = safeNumber(value);
                        const isActive = stakeholderVisible[i];
                        const colors = [
                          "#009688",
                          "#2196F3",
                          "#FF9800",
                          "#9C27B0",
                          "#F44336",
                          "#00BCD4",
                          "#8BC34A",
                          "#FFC107",
                        ];
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const updated = [...stakeholderVisible];
                              updated[i] = !updated[i];
                              setStakeholderVisible(updated);
                            }}
                          >
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: colors[i],
                                opacity: isActive ? 1 : 0.3,
                                borderRadius: 3,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 500,
                                fontSize: 12,
                                opacity: isActive ? 1 : 0.5,
                              }}
                            >
                              {label} ({safeVal.toFixed(2)})
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="chart-container">
                    <Doughnut
                      data={{
                        labels: Object.entries(hcByStakeholder)
                          .filter(([k]) => k && k !== "Unknown")
                          .map(([label]) => label),
                        datasets: [
                          {
                            data: Object.entries(hcByStakeholder)
                              .filter(([k]) => k && k !== "Unknown")
                              .map(([_, v], i) =>
                                stakeholderVisible[i] ? safeNumber(v) : 0,
                              ),
                            backgroundColor: [
                              "#009688",
                              "#2196F3",
                              "#FF9800",
                              "#9C27B0",
                              "#F44336",
                              "#00BCD4",
                              "#8BC34A",
                              "#FFC107",
                            ],
                          },
                        ],
                      }}
                      plugins={[ChartDataLabels]}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "45%",
                        plugins: {
                          legend: { display: false },
                          datalabels: {
                            anchor: "center",
                            align: "center",
                            color: "#fff",
                            font: { weight: "bold", size: 11 },
                            formatter: (value) =>
                              value !== undefined && value !== 0
                                ? value.toFixed(2)
                                : "",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {/* ---------- TrendView2 Charts ---------- */}

          {activeTrendView === "TrendView2" &&
            hcBillableKey &&
            quarterlyLossKey &&
            monthlyRevenueKey &&
            (() => {
              const rampCharts = [
                { title: "Project-wise Ramp Down", key: projectKey },
                { title: "Process-wise Ramp Down", key: processKey },
                { title: "Stakeholder-wise Ramp Down", key: stakeholderKey },
              ];

              const monthToQuarter = {
                Jan: "Q1",
                Feb: "Q1",
                Mar: "Q1",
                Apr: "Q2",
                May: "Q2",
                Jun: "Q2",
                Jul: "Q3",
                Aug: "Q3",
                Sep: "Q3",
                Oct: "Q4",
                Nov: "Q4",
                Dec: "Q4",
              };

              const calendarOrder = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];

              // ---------- Aggregate data ----------
              const rampData = rampCharts
                .map(({ title, key }) => {
                  const rampDataByMonth = {};
                  const rampDataByQuarter = {};

                  filteredData.forEach((row) => {
                    const monthRaw = row[rampDownMonthKey];
                    if (!monthRaw) return;

                    const [monthName, yearPart] = monthRaw.split("-");
                    const yearFull = parseInt(yearPart, 10) + 2000;
                    const quarter = monthToQuarter[monthName] || "Unknown";
                    const monthKey = `${monthName}-${yearFull}`;
                    const quarterKey = `${quarter}-${yearFull}`;

                    // Month-wise
                    if (!rampDataByMonth[monthKey])
                      rampDataByMonth[monthKey] = { hc: 0, quarterlyLoss: 0 };
                    rampDataByMonth[monthKey].hc += safeNumber(
                      row[hcBillableKey],
                    );
                    rampDataByMonth[monthKey].quarterlyLoss += safeNumber(
                      row[quarterlyLossKey],
                    );

                    // Quarter-wise
                    if (!rampDataByQuarter[quarterKey])
                      rampDataByQuarter[quarterKey] = {
                        hc: 0,
                        quarterlyLoss: 0,
                      };
                    rampDataByQuarter[quarterKey].hc += safeNumber(
                      row[hcBillableKey],
                    );
                    rampDataByQuarter[quarterKey].quarterlyLoss += safeNumber(
                      row[quarterlyLossKey],
                    );
                  });

                  return { title, rampDataByMonth, rampDataByQuarter };
                })
                .filter((d) => Object.keys(d.rampDataByMonth).length > 0);

              if (!rampData.length) {
                return (
                  <p style={{ color: "red", padding: 20 }}>
                    No Ramp Down data available.
                  </p>
                );
              }

              // ---------- Render charts ----------
              return rampData.map(
                ({ title, rampDataByMonth, rampDataByQuarter }, chartIndex) => {
                  if (!rampChartRefs.current[chartIndex])
                    rampChartRefs.current[chartIndex] = React.createRef();

                  const allMonths = Object.keys(rampDataByMonth);
                  const yearsOptions = [
                    ...new Set(
                      allMonths.map((m) => parseInt(m.split("-")[1], 10)),
                    ),
                  ].sort((a, b) => a - b);

                  // ---------- Validation ----------
                  // ---------- Validation ----------
                  if (
                    quarterChangedByUser[title] &&
                    !selectedRampYear &&
                    selectedQuarter !== "All Months"
                  ) {
                    return (
                      <div
                        className="chart-card large-chart"
                        key={title}
                        style={{ padding: 20 }}
                      >
                        <h3>{title}</h3>

                        <select
                          value={selectedRampYear || ""}
                          onChange={(e) =>
                            setSelectedRampYear(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : null,
                            )
                          }
                          style={{
                            width: "20%",
                            padding: "4px 8px",
                            fontSize: 14,
                            border: "2px solid red",
                          }}
                        >
                          <option value="">Select Year</option>
                          {yearsOptions.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>

                        <p style={{ color: "red", marginTop: 8 }}>
                          Please select a year from the dropdown to view the
                          chart.
                        </p>
                      </div>
                    );
                  }

                  // ---------- Build labels and datasets ----------
                  let xLabels = [],
                    hcData = [],
                    quarterlyLossData = [];

                  if (selectedQuarter === "All Months") {
                    const filteredMonths = selectedRampYear
                      ? allMonths.filter(
                          (m) =>
                            parseInt(m.split("-")[1], 10) === selectedRampYear,
                        )
                      : allMonths;

                    xLabels = filteredMonths.sort((a, b) => {
                      const [monA, yrA] = a.split("-"),
                        [monB, yrB] = b.split("-");
                      const yearDiff = parseInt(yrA) - parseInt(yrB);
                      return yearDiff !== 0
                        ? yearDiff
                        : calendarOrder.indexOf(monA) -
                            calendarOrder.indexOf(monB);
                    });

                    hcData = xLabels.map((m) => rampDataByMonth[m]?.hc || 0);
                    quarterlyLossData = xLabels.map(
                      (m) => rampDataByMonth[m]?.quarterlyLoss || 0,
                    );
                  } else if (selectedQuarter === "All Quarters") {
                    const filteredQuarters = Object.keys(
                      rampDataByQuarter,
                    ).filter(
                      (q) =>
                        !selectedRampYear ||
                        parseInt(q.split("-")[1], 10) === selectedRampYear,
                    );
                    const yr =
                      selectedRampYear ||
                      parseInt(filteredQuarters[0]?.split("-")[1] || 2000, 10);
                    xLabels = quarterOrder.map((q) => `${q}-${yr}`);
                    hcData = xLabels.map((q) => rampDataByQuarter[q]?.hc || 0);
                    quarterlyLossData = xLabels.map(
                      (q) => rampDataByQuarter[q]?.quarterlyLoss || 0,
                    );
                  } else {
                    const filteredQuarters = Object.keys(
                      rampDataByQuarter,
                    ).filter(
                      (q) =>
                        q.startsWith(selectedQuarter) &&
                        (!selectedRampYear ||
                          parseInt(q.split("-")[1], 10) === selectedRampYear),
                    );
                    xLabels = filteredQuarters.length
                      ? filteredQuarters
                      : [`${selectedQuarter}-${selectedRampYear || 2000}`];
                    hcData = xLabels.map((q) => rampDataByQuarter[q]?.hc || 0);
                    quarterlyLossData = xLabels.map(
                      (q) => rampDataByQuarter[q]?.quarterlyLoss || 0,
                    );
                  }

                  const activeState = rampActiveDatasets[chartIndex] || [
                    true,
                    true,
                  ];
                  const datasets = [
                    {
                      label: "HC (Billable Only)",
                      color: "#4caf50",
                      data: hcData,
                      yAxisID: "yHC",
                      type: "line",
                      tension: 0.3,
                      fill: false,
                      pointRadius: 5,
                    },
                    {
                      label: "Quarterly Loss",
                      color: "#8e5ea2",
                      data: quarterlyLossData,
                      yAxisID: "yRev",
                      type: "bar",
                    },
                  ];

                  const toggleDataset = (i) => {
                    const newActive = [...activeState];
                    newActive[i] = !newActive[i];
                    const updatedAll = [...rampActiveDatasets];
                    updatedAll[chartIndex] = newActive;
                    setRampActiveDatasets(updatedAll);

                    const chart = rampChartRefs.current[chartIndex].current;
                    if (chart) {
                      chart.data.datasets[i].hidden = !newActive[i];
                      chart.update();
                    }
                  };

                  // ---------- Render ----------
                  return (
                    <div className="chart-card large-chart" key={title}>
                      <h3>{title}</h3>

                      <div
                        style={{ display: "flex", gap: 12, marginBottom: 12 }}
                      >
                        <select
                          value={selectedRampYear || ""}
                          onChange={(e) =>
                            setSelectedRampYear(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : null,
                            )
                          }
                          style={{
                            width: "25%",
                            padding: "4px 8px",
                            fontSize: 14,
                          }}
                        >
                          <option value="">All Years</option>
                          {yearsOptions.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedQuarter || "All Months"}
                          onChange={(e) => {
                            setSelectedQuarter(e.target.value);

                            // 👇 make validation chart-specific using title
                            setQuarterChangedByUser((prev) => ({
                              ...prev,
                              [title]: true,
                            }));
                          }}
                          style={{
                            width: "25%",
                            padding: "4px 8px",
                            fontSize: 14,
                          }}
                        >
                          <option value="All Months">All Months</option>
                          <option value="All Quarters">All Quarters</option>
                          {quarterOrder.map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Legend */}
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {datasets.map((ds, i) => {
                          const total = ds.data.reduce((sum, v) => sum + v, 0);
                          const isActive = activeState[i];
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                cursor: "pointer",
                              }}
                              onClick={() => toggleDataset(i)}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: ds.color,
                                  opacity: isActive ? 1 : 0.3,
                                  borderRadius: 3,
                                }}
                              />
                              <span
                                style={{
                                  fontWeight: 500,
                                  fontSize: 12,
                                  opacity: isActive ? 1 : 0.5,
                                }}
                              >
                                {ds.label} ({total.toFixed(2)})
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="chart-container">
                        <Bar
                          ref={rampChartRefs.current[chartIndex]}
                          data={{
                            labels: xLabels.map((l) => {
                              const [p, y] = l.split("-");
                              return `${p}-${y.slice(-2)}`;
                            }),
                            datasets: datasets.map((ds, i) => ({
                              ...ds,
                              backgroundColor: activeState[i]
                                ? ds.color
                                : `${ds.color}55`,
                              borderColor: activeState[i]
                                ? ds.color
                                : `${ds.color}55`,
                            })),
                          }}
                          plugins={[ChartDataLabels]}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                              padding: {
                                top: 15,
                                bottom: 0,
                                left: 0,
                                right: 0,
                              },
                            },
                            plugins: {
                              legend: { display: false },
                              datalabels: {
                                anchor: "end",
                                align: "end",
                                color: "#000",
                                font: { weight: "bold", size: 11 },
                              },
                            },
                            scales: {
                              yHC: {
                                type: "linear",
                                beginAtZero: true,
                                position: "left",
                                title: { display: true, text: "HC (Billable)" },
                              },
                              yRev: {
                                type: "linear",
                                beginAtZero: true,
                                position: "right",
                                grid: { drawOnChartArea: false },
                                title: {
                                  display: true,
                                  text: "Quarterly Loss (USD)",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              );
            })()}
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <div className="logo">📊 Opportunity Tracker</div>
        <div className="topbar-right">
          <span>
            {user?.Name} ({user?.Role})
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        <Sidebar
          dynamicTrends={dynamicTrends}
          activePage={activePage}
          activeTrendId={
            dynamicTrends.find((t) => t.file === selectedTrendCsv)?.id
          }
          onMenuSelect={setActivePage}
          onTrendClick={handleTrendClick} // ✅ now it's used
        />

        {/* Loader overlay limited to this section */}
        {(loading || showLoader) && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "110vh",
              backgroundColor: "rgba(0, 0, 0, 0.65)", // semi-transparent overlay
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              pointerEvents: "all",
            }}
          >
            <div
              style={{
                border: "8px solid #f3f3f3",
                borderTop: "8px solid #46b0e9",
                borderRadius: "50%",
                width: 60,
                height: 60,
                animation: "spin 1s linear infinite",
                marginBottom: 15,
                marginLeft: 200,
              }}
            />
            <div
              style={{
                marginLeft: 212,
              }}
            >
              {" "}
              Loading...{" "}
            </div>
            <style>
              {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
            </style>
          </div>
        )}

        <div className="content">
          <h2>
            {activePage === "trends"
              ? selectedTrendTitle || pageTitles[activePage]
              : pageTitles[activePage]}
          </h2>
          {activePage === "trends" && (
            <div
              style={{
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
              }}
            >
              <label htmlFor="ownerFilter">Filter by Owner: </label>
              <select
                id="ownerFilter"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                style={{ padding: "5px 10px", marginLeft: 10 }}
              >
                {ownerList.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>

              <select
                style={{ marginLeft: 20, padding: "5px 10px" }}
                onChange={(e) => handleDownloadFullSection(e.target.value)}
              >
                <option value="">Download As</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
          )}
          {/* Section wrapper for charts & table */}
          <div
            style={{ position: "relative", width: "100%", minHeight: "400px" }}
          >
            {/* Charts & KPI */}
            <div ref={chartSectionRef}>
              {activePage === "trends" && (
                <>
                  <div className="kpi-row">
                    {kpiValues.map((card, idx) => (
                      <div className="kpi-card" key={idx}>
                        <div>
                          <h3>{card.title}</h3>
                          <div className="kpi-total">
                            {card.isUSD ? formatUSD(card.value) : card.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {renderAllCharts()}
                </>
              )}

              {/* Tracker table */}
              {[
                "new-transitions",
                "ramp-down-project",
                "new-joiner-list",
                "attrition",
                "project-details",
                "orm-demand",
                "bt-tracker",
                "kakushin",
                "automation",
                "rewards",
                "revenue",
              ].includes(activePage) && renderTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
