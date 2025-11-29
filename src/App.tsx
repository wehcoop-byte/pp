// Compatibility shim: App.tsx is no longer the application root.
// Routing now lives in src/routes/AppRoutes.tsx and pages handle the flows.
// If something still imports App, this component will render nothing,
// and log a warning so you can trace the stray import.

import React, { useEffect } from "react";

const App: React.FC = () => {
  useEffect(() => {
    console.warn("[pet-pawtrAIt] App.tsx is deprecated. Use <AppRoutes /> and the pages in src/pages/*.");
  }, []);
  return null;
};

export default App;