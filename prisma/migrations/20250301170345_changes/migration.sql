-- AlterTable
ALTER TABLE "Design" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "imageOptions_imageSize" DROP NOT NULL,
ALTER COLUMN "imageOptions_margin" DROP NOT NULL,
ALTER COLUMN "dotsOptions_type" DROP NOT NULL,
ALTER COLUMN "dotsOptions_color" DROP NOT NULL,
ALTER COLUMN "backgroundOptions_color" DROP NOT NULL,
ALTER COLUMN "cornersSquareOptions_type" DROP NOT NULL,
ALTER COLUMN "cornersSquareOptions_color" DROP NOT NULL,
ALTER COLUMN "cornersDotOptions_type" DROP NOT NULL,
ALTER COLUMN "cornersDotOptions_color" DROP NOT NULL,
ALTER COLUMN "qrOptions_errorCorrectionLevel" DROP NOT NULL;
