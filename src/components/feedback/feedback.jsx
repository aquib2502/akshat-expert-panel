
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/compat/router";

export default function Feedback() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [questionCount, setQuestionCount] = useState(0);


  const router = useRouter();

  useEffect(() => {
    const appointmentIdParam = new URLSearchParams(window.location.search).get("appointmentId");
    setAppointmentId(appointmentIdParam);
  }, []);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchStartingQuestion = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3046/api/feedback/start?appointmentId=${appointmentId}`
        );
        if (res.data.success) {
          setCurrentQuestion(res.data.question);
        } else {
          setError("No starting question found.");
        }
      } catch (err) {
        setError("Failed to load the starting question.");
      }
    };

    fetchStartingQuestion();
  }, [appointmentId]);

  const handleAnswerSubmit = async (answer) => {
    setResponses((prev) => ({ ...prev, [currentQuestion.questionId]: answer }));

    setQuestionCount((prevCount) => prevCount + 1);

    // Check if it's the last question
    if (questionCount + 1 === 10) {
      // Submit feedback and redirect after success
      try {
        const response = await axios.post(
          'http://localhost:3046/api/feedback/submit',
          { appointmentId, responses: { ...responses, [currentQuestion.questionId]: answer } }
        );
        if (response.data.success) {
          setError("Feedback submitted successfully!");
          // Redirect to the completion page
          router.push("/feedback/completion");
        }
      } catch (err) {
        setError("Error submitting feedback.");
      }
      return;
    }

    // Proceed to the next question
    const nextQuestionId = currentQuestion.nextRule[answer];
    if (!nextQuestionId) {
      setError("Invalid next question.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3046/api/feedback/${nextQuestionId}?appointmentId=${appointmentId}&currentQuestionId=${currentQuestion.questionId}&answer=${encodeURIComponent(answer)}`
      );

      if (res.data.success) {
        setCurrentQuestion(res.data.question);
      } else {
        setError("Next question not found.");
      }
    } catch (err) {
      setError("Error fetching the next question.");
    }
  };

  const handleTextChange = (e) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.questionId]: e.target.value,
    }));
  };

  const handleTextAnswerSubmit = async (answer) => {
    setResponses((prev) => ({ ...prev, [currentQuestion.questionId]: answer }));
  
    setQuestionCount((prevCount) => prevCount + 1);
  
    // Ensure the responses are serializable and do not include non-serializable data like DOM elements
    const serializableResponses = {};
    for (const key in responses) {
      if (responses.hasOwnProperty(key) && typeof responses[key] !== 'object') {
        serializableResponses[key] = responses[key];
      }
    }
  
    try {
      // Send valid serialized responses to the server
      const response = await axios.post('http://localhost:3046/api/feedback/submit', {
        appointmentId,
        responses: serializableResponses,  // Send only serializable responses
      });
  
      // If feedback is successfully submitted
      if (response.data.success) {
        // Update the status to "report sent"
        await axios.post('http://localhost:3046/api/appointments/updateStatus', {
          appointmentId,
          status: "report sent",
        });
  
        // Ensure that router is initialized before redirecting
        if (router && router.push) {
          // Redirect to the completion page
          router.push('/feedback/completion');
        } else {
          setError("Error: Router not initialized.");
        }
      } else {
        setError("Error submitting feedback.");
      }
    } catch (err) {
      setError("Error submitting feedback.");
      console.error("Error in feedback submission:", err);
    }
  };
  
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6">
      <div className="w-full sm:w-1/2 md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {!currentQuestion ? (
          <div className="text-center text-lg text-gray-500">Loading feedback question...</div>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{currentQuestion.text}</h3>

            {/* If the question is of type 'mcq' */}
            {currentQuestion.type === "multiple-choice" && (
              <div className="space-y-4">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    className="w-full py-2 px-4 text-lg font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* If the question is of type 'text' */}
            {currentQuestion.type === "text" && (
              <div>
                <textarea
                  value={responses[currentQuestion.questionId] || ""}
                  onChange={handleTextChange}
                  rows="5"
                  className="w-full p-2 border rounded-md mb-4"
                  placeholder="Enter your feedback..."
                ></textarea>

                <button
                  onClick={handleTextAnswerSubmit}
                  className="w-full py-2 px-4 text-lg font-semibold text-white bg-green-600 rounded-md"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
