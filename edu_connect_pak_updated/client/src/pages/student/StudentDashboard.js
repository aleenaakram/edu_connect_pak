import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TutorCard from "../../components/tutors/TutorCard";

const StudentDashboard = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]); // For sorting/filtering
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingData, setBookingData] = useState({
    sessionType: "online",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [filters, setFilters] = useState({
    subject: "",
    location: "",
    maxPrice: "",
    day: "",
  });
  const [wishlistFilters, setWishlistFilters] = useState({
    subject: "",
    location: "",
    sortBy: "name", // Default sort
  });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const sessionResponse = await axios.get(
          "http://localhost:5000/api/session/my-sessions",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(sessionResponse.data);

        const tutorResponse = await axios.get(
          "http://localhost:5000/api/tutor/approved",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTutors(tutorResponse.data);
        setFilteredTutors(tutorResponse.data);

        const wishlistResponse = await axios.get(
          "http://localhost:5000/api/wishlist",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlist(wishlistResponse.data);
        setFilteredWishlist(wishlistResponse.data); // Initialize filtered wishlist
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
    const applyFilters = () => {
      let result = [...tutors];

      if (filters.subject) {
        result = result.filter((tutor) =>
          tutor.subjects.some((sub) =>
            sub.toLowerCase().includes(filters.subject.toLowerCase())
          )
        );
      }
      if (filters.location) {
        result = result.filter((tutor) =>
          tutor.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      if (filters.maxPrice) {
        result = result.filter(
          (tutor) => tutor.hourlyRate <= Number(filters.maxPrice)
        );
      }
      if (filters.day) {
        result = result.filter((tutor) =>
          tutor.availability.some((slot) =>
            slot.day.toLowerCase().includes(filters.day.toLowerCase())
          )
        );
      }

      setFilteredTutors(result);
    };

    applyFilters();
  }, [filters, tutors]);

  useEffect(() => {
    const refreshWishlist = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data);
        applyWishlistFilters(response.data); // Apply filters to updated wishlist
      } catch (error) {
        console.error("Failed to refresh wishlist:", error);
      }
    };

    window.addEventListener("wishlistUpdated", refreshWishlist);
    return () => window.removeEventListener("wishlistUpdated", refreshWishlist);
  }, [token]);

  useEffect(() => {
    applyWishlistFilters(wishlist);
  }, [wishlistFilters, wishlist]);

  const applyWishlistFilters = (wishlistData) => {
    let result = [...wishlistData];

    // Apply filters
    if (wishlistFilters.subject) {
      result = result.filter((tutor) =>
        tutor.subjects.some((sub) =>
          sub.toLowerCase().includes(wishlistFilters.subject.toLowerCase())
        )
      );
    }
    if (wishlistFilters.location) {
      result = result.filter((tutor) =>
        tutor.location
          .toLowerCase()
          .includes(wishlistFilters.location.toLowerCase())
      );
    }

    // Apply sorting
    switch (wishlistFilters.sortBy) {
      case "name":
        result.sort((a, b) => a.user.name.localeCompare(b.user.name));
        break;
      case "rating":
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "rate":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      default:
        break;
    }

    setFilteredWishlist(result);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTutor) {
      alert("Please select a tutor.");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/session/book",
        {
          tutorId: selectedTutor.user._id,
          tutorProfileId: selectedTutor._id,
          sessionType: bookingData.sessionType,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions([...sessions, response.data.session]);
      setSelectedTutor(null);
      setBookingData({
        sessionType: "online",
        date: "",
        startTime: "",
        endTime: "",
      });
      alert("Session booked successfully!");
    } catch (error) {
      console.error(
        "Booking failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to book session: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (sessionId) => {
    const data = reviewData[sessionId] || { rating: 0, comment: "" };
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/review/submit",
        { sessionId, ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted!");
      setReviewData((prev) => ({
        ...prev,
        [sessionId]: { rating: 0, comment: "" },
      }));
      const sessionResponse = await axios.get(
        "http://localhost:5000/api/session/my-sessions",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(sessionResponse.data);

      const tutorResponse = await axios.get(
        "http://localhost:5000/api/tutor/approved",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTutors(tutorResponse.data);
      setFilteredTutors(tutorResponse.data);
    } catch (error) {
      alert(
        "Failed to submit review: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleTutorSelect = async (tutor) => {
    setSelectedTutor(tutor);
    try {
      const reviewResponse = await axios.get(
        `http://localhost:5000/api/review/tutor/${tutor._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTutor({ ...tutor, reviews: reviewResponse.data });
    } catch (error) {
      console.error(
        "Failed to fetch reviews:",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Student Dashboard
        </h1>

        {/* Wishlist Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Your Wishlist ({wishlist.length})
            </h2>
            {!loading && wishlist.length > 0 && (
              <div className="flex space-x-4">
                <select
                  value={wishlistFilters.sortBy}
                  onChange={(e) =>
                    setWishlistFilters({
                      ...wishlistFilters,
                      sortBy: e.target.value,
                    })
                  }
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="rate">Sort by Rate</option>
                </select>
              </div>
            )}
          </div>
          {!loading && wishlist.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm">
                    Filter by Subject
                  </label>
                  <input
                    type="text"
                    value={wishlistFilters.subject}
                    onChange={(e) =>
                      setWishlistFilters({
                        ...wishlistFilters,
                        subject: e.target.value,
                      })
                    }
                    placeholder="e.g., Math"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm">
                    Filter by Location
                  </label>
                  <input
                    type="text"
                    value={wishlistFilters.location}
                    onChange={(e) =>
                      setWishlistFilters({
                        ...wishlistFilters,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g., Karachi"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <p className="text-gray-600">Loading wishlist...</p>
          ) : filteredWishlist.length === 0 ? (
            <p className="text-gray-600">
              {wishlist.length === 0
                ? "Your wishlist is empty."
                : "No tutors match your wishlist filters."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredWishlist.map((tutor) => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  onSelect={handleTutorSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your Sessions
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600">You have no sessions booked yet.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Tutor: {session.tutor.name}
                      </p>
                      <p className="text-gray-600">
                        Date: {new Date(session.date).toLocaleDateString()} |{" "}
                        {session.startTime} - {session.endTime}
                      </p>
                      <p className="text-gray-600">
                        Type: {session.sessionType}
                      </p>
                      <p className="text-gray-600">Price: ${session.price}</p>
                    </div>
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
                  </div>
                  {session.status === "completed" && (
                    <div className="mt-4">
                      <label className="block text-gray-700">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData[session._id]?.rating || ""}
                        onChange={(e) =>
                          setReviewData((prev) => ({
                            ...prev,
                            [session._id]: {
                              ...prev[session._id],
                              rating: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-20 p-2 border border-gray-300 rounded-md"
                      />
                      <label className="block text-gray-700 mt-2">
                        Comment
                      </label>
                      <textarea
                        value={reviewData[session._id]?.comment || ""}
                        onChange={(e) =>
                          setReviewData((prev) => ({
                            ...prev,
                            [session._id]: {
                              ...prev[session._id],
                              comment: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="2"
                      />
                      <button
                        onClick={() => handleReviewSubmit(session._id)}
                        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        Submit Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Book a Session
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Find a Tutor
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={filters.subject}
                      onChange={(e) =>
                        setFilters({ ...filters, subject: e.target.value })
                      }
                      placeholder="e.g., Math"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      placeholder="e.g., Karachi"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm">
                      Max Price ($/hr)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      placeholder="e.g., 30"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm">
                      Available Day
                    </label>
                    <input
                      type="text"
                      value={filters.day}
                      onChange={(e) =>
                        setFilters({ ...filters, day: e.target.value })
                      }
                      placeholder="e.g., Monday"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredTutors.length === 0 ? (
                  <p className="text-gray-600">No tutors match your filters.</p>
                ) : (
                  filteredTutors.map((tutor) => (
                    <TutorCard
                      key={tutor._id}
                      tutor={tutor}
                      onSelect={handleTutorSelect}
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              {selectedTutor ? (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                  <h3 className="text-lg font-medium text-gray-700">
                    Booking with {selectedTutor.user.name}
                  </h3>
                  <p className="text-gray-600">
                    Average Rating: {selectedTutor.averageRating.toFixed(1)}/5
                  </p>
                  {selectedTutor.reviews &&
                    selectedTutor.reviews.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-700">
                          Reviews:
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedTutor.reviews.map((review) => (
                            <div key={review._id} className="text-gray-600">
                              <p>Rating: {review.rating}/5</p>
                              <p>{review.comment || "No comment"}</p>
                              <p className="text-sm">
                                -{" "}
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Session Type
                      </label>
                      <select
                        value={bookingData.sessionType}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            sessionType: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="online">Online</option>
                        <option value="in-person">In-Person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            date: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={bookingData.startTime}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={bookingData.endTime}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className={`w-full p-2 rounded-md text-white ${
                        bookingLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } transition duration-200`}
                    >
                      {bookingLoading ? "Booking..." : "Book Session"}
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-gray-600">
                  Select a tutor to book a session.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
