// // src/App.js
// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// // Import User Components
// import LoginForm from "./components/LoginForm";
// import RegisterForm from "./components/RegisterForm";
// import FileUpload from "./components/FileUpload";
// import Header from "./components/Header";
// import ProtectedRoute from "./components/ProtectedRoute";
// import FlexibleChartGenerator from "./components/FlexibleChartGenerator";
// import SummaryReport from "./components/SummaryReport";
// import UploadHistory from "./components/UploadHistory";
// import DataTable from "./components/DataTable";
// import ExportCSV from "./components/ExportCSV";
// // import PivotTableDashboard from "./components/PivotTableDashboard";

// // Import Admin Dashboard Components
// import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
// import AdminDashboard from "./admin/AdminDashboard";

// // Import ThemeProvider to wrap the entire app and provide dark mode
// import { ThemeProvider } from "./context/ThemeContext";

// /*
//   DashboardWrapper extracts a token from the URL (if present)
//   and displays file upload + data analysis.
// */
// const DashboardWrapper = ({ fileData = [], handleFileUploaded }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Extract and store JWT token if present in URL
//   React.useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const token = params.get("token");
//     if (token) {
//       localStorage.setItem("authToken", token);
//       navigate("/dashboard", { replace: true });
//     }
//   }, [location, navigate]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 font-sans">
//       <Header />
//       <main className="max-w-7xl mx-auto p-6">
//         {/* File Upload and Upload History Section */}
//         <section className="mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-lg "> 
//             <FileUpload onFileUploaded={handleFileUploaded} />
//             <div className="mt-6">
//               <UploadHistory />
//             </div>
//           </div>
//         </section>

//         {/* Data Analysis Section – Render only when fileData exists */}
//         {Array.isArray(fileData) && fileData.length > 0 && (
//           <section>
//             <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//               Data Analysis
//             </h2>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
//                 <FlexibleChartGenerator data={fileData} />
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
//                 <SummaryReport chartData={fileData} />
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
//                 <DataTable data={fileData} />
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
//                 <ExportCSV data={fileData} filename="uploaded-data.csv" />
//               </div>
//             </div>
//           </section>
//         )}
//       </main>
//       <footer className="bg-gray-800 text-center text-white py-4">
//         <p>&copy; {new Date().getFullYear()} Excel Analytics Dashboard. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };


// function App() {
//   // Hold file data in App state.
//   const [fileData, setFileData] = useState([]);

//   const handleFileUploaded = (data) => {
//     console.log("handleFileUploaded received data:", data);
//     setFileData(data);
//   };

//   useEffect(() => {
//     console.log("App updated fileData:", fileData);
//   }, [fileData]);

//   return (
//     <ThemeProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/register" element={<RegisterForm />} />

//           {/* Protected User Dashboard */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardWrapper
//                   fileData={fileData}
//                   handleFileUploaded={handleFileUploaded}
//                 />
//               </ProtectedRoute>
//             }
//           />

//           {/* Protected Admin Dashboard */}
//           <Route
//             path="/admin/dashboard/*"
//             element={
//               <ProtectedAdminRoute>
//                 <AdminDashboard />
//               </ProtectedAdminRoute>
//             }
//           />

//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// }

// export default App;

// src/App.js
// src/App.js
// src/App.js
// src/App.js
  // src/App.jsx
// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Import your core components (logic remains intact)
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import FileUpload from "./components/FileUpload";
import ProtectedRoute from "./components/ProtectedRoute";
import FlexibleChartGenerator from "./components/FlexibleChartGenerator";
import SummaryReport from "./components/SummaryReport";
import UploadHistory from "./components/UploadHistory";
import DataTable from "./components/DataTable";
import ExportCSV from "./components/ExportCSV";
import ChartAnalysisPage from "./components/ChartAnalysisPage"; // Import the new page

// Import Admin Dashboard Components
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminDashboard from "./admin/AdminDashboard";

// Import ThemeProvider (for dark/light mode)
import { ThemeProvider, ThemeContext } from "./context/ThemeContext"; // Import ThemeContext
import AboutUs from "./components/AboutUs";

