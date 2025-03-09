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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoginCredential" (
    "contactId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hubspotAccountId" INTEGER,
    CONSTRAINT "LoginCredential_hubspotAccountId_fkey" FOREIGN KEY ("hubspotAccountId") REFERENCES "HubSpotAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LoginCredential" ("contactId", "email", "insertDate", "password") SELECT "contactId", "email", "insertDate", "password" FROM "LoginCredential";
DROP TABLE "LoginCredential";
ALTER TABLE "new_LoginCredential" RENAME TO "LoginCredential";
CREATE TABLE "new_LoginHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactId" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "insertDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "hubspotAccountId" INTEGER,
    CONSTRAINT "LoginHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LoginCredential" ("contactId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoginHistory_hubspotAccountId_fkey" FOREIGN KEY ("hubspotAccountId") REFERENCES "HubSpotAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LoginHistory" ("contactId", "id", "insertDate", "ip", "success") SELECT "contactId", "id", "insertDate", "ip", "success" FROM "LoginHistory";
DROP TABLE "LoginHistory";
ALTER TABLE "new_LoginHistory" RENAME TO "LoginHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HubSpotAccount_hubspotId_key" ON "HubSpotAccount"("hubspotId");
