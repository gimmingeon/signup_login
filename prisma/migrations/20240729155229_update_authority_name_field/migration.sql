/*
  Warnings:

  - You are about to drop the `Authorities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authority` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Authorities` DROP FOREIGN KEY `Authorities_userId_fkey`;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `authority` ENUM('ROLE_USER', 'ROLE_ADMIN') NOT NULL;

-- DropTable
DROP TABLE `Authorities`;
