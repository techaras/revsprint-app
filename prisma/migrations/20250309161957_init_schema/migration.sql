-- CreateTable
CREATE TABLE "Config" (
    "configKey" TEXT NOT NULL PRIMARY KEY,
    "configValue" TEXT NOT NULL DEFAULT '',
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HubSpotAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hubspotId" TEXT NOT NULL,
    "name" TEXT DEFAULT 'HubSpot Account',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LoginCredential" (
    "contactId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hubspotAccountId" INTEGER,
    CONSTRAINT "LoginCredential_hubspotAccountId_fkey" FOREIGN KEY ("hubspotAccountId") REFERENCES "HubSpotAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactId" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "hubspotAccountId" INTEGER,
    CONSTRAINT "LoginHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LoginCredential" ("contactId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoginHistory_hubspotAccountId_fkey" FOREIGN KEY ("hubspotAccountId") REFERENCES "HubSpotAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "HubSpotAccount_hubspotId_key" ON "HubSpotAccount"("hubspotId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
