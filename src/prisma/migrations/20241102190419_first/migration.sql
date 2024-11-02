-- CreateTable
CREATE TABLE `Exchange` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `exchangeSite` VARCHAR(191) NOT NULL,
    `type` ENUM('BUY', 'SELL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rate` (
    `id` INTEGER NOT NULL,
    `exchangeId` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rate` ADD CONSTRAINT `Rate_exchangeId_fkey` FOREIGN KEY (`exchangeId`) REFERENCES `Exchange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
DROP INDEX `User.email_unique` ON `user`;
