-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "playStoreUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screenshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_appId_key" ON "App"("appId");

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("appId") ON DELETE RESTRICT ON UPDATE CASCADE;
