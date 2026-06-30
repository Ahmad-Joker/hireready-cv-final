import "./globals.css";

export const metadata = {
  title: "HireReady CV",
  description: "A UI-only MVP for a CV / ATS analyzer website.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
