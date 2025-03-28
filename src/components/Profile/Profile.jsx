"use client"; // Ensure this is a client-side component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { PencilIcon, UsersIcon, CalendarIcon, DocumentTextIcon, ChatAltIcon } from '@heroicons/react/outline';

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expert, setExpert] = useState(null);
  const [appointments, setAppointments] = useState([]); // For pending appointments
  const [confirmedAppointments, setConfirmedAppointments] = useState([]); // For confirmed appointments
  const [summaries, setSummaries] = useState([]); // To store multiple summaries
  const [message, setMessage] = useState("");
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [token, setToken] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    specialization: "",
    address: "",
    gender: "",
    profilePic: null,
  });
  const [previewPic, setPreviewPic] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      fetchExpertData(storedToken);
    }
  }, [router]);

  // Fetch Expert Profile Data
  const fetchExpertData = async (token) => {
    try {
      const response = await axios.get("http://localhost:3046/api/expert/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setExpert(response.data.expert);
        setUpdatedProfile({
          name: response.data.expert.name,
          specialization: response.data.expert.specialization,
          address: response.data.expert.address || "",
          gender: response.data.expert.gender || "Male",
          profilePic: response.data.expert.profilePic,
        });
      } else {
        setMessage("Failed to load expert data.");
      }
    } catch (error) {
      console.error("Error fetching expert data:", error);
      setMessage("Error fetching expert data.");
    }
  };

  // Fetch Data for Specific Tab (Summary, Appointments, etc.)
  const fetchDataForTab = async (tab) => {
    const token = localStorage.getItem("authToken");
    if (tab === "summary") {
      fetchSummary(token);
    } else if (tab === "pendingAppointments") {
      fetchAppointments(token);
    }
  };

  const fetchAppointments = async (token) => {
    setLoadingAppointments(true);
    try {
      const response = await axios.get("http://localhost:3046/api/appointments/expert", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const { pending, confirmed } = response.data.appointments;
        setAppointments(pending); 
        setConfirmedAppointments(confirmed); // Store confirmed appointments for feedback
      } else {
        setAppointments([]);
        setConfirmedAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setMessage("Error fetching appointments.");
    }
    setLoadingAppointments(false);
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    const status = action === "confirmed" ? "confirmed" : "rejected";
  
    try {
      const response = await axios.post(
        "http://localhost:3046/api/expert/confirm", // Correct POST endpoint
        {
          appointmentId: appointmentId, // Send the appointmentId
          status: status, // Send the status (confirmed or rejected)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in the Authorization header
          },
        }
      );
  
      if (response.data.success) {
        // Update the appointments list by removing the confirmed/rejected appointment
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
  
        // Add the confirmed appointment to the confirmed appointments list
        if (status === "confirmed") {
          const confirmedAppointment = response.data.appointment; // Assuming the response contains the updated appointment
          setConfirmedAppointments((prevConfirmedAppointments) => [
            ...prevConfirmedAppointments,
            confirmedAppointment,
          ]);
        }
  
        setMessage("Appointment status updated successfully!");
      } else {
        setMessage(response.data.message); // Show the error message from the response
      }
    } catch (error) {
      console.error("Error confirming or rejecting appointment:", error);
      setMessage("Failed to update appointment status.");
    }
  };

  const fetchSummary = async (token) => {
    try {
      const response = await axios.get("http://localhost:3046/api/expert/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSummaries(response.data.summaries); // Store the array of summaries
      } else {
        setSummaries([]);
        setMessage("No summaries found. They may have been deleted.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSummaries([]);
        setMessage("No summaries found. They may have been deleted.");
      } else {
        console.error("Error fetching summaries:", error);
        setMessage("Error fetching summaries.");
      }
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updatedExpert = {
      name: updatedProfile.name,
      specialization: updatedProfile.specialization,
      address: updatedProfile.address,
      gender: updatedProfile.gender,
      profilePic: previewPic, 
    };

    try {
      const response = await axios.put("http://localhost:3046/api/expert/profile", updatedExpert, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setExpert(response.data.expert);
        setMessage("Profile updated successfully!");
        setPreviewPic(response.data.expert.profilePic);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile.");
    }
  };
  // Fetch confirmed appointments for the feedback tab
const fetchConfirmedAppointmentsForFeedback = async (token) => {
  setLoadingAppointments(true);
  try {
    const response = await axios.get("http://localhost:3046/api/appointments/expert", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.success) {
      const { confirmed } = response.data.appointments;  // Only fetching confirmed appointments
      setConfirmedAppointments(confirmed); // Store them in the confirmedAppointments state
    } else {
      setConfirmedAppointments([]);  // Empty list if no confirmed appointments
    }
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    setMessage("Error fetching appointments.");
  }
  setLoadingAppointments(false);
};

useEffect(() => {
  const storedToken = localStorage.getItem("authToken");
  if (storedToken) {
    setToken(storedToken);
    fetchConfirmedAppointmentsForFeedback(storedToken);  // Call to fetch confirmed appointments for feedback
  }
}, []);


const handleFillFeedback = async (appointmentId) => {
  try {
    // You can use the appointmentId from the clicked appointment to redirect the expert to the feedback page
    router.push(`/feedback?appointmentId=${appointmentId}`);
  } catch (err) {
    console.error("Error redirecting to feedback page:", err);
    setError("Failed to redirect to feedback page.");
  }
};
  

  // Handle Tab Switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    fetchDataForTab(tab);  // Fetch data when a tab is switched
  };

  if (!expert) {
    return <p className="text-center mt-10 text-black">Loading expert data...</p>;
  }

  return (
    <div className="flex min-h-screen bg-[#A1E3F9] pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-r from-[#3674B5] to-[#578FCA] text-white p-6 flex flex-col rounded-l-lg shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Image
            src={expert?.profilePic || "/default-avatar.png"} 
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <p className="mt-4 text-xl font-semibold">{expert.name}</p>
          <p className="text-sm">{expert.email}</p>
        </div>

        <nav className="flex-grow">
          <button
            onClick={() => handleTabSwitch("dashboard")}
            className={`block w-full text-left p-4 rounded-md mb-2 ${activeTab === "dashboard" ? "bg-white text-[#3674B5] font-semibold" : "hover:bg-blue-600"}`}
          >
            <PencilIcon className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => handleTabSwitch("pendingAppointments")}
            className={`block w-full text-left p-4 rounded-md mb-2 ${activeTab === "pendingAppointments" ? "bg-white text-[#3674B5] font-semibold" : "hover:bg-blue-600"}`}
          >
            <CalendarIcon className="w-5 h-5 inline mr-2" />
            Pending Appointments
          </button>
          <button
            onClick={() => handleTabSwitch("confirmedAppointments")}
            className={`block w-full text-left p-4 rounded-md mb-2 ${activeTab === "confirmedAppointments" ? "bg-white text-[#3674B5] font-semibold" : "hover:bg-blue-600"}`}
          >
            <UsersIcon className="w-5 h-5 inline mr-2" />
            Confirmed Appointments
          </button>
          <button
            onClick={() => handleTabSwitch("summary")}
            className={`block w-full text-left p-4 rounded-md mb-2 ${activeTab === "summary" ? "bg-white text-[#3674B5] font-semibold" : "hover:bg-blue-600"}`}
          >
            <DocumentTextIcon className="w-5 h-5 inline mr-2" />
            Summary
          </button>
          <button
            onClick={() => handleTabSwitch("feedback")}
            className={`block w-full text-left p-4 rounded-md mb-2 ${activeTab === "feedback" ? "bg-white text-[#3674B5] font-semibold" : "hover:bg-blue-600"}`}
          >
            <ChatAltIcon className="w-5 h-5 inline mr-2" />
            Feedback Report
          </button>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            router.push("/login");
          }}
          className="mt-auto p-4 w-full bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-[#3674B5] mb-4">Dashboard</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {expert.name}</p>
              <p><strong>Email:</strong> {expert.email}</p>
              <p><strong>Specialization:</strong> {expert.specialization}</p>
              <p><strong>Address:</strong> {expert.address || "Not provided"}</p>
              <p><strong>Gender:</strong> {expert.gender}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#D1F8EF] text-[#3674B5] p-2 rounded-md mt-4"
              >
                Edit Profile
              </button>
              {isEditing && (
                <div className="mt-6 p-6 bg-white rounded-md shadow-md">
                  <h3 className="text-xl font-semibold text-[#3674B5] mb-4">Edit Profile</h3>
                  <label className="block mb-2">Name:</label>
                  <input
                    type="text"
                    value={updatedProfile.name}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
                    className="w-full p-2 border rounded-md mb-4"
                  />
                  <label className="block mb-2">Specialization:</label>
                  <input
                    type="text"
                    value={updatedProfile.specialization}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, specialization: e.target.value })}
                    className="w-full p-2 border rounded-md mb-4"
                  />
                  <label className="block mb-2">Address:</label>
                  <input
                    type="text"
                    value={updatedProfile.address}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, address: e.target.value })}
                    className="w-full p-2 border rounded-md mb-4"
                  />
                  <label className="block mb-2">Gender:</label>
                  <select
                    value={updatedProfile.gender}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, gender: e.target.value })}
                    className="w-full p-2 border rounded-md mb-4"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <label className="block mb-2">Profile Picture:</label>
                  <input
                    type="file"
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, profilePic: e.target.files[0] })}
                    className="w-full p-2 border rounded-md mb-4"
                  />
                  <div>
                    <label>Profile Picture:</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setPreviewPic(URL.createObjectURL(file)); 
                        setUpdatedProfile((prevData) => ({
                          ...prevData,
                          profilePic: file,
                        }));
                      }}
                    />
                    {previewPic && <Image src={previewPic} alt="Profile Preview" width={100} height={100} />}
                  </div>
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-[#3674B5] text-white p-2 rounded-md mt-4"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 text-white p-2 rounded-md mt-4 ml-4"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {activeTab === "summary" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-[#3674B5] mb-4">Summary</h2>
            {/* Check if summary data exists */}
            {summaries.length === 0 ? (
              <p>No summaries available.</p>
            ) : (
              summaries.map((summary, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-md mb-6">
                  <p className="mb-2"><strong>Appointment ID:</strong> {summary.appointmentId}</p>
                  <p className="mb-4"><strong>Created At:</strong> {new Date(summary.createdAt).toLocaleDateString()}</p>
                  <ol className="list-decimal list-inside space-y-2">
                    {(() => {
                      try {
                        const parsed = JSON.parse(summary.summary);
                        const parts = parsed.parts?.[0]?.text?.split('. ') || [];
                        return parts.map((line, idx) => (
                          <li key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") + (idx !== parts.length - 1 ? '.' : '') }} />
                        ));
                      } catch (e) {
                        console.error("Summary Parse Error:", e);
                        return <p>Summary is not available.</p>;
                      }
                    })()}
                  </ol>
                </div>
              ))
            )}
          </div>
        )}
          {/* Pending Appointments */}
      {activeTab === "pendingAppointments" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-[#3674B5] mb-4">Pending Appointments</h2>
          {loadingAppointments ? <p>Loading...</p> : (
            <ul>
              {appointments.length === 0 ? (
                <p>No pending appointments found.</p>
              ) : (
            appointments.map((appointment) => (
              <li key={appointment._id} className="border-b py-2">
                <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
              <p><strong>Status:</strong> {appointment.status}</p>
              <div className="space-x-4 mt-2">
                <button
                  onClick={() => handleAppointmentAction(appointment._id, "confirmed")}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleAppointmentAction(appointment._id, "rejected")}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg"
                >
                  Reject
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    )}
  </div>
)}
   {activeTab === "feedback" && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-3xl font-bold text-[#3674B5] mb-4">Feedback Report</h2>
    {loadingAppointments ? (
      <p>Loading...</p>
    ) : (
      <div>
        {confirmedAppointments.length === 0 ? (
          <p>No confirmed appointments found.</p>
        ) : (
          <ul>
            {confirmedAppointments.map((appointment) => (
              <li key={appointment._id} className="border-b py-2">
                <p><strong>Appointment ID:</strong> {appointment._id}</p>
                <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Status:</strong> {appointment.status}</p>

                {/* Check if the status is not 'report sent' before showing the button */}
                {appointment.status !== "report sent" && (
                  <button
                    onClick={() => handleFillFeedback(appointment._id)} // Redirect to feedback form
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-2"
                  >
                    Fill Feedback
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
)}


         {/* Confirmed Appointments */}
         {activeTab === "confirmedAppointments" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-[#3674B5] mb-4">Confirmed Appointments</h2>
            {confirmedAppointments.length === 0 ? (
              <p>No confirmed appointments found.</p>
            ) : (
              <ul>
                {confirmedAppointments.map((appointment) => (
                  <li key={appointment._id} className="border-b py-2">
                    <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.time}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
