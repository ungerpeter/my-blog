-- CreateTable
CREATE TABLE "Author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatarImageUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author" ("email");
