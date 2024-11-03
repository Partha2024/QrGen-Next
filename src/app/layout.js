import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export const metadata = {
  title: "QRGen",
  description: "QR Code Generator Tool POC",
  icons: {
  },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`antialiased`}>
                <SidebarProvider>
                    <AppSidebar />
                    <main>
                        {children}
                    </main>
                </SidebarProvider>
            </body>
        </html>
    );  
}
