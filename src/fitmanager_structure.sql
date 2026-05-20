SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `Role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Activite` (
  `idActivite` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `couleur` varchar(20) DEFAULT '#e53935',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idActivite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Utilisateur` (
  `idUtilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `motDePasse` varchar(255) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `activite_id` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idUtilisateur`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `fk_utilisateur_activite` (`activite_id`),
  CONSTRAINT `fk_utilisateur_activite` FOREIGN KEY (`activite_id`) REFERENCES `Activite` (`idActivite`) ON DELETE SET NULL,
  CONSTRAINT `Utilisateur_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Adherent` (
  `idAdherent` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `dateNaissance` date DEFAULT NULL,
  `numTelephone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `photo` longtext,
  `dateCreation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sexe` enum('Homme','Femme') DEFAULT NULL,
  `niveau` varchar(20) DEFAULT 'Bronze',
  `niveau_depuis` date DEFAULT NULL,
  `niveau_expire` date DEFAULT NULL,
  `points` int DEFAULT '0',
  PRIMARY KEY (`idAdherent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `TypeAbonnement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `duree` int DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Abonnement` (
  `idAbonnement` int NOT NULL AUTO_INCREMENT,
  `adherent_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `statut` enum('actif','expiré','suspendu') DEFAULT NULL,
  `montantDu` decimal(10,2) DEFAULT NULL,
  `dureeSuspension` int DEFAULT NULL,
  `causeSuspension` text,
  `dateFinSuspension` date DEFAULT NULL,
  PRIMARY KEY (`idAbonnement`),
  KEY `adherent_id` (`adherent_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `Abonnement_ibfk_1` FOREIGN KEY (`adherent_id`) REFERENCES `Adherent` (`idAdherent`),
  CONSTRAINT `Abonnement_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `TypeAbonnement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Regles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_abonnement_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `type_abonnement_id` (`type_abonnement_id`),
  CONSTRAINT `Regles_ibfk_1` FOREIGN KEY (`type_abonnement_id`) REFERENCES `TypeAbonnement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Paiement` (
  `idPaiement` int NOT NULL AUTO_INCREMENT,
  `abonnement_id` int DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `datePaiement` date DEFAULT NULL,
  `modePaiement` enum('cash','carte','virement') DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idPaiement`),
  KEY `abonnement_id` (`abonnement_id`),
  CONSTRAINT `Paiement_ibfk_1` FOREIGN KEY (`abonnement_id`) REFERENCES `Abonnement` (`idAbonnement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `page_key` varchar(50) NOT NULL,
  `statut` enum('autorise','restreindre','interdit') DEFAULT 'autorise',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_page` (`role_id`,`page_key`),
  CONSTRAINT `Permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Produit` (
  `idProduit` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idProduit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HistoriqueAchat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `produit_id` int DEFAULT NULL,
  `quantite` int DEFAULT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `produit_id` (`produit_id`),
  CONSTRAINT `HistoriqueAchat_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur` (`idUtilisateur`),
  CONSTRAINT `HistoriqueAchat_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `Produit` (`idProduit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HistoriqueVente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `produit_id` int DEFAULT NULL,
  `quantite` int DEFAULT NULL,
  `adherent_id` int DEFAULT NULL,
  `client_externe` varchar(100) DEFAULT NULL,
  `prix_vente` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `produit_id` (`produit_id`),
  KEY `fk_hv_adherent` (`adherent_id`),
  CONSTRAINT `fk_hv_adherent` FOREIGN KEY (`adherent_id`) REFERENCES `Adherent` (`idAdherent`) ON DELETE SET NULL,
  CONSTRAINT `HistoriqueVente_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur` (`idUtilisateur`),
  CONSTRAINT `HistoriqueVente_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `Produit` (`idProduit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Seance` (
  `idSeance` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `heureDebut` time DEFAULT NULL,
  `heureFin` time DEFAULT NULL,
  `participantsMax` int DEFAULT NULL,
  `coach_id` int DEFAULT NULL,
  `activite_id` int DEFAULT NULL,
  `publicCible` enum('Homme','Femme') DEFAULT 'Homme',
  PRIMARY KEY (`idSeance`),
  KEY `coach_id` (`coach_id`),
  KEY `activite_id` (`activite_id`),
  CONSTRAINT `Seance_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `Utilisateur` (`idUtilisateur`),
  CONSTRAINT `Seance_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `Activite` (`idActivite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Presence` (
  `idPresence` int NOT NULL AUTO_INCREMENT,
  `adherent_id` int DEFAULT NULL,
  `seance_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `heureEntree` time DEFAULT NULL,
  `heureSortie` time DEFAULT NULL,
  PRIMARY KEY (`idPresence`),
  UNIQUE KEY `unique_presence` (`adherent_id`, `seance_id`),
  KEY `seance_id` (`seance_id`),
  CONSTRAINT `Presence_ibfk_1` FOREIGN KEY (`adherent_id`) REFERENCES `Adherent` (`idAdherent`),
  CONSTRAINT `Presence_ibfk_2` FOREIGN KEY (`seance_id`) REFERENCES `Seance` (`idSeance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `SeanceLibre` (
  `id` int NOT NULL AUTO_INCREMENT,
  `montant` decimal(10,2) NOT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `modePaiement` enum('cash','carte','virement') DEFAULT 'cash',
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;