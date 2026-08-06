const express = require("express");
const router = express.Router();
const { getSemesters, getActiveSemesters, createSemester, toggleSemester, deleteSemester } = require("../controller/semesterController");
const { verifyToken, requireRole } = require("../middleware/verifyToken");

// Public — students/school heads need active semesters to populate the evaluation form
router.get("/active", getActiveSemesters);

// Protected — viewing all semesters and managing them is admin only
router.get("/", verifyToken, requireRole("admin"), getSemesters);
router.post("/", verifyToken, requireRole("admin"), createSemester);
router.patch("/:id/toggle", verifyToken, requireRole("admin"), toggleSemester);
router.delete("/:id", verifyToken, requireRole("admin"), deleteSemester);

module.exports = router;
