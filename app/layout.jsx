import "./globals.css";

export const metadata = {
  title: "Quiz App",
  description: "Somali quiz app built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <body>{children}</body>
    </html>
  );
}