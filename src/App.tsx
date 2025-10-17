import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { Navigation } from "./components/Navigation";
import { CaseManagement } from "./components/CaseManagement";
import { SignalDetection } from "./components/SignalDetection";
import { Reports } from "./components/Reports";
import { UserManagement } from "./components/UserManagement";
import { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PharmVigilance</h1>
              <span className="text-sm text-gray-500">Safety Monitoring Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.name || currentUser?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser?.profile?.role} />
        </header>
        
        <main className="flex-1 p-6">
          <Content activeTab={activeTab} />
        </main>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">PharmVigilance</h1>
              <p className="text-gray-600">Safety Monitoring Platform</p>
              <p className="text-sm text-gray-500 mt-2">Sign in to access the system</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "cases":
      return <CaseManagement />;
    case "signals":
      return <SignalDetection />;
    case "reports":
      return <Reports />;
    case "users":
      return <UserManagement />;
    default:
      return <Dashboard />;
  }
}
