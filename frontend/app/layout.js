import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "LearnHub — Modern Learning Platform",
  description:
    "Master new skills with curated courses, interactive video lessons, and real-time doubt clearing. Your premium learning experience starts here.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0a0a0a",
                color: "#ededed",
                border: "1px solid #262626",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
