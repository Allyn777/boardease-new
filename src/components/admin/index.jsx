import { Routes, Route } from "react-router-dom";
import Layout from "./layout";

import Dashboard from "./dashboard";
import Rooms from "./rooms";
import Tenants from "./tenants";
import Payments from "./payment";

export default function AdminRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="payments" element={<Payments />} />
      </Routes>
    </Layout>
  );
}
