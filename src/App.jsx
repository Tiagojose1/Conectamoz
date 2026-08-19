import React from "react";
import AppRoutes from "./Routes/AppRoutes";
import Notifications from "./Pages/Notifications";
function App() {
  return <AppRoutes />;
}
<Route path="/notificacoes" element={<Notifications />} />
export default App;