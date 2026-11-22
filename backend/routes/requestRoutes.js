
const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const analyzeRequest = require("../services/dfaAnalyzer");
const detectAnomaly = require("../services/anomalyDetector");

// GET - Retrieve all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST - Receive and analyze HTTP request events
router.post("/", async (req, res) => {
  try {
    const { sessionId, method, endpoint } = req.body;

    // Validate required fields
    if (!sessionId || !method || !endpoint) {
      return res.status(400).json({
        success: false,
        message: "Session ID, method and endpoint are required"
      });
    }

    // Validate HTTP method
    const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid HTTP method"
      });
    }

    // Validate endpoint format
    if (
      typeof endpoint !== "string" ||
      !/^\/[a-zA-Z0-9/_-]*$/.test(endpoint)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid endpoint format"
      });
    }

    // Get previous requests from the same session
    const previousRequests = await Request.find({ sessionId })
      .sort({ timestamp: 1 });

    // FLAT - DFA analysis
    const result = analyzeRequest(
      { method, endpoint },
      previousRequests
    );

    // CN + FLAT - Smart anomaly detection
    const anomaly = detectAnomaly(
      result,
      { sessionId, method, endpoint },
      previousRequests
    );

    // Store analyzed request in MongoDB
    const newRequest = await Request.create({
      sessionId,
      method,
      endpoint,
      responseCode: result.responseCode,
      status: result.isValid ? "Valid" : "Invalid",
      anomalyReason: anomaly.detected
        ? anomaly.message
        : "",
      stateBefore: result.stateBefore,
      stateAfter: result.stateAfter
    });

    res.status(201).json({
      success: true,
      message: anomaly.message,
      anomaly,
      request: newRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
