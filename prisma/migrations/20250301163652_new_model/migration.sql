-- CreateTable
CREATE TABLE "Design" (
    "id" SERIAL NOT NULL,
    "qr_unique_id" TEXT,
    "image" TEXT NOT NULL,
    "imageOptions_imageSize" INTEGER NOT NULL,
    "imageOptions_margin" INTEGER NOT NULL,
    "dotsOptions_type" TEXT NOT NULL,
    "dotsOptions_color" TEXT NOT NULL,
    "backgroundOptions_color" TEXT NOT NULL,
    "cornersSquareOptions_type" TEXT NOT NULL,
    "cornersSquareOptions_color" TEXT NOT NULL,
    "cornersDotOptions_type" TEXT NOT NULL,
    "cornersDotOptions_color" TEXT NOT NULL,
    "qrOptions_errorCorrectionLevel" TEXT NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Design_qr_unique_id_key" ON "Design"("qr_unique_id");
