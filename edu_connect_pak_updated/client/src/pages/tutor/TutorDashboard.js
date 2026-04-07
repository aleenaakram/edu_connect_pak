import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TutorDashboard = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({
    subjects: [],
    hourlyRate: "",
    location: "",
    availability: [],
    bio: "",
  });
  const [newAvailability, setNewAvailability] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "tutor") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const profileResponse = await axios.get(
          "http://localhost:5000/api/tutor/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(profileResponse.data);
        setEditProfile({
          subjects: profileResponse.data.subjects || [],
          hourlyRate: profileResponse.data.hourlyRate || "",
          location: profileResponse.data.location || "",
          availability: profileResponse.data.availability || [],
          bio: profileResponse.data.bio || "",
        });

        const sessionResponse = await axios.get(
          "http://localhost:5000/api/session/tutor-sessions",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(sessionResponse.data);

        const reviewResponse = await axios.get(
          `http://localhost:5000/api/review/tutor/${profileResponse.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(reviewResponse.data);
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

  const handleAcceptSession = async (sessionId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/session/accept",
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(
        sessions.map((s) =>
          s._id === sessionId ? { ...s, status: "accepted" } : s
        )
      );
      alert("Session accepted successfully!");
    } catch (error) {
      console.error(
        "Accept failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to accept session: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/session/decline",
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(
        sessions.map((s) =>
          s._id === sessionId ? { ...s, status: "declined" } : s
        )
      );
      alert("Session declined successfully!");
    } catch (error) {
      console.error(
        "Reject failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to reject session: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/session/complete",
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(
        sessions.map((s) =>
          s._id === sessionId ? { ...s, status: "completed" } : s
        )
      );
      alert("Session completed successfully!");
    } catch (error) {
      console.error(
        "Complete failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to complete session: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/tutor/profile",
        editProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(
        "Update failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to update profile: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const addAvailability = () => {
    if (!newAvailability) return;
    const [day, timeRange] = newAvailability.split(" ");
    const [start, end] = timeRange?.split("-") || [];
    if (
      day &&
      start &&
      end &&
      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].includes(day)
    ) {
      setEditProfile((prev) => ({
        ...prev,
        availability: [
          ...prev.availability,
          { day, timeSlots: [{ start, end }] },
        ],
      }));
      setNewAvailability("");
    } else {
      alert(
        "Invalid format or day. Use: 'Day HH:MM-HH:MM' (e.g., 'Monday 14:00-15:00')"
      );
    }
  };

  const removeAvailability = (index) => {
    setEditProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const canCompleteSession = (session) => {
    const now = new Date();
    // Convert session.date to a Date object if it’s a string
    const sessionDate = new Date(session.date);
    const sessionEnd = new Date(
      `${sessionDate.toISOString().split("T")[0]}T${session.endTime}:00Z`
    );
    return session.status === "accepted" && now >= sessionEnd;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Tutor Dashboard
        </h1>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Your Profile
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : profile && !isEditing ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-700">
                Name: {user.name}
              </p>
              <p className="text-gray-600">
                Subjects: {profile.subjects.join(", ")}
              </p>
              <p className="text-gray-600">
                Hourly Rate: ${profile.hourlyRate}
              </p>
              <p className="text-gray-600">Location: {profile.location}</p>
              <p className="text-gray-600">Bio: {profile.bio}</p>
              <p className="text-gray-600">
                Availability:{" "}
                {profile.availability.map((slot) => (
                  <span key={slot.day}>
                    {slot.day}:{" "}
                    {slot.timeSlots
                      .map((t) => `${t.start}-${t.end}`)
                      .join(", ")}{" "}
                    |{" "}
                  </span>
                ))}
              </p>
              <p className="text-gray-600">
                Average Rating: {profile.averageRating.toFixed(1)}
              </p>
              <p
                className={`text-sm font-medium ${
                  profile.verificationStatus === "approved"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                Status: {profile.verificationStatus}
              </p>
            </div>
          ) : isEditing ? (
            <form
              onSubmit={handleProfileSubmit}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <div>
                <label className="block text-gray-700">
                  Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={editProfile.subjects.join(", ")}
                  onChange={(e) =>
                    setEditProfile({
                      ...editProfile,
                      subjects: e.target.value.split(", ").map((s) => s.trim()),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={editProfile.hourlyRate}
                  onChange={(e) =>
                    setEditProfile({
                      ...editProfile,
                      hourlyRate: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700">Location</label>
                <input
                  type="text"
                  value={editProfile.location}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, location: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700">Bio</label>
                <textarea
                  value={editProfile.bio}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, bio: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  Add Availability (e.g., Monday 14:00-15:00)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAvailability}
                    onChange={(e) => setNewAvailability(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Monday 14:00-15:00"
                  />
                  <button
                    type="button"
                    onClick={addAvailability}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <ul className="mt-2">
                  {editProfile.availability.map((slot, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      {slot.day}:{" "}
                      {slot.timeSlots
                        .map((t) => `${t.start}-${t.end}`)
                        .join(", ")}
                      <button
                        type="button"
                        onClick={() => removeAvailability(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              No profile found. Please create one.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your Sessions
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600">No sessions scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Student: {session.student.name}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(session.date).toLocaleDateString()} |{" "}
                      {session.startTime} - {session.endTime}
                    </p>
                    <p className="text-gray-600">Type: {session.sessionType}</p>
                    <p className="text-gray-600">Price: ${session.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
                          : session.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {session.status}
                    </span>
                    {session.status === "pending" && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleAcceptSession(session._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectSession(session._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {canCompleteSession(session) && (
                      <button
                        onClick={() => handleCompleteSession(session._id)}
                        className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition duration-200"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your Reviews
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-4 rounded-lg shadow-md"
                >
                  <p className="text-gray-600">
                    Student: {review.student.name}
                  </p>
                  <p className="text-gray-600">Rating: {review.rating}/5</p>
                  <p className="text-gray-600">
                    Comment: {review.comment || "No comment"}
                  </p>
                  <p className="text-gray-600">
                    Date: {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
