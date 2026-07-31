import React from "react";
import { Analytics } from "@vercel/analytics/react";
import AppRoutes from "./Routes/AppRoutes"; // Verifique se a pasta é "Routes" ou "routes" (maiúscula/minúscula)

function App() {
  return (
    <div className="App font-sans antialiased text-gray-900 bg-gray-100 min-h-screen">
      <AppRoutes />
      <Analytics />
    </div>
  );
}

export default App;