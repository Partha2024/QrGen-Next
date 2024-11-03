-- CreateTable
CREATE TABLE "qr_codes" (
    "id" SERIAL NOT NULL,
    "unique_id" TEXT NOT NULL,
    "qr_code_name" TEXT NOT NULL,
    "qr_experience" TEXT,
    "qr_code_type" TEXT NOT NULL,
    "design_qr_color" TEXT NOT NULL,
    "design_bg_color" TEXT NOT NULL,
    "content_url" TEXT,
    "content_phone_number" TEXT,
    "content_sms_body" TEXT,
    "qr_url" TEXT NOT NULL,
    "qr_image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_unique_id_key" ON "qr_codes"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_qr_url_key" ON "qr_codes"("qr_url");
