-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_email_key" ON "Post"("email");

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");
