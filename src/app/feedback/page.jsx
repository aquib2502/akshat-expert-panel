// src/app/feedback/page.jsx

"use client"; // Ensure this is client-side code
import { Suspense } from "react";
import Feedback from "@/components/feedback/feedback";// Import the feedback page

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading Feedback...</div>}>
        <Feedback /> {/* This calls the feedback.jsx page */}
      </Suspense>
    </div>
  );
};

export default Page;
