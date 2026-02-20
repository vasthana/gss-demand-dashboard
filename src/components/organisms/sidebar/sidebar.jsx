import React, { useState } from "react";
import { MdOutlineDashboard, MdOutlineListAlt } from "react-icons/md";
import "../../../css/sidebar.css";

const Sidebar = ({
  dynamicTrends = [],
  activePage,
  activeTrendId,
  activeTrackerId,
  onMenuSelect,
  onTrendClick,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const trackerList = [
    {
      id: "new-transitions",
      label: "New Transitions / Opportunity Tracker",
      csvFile:
        "Oppurtunity_Tracker/FY25/Month/Jan/Application Data_Opportunity Tracker.csv",
    },
    {
      id: "ramp-down-project",
      label: "Ramp Down Project",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/Ramp_Down_Tracker.csv",
    },
    {
      id: "new-joiner-list",
      label: "New Joiner List",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/New_Joiner_List.csv",
    },
    {
      id: "attrition",
      label: "Attrition / Resignation",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/Attrition_Resignation.csv",
    },
    {
      id: "project-details",
      label: "Project Details",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/Project_Details.csv",
    },
    {
      id: "orm-demand",
      label: "ORM Demand Tracker",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/ORM_Demand.csv",
    },
    {
      id: "bt-tracker",
      label: "BT Tracker",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/BT_Tracker.csv",
    },
    {
      id: "kakushin",
      label: "Kaku shin",
      csvFile: "Oppurtunity_Tracker/FY25/Month/Jan/Kakushin.csv",
    },
  ];

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* CLOSE BUTTON (MOBILE ONLY) */}
        <div className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          ✖
        </div>

        <h2 className="sidebar-title">BPS Tracker</h2>

        <ul className="sidebar-menu">
          {/* ===== Portfolio Health ===== */}
          <li
            className={`menu-parent ${activePage === "trends" ? "active-parent" : ""}`}
          >
            <span className="menu-left">
              <MdOutlineDashboard className="menu-icon" />
              Portfolio Health
            </span>
          </li>

          <ul className="submenu">
            {dynamicTrends.length > 0 ? (
              dynamicTrends.map((trend) => (
                <li
                  key={trend.id}
                  className={activeTrendId === trend.id ? "active" : ""}
                  onClick={() => {
                    onMenuSelect("trends");
                    const type = trend.file.toLowerCase().includes("ramp")
                      ? "TrendView2"
                      : "TrendView1";
                    onTrendClick(trend.file, trend.label, type);
                    setSidebarOpen(false);
                  }}
                >
                  {trend.label}
                </li>
              ))
            ) : (
              <li style={{ color: "#888" }}>No Trend CSVs Available</li>
            )}
          </ul>

          <li
            className={`menu-parent ${activePage !== "trends" ? "active-parent" : ""}`}
          >
            <span className="menu-left">
              <MdOutlineListAlt className="menu-icon" />
              Tracker List
            </span>
          </li>

          <ul className="submenu">
            {trackerList.map((tracker) => (
              <li
                key={tracker.id}
                className={activePage === tracker.id ? "active" : ""}
                onClick={() => {
                  onMenuSelect(tracker.id);
                  onTrendClick(tracker.csvFile);
                  setSidebarOpen(false);
                }}
              >
                {tracker.label}
              </li>
            ))}
          </ul>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
