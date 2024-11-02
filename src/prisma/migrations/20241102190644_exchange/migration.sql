/*
  Warnings:

  - You are about to drop the column `type` on the `exchange` table. All the data in the column will be lost.
  - Added the required column `type` to the `Rate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exchange` DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `rate` ADD COLUMN `type` ENUM('BUY', 'SELL') NOT NULL;
