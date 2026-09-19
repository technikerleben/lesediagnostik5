import "./globals.css";

export const metadata = {
  title: "Lese-Navigator Jahrgang 5",
  description: "Digitaler Förderwegweiser für das Lesen in Jahrgang 5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
