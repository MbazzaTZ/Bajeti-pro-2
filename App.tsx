import { useState, useEffect } from "react";
import { MobileLayout } from "./components/mobile-layout";
import { Dashboard } from "./components/dashboard";
import { Transactions } from "./components/transactions";
import { AddTransaction } from "./components/add-transaction";
import { Summary } from "./components/summary";
import { Profile } from "./components/profile";
import { Login } from "./components/login";
import { Settings } from "./components/settings";
import { Notifications, Notification } from "./components/notifications";
import { 
  BudgetAlertModal,
  GoalAchievedModal,
  LoanReminderModal,
  TransactionConfirmModal,
  InsightsModal,
  QuickAddBudgetModal
} from "./components/popup-modals";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { CurrencyProvider } from "./lib/currency-context";
import { useLocalStorage } from "./lib/use-local-storage";

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "transaction",
    title: "Payment Received",
    message: "Salary deposit of $8,500 has been credited to your account.",
    time: "2 hours ago",
    isRead: false,
    icon: "dollar",
    priority: "high"
  },
  {
    id: "2",
    type: "budget",
    title: "Budget Warning",
    message: "You've spent 85% of your Food & Dining budget this month.",
    time: "5 hours ago",
    isRead: false,
    icon: "alert",
    priority: "medium"
  },
  {
    id: "3",
    type: "loan",
    title: "Loan Payment Due",
    message: "Your home loan payment of $1,250 is due in 3 days.",
    time: "1 day ago",
    isRead: false,
    icon: "credit",
    priority: "high"
  },
  {
    id: "4",
    type: "goal",
    title: "Goal Progress",
    message: "You're 85% towards your Emergency Fund goal. Keep it up!",
    time: "2 days ago",
    isRead: true,
    icon: "target",
    priority: "low"
  },
  {
    id: "5",
    type: "alert",
    title: "Spending Insight",
    message: "Your spending increased by 15% compared to last week.",
    time: "3 days ago",
    isRead: true,
    icon: "trending",
    priority: "medium"
  },
  {
    id: "6",
    type: "goal",
    title: "Goal Achieved!",
    message: "Congratulations! You've reached your Vacation savings goal.",
    time: "5 days ago",
    isRead: true,
    icon: "check",
    priority: "low"
  }
];

export default function App() {
  // Use localStorage for persistent state
  const [currentScreen, setCurrentScreen] = useLocalStorage<string>("ji-bajeti-screen", "login");
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>("ji-bajeti-logged-in", false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>("ji-bajeti-dark-mode", false);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>("ji-bajeti-notifications", INITIAL_NOTIFICATIONS);
  const [hasShownInsights, setHasShownInsights] = useLocalStorage<boolean>("ji-bajeti-shown-insights", false);
  
  // Modal states (these don't need to persist)
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [showGoalAchieved, setShowGoalAchieved] = useState(false);
  const [showLoanReminder, setShowLoanReminder] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showQuickBudget, setShowQuickBudget] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Show welcome modal after login (only once per session)
  useEffect(() => {
    if (isLoggedIn && !hasShownInsights) {
      const timer = setTimeout(() => {
        setShowInsights(true);
        setHasShownInsights(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, hasShownInsights, setHasShownInsights]);

  // If logged in but on login screen, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn && currentScreen === "login") {
      setCurrentScreen("dashboard");
    }
  }, [isLoggedIn, currentScreen, setCurrentScreen]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen("dashboard");
    setHasShownInsights(false); // Reset insights flag for new session
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen("login");
    setHasShownInsights(false);
    // Optionally clear other data on logout
    // setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  
  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const handleNotificationClick = () => {
    setCurrentScreen("notifications");
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isLoggedIn) {
    return (
      <CurrencyProvider>
        <Login onLogin={handleLogin} />
        <Toaster />
      </CurrencyProvider>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "transactions":
        return <Transactions onNavigate={handleNavigate} />;
      case "add-transaction":
        return <AddTransaction onNavigate={handleNavigate} />;
      case "summary":
        return <Summary onNavigate={handleNavigate} />;
      case "profile":
        return <Profile onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onLogout={handleLogout} />;
      case "settings":
        return <Settings onNavigate={handleNavigate} />;
      case "notifications":
        return (
          <Notifications
            onNavigate={handleNavigate}
            onClose={() => handleNavigate("dashboard")}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
          />
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const showBackButton = ["add-transaction", "settings", "notifications"].includes(currentScreen);

  return (
    <CurrencyProvider>
      <MobileLayout
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        showBackButton={showBackButton}
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      >
        {renderScreen()}
      </MobileLayout>
      
      {/* Demo Modal Triggers - Add to Dashboard for testing */}
      {currentScreen === "dashboard" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowBudgetAlert(true)}
            className="text-xs"
          >
            Budget Alert
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowLoanReminder(true)}
            className="text-xs"
          >
            Loan Reminder
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowGoalAchieved(true)}
            className="text-xs"
          >
            Goal Achieved
          </Button>
        </div>
      )}
      
      {/* Popup Modals */}
      <BudgetAlertModal
        open={showBudgetAlert}
        onOpenChange={setShowBudgetAlert}
        category="Food & Dining"
        spent={850}
        budget={1000}
      />
      
      <GoalAchievedModal
        open={showGoalAchieved}
        onOpenChange={setShowGoalAchieved}
        goalName="Emergency Fund"
        amount={10000}
      />
      
      <LoanReminderModal
        open={showLoanReminder}
        onOpenChange={setShowLoanReminder}
        loanName="Home Loan"
        amount={1250}
        dueDate="November 1"
      />
      
      <InsightsModal
        open={showInsights}
        onOpenChange={setShowInsights}
      />
      
      <QuickAddBudgetModal
        open={showQuickBudget}
        onOpenChange={setShowQuickBudget}
      />
      
      <Toaster />
    </CurrencyProvider>
  );
}