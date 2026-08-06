const express = require("express");
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  bulkStatus,
  bulkCreate,
} = require("../controller/surveyQuestionController");
const { verifyToken, requireRole } = require("../middleware/verifyToken");

// Public — students/school heads need to fetch questions for the evaluation form
router.get("/", getQuestions);

// Protected — admin only (manage questionnaire)
router.post("/", verifyToken, requireRole("admin"), createQuestion);
router.post("/reorder", verifyToken, requireRole("admin"), reorderQuestions);
router.post("/bulk-status", verifyToken, requireRole("admin"), bulkStatus);
router.post("/bulk", verifyToken, requireRole("admin"), bulkCreate);
router.put("/:id", verifyToken, requireRole("admin"), updateQuestion);
router.delete("/:id", verifyToken, requireRole("admin"), deleteQuestion);

module.exports = router;
