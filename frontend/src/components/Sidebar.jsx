import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/search", label: "Search Logs", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-dot" />
        <span className="brand-name">LogAnalytics</span>
      </div>

      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <Icon size={17} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
