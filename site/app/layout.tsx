import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قبل از اینکه بخری | مشاوره پیش از خرید",
  description: "از نیاز خودت شروع کن، ترجیحاتت را بشناس و درخواست مشاوره پیش از خرید ثبت کن.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
