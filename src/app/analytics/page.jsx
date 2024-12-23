"use client";

import React from "react";
import { Button } from "@/components/ui/button";

function Analytics() {

  async function onSubmit() {
    console.log("onSubmit got called nigga");
  
    try {
      const response = await fetch("/api/tempQr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("response ok")
        // const { qrCodeUrl, generatedQrCode, identifier } = await response.json();
        // console.log("QR Code generated:", qrCodeUrl);
        // window.location.href = "/edit?uid=" + identifier;
        // setQrImageSrc(generatedQrCode);
      } else {
        console.error("Failed to generate QR code:", await response.text());
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }



  return (
    <>
      Analytics Page
      <Button variant="outline" onClick={() => onSubmit()}>Click Me</Button>
    </>
  );
}

export default Analytics;
