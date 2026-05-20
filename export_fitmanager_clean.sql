-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: fitmanager
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Abonnement`
--

DROP TABLE IF EXISTS `Abonnement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Abonnement` (
  `idAbonnement` int NOT NULL AUTO_INCREMENT,
  `adherent_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `statut` enum('actif','expiré','suspendu') DEFAULT NULL,
  `montantDu` decimal(10,2) DEFAULT NULL,
  `dureeSuspension` int DEFAULT NULL COMMENT 'Durée de suspension en jours',
  `causeSuspension` text COMMENT 'Cause / motif de la suspension',
  `dateFinSuspension` date DEFAULT NULL COMMENT 'Date de fin de suspension',
  PRIMARY KEY (`idAbonnement`),
  KEY `adherent_id` (`adherent_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `Abonnement_ibfk_1` FOREIGN KEY (`adherent_id`) REFERENCES `Adherent` (`idAdherent`),
  CONSTRAINT `Abonnement_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `TypeAbonnement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Abonnement`
--

/*!40000 ALTER TABLE `Abonnement` DISABLE KEYS */;
/*!40000 ALTER TABLE `Abonnement` ENABLE KEYS */;

--
-- Table structure for table `Activite`
--

DROP TABLE IF EXISTS `Activite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Activite` (
  `idActivite` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `couleur` varchar(20) DEFAULT '#e53935',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idActivite`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Activite`
--

/*!40000 ALTER TABLE `Activite` DISABLE KEYS */;
/*!40000 ALTER TABLE `Activite` ENABLE KEYS */;

--
-- Table structure for table `Adherent`
--

DROP TABLE IF EXISTS `Adherent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Adherent` (
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Adherent`
--

/*!40000 ALTER TABLE `Adherent` DISABLE KEYS */;
/*!40000 ALTER TABLE `Adherent` ENABLE KEYS */;

--
-- Table structure for table `HistoriqueAchat`
--

DROP TABLE IF EXISTS `HistoriqueAchat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HistoriqueAchat` (
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HistoriqueAchat`
--

/*!40000 ALTER TABLE `HistoriqueAchat` DISABLE KEYS */;
/*!40000 ALTER TABLE `HistoriqueAchat` ENABLE KEYS */;

--
-- Table structure for table `HistoriqueVente`
--

DROP TABLE IF EXISTS `HistoriqueVente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HistoriqueVente` (
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HistoriqueVente`
--

/*!40000 ALTER TABLE `HistoriqueVente` DISABLE KEYS */;
/*!40000 ALTER TABLE `HistoriqueVente` ENABLE KEYS */;

--
-- Table structure for table `Paiement`
--

DROP TABLE IF EXISTS `Paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Paiement` (
  `idPaiement` int NOT NULL AUTO_INCREMENT,
  `abonnement_id` int DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `datePaiement` date DEFAULT NULL,
  `modePaiement` enum('cash','carte','virement') DEFAULT NULL,
  `statut` varchar(50),
  PRIMARY KEY (`idPaiement`),
  KEY `abonnement_id` (`abonnement_id`),
  CONSTRAINT `Paiement_ibfk_1` FOREIGN KEY (`abonnement_id`) REFERENCES `Abonnement` (`idAbonnement`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Paiement`
--

/*!40000 ALTER TABLE `Paiement` DISABLE KEYS */;
/*!40000 ALTER TABLE `Paiement` ENABLE KEYS */;

--
-- Table structure for table `Permissions`
--

DROP TABLE IF EXISTS `Permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `page_key` varchar(50) NOT NULL,
  `statut` enum('autorise','restreindre','interdit') DEFAULT 'autorise',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_page` (`role_id`,`page_key`),
  CONSTRAINT `Permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Permissions`
--

/*!40000 ALTER TABLE `Permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `Permissions` ENABLE KEYS */;

--
-- Table structure for table `Presence`
--

DROP TABLE IF EXISTS `Presence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Presence` (
  `idPresence` int NOT NULL AUTO_INCREMENT,
  `adherent_id` int DEFAULT NULL,
  `seance_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `heureEntree` time DEFAULT NULL,
  `heureSortie` time DEFAULT NULL,
  PRIMARY KEY (`idPresence`),
  KEY `adherent_id` (`adherent_id`),
  KEY `seance_id` (`seance_id`),
  CONSTRAINT `Presence_ibfk_1` FOREIGN KEY (`adherent_id`) REFERENCES `Adherent` (`idAdherent`),
  CONSTRAINT `Presence_ibfk_2` FOREIGN KEY (`seance_id`) REFERENCES `Seance` (`idSeance`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Presence`
--

/*!40000 ALTER TABLE `Presence` DISABLE KEYS */;
/*!40000 ALTER TABLE `Presence` ENABLE KEYS */;

--
-- Table structure for table `Produit`
--

DROP TABLE IF EXISTS `Produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Produit` (
  `idProduit` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idProduit`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Produit`
--

/*!40000 ALTER TABLE `Produit` DISABLE KEYS */;
/*!40000 ALTER TABLE `Produit` ENABLE KEYS */;

--
-- Table structure for table `Regles`
--

DROP TABLE IF EXISTS `Regles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Regles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_abonnement_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `type_abonnement_id` (`type_abonnement_id`),
  CONSTRAINT `Regles_ibfk_1` FOREIGN KEY (`type_abonnement_id`) REFERENCES `TypeAbonnement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Regles`
--

/*!40000 ALTER TABLE `Regles` DISABLE KEYS */;
/*!40000 ALTER TABLE `Regles` ENABLE KEYS */;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;

--
-- Table structure for table `Seance`
--

DROP TABLE IF EXISTS `Seance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Seance` (
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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Seance`
--

/*!40000 ALTER TABLE `Seance` DISABLE KEYS */;
/*!40000 ALTER TABLE `Seance` ENABLE KEYS */;

--
-- Table structure for table `SeanceLibre`
--

DROP TABLE IF EXISTS `SeanceLibre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SeanceLibre` (
  `id` int NOT NULL AUTO_INCREMENT,
  `montant` decimal(10,2) NOT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `modePaiement` enum('cash','carte','virement') DEFAULT 'cash',
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SeanceLibre`
--

/*!40000 ALTER TABLE `SeanceLibre` DISABLE KEYS */;
/*!40000 ALTER TABLE `SeanceLibre` ENABLE KEYS */;

--
-- Table structure for table `TypeAbonnement`
--

DROP TABLE IF EXISTS `TypeAbonnement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TypeAbonnement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `duree` int DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TypeAbonnement`
--

/*!40000 ALTER TABLE `TypeAbonnement` DISABLE KEYS */;
/*!40000 ALTER TABLE `TypeAbonnement` ENABLE KEYS */;

--
-- Table structure for table `Utilisateur`
--

DROP TABLE IF EXISTS `Utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Utilisateur` (
  `idUtilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `motDePasse` varchar(255) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `activite_id` int DEFAULT NULL,
  PRIMARY KEY (`idUtilisateur`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `fk_utilisateur_activite` (`activite_id`),
  CONSTRAINT `fk_utilisateur_activite` FOREIGN KEY (`activite_id`) REFERENCES `Activite` (`idActivite`) ON DELETE SET NULL,
  CONSTRAINT `Utilisateur_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Utilisateur`
--

/*!40000 ALTER TABLE `Utilisateur` DISABLE KEYS */;
/*!40000 ALTER TABLE `Utilisateur` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 12:16:15
