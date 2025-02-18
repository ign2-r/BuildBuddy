"use client";

import Link from "next/link";
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";

export default function Home() {
  return (
    <main className="min-h-screen flex bg-gray-900 text-white">
      {/* Left 1/4: Chatbot Panel */}
      <aside className="w-1/4 bg-white text-black p-6 flex flex-col">
        <h2 className="text-xl font-bold text-black-400">💬 Chat</h2>
        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          <div className="bg-gray-700 text-white p-3 rounded-md">Hello! How can I help?</div>
          <div className="bg-blue-500 text-white p-3 rounded-md self-end">I need a gaming PC!</div>
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          className="mt-4 p-2 bg-white-700 text-black rounded-md border border-gray w-full"
        />
      </aside>

      {/* Right 3/4: Main Content */}
      <section className="w-3/4 flex flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-4 text-blue-400">
            BuildBuddy
          </h1>
          <p className="text-gray-300 text-lg">
            Your AI-powered assistant for building the perfect PC. Get tailored recommendations
            based on your needs, budget, and preferences.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg flex items-center gap-2 transition"
            >
              Get Started <ArrowRightCircleIcon className="w-6 h-6" />
            </Link>
            <Link
              href="/home"
              className="border border-gray-400 hover:border-white text-gray-300 px-6 py-3 rounded-lg text-lg transition"
            >
              Explore
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
          <FeatureCard
            title="🔍 Smart Recommendations"
            description="Tell us what you need, and BuildBuddy will suggest the best PC parts for you."
          />
          <FeatureCard
            title="⚡ Performance Optimized"
            description="Compare benchmarks and find the best price-to-performance ratio."
          />
          <FeatureCard
            title="🛒 One-Click Buying"
            description="Add all recommended parts to your cart with a single click."
          />
        </section>
      </section>
    </main>
  );
}

// Feature Card Component
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:scale-105 transition">
      <h3 className="text-xl font-semibold text-blue-400">{title}</h3>
      <p className="text-gray-300 mt-2">{description}</p>
    </div>
  );
}
