import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Poppins, Ubuntu } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import ClientLayout from "@/components/ClientLayout";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "QRGen",
  description: "QR Code Generator Tool POC",
  icons: {},
};

const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
});

const ubuntu = Ubuntu({
  weight: ["400", "500"],
  subsets: ["cyrillic"],
  display: "block",
});

export default function RootLayout({ children }) {  
  return (
    <html lang="en" suppressHydrationWarning
      // className={`${ubuntu.className}`}
    >
      <head>
        {/* OneTrust Cookies Consent Notice start */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
          type="text/javascript"
          charSet="UTF-8"
          data-domain-script="0196d3bf-f3e6-7674-a3b9-e63968118774"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function OptanonWrapper() { }
            `,
          }}
        />
        {/* OneTrust Cookies Consent Notice end */}
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <ClientLayout>{children}</ClientLayout>
              <SpeedInsights />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}