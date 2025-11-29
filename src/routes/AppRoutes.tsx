import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const Home = React.lazy(() => import("../pages/Home"));
const Create = React.lazy(() => import("../pages/Create"));
const OrderComplete = React.lazy(() => import("../pages/OrderComplete"));

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{padding: 24, color: 'white'}}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};