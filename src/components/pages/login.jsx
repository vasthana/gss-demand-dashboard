// import React, { useEffect, useState } from "react";
// import "../../css/login.css";

// const demandOwners = [
//   "Neeraj Gupta",
//   "Pankaj Kumar Chaudhary",
//   "Rajat Jain",
//   "Pasunooti Veeralah",
//   "Dani Poothokaran",
// ];

// const roles = ["Japan BPS Head", "Director", "Delivery Manager"];
// const financialYears = ["FY24", "FY25"];
// const months = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// const Login = ({ onLogin }) => {
//   const [owner, setOwner] = useState("");
//   const [role, setRole] = useState("");
//   const [fy, setFy] = useState("");
//   const [month, setMonth] = useState("");
//   const [csvFiles, setCsvFiles] = useState([]);
//   const [filteredFiles, setFilteredFiles] = useState([]);
//   const [selectedFile, setSelectedFile] = useState("");
//   const [pathPreview, setPathPreview] = useState("");
//   const [showWarning, setShowWarning] = useState(false);

//   useEffect(() => {
//     fetch("/api/files.json")
//       .then((res) => res.json())
//       .then((data) => setCsvFiles(data.files || []));
//   }, []);

//   useEffect(() => {
//     if (fy && month) {
//       const path = `Oppurtunity_Tracker/${fy}/Month/${month}/`;
//       setPathPreview(`public/api/${path}`);

//       const matches = csvFiles.filter((file) => file.includes(path));
//       setFilteredFiles(matches);
//       setSelectedFile("");

//       setShowWarning(matches.length === 0); // 🔴 show red if no files
//     } else {
//       setFilteredFiles([]);
//       setSelectedFile("");
//       setPathPreview("");
//       setShowWarning(false);
//     }
//   }, [fy, month, csvFiles]);

//   const handleLogin = () => {
//     if (!owner || !role || !fy || !month || !selectedFile) return;

//     onLogin({
//       Name: owner,
//       Role: role,
//       selectedCsv: selectedFile,
//     });
//   };

//   return (
//     <div className="login-container">
//       <h2>GSS Japan BPS Demand Tracker</h2>

//       <div className="login-form-group">
//         <label className="login-label">Demand Owner</label>
//         <select value={owner} onChange={(e) => setOwner(e.target.value)}>
//           <option value="">Select Demand Owner</option>
//           {demandOwners.map((o, i) => (
//             <option key={i} value={o}>
//               {o}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="login-form-group">
//         <label className="login-label">Role</label>
//         <select value={role} onChange={(e) => setRole(e.target.value)}>
//           <option value="">Select Role</option>
//           {roles.map((r, i) => (
//             <option key={i} value={r}>
//               {r}
//             </option>
//           ))}
//         </select>
//       </div>

//       {role && (
//         <div className="login-row">
//           <div className="login-col login-form-group">
//             <label>Financial Year</label>
//             <select value={fy} onChange={(e) => setFy(e.target.value)}>
//               <option value="">Select FY</option>
//               {financialYears.map((y, i) => (
//                 <option key={i} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="login-col login-form-group">
//             <label>Month</label>
//             <select value={month} onChange={(e) => setMonth(e.target.value)}>
//               <option value="">Select Month</option>
//               {months.map((m, i) => (
//                 <option key={i} value={m}>
//                   {m}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       )}

//       {fy && month && (
//         <div className="login-form-group">
//           <label className="login-label">Select CSV File</label>
//           <select
//             value={selectedFile}
//             onChange={(e) => setSelectedFile(e.target.value)}
//             className={showWarning ? "error-border" : ""}
//           >
//             <option value="">Select CSV</option>
//             {filteredFiles.map((file, i) => (
//               <option key={i} value={file}>
//                 {file}
//               </option>
//             ))}
//           </select>

//           {pathPreview && <div className="csv-path-preview">{pathPreview}</div>}

//           {showWarning && (
//             <div className="login-message">
//               No CSV file available. Please select correct FY and Month.
//             </div>
//           )}
//         </div>
//       )}

//       <button className="login-button" onClick={handleLogin}>
//         Open Dashboard
//       </button>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import "../../css/login.css";

const demandOwners = [
  "Neeraj Gupta",
  "Pankaj Kumar Chaudhary",
  "Rajat Jain",
  "Pasunooti Veeralah",
  "Dani Poothokaran",
];

const roles = ["Japan BPS Head", "Director", "Delivery Manager"];

const Login = ({ onLogin }) => {
  const [owner, setOwner] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = () => {
    if (!owner || !role) return;

    onLogin({
      Name: owner,
      Role: role,
      // CSVs will be loaded automatically in Dashboard
    });
  };

  return (
    <div className="login-container">
      <h2>GSS Japan BPS Demand Tracker</h2>

      <div className="login-form-group">
        <label>Demand Owner</label>
        <select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Select Demand Owner</option>
          {demandOwners.map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      </div>

      <div className="login-form-group">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          {roles.map((r, i) => (
            <option key={i}>{r}</option>
          ))}
        </select>
      </div>

      <button className="login-button" onClick={handleLogin}>
        Open Dashboard
      </button>
    </div>
  );
};

export default Login;
