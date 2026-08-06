const express = require("express");
const router = express.Router();
const { createFaculty, getAllFaculty, getFacultyByDepartment, deleteFaculty, toggleFacultyStatus, updateFaculty } = require("../controller/facultyController");
const { verifyToken, requireRole } = require("../middleware/verifyToken");

// Public — students/school heads need to fetch faculty for the evaluation form
router.get("/by-department/:department", getFacultyByDepartment);
router.get("/", getAllFaculty);

// Protected — admin only
router.post("/", verifyToken, requireRole("admin"), createFaculty);
router.put("/:id", verifyToken, requireRole("admin"), updateFaculty);
router.patch("/:id/toggle", verifyToken, requireRole("admin"), toggleFacultyStatus);
router.delete("/:id", verifyToken, requireRole("admin"), deleteFaculty);

module.exports = router;
