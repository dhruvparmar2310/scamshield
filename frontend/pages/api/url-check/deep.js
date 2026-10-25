/**
 * CyberMentis Deep Scan API Proxy
 *
 * This route forwards Deep Scan requests from the
 * Next.js frontend to the Python FastAPI backend.
 *
 * It prevents HTML error pages from being passed
 * directly to the frontend as JSON.
 *
 * Existing Smart Scan and Message Checker APIs
 * remain unchanged.
 */

export default async function handler(req, res) {
    // Only allow POST requests.
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
  
      return res.status(405).json({
        detail: "Method not allowed.",
      });
    }
  
    // Validate the submitted URL.
    const url = req.body?.url;
  
    if (
      typeof url !== "string" ||
      !url.trim() ||
      url.length > 2048
    ) {
      return res.status(400).json({
        detail: "Please enter a valid URL.",
      });
    }
  
    // Use the configured FastAPI backend URL.
    const backendUrl = (
      process.env.NEXT_PUBLIC_SCAMSHIELD_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");
  
    try {
      // Forward the request to FastAPI Deep Scan.
      const response = await fetch(
        `${backendUrl}/api/url-check/deep`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
          signal: AbortSignal.timeout(25000),
        }
      );
  
      // Verify that the backend returned JSON.
      const contentType =
        response.headers.get("content-type") || "";
  
      if (!contentType.toLowerCase().includes("application/json")) {
        console.error(
          "Deep Scan returned non-JSON:",
          response.status,
          contentType
        );
  
        return res.status(502).json({
          detail:
            "FastAPI returned an unexpected response. " +
            "Verify the backend URL and Deep Scan endpoint.",
        });
      }
  
      const data = await response.json();
  
      // Preserve the backend response status.
      return res.status(response.status).json(data);
    } catch (error) {
      console.error("CyberMentis Deep Scan proxy:", error);
  
      const timedOut =
        error?.name === "TimeoutError" ||
        error?.name === "AbortError";
  
      return res.status(timedOut ? 504 : 502).json({
        detail: timedOut
          ? "Deep Scan timed out. Please try again."
          : "Unable to connect to the FastAPI backend.",
      });
    }
  }