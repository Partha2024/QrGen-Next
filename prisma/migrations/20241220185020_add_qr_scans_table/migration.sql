-- CreateTable
CREATE TABLE "qr_scans" (
    "id" SERIAL NOT NULL,
    "qr_unique_id" TEXT,
    "qr_code_name" TEXT,
    "scan_date" DATE,
    "scan_time" TIME,
    "scan_country" TEXT,
    "scan_state" TEXT,
    "scan_city" TEXT,
    "scan_ip_address" INET,
    "scan_os" TEXT,

    CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id")
);
