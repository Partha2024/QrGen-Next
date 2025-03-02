"use client";
import { Button } from "@/components/ui/button";
import { Link, MessageSquareMore } from "lucide-react";

export default function HomePage() {
  
  function openCreate(qrCodeExperience) {
    // console.log(qrCodeExperience);  
    window.location.href = "/create?qr=" + qrCodeExperience;
  }

  return (
    <main>
      <ul>
        <a href="/create" />
        <a href="/manage" />
        <a href="/analytics" />
        <a href="/settings" />
      </ul>

      <section className="homepage">
        <div className="qr_options">
          <Button variant="outline" className="options" onClick={()=>openCreate('url')}>
            <em>
              <Link />
            </em>
            URL
          </Button>
          <Button variant="outline" className="options" onClick={()=>openCreate('sms')}>
            <em>
              <MessageSquareMore />
            </em>
            SMS
          </Button>
          <Button variant="outline" className="options">
            <em>
              <MessageSquareMore />
            </em>
            Bulk
          </Button>
        </div>     
      </section>
    </main>
  );
}
