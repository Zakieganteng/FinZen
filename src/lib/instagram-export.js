/**
 * Generate Instagram-ready PNG (1080×1350) — Gen Z money recap style
 */

const CATEGORY_COLORS = ["#60A5FA", "#4ADE80", "#C084FC", "#FACC15", "#FB7185", "#22D3EE"];
const W = 1080;
const H = 1350;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatIdr(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function formatIdrShort(n) {
  const v = Math.abs(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")}jt`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`;
  return String(Math.round(v));
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBlob(ctx, x, y, r, color, alpha = 0.35) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * @param {Object} data
 * @param {string} data.userName
 * @param {string} data.periodLabel - e.g. "Mei 2026"
 * @param {string} data.presetLabel - e.g. "bulan ini"
 * @param {number} data.totalSpending
 * @param {number} data.momDelta
 * @param {number} data.momPct - 0.12 = 12%
 * @param {boolean} data.showMom
 * @param {Array<{category: string, value: number}>} data.topCategories
 */
export function drawInstagramReport(data) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const {
    userName = "kamu",
    periodLabel = "",
    presetLabel = "bulan ini",
    totalSpending = 0,
    momDelta = 0,
    momPct = 0,
    showMom = true,
    topCategories = [],
  } = data;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f0c29");
  bg.addColorStop(0.45, "#302b63");
  bg.addColorStop(1, "#24243e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawBlob(ctx, 180, 200, 280, "#a855f7", 0.5);
  drawBlob(ctx, 920, 320, 320, "#22d3ee", 0.4);
  drawBlob(ctx, 800, 1100, 360, "#f472b6", 0.35);
  drawBlob(ctx, 120, 1000, 240, "#4ade80", 0.25);

  // Header pill
  roundRect(ctx, 72, 72, 220, 52, 26);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px system-ui, Segoe UI, sans-serif";
  ctx.fillText("finzen ✨", 98, 108);

  // Period tag
  roundRect(ctx, 72, 148, 420, 44, 22);
  ctx.fillStyle = "rgba(34, 211, 238, 0.25)";
  ctx.fill();
  ctx.fillStyle = "#a5f3fc";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText(`${presetLabel} · ${periodLabel}`, 92, 178);

  // Main headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 56px system-ui, sans-serif";
  ctx.fillText("money recap", 72, 280);
  ctx.font = "800 56px system-ui, sans-serif";
  ctx.fillStyle = "#fde047";
  ctx.fillText("📊💸", 72, 350);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText(`hey ${userName.split(" ")[0]} — ini spill dompet lo`, 72, 400);

  // Hero card — total spending
  roundRect(ctx, 72, 440, W - 144, 200, 32);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText("total keluar", 108, 500);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 64px system-ui, sans-serif";
  const totalStr = formatIdr(totalSpending);
  ctx.fillText(totalStr.length > 18 ? `Rp ${formatIdrShort(totalSpending)}` : totalStr, 108, 580);

  // MoM badge
  if (showMom) {
    const up = momDelta >= 0;
    const badgeX = W - 72 - 280;
    roundRect(ctx, badgeX, 468, 280, 72, 36);
    ctx.fillStyle = up ? "rgba(251, 113, 133, 0.35)" : "rgba(74, 222, 128, 0.35)";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 22px system-ui, sans-serif";
    const momText = `${up ? "📈" : "📉"} vs bulan lalu ${up ? "+" : ""}${Math.round(momPct * 100)}%`;
    ctx.fillText(momText, badgeX + 24, 514);
  }

  // Top categories
  ctx.fillStyle = "#fff";
  ctx.font="800 36px system-ui, sans-serif";
  ctx.fillText("habis di mana? 👇", 72, 700);

  const cats = [...topCategories].sort((a, b) => b.value - a.value).slice(0, 5);
  const maxVal = cats[0]?.value || 1;
  let y = 740;

  if (cats.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText("belum ada transaksi — gas catat dulu 🔥", 72, y + 40);
  } else {
    cats.forEach((cat, i) => {
      const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
      const barW = W - 144;
      const rowH = 88;

      roundRect(ctx, 72, y, barW, rowH, 20);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();

      // progress bar
      const fillW = Math.max(12, (cat.value / maxVal) * (barW - 48));
      roundRect(ctx, 96, y + rowH - 28, fillW, 12, 6);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "700 26px system-ui, sans-serif";
      ctx.fillText(cat.category, 96, y + 38);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "600 22px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatIdr(cat.value), 72 + barW - 24, y + 38);
      ctx.textAlign = "left";

      y += rowH + 16;
    });
  }

  // Footer vibe card
  const footerY = H - 200;
  roundRect(ctx, 72, footerY, W - 144, 120, 28);
  const footerGrad = ctx.createLinearGradient(72, footerY, W - 72, footerY + 120);
  footerGrad.addColorStop(0, "rgba(168, 85, 247, 0.45)");
  footerGrad.addColorStop(1, "rgba(34, 211, 238, 0.35)");
  ctx.fillStyle = footerGrad;
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 28px system-ui, sans-serif";
  ctx.fillText("track · stay chill · repeat 🔁", 108, footerY + 48);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "500 20px system-ui, sans-serif";
  const tagLines = wrapText(ctx, "#FinZen #MoneyRecap #DompetSehat #GenZFinance", W - 200);
  tagLines.forEach((line, idx) => {
    ctx.fillText(line, 108, footerY + 88 + idx * 26);
  });

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 18px system-ui, sans-serif";
  ctx.fillText("made with finzen — share ke close friends ✌️", 72, H - 48);

  return canvas;
}

export function downloadInstagramReport(data, filename) {
  const canvas = drawInstagramReport(data);
  if (!canvas) return false;

  const link = document.createElement("a");
  link.download = filename || `finzen-recap-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  return true;
}

export function getPeriodLabel(preset, ym) {
  const [y, m] = ym.split("-").map(Number);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (preset === "this-month") return `${monthNames[m - 1]} ${y}`;
  if (preset === "last-3") return "3 bulan terakhir";
  return `YTD ${y}`;
}

export function getPresetLabel(preset) {
  if (preset === "this-month") return "bulan ini";
  if (preset === "last-3") return "3 bulan";
  return "tahun ini";
}
