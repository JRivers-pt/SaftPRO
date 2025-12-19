import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "SaftPro by TechScire Solutions",
  description: "Análise avançada de SAFT para contabilistas.",
  manifest: "/manifest.json",
};

import AuthGuard from "../components/AuthGuard";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={outfit.className}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
