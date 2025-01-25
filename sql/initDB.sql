-- userdata.card_entity definition

CREATE TABLE `card_entity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `card_number` varchar(255) DEFAULT NULL,
  `cvv` varchar(255) DEFAULT NULL,
  `expiration_date` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.cards definition

CREATE TABLE `cards` (
  `id` int NOT NULL,
  `user_id` bigint NOT NULL,
  `card_number` varchar(255) NOT NULL,
  `expiration_date` date NOT NULL,
  `cvv` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.currencies definition

CREATE TABLE `currencies` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.exchange_rates definition

CREATE TABLE `exchange_rates` (
  `id` int NOT NULL,
  `currency_code` varchar(3) NOT NULL,
  `exchange_rate_usd` decimal(10,4) NOT NULL,
  `exchange_rate_eur` decimal(10,4) NOT NULL,
  `exchange_rate_gbp` decimal(10,4) NOT NULL,
  `exchange_rate_jpy` decimal(10,4) NOT NULL,
  `currency_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.friend_entity definition

CREATE TABLE `friend_entity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `friend_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.friends definition

CREATE TABLE `friends` (
  `id` int NOT NULL,
  `user_id` bigint NOT NULL,
  `friend_id` int NOT NULL,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.post definition

CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_currency` varchar(255) NOT NULL,
  `from_amount` decimal(20,2) NOT NULL,
  `to_currency` varchar(255) NOT NULL,
  `to_amount` decimal(20,2) NOT NULL,
  `name` varchar(255) NOT NULL,
  `walletId` varchar(255) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `exchange_payment` decimal(20,2) NOT NULL,
  `tax_charges` decimal(20,2) NOT NULL,
  `service_fee` decimal(20,2) NOT NULL,
  `total` decimal(20,2) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.transaction_entity definition

CREATE TABLE `transaction_entity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `friend_id` bigint DEFAULT NULL,
  `transaction_date` datetime(6) DEFAULT NULL,
  `transaction_type` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.user_entity definition

CREATE TABLE `user_entity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.users definition

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `walletId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.wallets definition

CREATE TABLE `wallets` (
  `id` int NOT NULL,
  `user_id` bigint NOT NULL,
  `wallet_id` varchar(255) NOT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- userdata.transactions definition

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `transaction_type` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `from_currency_id` int NOT NULL,
  `to_currency_id` int NOT NULL,
  `exchange_rate` decimal(10,4) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  KEY `from_currency_id` (`from_currency_id`),
  KEY `to_currency_id` (`to_currency_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`from_currency_id`) REFERENCES `currencies` (`id`),
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`to_currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Grant all privileges to the root user
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY ${MYSQL_ROOT_PASSWORD} WITH GRANT OPTION;

-- Apply changes
FLUSH PRIVILEGES;