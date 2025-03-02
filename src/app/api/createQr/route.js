import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {

  const {
    qrCodeName,
    qrExperience,
    qrCodeType,
    url,
    phoneNumber,
    smsBody,
    uidFromUrl,
    qrCodeColor,
    qrCodeBackgroundColor,
    qrImage,
    uniqueId,
    qrUrl,
    customDomain,
    designData
  } = await req.json();

  // console.log("designData", designData, designData.margin);

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
            qr_url: qrUrl,
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
      await prisma.Design.update({
        where: {
          qr_unique_id: uidFromUrl,
        },
        data: {
          image: designData.image || null,
          imageOptions_imageSize: designData.imageOptions.imageSize,
          imageOptions_margin: designData.imageOptions.margin,
          dotsOptions_type: designData.dotsOptions.type,
          dotsOptions_color: designData.dotsOptions.color,
          backgroundOptions_color: designData.backgroundOptions.color,
          cornersSquareOptions_type: designData.cornersSquareOptions.type,
          cornersSquareOptions_color: designData.cornersSquareOptions.color,
          cornersDotOptions_type: designData.cornersDotOptions.type,
          cornersDotOptions_color: designData.cornersDotOptions.color,
          qrOptions_errorCorrectionLevel: designData.qrOptions.errorCorrectionLevel,
        },
      });
      return NextResponse.json({
        // generatedQrCode: qrImage,
        // qrCodeUrl: qrUrl,
      });
    }else{
      //creating new QR code into qr_code table
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
          qr_url: qrUrl, // dynamic generated url / staic url
          qr_image: qrImage,
          qr_domain: customDomain
        },
      });
      //creating new row into design table
      await prisma.Design.create({
        data: {
          qr_unique_id: uniqueId,
          image: designData.image || null,
          imageOptions_imageSize: designData.imageOptions.imageSize,
          imageOptions_margin: designData.imageOptions.margin,
          dotsOptions_type: designData.dotsOptions.type,
          dotsOptions_color: designData.dotsOptions.color,
          backgroundOptions_color: designData.backgroundOptions.color,
          cornersSquareOptions_type: designData.cornersSquareOptions.type,
          cornersSquareOptions_color: designData.cornersSquareOptions.color,
          cornersDotOptions_type: designData.cornersDotOptions.type,
          cornersDotOptions_color: designData.cornersDotOptions.color,
          qrOptions_errorCorrectionLevel: designData.qrOptions.errorCorrectionLevel,
        },
      });
      return NextResponse.json({
        // generatedQrCode: qrImage,  
        // qrCodeUrl: qrUrl,
        // id: newQRCode.id,
        // identifier: uniqueId,
      });
    }
  } catch (error) {
    console.error("Error generating QR Code(B):", error);
    return NextResponse.json(
      { error: "Error generating QR Code(B)" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}