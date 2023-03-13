/*
  Warnings:

  - Added the required column `photo` to the `pets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "energy" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "independence" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    CONSTRAINT "pets_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "orgs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pets" ("age", "city", "description", "energy", "id", "independence", "name", "orgId", "size") SELECT "age", "city", "description", "energy", "id", "independence", "name", "orgId", "size" FROM "pets";
DROP TABLE "pets";
ALTER TABLE "new_pets" RENAME TO "pets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
