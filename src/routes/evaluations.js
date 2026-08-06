const express = require("express");
const router = express.Router();
const { createEvaluation, getEvaluations } = require("../controller/evaluationController");
const { verifyToken } = require("../middleware/verifyToken");

// Both GET and POST require a valid logged-in user (admin, student, or school head)
router.get("/", verifyToken, getEvaluations);
router.post("/", verifyToken, createEvaluation);

module.exports = router;
