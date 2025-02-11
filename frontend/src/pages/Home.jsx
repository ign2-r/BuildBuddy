import { useState } from "react";

function Home() {
    return (
      <div className="h-screen flex">
        {/* Left 1/4: Chatbot Panel */}
        <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col">
          <h2 className="text-xl font-bold">💬 Chat</h2>
          <div className="flex-1 overflow-y-auto mt-4">
            {/* Chat messages placeholder */}
            <div className="space-y-2">
              <div className="bg-gray-700 p-2 rounded-md">Hello! How can I help?</div>
              <div className="bg-blue-500 p-2 rounded-md self-end">I need a gaming PC!</div>
            </div>
          </div>
          {/* Chat input */}
          <input
            type="text"
            placeholder="Type a message..."
            className="mt-4 p-2 bg-gray-700 text-white rounded-md"
          />
        </div>
  
        {/* Right 3/4: Main Content */}
        <div className="w-3/4 p-8 bg-gray-100 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to BuildBuddy</h1>
          <p className="mt-2 text-gray-600">
            Let’s help you find the perfect PC build!
          </p>
  
          {/* Placeholder for PC Part Picker UI */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 shadow rounded-lg">💻 CPU</div>
            <div className="bg-white p-4 shadow rounded-lg">🎮 GPU</div>
            <div className="bg-white p-4 shadow rounded-lg">🖥 Monitor</div>
            <div className="bg-white p-4 shadow rounded-lg">⌨️ Peripherals</div>
          </div>
        </div>
      </div>
    );
  }
  
  export default Home;