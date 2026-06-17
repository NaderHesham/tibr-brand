import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { ToastProvider } from "@/components/ui/Toast";

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onMenuOpen={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
}
