/*
  Warnings:

  - You are about to drop the `config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `login_credential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `login_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "config";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "login_credential";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "login_history";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Config" (
    "configKey" TEXT NOT NULL PRIMARY KEY,
    "configValue" TEXT NOT NULL DEFAULT '',
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LoginCredential" (
    "contactId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactId" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LoginHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LoginCredential" ("contactId") ON DELETE RESTRICT ON UPDATE CASCADE
);
