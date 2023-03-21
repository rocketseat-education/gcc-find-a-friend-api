/*
  Warnings:

  - You are about to drop the column `nome` on the `orgs` table. All the data in the column will be lost.
  - Added the required column `name` to the `orgs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orgs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_orgs" ("address", "cep", "email", "id", "password", "whatsappNumber") SELECT "address", "cep", "email", "id", "password", "whatsappNumber" FROM "orgs";
DROP TABLE "orgs";
ALTER TABLE "new_orgs" RENAME TO "orgs";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
