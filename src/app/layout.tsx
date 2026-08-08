import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProgramLoom — Event program operations",
  description: "A calmer way to run the program, from CFP to published agenda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
