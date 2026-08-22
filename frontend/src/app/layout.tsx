// Update: frontend/src/app/layout.tsx
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Providers from "./providers";
import "./globals.css";

import AdminRouteHandler from "@/components/admin/common/AdminRouteHandler";
import UserRouteHandler from "@/components/common/UserRouteHandler";
import WhatsAppBotWrapper from "@/components/common/WhatsAppBotWrapper";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export const metadata = {
  title: "E-commerce App",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers>
            <AuthProvider>
              <CartProvider>
                <AdminAuthProvider>
                  <AdminRouteHandler>
                    <UserRouteHandler>
                      {children}
                      <WhatsAppBotWrapper />
                    </UserRouteHandler>
                  </AdminRouteHandler>
                </AdminAuthProvider>
              </CartProvider>
            </AuthProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}