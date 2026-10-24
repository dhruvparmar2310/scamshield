import { jsPDF } from "jspdf";

const TEMPLATE = "/certificates/certificate-template.png";
const W = 1536;
const H = 1024;
const MIN_SCORE = 75;

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Certificate artwork could not be loaded."));
    image.src = url;
  });

function centeredText(ctx, value, centerX, y, maxWidth, baseSize, family, color) {
  let size = baseSize;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  do {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(value).width <= maxWidth || size <= 26) break;
    size -= 2;
  } while (true);
  ctx.fillText(value, centerX, y, maxWidth);
}

/**
 * Uses the reference certificate artwork itself (minus four variable text fields).
 * All ornamental elements, the seal, and the original signature remain untouched.
 * This is an educational completion certificate, not a verified credential.
 */
export async function generateQuizCertificate({ recipientName, result, difficulty = "easy", completedAt }) {
  const name = String(recipientName ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 70) throw new Error("Enter a name between 2 and 70 characters.");
  const total = Number(result?.total);
  const correct = Number(result?.correct);
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(correct) || correct < 0 || correct > total) {
    throw new Error("Invalid quiz result.");
  }
  const percentage = Math.round((correct / total) * 100);
  if (percentage < MIN_SCORE) throw new Error("A score of 75% or higher is required.");
  const date = completedAt ? new Date(completedAt) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Invalid completion date.");

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");
  ctx.scale(2, 2);
  const image = await loadImage(TEMPLATE);
  ctx.drawImage(image, 0, 0, W, H);
  // Positioning is in original reference-image pixels (1536 × 1024).
  centeredText(ctx, name, 768, 402, 570, 74, 'Georgia, "Times New Roman", serif', "#f5cb7d");
  centeredText(ctx, `${percentage}%`, 490, 706, 150, 55, 'Georgia, "Times New Roman", serif', "#f5c775");
  const level = `${String(difficulty).charAt(0).toUpperCase()}${String(difficulty).slice(1)} Level`;
  centeredText(ctx, level, 1145, 707, 225, 38, 'Georgia, "Times New Roman", serif', "#f5c775");
  const dateText = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  centeredText(ctx, dateText, 304, 851, 240, 22, 'Georgia, "Times New Roman", serif', "#f4f5fb");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 210);
  const safeName = name.normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/\s+/g, "-") || "Learner";
  pdf.save(`CyberMentis-Certificate-${safeName}.pdf`);
}
