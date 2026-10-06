-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: outfitory
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `Calendar`
--

DROP TABLE IF EXISTS `Calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Calendar` (
  `calendar_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `outfit_id` int NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`calendar_id`),
  KEY `user_id` (`user_id`),
  KEY `outfit_id` (`outfit_id`),
  CONSTRAINT `Calendar_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `Calendar_ibfk_2` FOREIGN KEY (`outfit_id`) REFERENCES `Outfits` (`outfit_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Calendar`
--

LOCK TABLES `Calendar` WRITE;
/*!40000 ALTER TABLE `Calendar` DISABLE KEYS */;
INSERT INTO `Calendar` VALUES (1,1,1,'2025-10-25'),(2,2,2,'2025-10-27'),(3,3,3,'2025-11-02');
/*!40000 ALTER TABLE `Calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Clothes`
--

DROP TABLE IF EXISTS `Clothes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clothes` (
  `cloth_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `season` varchar(50) DEFAULT NULL,
  `occasion` varchar(50) DEFAULT NULL,
  `image_url` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cloth_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Clothes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Clothes`
--

LOCK TABLES `Clothes` WRITE;
/*!40000 ALTER TABLE `Clothes` DISABLE KEYS */;
INSERT INTO `Clothes` VALUES (1,1,'White T-Shirt','Top','White','Summer','Casual','/images/tshirt_white.jpg','Basic cotton t-shirt','2025-10-24 19:19:39'),(2,1,'Blue Jeans','Pants','Blue','Autumn','Casual','/images/jeans_blue.jpg','Slim fit','2025-10-24 19:19:39'),(3,2,'Red Dress','Dress','Red','Spring','Formal','/images/red_dress.jpg','Ideal for evening events','2025-10-24 19:19:39'),(4,3,'Black Hoodie','Top','Black','Winter','Casual','/images/hoodie_black.jpg','Soft fleece material','2025-10-24 19:19:39');
/*!40000 ALTER TABLE `Clothes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CollectionOutfits`
--

DROP TABLE IF EXISTS `CollectionOutfits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CollectionOutfits` (
  `collection_id` int NOT NULL,
  `outfit_id` int NOT NULL,
  PRIMARY KEY (`collection_id`,`outfit_id`),
  KEY `outfit_id` (`outfit_id`),
  CONSTRAINT `CollectionOutfits_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `Collections` (`collection_id`) ON DELETE CASCADE,
  CONSTRAINT `CollectionOutfits_ibfk_2` FOREIGN KEY (`outfit_id`) REFERENCES `Outfits` (`outfit_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CollectionOutfits`
--

LOCK TABLES `CollectionOutfits` WRITE;
/*!40000 ALTER TABLE `CollectionOutfits` DISABLE KEYS */;
INSERT INTO `CollectionOutfits` VALUES (1,1),(2,2);
/*!40000 ALTER TABLE `CollectionOutfits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Collections`
--

DROP TABLE IF EXISTS `Collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Collections` (
  `collection_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Collections`
--

LOCK TABLES `Collections` WRITE;
/*!40000 ALTER TABLE `Collections` DISABLE KEYS */;
INSERT INTO `Collections` VALUES (1,1,'Summer Essentials','Basic everyday outfits for warm weather','2025-10-24 19:19:40'),(2,2,'Evening Wear','Formal dresses and accessories for events','2025-10-24 19:19:40');
/*!40000 ALTER TABLE `Collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OutfitItems`
--

DROP TABLE IF EXISTS `OutfitItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OutfitItems` (
  `outfit_id` int NOT NULL,
  `cloth_id` int NOT NULL,
  PRIMARY KEY (`outfit_id`,`cloth_id`),
  KEY `cloth_id` (`cloth_id`),
  CONSTRAINT `OutfitItems_ibfk_1` FOREIGN KEY (`outfit_id`) REFERENCES `Outfits` (`outfit_id`) ON DELETE CASCADE,
  CONSTRAINT `OutfitItems_ibfk_2` FOREIGN KEY (`cloth_id`) REFERENCES `Clothes` (`cloth_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OutfitItems`
--

LOCK TABLES `OutfitItems` WRITE;
/*!40000 ALTER TABLE `OutfitItems` DISABLE KEYS */;
INSERT INTO `OutfitItems` VALUES (1,1),(1,2),(2,3),(3,4);
/*!40000 ALTER TABLE `OutfitItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Outfits`
--

DROP TABLE IF EXISTS `Outfits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Outfits` (
  `outfit_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`outfit_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Outfits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Outfits`
--

LOCK TABLES `Outfits` WRITE;
/*!40000 ALTER TABLE `Outfits` DISABLE KEYS */;
INSERT INTO `Outfits` VALUES (1,1,'Casual Day','A simple summer outfit with jeans and t-shirt.','2025-10-24 19:19:39'),(2,2,'Elegant Night','Red dress with heels for formal events','2025-10-24 19:19:39'),(3,3,'Comfy Winter','Warm hoodie with jeans','2025-10-24 19:19:39');
/*!40000 ALTER TABLE `Outfits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TravelItems`
--

DROP TABLE IF EXISTS `TravelItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TravelItems` (
  `travel_id` int NOT NULL,
  `cloth_id` int NOT NULL,
  PRIMARY KEY (`travel_id`,`cloth_id`),
  KEY `cloth_id` (`cloth_id`),
  CONSTRAINT `TravelItems_ibfk_1` FOREIGN KEY (`travel_id`) REFERENCES `TravelList` (`travel_id`) ON DELETE CASCADE,
  CONSTRAINT `TravelItems_ibfk_2` FOREIGN KEY (`cloth_id`) REFERENCES `Clothes` (`cloth_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TravelItems`
--

LOCK TABLES `TravelItems` WRITE;
/*!40000 ALTER TABLE `TravelItems` DISABLE KEYS */;
INSERT INTO `TravelItems` VALUES (1,1),(1,2),(2,3);
/*!40000 ALTER TABLE `TravelItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TravelList`
--

DROP TABLE IF EXISTS `TravelList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TravelList` (
  `travel_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`travel_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `TravelList_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TravelList`
--

LOCK TABLES `TravelList` WRITE;
/*!40000 ALTER TABLE `TravelList` DISABLE KEYS */;
INSERT INTO `TravelList` VALUES (1,1,'Paris Trip','2025-12-20','2025-12-27'),(2,2,'Milan Fashion Week','2025-09-01','2025-09-05');
/*!40000 ALTER TABLE `TravelList` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Student','Fashion Enthusiast','Business Consultant','Development Team') DEFAULT 'Student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'mattia','mattia@example.com','hashed_password_123','Development Team','2025-10-24 19:19:39'),(2,'giulia','giulia@example.com','hashed_password_abc','Fashion Enthusiast','2025-10-24 19:19:39'),(3,'luca','luca@example.com','hashed_password_xyz','Student','2025-10-24 19:19:39');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Wishlist`
--

DROP TABLE IF EXISTS `Wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Wishlist` (
  `wishlist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cloth_name` varchar(100) DEFAULT NULL,
  `estimated_price` decimal(8,2) DEFAULT NULL,
  `link` text,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  PRIMARY KEY (`wishlist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Wishlist`
--

LOCK TABLES `Wishlist` WRITE;
/*!40000 ALTER TABLE `Wishlist` DISABLE KEYS */;
INSERT INTO `Wishlist` VALUES (1,1,'Leather Jacket',149.99,'https://example.com/jacket','High'),(2,2,'White Sneakers',79.90,'https://example.com/sneakers','Medium'),(3,3,'Denim Jacket',99.50,'https://example.com/denim','Low');
/*!40000 ALTER TABLE `Wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-24 19:20:37
