import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import ChartComponent from "../../components/charts/ChartComponent";

const AdminDashboard = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState("popularSubjects");
  const [reportData, setReportData] = useState({});
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const tutorResponse = await axios.get(
          "http://localhost:5000/api/admin/pending-tutors",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingTutors(tutorResponse.data);

        const statsResponse = await axios.get(
          "http://localhost:5000/api/admin/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsResponse.data.tutorProfiles);
      } catch (error) {
        console.error(
          "Failed to fetch data:",
          error.response?.data?.message || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    fetchReportData();
  }, [token, startDate, endDate, reportType]);

  const handleVerifyTutor = async (tutorId, verificationStatus) => {
    try {
      await axios.post(
        "http://localhost:5000/api/admin/update-tutor-verification",
        {
          tutorProfileId: tutorId,
          verificationStatus,
          comment: comment[tutorId] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingTutors(pendingTutors.filter((tutor) => tutor._id !== tutorId));
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        [verificationStatus]: prev[verificationStatus] + 1,
      }));
      alert(`Tutor ${verificationStatus} successfully!`);
    } catch (error) {
      console.error(
        "Verification failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to verify tutor: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const fetchReportData = async () => {
    if (!token) return;
    setReportLoading(true);
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      let response;

      switch (reportType) {
        case "popularSubjects":
          response = await axios.get(
            "http://localhost:5000/api/admin/reports/popular-subjects",
            {
              headers: { Authorization: `Bearer ${token}` },
              params,
            }
          );
          setReportData(response.data);
          break;
        case "sessionCompletion":
          response = await axios.get(
            "http://localhost:5000/api/admin/reports/session-completion",
            {
              headers: { Authorization: `Bearer ${token}` },
              params,
            }
          );
          setReportData(response.data);
          break;
        case "usageByCity":
          response = await axios.get(
            "http://localhost:5000/api/admin/reports/usage-by-city",
            {
              headers: { Authorization: `Bearer ${token}` },
              params,
            }
          );
          setReportData(response.data);
          break;
        case "userGrowth":
          response = await axios.get(
            "http://localhost:5000/api/admin/reports/user-growth",
            {
              headers: { Authorization: `Bearer ${token}` },
              params,
            }
          );
          setReportData(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setReportData({});
    } finally {
      setReportLoading(false);
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];

    switch (reportType) {
      case "popularSubjects":
        rows.push(["Subject", "Sessions"]);
        reportData.subjects?.forEach((s) => rows.push([s.name, s.count]));
        break;
      case "sessionCompletion":
        rows.push(["Status", "Count"]);
        rows.push(["Completed", reportData.completed]);
        rows.push(["Incomplete", reportData.total - reportData.completed]);
        break;
      case "usageByCity":
        rows.push(["City", "Users"]);
        reportData.cities?.forEach((c) => rows.push([c.name, c.count]));
        break;
      case "userGrowth":
        rows.push(["Date", "Users"]);
        reportData.growth?.forEach((g) => rows.push([g.date, g.count]));
        break;
      default:
        return;
    }

    csvContent += rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `${reportType}-report-${startDate.toISOString().split("T")[0]}-to-${
        endDate.toISOString().split("T")[0]
      }.csv`
    );
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, tooltip: { enabled: true } },
  };

  const renderChart = () => {
    if (reportLoading)
      return <p className="text-gray-600">Loading report...</p>;
    if (!reportData || Object.keys(reportData).length === 0)
      return (
        <p className="text-gray-600">No data available for this period.</p>
      );

    switch (reportType) {
      case "popularSubjects":
        return (
          <ChartComponent
            type="bar"
            title="Popular Subjects"
            data={{
              labels: reportData.subjects?.map((s) => s.name) || [],
              datasets: [
                {
                  label: "Sessions",
                  data: reportData.subjects?.map((s) => s.count) || [],
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
            options={chartOptions}
          />
        );
      case "sessionCompletion":
        return (
          <ChartComponent
            type="pie"
            title="Session Completion Rates"
            data={{
              labels: ["Completed", "Incomplete"],
              datasets: [
                {
                  data: [
                    reportData.completed,
                    reportData.total - reportData.completed,
                  ],
                  backgroundColor: [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                  ],
                },
              ],
            }}
            options={chartOptions}
          />
        );
      case "usageByCity":
        return (
          <ChartComponent
            type="bar"
            title="Platform Usage by City"
            data={{
              labels: reportData.cities?.map((c) => c.name) || [],
              datasets: [
                {
                  label: "Users",
                  data: reportData.cities?.map((c) => c.count) || [],
                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
              ],
            }}
            options={chartOptions}
          />
        );
      case "userGrowth":
        return (
          <ChartComponent
            type="line"
            title="User Growth Over Time"
            data={{
              labels: reportData.growth?.map((g) => g.date) || [],
              datasets: [
                {
                  label: "Users",
                  data: reportData.growth?.map((g) => g.count) || [],
                  borderColor: "rgba(255, 159, 64, 1)",
                  fill: false,
                },
              ],
            }}
            options={chartOptions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {/* Verification Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Verification Stats
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading stats...</p>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md flex space-x-6">
              <p className="text-gray-600">Pending: {stats.pending}</p>
              <p className="text-gray-600">Approved: {stats.approved}</p>
              <p className="text-gray-600">Rejected: {stats.rejected}</p>
            </div>
          )}
        </div>

        {/* Pending Tutor Verifications */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Pending Tutor Verifications
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading tutors...</p>
          ) : pendingTutors.length === 0 ? (
            <p className="text-gray-600">No pending tutor verifications.</p>
          ) : (
            <div className="space-y-4">
              {pendingTutors.map((tutor) => (
                <div
                  key={tutor._id}
                  className="bg-white p-6 rounded-lg shadow-md flex justify-between items-start"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Name: {tutor.user.name}
                    </p>
                    <p className="text-gray-600">Email: {tutor.user.email}</p>
                    <p className="text-gray-600">
                      Subjects: {tutor.subjects.join(", ")}
                    </p>
                    <p className="text-gray-600">
                      Hourly Rate: ${tutor.hourlyRate}
                    </p>
                    <p className="text-gray-600">Location: {tutor.location}</p>
                    <p className="text-gray-600">Bio: {tutor.bio}</p>
                    <p className="text-gray-600">
                      Availability:{" "}
                      {tutor.availability
                        .map(
                          (slot) =>
                            `${slot.day}: ${slot.timeSlots
                              .map((t) => `${t.start}-${t.end}`)
                              .join(", ")}`
                        )
                        .join("; ")}
                    </p>
                  </div>
                  <div className="space-y-2 w-1/4">
                    <button
                      onClick={() => handleVerifyTutor(tutor._id, "approved")}
                      className="w-full bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                    >
                      Approve
                    </button>
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={comment[tutor._id] || ""}
                        onChange={(e) =>
                          setComment({
                            ...comment,
                            [tutor._id]: e.target.value,
                          })
                        }
                        placeholder="Rejection comment"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleVerifyTutor(tutor._id, "rejected")}
                        className="w-full bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reporting Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Reports</h2>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full"
                >
                  <option value="popularSubjects">Popular Subjects</option>
                  <option value="sessionCompletion">Session Completion</option>
                  <option value="usageByCity">Usage by City</option>
                  <option value="userGrowth">User Growth</option>
                </select>
              </div>
              <button
                onClick={exportToCSV}
                className="mt-auto bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Export to CSV
              </button>
            </div>
          </div>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