/*
  DashboardWrapper:
  - Extracts the token from the URL (if present) and saves it.
  - Lays out the dashboard using our futuristic mosaic design.
  - The order is now: File Upload, Data Analysis, then Upload History.
*/
const DashboardWrapper = ({ fileData = [], handleFileUploaded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = React.useContext(ThemeContext); // Get theme context

  // Extract token from URL and store it.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans"
      style={{
        background: "radial-gradient(at top left, #3b82f6, #9333ea)",
      }}
    >
      {/* Abstract overlay image for texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/random/1920x1080?abstract')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="text-white text-3xl font-extrabold drop-shadow-lg">
          V i z X c e L
        </div>

        {/* Right side container for toggle and nav */}
        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/30 text-sm transition-colors shadow-md"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"} {/* Corrected text based on state */}
          </button>

          <nav className="space-x-4"> {/* Reduced spacing between nav links slightly */}
            <a href="/dashboard" className="text-white hover:underline">
              Home
            </a>
            <a href="/admin/dashboard" className="text-white hover:underline">
              Admin
            </a>
            <a href="/login" className="text-white hover:underline">
              Logout
            </a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 flex">
        {/* Unique Clipped Sidebar */}
        <aside
          className="w-1/3 lg:w-1/4 h-screen bg-gradient-to-b from-purple-800 to-indigo-800 text-white p-8"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
        >
          <h2 className="text-4xl font-bold mb-8   drop-shadow-lg">Menu</h2>
          <nav className="space-y-6">
            <a
              href="#upload"
              className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              File Upload
            </a>
            <a
              href="#analysis"
              className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Data Analysis
            </a>
            <a
              href="#history"
              className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Upload History
            </a>
            <a
              href="/Aboutus"
              className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              About Us
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto space-y-16">
          {/* File Upload Section */}
          <section id="upload">
            {/* Apply dark mode styles to the container div */}
            <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                File Upload
              </h2>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          </section>

          {/* Data Analysis Section */}
          {Array.isArray(fileData) && fileData.length > 0 && (
            <section id="analysis">
              <h2 className="text-3xl font-bold text-white text-center mb-10">
                Data Analysis
              </h2>
              {/* Use vertical stacking for main sections, then grid for smaller items */}
              <div className="space-y-8">
                {/* Chart takes full width */}
                {/* Apply dark mode styles to the container div */}
                <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-6 transform transition duration-300 hover:scale-105">
                  <FlexibleChartGenerator data={fileData} />
                  {/* Add Button to go to full chart page */}
                  <div className="text-center mt-4"> {/* Adjusted margin */}
                      <button
                          onClick={() => navigate('/dashboard/chart-analysis', { state: { fileData } })}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md shadow-sm transition"
                      >
                          View Full Chart Analysis
                      </button>
                  </div>
                </div>
                {/* Data Table takes full width */}
                {/* Apply dark mode styles to the container div */}
                <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-6 transform transition duration-300 hover:scale-105">
                  <DataTable data={fileData} />
                </div>
                {/* Grid for Summary and Export */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Apply dark mode styles to the container div
                    <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-6 transform transition duration-300 hover:scale-105"><SummaryReport chartData={fileData} /></div> */}
                    {/* Apply dark mode styles to the container div */}
                    <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-6 transform transition duration-300 hover:scale-105"><ExportCSV data={fileData} filename="uploaded-data.csv" /></div>
                </div>
              </div>
            </section>
          )}

          {/* Upload History Section */}
          <section id="history">
            {/* Apply dark mode styles to the container div */}
            <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Upload History
              </h2>
              <UploadHistory />
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4 text-white opacity-90">
        &copy; {new Date().getFullYear()} Excel Mosaic Dashboard. All rights
        reserved.
      </footer>
    </div>
  );
};

function App() {
  const [fileData, setFileData] = useState([]);

  const handleFileUploaded = (data) => {
    console.log("File uploaded data received:", data);
    setFileData(data);
  };

  useEffect(() => {
    console.log("App fileData updated:", fileData);
  }, [fileData]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper
                  fileData={fileData}
                  handleFileUploaded={handleFileUploaded}
                />
              </ProtectedRoute>
            }
          />

        {/* New Route for Full Chart Analysis Page */}
        <Route
          path="/dashboard/chart-analysis"
          element={
            <ProtectedRoute>
              <ChartAnalysisPage />
            </ProtectedRoute>
          }
        />
          {/* Protected Admin Dashboard */}
          <Route
            path="/admin/dashboard/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route 
          path="/Aboutus"
          element={
          <ProtectedRoute>
            <AboutUs/>
          </ProtectedRoute>
        }/>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

