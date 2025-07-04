"use client";

import { VeltProvider, VeltComments, VeltPresence } from "@veltdev/react";
import VideoComponent from "./components/VideoComponent";

export default function App() {
  console.log(
    "Velt API Key:",
    process.env.NEXT_PUBLIC_VELT_API_KEY ? "Present" : "Missing"
  );

  if (!process.env.NEXT_PUBLIC_VELT_API_KEY) {
    throw new Error("VELT_API_KEY environment variable is required");
  }

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!}>
      <VideoComponent />
    </VeltProvider>
  );
}