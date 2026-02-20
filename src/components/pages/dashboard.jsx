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
import PptxGenJS from "pptxgenjs";
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
  const [selectedTableYear1, setSelectedTableYear1] = useState(null);
  const monthlyContractValueKey = React.useMemo(() => {
    if (!headers?.length) return "Monthly Contract Value";

    return (
      headers.find(
        (h) =>
          h.toLowerCase().includes("contract") &&
          h.toLowerCase().includes("value"),
      ) || "Monthly Contract Value"
    );
  }, [headers]);

  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("trends");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [showLoader, setShowLoader] = useState(true);
  const [filesList, setFilesList] = useState([]);
  const [selectedFY, setSelectedFY] = React.useState(null); // null means "All Years"
  const fjChartRef = React.useRef(null);
  const rampChartRefs = useRef([]); // array of refs for Ramp Down charts
  //const [rampActiveDatasets, setRampActiveDatasets] = useState(
  // Array(4).fill([true, true, true]), // 4 charts, each with 3 datasets initially active
  // );

  // Ensure these keys exist (replace headers with your CSV headers array)

  const [selectedRampYear, setSelectedRampYear] = React.useState(null);
  const [selectedQuarter, setSelectedQuarter] = React.useState("All Months");
  const [showChart, setShowChart] = React.useState("HC"); // default to HC chart
  //const [quarterChangedByUser, setQuarterChangedByUser] = useState({});
  // Define exact CSV column names

  //const rampDownKey = "Ramp down Month"; // exact column name in your CSV

  // For TrendView1 interactive legend
  const trend1ChartRef = React.createRef();
  const [trend1Visible, setTrend1Visible] = useState([true, true]);
  //const [showStartMonthHC, setShowStartMonthHC] = useState(true);
  const [showBgHC, setShowBgHC] = useState(true);
  const [stakeholderVisible, setStakeholderVisible] = useState([]);
  const [selectedFY2, setSelectedFY2] = useState(null);

  const [activeTrendView, setActiveTrendView] = useState("TrendView1");
  const [trendView1Layout, setTrendView1Layout] = useState("1x2"); // default for TrendView1
  const [trendView2Layout, setTrendView2Layout] = useState("1x2"); // default for TrendView2
  const [trendView3Layout, setTrendView3Layout] = useState("1x2"); // default for TrendView3
  // ----------------------------
  // Safe parsing functions
  // ----------------------------
  const parseHC = (val) => {
    if (!val) return 0;
    return Number(val) || 0; // handles 1.5, 2, 0
  };

  const parseMoney = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/[$,]/g, ""); // remove $ and commas
    return Number(cleaned) || 0;
  };

  // Touch Scroll table//
  const tableRef1 = useRef(null);
  const tableRef2 = useRef(null);
  // const tableRef3 = useRef(null);
  const setTableRef1 = (el) => {
    if (el) {
      tableRef1.current = el;
      attachDrag(el, "Table1");
    }
  };

  const setTableRef2 = (el) => {
    if (el) {
      tableRef2.current = el;
      attachDrag(el, "Table2");
    }
  };

  // const setTableRef3 = (el) => {
  //   if (el) {
  //     tableRef3.current = el;
  //     attachDrag(el, "Table2");
  //   }
  // };

  // attachDrag function same as before, defined outside
  const attachDrag = (slider, tableName) => {
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const dragStart = (x, y) => {
      isDown = true;
      startX = x;
      startY = y;
      scrollLeft = slider.scrollLeft;
      scrollTop = slider.scrollTop;
      slider.classList.add("dragging");
      // console.log(`[${tableName}] Drag started`);
    };

    const dragEnd = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("dragging");
      // console.log(`[${tableName}] Drag stopped`);
    };

    const dragMove = (x, y) => {
      if (!isDown) return;
      const dx = x - startX;
      const dy = y - startY;
      slider.scrollLeft = scrollLeft - dx * 1.5;
      slider.scrollTop = scrollTop - dy * 1.2;
      // console.log(`[${tableName}] Dragging`, {
      // scrollLeft: slider.scrollLeft,
      // scrollTop: slider.scrollTop,
      //});
    };

    slider.addEventListener("mousedown", (e) =>
      dragStart(e.clientX, e.clientY),
    );
    slider.addEventListener("mousemove", (e) => {
      e.preventDefault();
      dragMove(e.clientX, e.clientY);
    });
    slider.addEventListener("mouseup", dragEnd);
    slider.addEventListener("mouseleave", dragEnd);

    slider.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          dragStart(touch.clientX, touch.clientY);
        }
      },
      { passive: false },
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (!isDown || e.touches.length !== 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        dragMove(touch.clientX, touch.clientY);
      },
      { passive: false },
    );

    slider.addEventListener("touchend", dragEnd);

    slider.addEventListener(
      "wheel",
      (e) => {
        if (e.shiftKey || Math.abs(e.deltaX) > 0) {
          slider.scrollLeft += e.deltaY;
          e.preventDefault();
          console.log(`[${tableName}] Wheel scroll`, slider.scrollLeft);
        }
      },
      { passive: false },
    );
  };

  // ---------- Column keys ----------
  const [selectedTableYear, setSelectedTableYear] = useState(null);
  //const monthKey = "Ramp down Month"; // Correct Month column

  // Detect if currently selected CSV is Ramp Down
  const chartSectionRef = React.useRef();
  const trackingPageCsvMap = useMemo(
    () => ({
      "new-transitions": `Application_Data_Opportunity_Tracker.csv`,
      "ramp-down-project": `Application_Data_Ramp_Down.csv`,
      "new-joiner-list": `Member_Detail.csv`,
    }),
    [],
  );
  const wrapCell = {
    padding: 8,
    border: "1px solid #999",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    verticalAlign: "middle",
  };
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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // 🔴 FORCE BOTH layouts when mobile
      if (mobile) {
        setTrendView1Layout("3x1");
        setTrendView2Layout("3x1");
        setTrendView3Layout("3x1");
      }
    };

    handleResize(); // run on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownloadFullSection = async (type) => {
    if (!chartSectionRef.current) return;

    if (type === "ppt") {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";

      // Grab all charts with the .ppt-export class
      const charts = document.querySelectorAll(".ppt-export");
      if (!charts.length) {
        alert("No charts found");
        return;
      }

      for (let i = 0; i < charts.length; i++) {
        const el = charts[i];

        // Ensure the chart is visible before capture
        el.scrollIntoView({ block: "center" });

        // Small delay to allow render stabilization
        await new Promise((r) => setTimeout(r, 500));

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: document.body.scrollWidth,
          windowHeight: document.body.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");

        const slide = pptx.addSlide();
        slide.addImage({
          data: imgData,
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 5,
        });
      }

      // Save PPTX after all charts are added
      pptx.writeFile("Dashboard.pptx");
    } else if (type === "png" || type === "jpg") {
      // Capture entire chart section for PNG / JPG
      const canvas = await html2canvas(chartSectionRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `dashboard.${type}`;
      link.href =
        type === "png"
          ? canvas.toDataURL("image/png")
          : canvas.toDataURL("image/jpeg", 1.0);
      link.click();
    }
  };

  // ================= OWNER FILTER =================
  const filteredData = useMemo(() => {
    if (selectedOwner === "All") return jsonData;

    const ownerKey = headers
      .find((h) => h.toLowerCase().includes("owner"))
      ?.trim();
    if (!ownerKey) return jsonData;

    return jsonData.filter(
      (row) => row[ownerKey]?.toString().trim() === selectedOwner,
    );
  }, [jsonData, selectedOwner, headers]);

  // 2️⃣ Owner list with trimmed, cleaned values
  const ownerList = useMemo(() => {
    if (!jsonData.length) return [];

    const ownerKey = headers
      .find((h) => h.toLowerCase().includes("owner"))
      ?.trim();
    if (!ownerKey) return [];

    const owners = Array.from(
      new Set(
        jsonData
          .map((row) => row[ownerKey]?.toString().trim())
          .filter((v) => v && v !== "`"), // remove empty/backtick
      ),
    ).sort();

    return ["All", ...owners];
  }, [jsonData, headers]);

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
      if (activeTrendView === "TrendView3") {
        // ---------- TrendView3 KPIs ----------
        const memberKey = headers.find((h) => h.trim() === "Member Name");
        const fjLevelKey = headers.find((h) => h.trim() === "FJ level");
        const jlptLevelKey = headers.find(
          (h) => h.trim() === "JLPT Level/Major Skill",
        );

        const totalMember = memberKey
          ? filteredData.filter(
              (row) =>
                row[memberKey] && row[memberKey].toString().trim() !== "",
            ).length
          : 0;

        const totalFJLevel = fjLevelKey
          ? filteredData.filter(
              (row) =>
                row[fjLevelKey] && row[fjLevelKey].toString().trim() !== "",
            ).length
          : 0;

        const totalJLPTLevel = jlptLevelKey
          ? filteredData.filter(
              (row) =>
                row[jlptLevelKey] && row[jlptLevelKey].toString().trim() !== "",
            ).length
          : 0;

        return [
          { title: "Total Member", value: totalMember },
          { title: "Total FJ Level", value: totalFJLevel },
          { title: "Total JLPT Level", value: totalJLPTLevel },
        ];
      } else {
        // ---------- TrendView1 & TrendView2 KPIs ----------
        const totalOpportunity = filteredData.filter(
          (row) => row[firstCol] && String(row[firstCol]).trim() !== "",
        ).length;

        const totalRampDown = filteredData.filter(
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
          ? filteredData.reduce(
              (sum, row) => sum + safeNumber(row[amountKey]),
              0,
            )
          : 0;

        const totalMonthly = totalAmount / 3;
        const totalYearly = totalAmount * 4;

        const firstKpi =
          activeTrendView === "TrendView1"
            ? { title: "Total Opportunity", value: totalOpportunity }
            : { title: "Total RampDown", value: totalRampDown };

        return [
          firstKpi,
          { title: "Total HC", value: totalHC },
          { title: "Total Amount (Monthly)", value: totalMonthly, isUSD: true },
          { title: "Total Amount (Yearly)", value: totalYearly, isUSD: true },
        ];
      }
    }

    return [];
  }, [filteredData, headers, activePage, activeTrendView]);

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
    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `${process.env.PUBLIC_URL}/files.json?v=${Date.now()}`,
        );
        const data = await res.json();
        // Pick the latest timestamp key
        const latestKey = Object.keys(data).sort().pop();
        if (latestKey && Array.isArray(data[latestKey])) {
          setFilesList(data[latestKey]);
        }
      } catch (err) {
        console.error("Error loading files.json:", err);
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only run if we have trends and no CSV selected yet
    if (!dynamicTrends || dynamicTrends.length === 0) return;
    if (selectedTrendCsv) return; // already initialized

    const firstTrend = dynamicTrends[0];

    setSelectedTrendCsv(firstTrend.file); // immediately select first CSV
    setSelectedTrendTitle(firstTrend.label);
    setActiveTrendView("TrendView1"); // always default to TrendView1
  }, [dynamicTrends, selectedTrendCsv]); // ✅ dependencies only on real variables

  // Timestamp updated by your watcher whenever CSV changes
  const [filesTimestamp] = useState(Date.now()); // optional
  useEffect(() => {
    if (!selectedTrendCsv) return;

    let lastCsvText = "";
    let isMounted = true;

    const fetchCsv = async () => {
      const csvUrl = `${process.env.PUBLIC_URL}/${selectedTrendCsv}?t=${filesTimestamp}`;
      console.log("Fetching CSV due to timestamp change:", csvUrl);

      try {
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
        const csvText = await res.text();

        if (csvText && csvText !== lastCsvText) {
          lastCsvText = csvText;

          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              if (!isMounted) return;

              const cleanHeaders = Object.keys(results.data[0] || {}).filter(
                (h) => h && h.trim() !== "",
              );

              const cleanedData = results.data.map((row) => {
                const newRow = {};
                cleanHeaders.forEach((h) => (newRow[h] = row[h]));
                return newRow;
              });

              setJsonData(cleanedData);
              setHeaders(cleanHeaders);
              setLoading(false);
              setShowLoader(false);
            },
          });
        }
      } catch (err) {
        console.error("CSV fetch error:", err);
      }
    };

    fetchCsv();

    return () => {
      isMounted = false;
    };
  }, [selectedTrendCsv, filesTimestamp]);

  const formatUSD = (val) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)} M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)} K`;
    return `$${val}`;
  };

  const handleTrendClick = (csvFile, label) => {
    setSelectedTrendCsv(csvFile);
    setSelectedTrendTitle(label);

    const lowerFile = csvFile.toLowerCase();

    if (lowerFile.includes("ramp")) {
      setActiveTrendView("TrendView2"); // Ramp Down Project
    } else if (lowerFile.includes("member") || lowerFile.includes("joiner")) {
      setActiveTrendView("TrendView3"); // Member Detail / New Joiner List
    } else {
      setActiveTrendView("TrendView1"); // Portfolio Health
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
          {filteredData.map((row, i) => (
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
    //const processKey = getKey(["process"]) || "dummyProcess";

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
        {activeTrendView === "TrendView1" && !isMobile && (
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
        {activeTrendView === "TrendView2" && !isMobile && (
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

        {/* ---------- TrendView3 Layout Dropdown ---------- */}
        {activeTrendView === "TrendView3" && !isMobile && (
          <div
            style={{ marginBottom: 20, display: "flex", alignItems: "center" }}
          >
            <label htmlFor="trendView3Layout">Select TrendView3 Layout: </label>
            <select
              id="trendView3Layout"
              value={trendView3Layout}
              onChange={(e) => setTrendView3Layout(e.target.value)}
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
                : activeTrendView === "TrendView2"
                  ? trendView2Layout
                  : activeTrendView === "TrendView3"
                    ? trendView3Layout
                    : "1fr", // fallback
            ),
          }}
        >
          {/* ---------- TrendView1 Charts ---------- */}
          {activeTrendView === "TrendView1" && (
            <>
              {/* ===================== 🆕 2️⃣ OWNER QUARTERLY HC & CONTRACT TABLE ===================== */}

              {startMonthKey &&
                actualHcKey &&
                monthlyContractValueKey &&
                (() => {
                  const tableYearsOptions1 = [
                    ...new Set(
                      filteredData
                        .map((row) => {
                          const m = row[startMonthKey];
                          if (!m) return null;
                          return parseInt(m.split("-")[1], 10) + 2000;
                        })
                        .filter(Boolean),
                    ),
                  ].sort((a, b) => a - b);

                  const tableFilteredData1 = selectedTableYear1
                    ? filteredData.filter((row) => {
                        const m = row[startMonthKey];
                        if (!m) return false;
                        const yr = parseInt(m.split("-")[1], 10) + 2000;
                        return yr === selectedTableYear1;
                      })
                    : filteredData;

                  return (
                    <div className="chart-card ppt-export">
                      <h3>Owner Quarterly HC & Contract Value</h3>

                      {/* Year dropdown */}
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ marginRight: 8 }}>Select Year:</label>

                        <select
                          value={selectedTableYear1 || ""}
                          onChange={(e) =>
                            setSelectedTableYear1(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : null,
                            )
                          }
                          style={{ padding: "4px 8px", fontSize: 14 }}
                        >
                          <option value="">All Years</option>
                          {tableYearsOptions1.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div ref={setTableRef1} className="table-responsive">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th rowSpan={2} style={wrapCell}>
                                Owner
                              </th>
                              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                <th key={q} colSpan={2} style={wrapCell}>
                                  {q}
                                </th>
                              ))}
                            </tr>

                            <tr>
                              {["Q1", "Q2", "Q3", "Q4"].flatMap((q) => [
                                <th key={`${q}-hc`} style={wrapCell}>
                                  HC
                                </th>,
                                <th key={`${q}-cv`} style={wrapCell}>
                                  Contract Value
                                </th>,
                              ])}
                            </tr>
                          </thead>

                          <tbody>
                            {[
                              ...new Set(
                                tableFilteredData1
                                  .map((r) => (r?.Owner || "").trim())
                                  .filter(Boolean),
                              ),
                            ].map((owner) => {
                              const quarters = ["Q1", "Q2", "Q3", "Q4"];

                              const values = quarters.map((q) => {
                                const rows = tableFilteredData1.filter(
                                  (row) => {
                                    if (!row?.Owner) return false;
                                    if (row.Owner.trim() !== owner)
                                      return false;

                                    const m = row[startMonthKey];
                                    if (!m) return false;

                                    const monthIndex =
                                      new Date(`1-${m}`).getMonth() + 1;

                                    const quarter =
                                      monthIndex <= 3
                                        ? "Q1"
                                        : monthIndex <= 6
                                          ? "Q2"
                                          : monthIndex <= 9
                                            ? "Q3"
                                            : "Q4";

                                    return quarter === q;
                                  },
                                );

                                return {
                                  hc: rows.reduce(
                                    (s, r) => s + (Number(r[actualHcKey]) || 0),
                                    0,
                                  ),
                                  cv: rows
                                    .reduce(
                                      (s, r) =>
                                        s +
                                        (Number(
                                          String(
                                            r[monthlyContractValueKey] || "",
                                          ).replace(/[$,]/g, ""),
                                        ) || 0),
                                      0,
                                    )
                                    .toFixed(2),
                                };
                              });

                              const allZero = values.every(
                                (v) => v.hc === 0 && Number(v.cv) === 0,
                              );
                              if (allZero) return null;

                              return (
                                <tr key={owner}>
                                  <td style={wrapCell}>{owner}</td>

                                  {values.flatMap((v, i) => [
                                    <td
                                      key={`${owner}-${i}-hc`}
                                      style={wrapCell}
                                    >
                                      {v.hc}
                                    </td>,
                                    <td
                                      key={`${owner}-${i}-cv`}
                                      style={wrapCell}
                                    >
                                      {v.cv}
                                    </td>,
                                  ])}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

              {/* ===================== 1️⃣ Actual HC by Start Month ===================== */}
              {startMonthKey &&
                actualHcKey &&
                hcBillableKey &&
                quarterlyLossKey &&
                (() => {
                  // ---------------- Prepare Actual HC Data ----------------
                  const monthsWithDates = Object.keys(hcByStartMonth)
                    .filter((m) => m && m !== "Unknown")
                    .map((m) => {
                      const [, yr] = m.split("-");
                      const fullYear = parseInt(yr, 10) + 2000;
                      const monthIndex = new Date(
                        `${m.split("-")[0]} 1, ${fullYear}`,
                      ).getMonth();
                      return {
                        label: m,
                        year: fullYear,
                        date: new Date(fullYear, monthIndex, 1),
                        value: Math.round(Number(hcByStartMonth[m] || 0)),
                      };
                    });

                  // ---------------- Prepare Ramp Down Data ----------------
                  const rampDownMonthKey = headers.find(
                    (h) => h.trim().toLowerCase() === "ramp down month",
                  );

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

                  const rampDataByMonth = {};
                  filteredData.forEach((row) => {
                    const monthRaw = row[rampDownMonthKey];
                    if (!monthRaw) return;

                    const [monthName, yearPart] = monthRaw.split("-");
                    const mKey = `${monthName}-${yearPart}`;

                    const hc = Math.round(
                      Number(safeNumber(row[hcBillableKey])),
                    );

                    // --- Clean Quarterly Loss ---
                    let lossRaw = row[quarterlyLossKey];
                    let loss = 0;
                    if (lossRaw) {
                      loss = parseFloat(
                        String(lossRaw).replace(/[\$,]/g, "").trim(),
                      );
                      loss = Math.round(isNaN(loss) ? 0 : loss);
                    }

                    if (!rampDataByMonth[mKey])
                      rampDataByMonth[mKey] = { hc: 0, quarterlyLoss: 0 };
                    rampDataByMonth[mKey].hc += hc;
                    rampDataByMonth[mKey].quarterlyLoss += loss;
                  });

                  // ---------------- FY Options ----------------
                  const hcYears = monthsWithDates.map((m) => m.year);
                  const rampYears = Object.keys(rampDataByMonth).map((m) => {
                    const [, yr] = m.split("-");
                    return parseInt(yr, 10) + 2000;
                  });
                  const fyOptions = [
                    ...new Set([...hcYears, ...rampYears]),
                  ].sort((a, b) => a - b);

                  // ---------------- Filter by Selected FY ----------------
                  const filteredMonths = selectedFY
                    ? monthsWithDates.filter((m) => m.year === selectedFY)
                    : monthsWithDates;

                  filteredMonths.sort((a, b) => a.date - b.date);
                  const sortedMonths = filteredMonths.map((m) => m.label);
                  const hcDataValues = filteredMonths.map((m) => m.value);

                  const rampMonths = Object.keys(rampDataByMonth)
                    .filter((m) => {
                      if (!selectedFY) return true;
                      const [, yr] = m.split("-");
                      const fullYear = parseInt(yr, 10) + 2000;
                      return fullYear === selectedFY;
                    })
                    .sort((a, b) => {
                      const [ma, ya] = a.split("-");
                      const [mb, yb] = b.split("-");
                      return ya !== yb
                        ? ya - yb
                        : calendarOrder.indexOf(ma) - calendarOrder.indexOf(mb);
                    });

                  const rampHC = rampMonths.map(
                    (m) => rampDataByMonth[m]?.hc || 0,
                  );
                  const rampLoss = rampMonths.map(
                    (m) => rampDataByMonth[m]?.quarterlyLoss || 0,
                  );

                  // ---------------- Render Chart Card ----------------
                  return (
                    <div className="chart-card large-chart ppt-export">
                      <h3>Project Dashboard</h3>

                      {/* FY Dropdown */}
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
                          width: "20%",
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

                      {/* Legend Toggle */}
                      <div
                        style={{ display: "flex", gap: 12, marginBottom: 12 }}
                      >
                        <div
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() => setShowChart("HC")}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: "#46b0e9",
                              borderRadius: 3,
                              opacity: showChart === "HC" ? 1 : 0.3,
                            }}
                          />
                          <span
                            style={{ opacity: showChart === "HC" ? 1 : 0.5 }}
                          >
                            Actual HC
                          </span>
                        </div>
                        <div
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() => setShowChart("Ramp")}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: "#8e5ea2",
                              borderRadius: 3,
                              opacity: showChart === "Ramp" ? 1 : 0.3,
                            }}
                          />
                          <span
                            style={{ opacity: showChart === "Ramp" ? 1 : 0.5 }}
                          >
                            Ramp Down
                          </span>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="chart-container">
                        <Bar
                          data={{
                            labels:
                              showChart === "HC" ? sortedMonths : rampMonths,
                            datasets:
                              showChart === "HC"
                                ? [
                                    {
                                      label: "Actual HC",
                                      data: hcDataValues,
                                      backgroundColor: "#46b0e9",
                                      borderRadius: 6,
                                    },
                                  ]
                                : [
                                    {
                                      label: "HC (Billable Only)",
                                      data: rampHC,
                                      type: "bar",
                                      backgroundColor: "green",
                                      borderRadius: 4,
                                      yAxisID: "yHC",
                                    },
                                    {
                                      label: "Quarterly Loss",
                                      data: rampLoss,
                                      type: "bar",
                                      backgroundColor: "red",
                                      borderRadius: 4,
                                      yAxisID: "yRev",
                                    },
                                  ],
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
                                formatter: (val) => Math.round(val),
                              },
                            },
                            scales: {
                              x: {
                                title: { display: true, text: "Month-Year" },
                                ticks: { autoSkip: false, maxRotation: 45 },
                                grid: { display: false },
                              },
                              yHC: {
                                type: "linear",
                                position: "left",
                                beginAtZero: true,
                                title: { display: true, text: "HC" },
                              },
                              yRev: {
                                type: "linear",
                                position: "right",
                                beginAtZero: true,
                                grid: { drawOnChartArea: false },
                                title: {
                                  display: true,
                                  text: "Quarterly Loss",
                                },
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
                <div className="chart-card large-chart ppt-export">
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
                <div className="chart-card large-chart ppt-export">
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
                <div className="chart-card large-chart ppt-export">
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
              // ---------- YEAR OPTIONS ----------
              const tableYearsOptions = [
                ...new Set(
                  filteredData
                    .map((row) => {
                      const monthRaw = row[rampDownMonthKey];
                      if (!monthRaw) return null;
                      return parseInt(monthRaw.split("-")[1], 10) + 2000;
                    })
                    .filter(Boolean),
                ),
              ].sort((a, b) => a - b);

              // ---------- FILTER TABLE DATA ----------
              const tableFilteredData = selectedTableYear
                ? filteredData.filter((row) => {
                    const monthRaw = row[rampDownMonthKey];
                    if (!monthRaw) return false;
                    const year = parseInt(monthRaw.split("-")[1], 10) + 2000;
                    return year === selectedTableYear;
                  })
                : filteredData;

              // ---------- TABLE ----------
              const combinedTableCard = (
                <div className="chart-card ppt-export">
                  <h3>Total RampDown</h3>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ marginRight: 8 }}>Select Year:</label>
                    <select
                      value={selectedTableYear || ""}
                      onChange={(e) =>
                        setSelectedTableYear(
                          e.target.value ? parseInt(e.target.value, 10) : null,
                        )
                      }
                      style={{ padding: "4px 8px", fontSize: 14 }}
                    >
                      <option value="">All Years</option>
                      {tableYearsOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div ref={setTableRef2} className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th rowSpan={2}>Owner</th>
                          {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                            <th key={q} colSpan={3}>
                              {q}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {["Q1", "Q2", "Q3", "Q4"].flatMap((q) => [
                            <th key={`${q}-hc`}>HC</th>,
                            <th key={`${q}-rev`}>Revenue Loss</th>,
                            <th key={`${q}-loss`}>Quarterly Loss</th>,
                          ])}
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          ...new Set(
                            tableFilteredData
                              .map((r) => (r?.Owner || "").trim())
                              .filter(Boolean),
                          ),
                        ].map((owner) => {
                          const quarterTotals = {
                            Q1: { hc: 0, rev: 0, loss: 0 },
                            Q2: { hc: 0, rev: 0, loss: 0 },
                            Q3: { hc: 0, rev: 0, loss: 0 },
                            Q4: { hc: 0, rev: 0, loss: 0 },
                          };

                          tableFilteredData.forEach((row) => {
                            if ((row.Owner || "").trim() !== owner) return;

                            const monthRaw = row[rampDownMonthKey];
                            if (!monthRaw) return;

                            const [monthName] = monthRaw.split("-");
                            const quarter =
                              monthName === "Jan" ||
                              monthName === "Feb" ||
                              monthName === "Mar"
                                ? "Q1"
                                : monthName === "Apr" ||
                                    monthName === "May" ||
                                    monthName === "Jun"
                                  ? "Q2"
                                  : monthName === "Jul" ||
                                      monthName === "Aug" ||
                                      monthName === "Sep"
                                    ? "Q3"
                                    : "Q4";

                            quarterTotals[quarter].hc += parseHC(
                              row[hcBillableKey],
                            );
                            quarterTotals[quarter].rev += parseMoney(
                              row[monthlyRevenueKey],
                            );
                            quarterTotals[quarter].loss += parseMoney(
                              row[quarterlyLossKey],
                            );
                          });

                          const allZero = Object.values(quarterTotals).every(
                            (v) => v.hc === 0 && v.rev === 0 && v.loss === 0,
                          );
                          if (allZero) return null;

                          return (
                            <tr key={owner}>
                              <td>{owner}</td>
                              {["Q1", "Q2", "Q3", "Q4"].flatMap((q) => [
                                <td key={`${owner}-${q}-hc`}>
                                  {quarterTotals[q].hc}
                                </td>,
                                <td key={`${owner}-${q}-rev`}>
                                  {quarterTotals[q].rev.toFixed(2)}
                                </td>,
                                <td key={`${owner}-${q}-loss`}>
                                  {quarterTotals[q].loss.toFixed(2)}
                                </td>,
                              ])}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

              // ---------- ONLY PROJECT CHART ----------
              const rampCharts = [
                { title: "Project-wise Ramp Down", key: projectKey },
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

              // ---------- AGGREGATE DATA (MONTH → QUARTER FIX) ----------
              const rampData = rampCharts
                .map(({ title, key }) => {
                  const rampDataByMonth = {};
                  const rampDataByQuarter = {};

                  filteredData.forEach((row) => {
                    const monthRaw = row[rampDownMonthKey];
                    if (!monthRaw) return;

                    const [monthName, yearPart] = monthRaw.split("-");
                    const yearFull = parseInt(yearPart, 10) + 2000;
                    const quarter = monthToQuarter[monthName];

                    const mKey = `${monthName}-${yearFull}`;
                    // const qKey=`${quarter}-${yearFull}`;

                    const hc = safeNumber(row[hcBillableKey]);
                    const loss = safeNumber(row[quarterlyLossKey]);

                    if (!rampDataByMonth[mKey]) {
                      rampDataByMonth[mKey] = {
                        hc: 0,
                        quarterlyLoss: 0,
                        quarter,
                        year: yearFull,
                      };
                    }

                    rampDataByMonth[mKey].hc += hc;
                    rampDataByMonth[mKey].quarterlyLoss += loss;
                  });

                  Object.values(rampDataByMonth).forEach((m) => {
                    const qKey = `${m.quarter}-${m.year}`;
                    if (!rampDataByQuarter[qKey]) {
                      rampDataByQuarter[qKey] = { hc: 0, quarterlyLoss: 0 };
                    }
                    rampDataByQuarter[qKey].hc += m.hc;
                    rampDataByQuarter[qKey].quarterlyLoss += m.quarterlyLoss;
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

              // ---------- RENDER CHART ----------
              const rampChartsRendered = rampData.map(
                ({ title, rampDataByMonth, rampDataByQuarter }, chartIndex) => {
                  if (!rampChartRefs.current[chartIndex])
                    rampChartRefs.current[chartIndex] = React.createRef();

                  const allMonths = Object.keys(rampDataByMonth);

                  const yearsOptions = [
                    ...new Set(
                      allMonths.map((m) => parseInt(m.split("-")[1], 10)),
                    ),
                  ].sort((a, b) => a - b);

                  let xLabels = [],
                    hcData = [],
                    lossData = [];

                  if (selectedQuarter === "All Months") {
                    const filteredMonths = selectedRampYear
                      ? allMonths.filter(
                          (m) =>
                            parseInt(m.split("-")[1], 10) === selectedRampYear,
                        )
                      : allMonths;

                    xLabels = filteredMonths.sort((a, b) => {
                      const [ma, ya] = a.split("-");
                      const [mb, yb] = b.split("-");
                      return ya !== yb
                        ? ya - yb
                        : calendarOrder.indexOf(ma) - calendarOrder.indexOf(mb);
                    });

                    hcData = xLabels.map((m) => rampDataByMonth[m]?.hc || 0);
                    lossData = xLabels.map(
                      (m) => rampDataByMonth[m]?.quarterlyLoss || 0,
                    );
                  } else {
                    const filteredQuarters = Object.keys(
                      rampDataByQuarter,
                    ).filter(
                      (q) =>
                        q.startsWith(
                          selectedQuarter === "All Quarters"
                            ? "Q"
                            : selectedQuarter,
                        ) &&
                        (!selectedRampYear ||
                          parseInt(q.split("-")[1], 10) === selectedRampYear),
                    );

                    xLabels = filteredQuarters;
                    hcData = xLabels.map((q) => rampDataByQuarter[q]?.hc || 0);
                    lossData = xLabels.map(
                      (q) => rampDataByQuarter[q]?.quarterlyLoss || 0,
                    );
                  }

                  return (
                    <div
                      className="chart-card large-chart ppt-export"
                      key={title}
                    >
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
                          style={{ width: "25%", padding: "4px 8px" }}
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
                          onChange={(e) => setSelectedQuarter(e.target.value)}
                          style={{ width: "25%", padding: "4px 8px" }}
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

                      <div className="chart-container">
                        <Bar
                          ref={rampChartRefs.current[chartIndex]}
                          data={{
                            labels: xLabels.map((l) => {
                              const [p, y] = l.split("-");
                              return `${p}-${y.slice(-2)}`;
                            }),
                            datasets: [
                              {
                                label: "HC (Billable Only)",
                                data: hcData,
                                yAxisID: "yHC",
                                type: "line",
                                borderColor: "#4caf50",
                                backgroundColor: "#4caf50",
                                tension: 0.3,
                              },
                              {
                                label: "Quarterly Loss",
                                data: lossData,
                                yAxisID: "yRev",
                                type: "bar",
                                backgroundColor: "#8e5ea2",
                              },
                            ],
                          }}
                          plugins={[ChartDataLabels]}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              yHC: {
                                type: "linear",
                                position: "left",
                                beginAtZero: true,
                                title: { display: true, text: "HC" },
                              },
                              yRev: {
                                type: "linear",
                                position: "right",
                                beginAtZero: true,
                                grid: { drawOnChartArea: false },
                                title: {
                                  display: true,
                                  text: "Quarterly Loss",
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

              return (
                <>
                  {combinedTableCard}
                  {rampChartsRendered}
                </>
              );
            })()}

          {/* ---------- TrendView3 FJ Chart Only (FJ Level on X-axis) ---------- */}
          {activeTrendView === "TrendView3" &&
            (() => {
              const memberNameKey = "Member Name";
              const fjLevelKey = "FJ level";

              if (!filteredData || filteredData.length === 0) return null;

              const fjLevels = [
                ...new Set(
                  filteredData.map((r) => r[fjLevelKey]).filter(Boolean),
                ),
              ].sort(
                (a, b) =>
                  parseInt(a.replace("FJ", ""), 10) -
                  parseInt(b.replace("FJ", ""), 10),
              );

              const memberCountData = fjLevels.map((level) => {
                const members = filteredData
                  .filter((r) => r[fjLevelKey] === level && r[memberNameKey])
                  .map((r) => r[memberNameKey]);
                return [...new Set(members)].length;
              });

              const fjLevelCountData = fjLevels.map(
                (level) =>
                  filteredData.filter((r) => r[fjLevelKey] === level).length,
              );

              if (!fjChartRef.current) fjChartRef.current = React.createRef();

              const totalMemberCount = memberCountData.reduce(
                (a, b) => a + b,
                0,
              );

              const data = {
                labels: [...fjLevels, "Members"], // last slice for member count
                datasets: [
                  {
                    label: "FJ vs Member",
                    data: [...fjLevelCountData, totalMemberCount],
                    backgroundColor: [
                      ...fjLevelCountData.map(
                        (_, i) =>
                          `hsl(${(i * 360) / fjLevelCountData.length}, 60%, 65%)`,
                      ),
                      "#4caf50", // member slice color
                    ],
                    borderColor: "#fff",
                    borderWidth: 1,
                    hoverOffset: 10,
                  },
                ],
              };

              const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      font: { size: 12, weight: "bold" },
                      generateLabels: (chart) => {
                        return chart.data.labels
                          .map((label, index) => {
                            // hide member slice from legend
                            if (label === "Members") return null;
                            const value = chart.data.datasets[0].data[index];
                            const color =
                              chart.data.datasets[0].backgroundColor[index];
                            return {
                              text: `${label} (${value})`, // show FJ level with value
                              fillStyle: color,
                              strokeStyle: "#fff",
                              lineWidth: 1,
                              hidden: false,
                              index,
                            };
                          })
                          .filter(Boolean);
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.label}: ${context.raw}`;
                      },
                    },
                  },
                  datalabels: {
                    color: "#000",
                    font: { size: 12, weight: "bold" },
                    formatter: (value, context) => value,
                  },
                },
              };

              return (
                <div className="chart-card large-chart ppt-export">
                  <h3>FJ Level vs Member Count</h3>
                  <div className="chart-container" style={{ height: 350 }}>
                    <Doughnut
                      ref={fjChartRef}
                      data={data}
                      options={options}
                      plugins={[ChartDataLabels]}
                    />
                  </div>
                </div>
              );
            })()}
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <div className="logo">DashBoard</div>
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
            <div className="owner-filter-bar">
              <label htmlFor="ownerFilter" className="owner-label">
                Filter by Owner:
              </label>

              <select
                id="ownerFilter"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="owner-select"
              >
                {ownerList.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>

              <select
                className="download-select"
                onChange={(e) => handleDownloadFullSection(e.target.value)}
              >
                <option value="">Download As</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="ppt">PPT</option> {/* ✅ ADD */}
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
