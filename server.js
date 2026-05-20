const express = require("express");
const app = express();

app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.json({ status: "WealthControl backend online" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// =========================
// ENGINE (SIMULAÇÃO)
// =========================
function rebuildEngine(transactions) {
  const processed = transactions.length;

  const checksum =
    "CS-" +
    transactions.reduce((acc, t) => acc + (t.amount || 0), 0) +
    "-" +
    processed;

  return { checksum, processed };
}

// =========================
// API REAL
// =========================
app.post("/api/rebuild", (req, res) => {
  try {
    const { portfolioId } = req.body;

    if (!portfolioId) {
      return res.status(400).json({
        error: "portfolioId é obrigatório"
      });
    }

    // MOCK de transações
    const transactions = Array.from({ length: 1000 }).map((_, i) => ({
      id: i + 1,
      amount: 100
    }));

    const start = Date.now();

    const result = rebuildEngine(transactions);

    const durationMs = Date.now() - start;

    return res.json({
      portfolioId,
      checksum: result.checksum,
      processed: result.processed,
      durationMs
    });

  } catch (err) {
    return res.status(500).json({
      error: "Rebuild failed",
      details: err.message
    });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
