interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
}

export function Navigation({ activeTab, setActiveTab, userRole }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "cases", label: "Case Management", icon: "📋" },
    { id: "signals", label: "Signal Detection", icon: "🔍" },
    { id: "reports", label: "Reports", icon: "📈" },
  ];

  // Add admin-only tabs
  if (userRole === "admin") {
    tabs.push({ id: "users", label: "User Management", icon: "👥" });
  }

  return (
    <nav className="border-t bg-gray-50">
      <div className="px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
