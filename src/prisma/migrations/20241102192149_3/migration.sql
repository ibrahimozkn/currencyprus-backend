/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Exchange` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[website]` on the table `Exchange` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Exchange_name_key` ON `Exchange`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Exchange_website_key` ON `Exchange`(`website`);
