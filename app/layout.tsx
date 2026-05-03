import type { Metadata } from "next";
import { Suspense } from "react";
import { Cherry_Bomb_One, Figtree, Pacifico } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers";
import { APP_NAME, APP_TAGLINE } from "@/constants/values";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

const cherryBombOne = Cherry_Bomb_One({
  variable: "--font-cherry-bomb-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} – ${APP_TAGLINE}`,
  description:
    "Book bus tickets across Tanzania in minutes. Compare operators, pick your seat, pay with mobile money. Modern, simple, secure.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${pacifico.variable} ${cherryBombOne.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                try {
                  const stored = localStorage.getItem('preferences-store');
                  let theme = 'light';
                  let language = 'en';
                  if (stored) {
                    const preferences = JSON.parse(stored);
                    if (preferences && preferences.state) {
                      theme = preferences.state.theme || 'light';
                      language = preferences.state.language || 'en';
                    }
                  }
                  const resolvedTheme = (theme === 'light' || theme === 'dark') ? theme : 'light';
                  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
                  if (language) document.documentElement.lang = language;
                  document.documentElement.setAttribute('data-theme-initialized', 'true');
                } catch (e) {
                  document.documentElement.classList.toggle('dark', false);
                  document.documentElement.lang = 'en';
                  document.documentElement.setAttribute('data-theme-initialized', 'true');
                }
              })();
            `,
          }}
        />
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
