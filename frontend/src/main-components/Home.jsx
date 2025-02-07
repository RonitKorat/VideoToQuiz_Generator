import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/userContext";
import QuizContext from "../context/quizContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const UploadVideoPage = () => {
  const [videoURL, setVideoURL] = useState("");
  const [transcription, setTranscription] = useState("");
  const [isTranscription, setIsTranscription] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { setQuiz } = useContext(QuizContext);

  const [loading, setLoading] = useState(false);

  const handleURLUpload = async () => {
    if (!videoURL) {
      setErrorMessage("Please enter a valid video URL.");
      return;
    }
    setUploading(true);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/extract-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtube_url: videoURL }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsTranscription(true);
        setTranscription(data.transcription);
        setUploading(false);
        setLoading(false);
      } else {
        setErrorMessage(data.error || "Failed to extract audio");
        setUploading(false);
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage("Failed to extract audio");
      setUploading(false);
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!transcription) {
      setErrorMessage("Transcription is required to generate quiz.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcription }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuiz(data.quiz);
        navigate("/quiz", {
          state: { quiz: data.quiz, transcription: transcription },
        });
      } else {
        setErrorMessage(data.error || "Failed to generate quiz");
      }
    } catch (error) {
      setErrorMessage("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  const handleLogout = () => {
    navigate("/signin");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
      <div className="absolute top-4 right-4">
        <div className="relative">
          <div
            className="bg-white shadow-lg rounded-full p-4 flex items-center justify-center w-12 h-12 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="text-gray-800 font-bold text-lg">
              {getInitials(user?.name)}
            </span>
          </div>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
              <p className="px-4 py-2 text-gray-800 font-semibold">
                {user?.name}
              </p>
              <p className="px-4 py-2 text-gray-600 text-sm">{user?.email}</p>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-semibold"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mb-6 transform transition duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Upload Video from URL
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Enter video URL:
          </label>
          <input
            type="text"
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        {!isTranscription && (
          <Button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            onClick={handleURLUpload}
          >
            {loading ? <Loader2 className="animate-spin" /> : null}
            {loading ? "Uploading" : "Upload Video"}
          </Button>
        )}

        {isTranscription && (
          <Button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 mt-4"
            onClick={handleGenerateQuiz}
          >
            {loading ? <Loader2 className="animate-spin" /> : null}
            {loading ? "Generating" : "Generate Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadVideoPage;
