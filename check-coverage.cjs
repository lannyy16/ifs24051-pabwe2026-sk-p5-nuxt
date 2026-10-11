const fs = require("node:fs");

const reportPath = "coverage/coverage-final.json";

if (!fs.existsSync(reportPath)) {
  console.log("Laporan coverage tidak ditemukan. Jalankan bun run test:coverage dahulu.");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

for (const [file, cov] of Object.entries(report)) {
  const lines = Object.entries(cov.s)
    .filter(([, count]) => count === 0)
    .map(([id]) => cov.statementMap[id]?.start?.line);

  const functions = Object.entries(cov.f)
    .filter(([, count]) => count === 0)
    .map(([id]) => ({
      name: cov.fnMap[id]?.name,
      line: cov.fnMap[id]?.line
    }));

  const branches = Object.entries(cov.b).flatMap(([id, counts]) =>
    counts.flatMap((count, index) =>
      count === 0
        ? [{
            line: cov.branchMap[id]?.locations?.[index]?.start?.line,
            type: cov.branchMap[id]?.type
          }]
        : []
    )
  );

  if (lines.length || functions.length || branches.length) {
    console.log("\nFILE:", file);
    if (lines.length) console.log("Baris:", [...new Set(lines)]);
    if (functions.length) console.log("Fungsi:", functions);
    if (branches.length) console.log("Cabang:", branches);
  }
}
