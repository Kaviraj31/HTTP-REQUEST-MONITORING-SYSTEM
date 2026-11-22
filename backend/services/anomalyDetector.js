
function detectAnomaly(result, request = {}, previousRequests = []) {
  const reasons = [];

  // 1. Detect invalid DFA transitions (FLAT)
  if (result && !result.isValid) {
    reasons.push(result.reason || "Invalid DFA state transition");
  }

  // 2. Detect repeated HTTP requests
  if (request.method && request.endpoint && request.sessionId) {
    const repeatedCount = previousRequests.filter(item =>
      item.sessionId === request.sessionId &&
      item.method === request.method &&
      item.endpoint === request.endpoint
    ).length;

    if (repeatedCount >= 2) {
      reasons.push(
        "Repeated request detected: same request sent multiple times"
      );
    }
  }

  // 3. Detect suspicious endpoint access
  const allowedEndpoints = [
    "/login",
    "/dashboard",
    "/profile",
    "/logout"
  ];

  if (
    request.endpoint &&
    !allowedEndpoints.includes(request.endpoint)
  ) {
    reasons.push("Suspicious or unknown endpoint access");
  }

  // 4. Detect unexpected HTTP methods
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

  if (
    request.method &&
    !allowedMethods.includes(request.method)
  ) {
    reasons.push("Unexpected HTTP method detected");
  }

  const detected = reasons.length > 0;

  return {
    detected,
    riskLevel: detected ? "HIGH" : "LOW",
    reasons,
    message: detected
      ? reasons.join("; ")
      : "No suspicious pattern detected"
  };
}

module.exports = detectAnomaly;
