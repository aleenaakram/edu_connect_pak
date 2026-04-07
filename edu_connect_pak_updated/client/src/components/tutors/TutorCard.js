import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const TutorCard = ({ tutor, onSelect }) => {
  const { token } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wishlist = response.data;
        setIsWishlisted(wishlist.some((w) => w._id.toString() === tutor._id));
      } catch (error) {
        console.error("Failed to check wishlist:", error);
      }
    };
    if (token) checkWishlist();
  }, [token, tutor._id]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      if (isWishlisted) {
        await axios.post(
          "http://localhost:5000/api/wishlist/remove",
          { tutorProfileId: tutor._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(false);
      } else {
        await axios.post(
          "http://localhost:5000/api/wishlist/add",
          { tutorProfileId: tutor._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error(
        "Wishlist toggle failed:",
        error.response?.data?.message || error.message
      );
      alert(
        "Failed to update wishlist: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
      onClick={() => onSelect(tutor)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {tutor.user.name}
        </h3>
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`text-2xl ${
            isWishlisted ? "text-red-500" : "text-gray-400"
          } hover:text-red-600 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isWishlisted ? "❤️" : "♡"}
        </button>
      </div>
      <p className="text-gray-600">Subjects: {tutor.subjects.join(", ")}</p>
      <p className="text-gray-600">Rate: ${tutor.hourlyRate}/hr</p>
      <p className="text-gray-600">Location: {tutor.location || "Online"}</p>
      <p className="text-gray-600">
        Rating: {tutor.averageRating.toFixed(1)}/5
      </p>
      <p
        className={`text-sm font-medium ${
          tutor.verificationStatus === "approved"
            ? "text-green-600"
            : "text-yellow-600"
        }`}
      >
        {tutor.verificationStatus === "approved"
          ? "Verified"
          : "Pending Verification"}
      </p>
    </div>
  );
};

export default TutorCard;
