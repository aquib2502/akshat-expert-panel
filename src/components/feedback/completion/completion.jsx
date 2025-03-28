"use client"; // Ensure that the component is client-side

import { useEffect } from "react";
import { useRouter } from "next/compat/router";


export default function FeedbackCompletion() {
  const router = useRouter();

  useEffect(() => {
    // Make sure the router is ready before attempting to redirect
    if (router && router.push) {
      const timer = setTimeout(() => {
        // Redirect to the profile page after 3 seconds
        router.push("/profile");
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer); // Clean up the timeout on unmount
    }
  }, [router]); // Re-run when the router object is ready

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-green-500">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl text-center max-w-xl w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
            Feedback Submitted Successfully!
          </h1>
          <p className="text-gray-700 text-base sm:text-lg mb-4">
            Your feedback has been recorded and sent for review.
          </p>
          <p className="text-gray-500 text-sm sm:text-base">
            You will be redirected to your profile shortly to view your appointments.
          </p>
        </div>
      </div>
    </div>
  );
}
