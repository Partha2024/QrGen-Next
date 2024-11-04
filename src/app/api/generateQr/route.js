import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export async function POST(req) {
  // const { qrCodeName, qrExperience, qrCodeType, content, smsBody, isDynamic, qrCodeColor, qrCodeBackgroundColor } = await req.json();
  const {
    qrCodeName,
    qrExperience,
    qrCodeType,
    qrCodeColor,
    qrCodeBackgroundColor,
    url,
    phoneNumber,
    smsBody,
  } = await req.json();

  // Validate required fields
  if ((!qrCodeName || !qrExperience || !qrCodeType)) {
    return NextResponse.json(
      {
        error:
          "qrCodeName, qrExperience, qrCodeType are required.",
      },
      { status: 400 }
    );
  }

  try {
    let qrCodeData;
    const uniqueId = qrCodeType==="dynamic" ? new Date().getTime().toString() : null;
    const redirectUrl = `https://qrgen-dun.vercel.app/api/redirect/${uniqueId}`;

    // Determine QR code data based on qrCodeType
    if (qrCodeType === "dynamic") {
      qrCodeData = redirectUrl;
    } else if (qrExperience === "sms") {
      qrCodeData = redirectUrl; 
      // qrCodeData = `sms:${phoneNumber}?body=${encodeURIComponent(smsBody || "")}`;
    } else {
      qrCodeData = url.startsWith("http") ? url : `http://${url}`;
    }

    const qrCodeOptions = {
      color: {
        dark: qrCodeColor || "#000000",
        light: qrCodeBackgroundColor || "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    };

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(qrCodeData, qrCodeOptions);

    // Insert into the database
    const newQRCode = await prisma.qRCode.create({
      data: {
        unique_id: uniqueId,
        qr_code_name: qrCodeName,
        qr_experience: qrExperience, // sms - url
        qr_code_type: qrCodeType, // static - dynamic
        design_qr_color: qrCodeColor || "#000000",
        design_bg_color: qrCodeBackgroundColor || "#FFFFFF",
        content_url: qrExperience === "url" ? url : null, // Only store if QR code type is URL
        content_phone_number: qrExperience === "sms" ? phoneNumber : null, // Only store if QR code type is SMS
        content_sms_body: qrExperience === "sms" ? smsBody : null, // Only store if QR code type is SMS
        qr_url: qrCodeData, // dynamic generated url / staic url
        qr_image: qrImage,
      },
    });

    return NextResponse.json({
      generatedQrCode: qrImage,
      qrCodeUrl: qrCodeData,
      id: newQRCode.id,
      identifier: uniqueId,
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
    return NextResponse.json(
      { error: "Error generating QR Code" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
