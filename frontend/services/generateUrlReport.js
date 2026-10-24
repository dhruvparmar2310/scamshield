// services/generateUrlReport.js

const COLORS = {
    navy: [12, 17, 30],
    purple: [116, 75, 220],
    text: [32, 40, 57],
    muted: [105, 115, 135],
    border: [226, 230, 238],
    light: [246, 247, 251],
    white: [255, 255, 255],
    red: [206, 62, 76],
    amber: [174, 109, 26],
    green: [28, 131, 89],
  };
  
  function getAssessment(verdict) {
    switch (verdict) {
      case "potentially_suspicious":
        return {
          label: "POTENTIALLY SUSPICIOUS",
          color: COLORS.red,
        };
  
      case "needs_review":
        return {
          label: "NEEDS REVIEW",
          color: COLORS.amber,
        };
  
      default:
        return {
          label: "NO OBVIOUS INDICATORS",
          color: COLORS.green,
        };
    }
  }
  
  function formatLabel(value = "") {
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
  
  // URLs can contain tokens or sensitive query parameters.
  // Avoid printing those values in a report by default.
  function getRedactedUrl(value = "") {
    try {
      const parsed = new URL(value);
  
      parsed.username = "";
      parsed.password = "";
      parsed.search = "";
      parsed.hash = "";
  
      return parsed.toString();
    } catch {
      return String(value).split("?")[0].split("#")[0];
    }
  }
  
  export async function generateUrlReport(result) {
    if (!result) {
      throw new Error("No URL analysis is available.");
    }
  
    // Dynamic import keeps jsPDF out of the initial page bundle.
    const { jsPDF } = await import("jspdf");
  
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
  
    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 18;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const FOOTER_LIMIT = 276;
  
    const assessment = getAssessment(result.verdict);
    const findings = Array.isArray(result.findings)
      ? result.findings
      : [];
  
    const now = new Date();
    const reportId = `SS-${now
      .toISOString()
      .replace(/\D/g, "")
      .slice(0, 14)}`;
  
    let y = 0;
  
    function setColor(rgb) {
      doc.setTextColor(...rgb);
    }
  
    function writeText(text, x, top, options = {}) {
      const {
        size = 9,
        color = COLORS.text,
        weight = "normal",
        maxWidth = CONTENT_WIDTH,
        lineHeight = 4.6,
      } = options;
  
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      setColor(color);
  
      const lines = doc.splitTextToSize(
        String(text ?? ""),
        maxWidth
      );
  
      doc.text(lines, x, top);
  
      return top + Math.max(1, lines.length) * lineHeight;
    }
  
    function ensureSpace(height) {
      if (y + height > FOOTER_LIMIT) {
        doc.addPage();
        y = 24;
      }
    }
  
    function sectionTitle(title) {
      ensureSpace(18);
  
      doc.setFillColor(...COLORS.purple);
      doc.roundedRect(MARGIN, y - 3, 1.5, 8, 0.5, 0.5, "F");
  
      y = writeText(title, MARGIN + 6, y + 3, {
        size: 11,
        weight: "bold",
      });
  
      y += 7;
    }
  
    function detailRow(label, value) {
      const labelWidth = 43;
      const valueWidth = CONTENT_WIDTH - labelWidth - 5;
  
      const valueLines = doc.splitTextToSize(
        String(value ?? "Not available"),
        valueWidth
      );
  
      const rowHeight = Math.max(11, valueLines.length * 4.5 + 5);
  
      ensureSpace(rowHeight);
  
      doc.setDrawColor(...COLORS.border);
      doc.line(MARGIN, y + rowHeight, PAGE_WIDTH - MARGIN, y + rowHeight);
  
      writeText(label, MARGIN + 3, y + 6, {
        size: 8,
        color: COLORS.muted,
        weight: "bold",
        maxWidth: labelWidth - 5,
      });
  
      writeText(value, MARGIN + labelWidth, y + 6, {
        size: 8.5,
        maxWidth: valueWidth,
      });
  
      y += rowHeight;
    }
  
    function paragraph(label, content, color = COLORS.text) {
      if (!content) return;
  
      const lines = doc.splitTextToSize(
        String(content),
        CONTENT_WIDTH - 10
      );
  
      ensureSpace(12 + lines.length * 4.6);
  
      y = writeText(label, MARGIN + 4, y + 4, {
        size: 8.3,
        weight: "bold",
        color: COLORS.muted,
      });
  
      y = writeText(content, MARGIN + 4, y + 1, {
        size: 9,
        color,
        maxWidth: CONTENT_WIDTH - 10,
      });
  
      y += 5;
    }
  
    // ─────────────────────────────────────────────
    // DOCUMENT HEADER
    // ─────────────────────────────────────────────
  
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, PAGE_WIDTH, 51, "F");
  
    doc.setFillColor(...COLORS.purple);
    doc.rect(0, 0, 3, 51, "F");
  
    writeText("CyberMentis", MARGIN, 19, {
      size: 20,
      weight: "bold",
      color: COLORS.white,
    });
  
    writeText("CYBERSECURITY AWARENESS REPORT", MARGIN, 28, {
      size: 8,
      color: [190, 179, 230],
    });
  
    writeText("URL SECURITY ASSESSMENT", MARGIN, 40, {
      size: 10,
      weight: "bold",
      color: COLORS.white,
    });
  
    writeText(reportId, 146, 19, {
      size: 8,
      color: COLORS.white,
      maxWidth: 46,
    });
  
    writeText(now.toLocaleString(), 146, 27, {
      size: 7.5,
      color: [190, 199, 216],
      maxWidth: 46,
    });
  
    y = 63;
  
    // ─────────────────────────────────────────────
    // ASSESSMENT SUMMARY
    // ─────────────────────────────────────────────
  
    doc.setFillColor(...COLORS.light);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 33, 3, 3, "F");
  
    writeText("OVERALL ASSESSMENT", MARGIN + 6, y + 8, {
      size: 8,
      color: COLORS.muted,
      weight: "bold",
    });
  
    writeText(assessment.label, MARGIN + 6, y + 19, {
      size: 12,
      color: assessment.color,
      weight: "bold",
      maxWidth: 125,
    });
  
    writeText("RISK SCORE", PAGE_WIDTH - MARGIN - 34, y + 8, {
      size: 7.5,
      color: COLORS.muted,
    });
  
    writeText(`${result.risk_score ?? 0}/100`, PAGE_WIDTH - MARGIN - 34, y + 20, {
      size: 15,
      weight: "bold",
      color: assessment.color,
    });
  
    y += 42;
  
    paragraph(
      "How to interpret this score",
      "The score is calculated from structural URL warning rules. It is not a percentage probability of fraud and does not establish whether a website is safe or malicious."
    );
  
    // ─────────────────────────────────────────────
    // URL DETAILS
    // ─────────────────────────────────────────────
  
    sectionTitle("01 / URL INFORMATION");
  
    detailRow("Analyzed URL", getRedactedUrl(result.url));
    detailRow("Hostname", result.hostname);
    detailRow("Protocol", String(result.scheme || "").toUpperCase());
    detailRow(
      "HTTPS in URL",
      result.uses_https ? "Yes" : "No"
    );
  
    if (result.scheme_was_assumed) {
      detailRow(
        "Protocol note",
        "HTTPS was assumed for parsing. Availability and certificate validity were not verified."
      );
    }
  
    if (result.ip_info) {
      const ip = result.ip_info;
  
      detailRow("IP address", ip.ip);
      detailRow("IP version", `IPv${ip.version}`);
      detailRow(
        "IP category",
        formatLabel(ip.category)
      );
      detailRow(
        "Globally routable",
        ip.is_global ? "Yes" : "No"
      );
    }
  
    y += 8;
  
    // ─────────────────────────────────────────────
    // FINDINGS
    // ─────────────────────────────────────────────
  
    sectionTitle(
      `02 / SECURITY FINDINGS (${findings.length})`
    );
  
    if (!findings.length) {
      paragraph(
        "No obvious structural indicators detected",
        "The URL did not trigger the current detection rules. Its content, ownership, and live reputation were not checked."
      );
    }
  
    findings.forEach((finding, index) => {
      const title = `${String(index + 1).padStart(2, "0")}  ${formatLabel(
        finding.type
      )}`;
  
      ensureSpace(25);
  
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 15, 2, 2, "F");
  
      writeText(title, MARGIN + 4, y + 9, {
        size: 10,
        weight: "bold",
        maxWidth: 130,
      });
  
      writeText(
        String(finding.severity || "review").toUpperCase(),
        PAGE_WIDTH - MARGIN - 28,
        y + 9,
        {
          size: 8,
          weight: "bold",
          color:
            finding.severity === "high"
              ? COLORS.red
              : finding.severity === "medium"
                ? COLORS.amber
                : COLORS.purple,
          maxWidth: 25,
        }
      );
  
      y += 19;
  
      paragraph("Detected indicator", finding.message);
      paragraph("Why it was flagged", finding.reason);
      paragraph("Potential impact", finding.potential_harm);
      paragraph("Recommended action", finding.action, COLORS.green);
  
      y += 5;
    });
  
    // ─────────────────────────────────────────────
    // GENERAL RECOMMENDATIONS
    // ─────────────────────────────────────────────
  
    sectionTitle("03 / SECURITY RECOMMENDATIONS");
  
    const recommendations = [
      "Verify the real hostname before opening unfamiliar links.",
      "Never share OTPs, passwords, or payment details on unverified websites.",
      "Access important services through their known official websites or applications.",
      "Remember that HTTPS alone does not establish website legitimacy.",
    ];
  
    recommendations.forEach((item, index) => {
      paragraph(`${index + 1}. Recommendation`, item);
    });
  
    sectionTitle("04 / ASSESSMENT LIMITATIONS");
  
    paragraph(
      "Scope of analysis",
      result.disclaimer ||
        "This report analyzes URL structure only. It does not visit the website or verify its live reputation."
    );
  
    paragraph(
      "Privacy note",
      "URL query parameters, fragments, and embedded credentials are omitted from the printed URL to reduce accidental exposure of sensitive information."
    );
  
    // ─────────────────────────────────────────────
    // FOOTER ON EVERY PAGE
    // ─────────────────────────────────────────────
  
    const totalPages = doc.getNumberOfPages();
  
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
  
      doc.setDrawColor(...COLORS.border);
      doc.line(MARGIN, 283, PAGE_WIDTH - MARGIN, 283);
  
      writeText(
        "CyberMentis  /  SECURITY AWARENESS",
        MARGIN,
        290,
        {
          size: 7,
          color: COLORS.muted,
        }
      );
  
      writeText(
        `Page ${page} of ${totalPages}`,
        PAGE_WIDTH - MARGIN - 28,
        290,
        {
          size: 7,
          color: COLORS.muted,
          maxWidth: 28,
        }
      );
    }
  
    doc.save(`CyberMentis-URL-Report-${reportId}.pdf`);
  }