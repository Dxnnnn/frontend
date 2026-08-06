const express = require("express");
const router = express.Router();
const { createStudent, getAllStudents, deleteStudent, loginStudent, toggleStudentStatus, updateStudent } = require("../controller/studentController");
const { verifyToken, requireRole } = require("../middleware/verifyToken");

// Public — login
router.post("/login", loginStudent);

// Protected — admin only (manage student accounts)
router.get("/", verifyToken, requireRole("admin"), getAllStudents);
router.post("/", verifyToken, requireRole("admin"), createStudent);
router.put("/:id", verifyToken, requireRole("admin"), updateStudent);
router.patch("/:id/toggle", verifyToken, requireRole("admin"), toggleStudentStatus);
router.delete("/:id", verifyToken, requireRole("admin"), deleteStudent);

module.exports = router;
