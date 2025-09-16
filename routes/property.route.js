const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const multer = require("multer");
const storage = require("../config/storage"); // Cloudinary storage

const upload = multer({ storage });

// Create a new property with multiple images
router.post(
  "/",
  upload.array("images", 50), // 'images' is the field name in form-data, max 10 files
  propertyController.createProperty
);

// Get all properties
router.get("/", propertyController.getProperties);

// Get single property by slug
router.get("/:slug", propertyController.getPropertyBySlug);

router.delete("/:slug", propertyController.deleteProperty);

router.patch(
  "/:slug",
  upload.array("images", 50),
  propertyController.updateProperty
);

module.exports = router;
