import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export async function POST(req) {
  const {
    qrCodeName,
    qrExperience,
    qrCodeType,
    qrCodeColor,
    qrCodeBackgroundColor,
    url,
    phoneNumber,
    smsBody,
    uidFromUrl
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
    let uniqueId;
    console.log("🚀 ~ POST ~ uidFromUrl:", uidFromUrl);
    if(uidFromUrl){
      uniqueId = uidFromUrl;
    }else{
      uniqueId = qrCodeType==="dynamic" ? new Date().getTime().toString() : "sta" + new Date().getTime().toString() + "tic";
    }
    console.log("🚀 ~ POST ~ uniqueId:", uniqueId)
    const redirectUrl = `https://qrgen-dun.vercel.app/api/redirect/${uniqueId}`;

    // Determine QR code data based on qrCodeType
    if (qrCodeType === "dynamic" || qrExperience === "sms") {
      qrCodeData = redirectUrl;
    } else {
      qrCodeData = url.startsWith("http") ? url : `http://${url}`;
      console.log("🚀 ~ POST ~ qrCodeData:", qrCodeData);
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
    if(uidFromUrl){
      var updateData;
      if(qrCodeType==="dynamic"){
        if(qrExperience==="url"){
          updateData = {
            qr_experience: qrExperience,
            qr_code_name: qrCodeName,
            design_qr_color: qrCodeColor || "#000000",
            design_bg_color: qrCodeBackgroundColor || "#FFFFFF",
            content_url: url,
            content_phone_number: null,
            content_sms_body: null,
            qr_image: qrImage,
          };
        }else if(qrExperience==="sms"){
          updateData = {
            qr_experience: qrExperience,
            qr_code_name: qrCodeName,
            design_qr_color: qrCodeColor || "#000000",
            design_bg_color: qrCodeBackgroundColor || "#FFFFFF",
            content_phone_number: phoneNumber,
            content_sms_body: smsBody,
            content_url: null,
            qr_url: qrCodeData,
            qr_image: qrImage,
          };
        }
      }else{
        updateData = {
          qr_code_name: qrCodeName,
          design_qr_color: qrCodeColor || "#000000",
          design_bg_color: qrCodeBackgroundColor || "#FFFFFF",
          qr_image: qrImage,
        };
      } 
      await prisma.qRCode.update({
        where: {
          unique_id: uidFromUrl,
        },
        data: updateData,
      });
      return NextResponse.json({
        generatedQrCode: qrImage,
        // qrCodeUrl: qrCodeData,
      });
    }else{
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
    }
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
