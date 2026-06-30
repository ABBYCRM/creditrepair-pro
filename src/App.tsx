import { Routes, Route } from "react-router";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreditReports from "./pages/CreditReports";
import DisputeCenter from "./pages/DisputeCenter";
import LetterGenerator from "./pages/LetterGenerator";
import Creditors from "./pages/Creditors";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<CreditReports />} />
        <Route path="/disputes" element={<DisputeCenter />} />
        <Route path="/letters" element={<LetterGenerator />} />
        <Route path="/creditors" element={<Creditors />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
