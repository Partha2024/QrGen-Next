import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import ClientLayout from "@/components/ClientLayout";
import { SpeedInsights } from "@vercel/speed-insights/next"

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

export default function RootLayout({ children }) {  
  return (
    // <html
    //   lang="en" className={`${poppins.className}`}
    // >
    //   <body className={`antialiased`}>
    //     <AuthProvider>
    //       <SidebarProvider>
    //         <AppSidebar />
    //         <main>
    //           <SidebarTrigger className="absolute" />
    //           {children}
    //         </main>
    //         <Toaster />
    //       </SidebarProvider>
    //     </AuthProvider>
    //   </body>
    // </html>
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <SidebarProvider>
            <ClientLayout>{children}</ClientLayout>
            <SpeedInsights />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}