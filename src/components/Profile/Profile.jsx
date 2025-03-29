"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  User, 
  Calendar, 
  FileText, 
  MessageSquare, 
  LogOut, 
  CheckCircle, 
  Clock,
  Edit,
  MapPin,
  Briefcase,
  UserCircle,
  Upload,
  X,
  Mail,
  Hash
} from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expert, setExpert] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [token, setToken] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    specialization: "",
    address: "",
    gender: "",
    profilePic: "",
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
          profilePic: response.data.expert.profilePic || "/default.png",
        });
      } else {
        setMessage("Failed to load expert data.");
      }
    } catch (error) {
      console.error("Error fetching expert data:", error);
      setMessage("Error fetching expert data.");
    }
  };

  // Fetch Data for Specific Tab
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
        setConfirmedAppointments(confirmed);
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
        "http://localhost:3046/api/expert/confirm",
        {
          appointmentId: appointmentId,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
  
        if (status === "confirmed") {
          const confirmedAppointment = response.data.appointment;
          setConfirmedAppointments((prevConfirmedAppointments) => [
            ...prevConfirmedAppointments,
            confirmedAppointment,
          ]);
        }
  
        setMessage("Appointment status updated successfully!");
      } else {
        setMessage(response.data.message);
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
        setSummaries(response.data.summaries);
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
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile.");
    }
  };

  const fetchConfirmedAppointmentsForFeedback = async (token) => {
    setLoadingAppointments(true);
    try {
      const response = await axios.get("http://localhost:3046/api/appointments/expert", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const { confirmed } = response.data.appointments;
        setConfirmedAppointments(confirmed);
      } else {
        setConfirmedAppointments([]);
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
      fetchConfirmedAppointmentsForFeedback(storedToken);
    }
  }, []);

  const handleFillFeedback = async (appointmentId) => {
    try {
      router.push(`/feedback?appointmentId=${appointmentId}`);
    } catch (err) {
      console.error("Error redirecting to feedback page:", err);
      setMessage("Failed to redirect to feedback page.");
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    fetchDataForTab(tab);
  };

  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="text-emerald-400 text-xl font-semibold">Loading expert data...</div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "pendingAppointments", label: "Pending Appointments", icon: Clock },
    { id: "confirmedAppointments", label: "Confirmed Appointments", icon: CheckCircle },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "feedback", label: "Feedback Report", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 h-fit border border-white/20"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Image
                src={expert?.profilePic || "/default-avatar.png"}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full border-4 border-emerald-400/20 shadow-lg"
                unoptimized
              />
              <div className="absolute bottom-0 right-0 bg-emerald-400 rounded-full p-2 shadow-lg">
                <Edit className="w-4 h-4 text-emerald-900" />
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              {expert.name}
            </h2>
            <p className="text-emerald-400/80">{expert.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabSwitch(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              router.push("/login");
            }}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          {message && (
            <div className="mb-6 p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 text-center">
              {message}
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h1 className="text-3xl font-bold text-white mb-8">
                Expert Dashboard
              </h1>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField icon={User} label="Name" value={expert.name} />
                  <ProfileField icon={Mail} label="Email" value={expert.email} />
                  <ProfileField icon={Briefcase} label="Specialization" value={expert.specialization} />
                  <ProfileField icon={MapPin} label="Address" value={expert.address || "Not provided"} />
                  <ProfileField icon={UserCircle} label="Gender" value={expert.gender} />
                </div>
              ) : (
                <EditProfileForm
                  updatedProfile={updatedProfile}
                  setUpdatedProfile={setUpdatedProfile}
                  previewPic={previewPic}
                  setPreviewPic={setPreviewPic}
                  handleProfileUpdate={handleProfileUpdate}
                  setIsEditing={setIsEditing}
                />
              )}

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-8 px-6 py-3 bg-emerald-400 text-emerald-900 rounded-xl font-semibold hover:bg-emerald-300 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          )}

     
     
      {activeTab === "pendingAppointments" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-8">
            Pending Appointments
          </h1>
          
          {loadingAppointments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-emerald-400/80">
                  No pending appointments found
                </div>
              ) : (
                appointments.map((appointment) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-emerald-400/80">Date</p>
                          <p className="font-medium text-white">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-emerald-400/80">Time</p>
                          <p className="font-medium text-white">{appointment.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-emerald-400/80">Status</p>
                          <p className="font-medium text-white">{appointment.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAppointmentAction(appointment._id, "confirmed")}
                        className="flex-1 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirm
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAppointmentAction(appointment._id, "rejected")}
                        className="flex-1 bg-red-400/20 hover:bg-red-400/30 text-red-400 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
        )}


        {/* Confirmed Appointments */}
{activeTab === "confirmedAppointments" && (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
    <h1 className="text-3xl font-bold text-white mb-8">
      Confirmed Appointments
    </h1>
    
    {loadingAppointments ? (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    ) : (
      <div className="space-y-4">
        {confirmedAppointments.length === 0 ? (
          <div className="text-center py-8 text-emerald-400/80">
            No confirmed appointments found
          </div>
        ) : (
          confirmedAppointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-emerald-400/80">Date</p>
                    <p className="font-medium text-white">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-emerald-400/80">Time</p>
                    <p className="font-medium text-white">{appointment.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-emerald-400/80">Status</p>
                    <p className="font-medium text-white">{appointment.status}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    )}
  </div>
)}

{/* Summary */}
{activeTab === "summary" && (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
    <h1 className="text-3xl font-bold text-white mb-8">
      Summary Reports
    </h1>
    
    {summaries.length === 0 ? (
      <div className="text-center py-8 text-emerald-400/80">
        No summaries available
      </div>
    ) : (
      <div className="space-y-6">
        {summaries.map((summary, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-400/80">Appointment ID</p>
                  <p className="font-medium text-white">{summary.appointmentId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-400/80">Created At</p>
                  <p className="font-medium text-white">
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <ol className="space-y-3">
                {(() => {
                  try {
                    const parsed = JSON.parse(summary.summary);
                    const parts = parsed.parts?.[0]?.text?.split('. ') || [];
                    return parts.map((line, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-white/90 flex gap-3"
                      >
                        <span className="text-emerald-400">{idx + 1}.</span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: line.replace(
                              /\*\*(.*?)\*\*/g,
                              '<span class="text-emerald-400 font-semibold">$1</span>'
                            ) + (idx !== parts.length - 1 ? '.' : '')
                          }}
                        />
                      </motion.li>
                    ));
                  } catch (e) {
                    console.error("Summary Parse Error:", e);
                    return (
                      <div className="text-red-400 text-center py-4">
                        Summary is not available
                      </div>
                    );
                  }
                })()}
              </ol>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
)}



    {activeTab === "feedback" && (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-8">
          Feedback Report
        </h1>
        
        {loadingAppointments ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {confirmedAppointments.length === 0 ? (
              <div className="text-center py-8 text-emerald-400/80">
                No confirmed appointments found
              </div>
            ) : (
              confirmedAppointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm text-emerald-400/80">Appointment ID</p>
                        <p className="font-medium text-white">{appointment._id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm text-emerald-400/80">Date</p>
                        <p className="font-medium text-white">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm text-emerald-400/80">Time</p>
                        <p className="font-medium text-white">{appointment.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm text-emerald-400/80">Status</p>
                        <p className="font-medium text-white">{appointment.status}</p>
                      </div>
                    </div>
                  </div>

                  {appointment.status !== "report sent" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFillFeedback(appointment._id)}
                      className="w-full mt-4 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Fill Feedback
                    </motion.button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

       )}




          {/* Other tabs remain unchanged */}
          {/* ... Rest of the code for other tabs ... */}
        </motion.div>
      </div>
    </div>
  );
}

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
    <Icon className="w-5 h-5 text-emerald-400" />
    <div>
      <p className="text-sm text-emerald-400/80">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  </div>
);

const EditProfileForm = ({
  updatedProfile,
  setUpdatedProfile,
  previewPic,
  setPreviewPic,
  handleProfileUpdate,
  setIsEditing
}) => (
  <form onSubmit={handleProfileUpdate} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        label="Name"
        name="name"
        value={updatedProfile.name}
        onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
      />
      <FormField
        label="Specialization"
        name="specialization"
        value={updatedProfile.specialization}
        onChange={(e) => setUpdatedProfile({ ...updatedProfile, specialization: e.target.value })}
      />
      <FormField
        label="Address"
        name="address"
        value={updatedProfile.address}
        onChange={(e) => setUpdatedProfile({ ...updatedProfile, address: e.target.value })}
      />
      <div className="space-y-2">
        <label className="block text-emerald-400">Gender</label>
        <select
          value={updatedProfile.gender}
          onChange={(e) => setUpdatedProfile({ ...updatedProfile, gender: e.target.value })}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
    </div>

    <div className="space-y-2">
      <label className="block text-emerald-400">Profile Picture</label>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl cursor-pointer hover:bg-emerald-400/20 transition-all">
          <Upload className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400">Choose File</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              setPreviewPic(URL.createObjectURL(file));
              setUpdatedProfile((prev) => ({ ...prev, profilePic: file }));
            }}
          />
        </label>
        {previewPic && (
          <Image
            src={previewPic}
            alt="Profile Preview"
            width={60}
            height={60}
            className="rounded-full border-2 border-emerald-400/20"
          />
        )}
      </div>
    </div>

    <div className="flex gap-4">
      <button
        type="submit"
        className="px-6 py-3 bg-emerald-400 text-emerald-900 rounded-xl font-semibold hover:bg-emerald-300 transition-all flex items-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        Save Changes
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="px-6 py-3 bg-red-400/10 text-red-400 rounded-xl font-semibold hover:bg-red-400/20 transition-all flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  </form>
);

const FormField = ({ label, name, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-emerald-400">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
    />
  </div>
);