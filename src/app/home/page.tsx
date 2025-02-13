export default function Home() {
    return (
      <div className="h-screen flex">
        <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col">
          <h2 className="text-xl font-bold">💬 Chat</h2>
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2">
              <div className="bg-gray-700 p-2 rounded-md">Hello! How can I help?</div>
              <div className="bg-blue-500 p-2 rounded-md self-end">I need a gaming PC!</div>
            </div>
          </div>
          <input type="text" placeholder="Type a message..." className="mt-4 p-2 bg-gray-700 text-white rounded-md" />
        </div>
        <div className="w-3/4 p-8 bg-gray-100 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to BuildBuddy</h1>
        </div>
      </div>
    );
  }
  