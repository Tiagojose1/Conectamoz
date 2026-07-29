import React from "react";
import AppRoutes from "./Routes/AppRoutes"; // Verifique se a pasta é "Routes" ou "routes" (maiúscula/minúscula)

function App() {
  return (
    <div className="App font-sans antialiased text-gray-900 bg-gray-100 min-h-screen">
      <AppRoutes />
    </div>
  );
}

export default App;