function calculateAI(match) {
  let score = 50;
  let reasons = [];

  const odds = Number(match.odds || 0);
  const market = (match.market || "").toLowerCase();
  const league = (match.league || "").toLowerCase();

  if (odds >= 1.40 && odds <= 1.80) {
    score += 18;
    reasons.push("stabil odds-tartomány");
  } else if (odds > 1.80 && odds <= 2.30) {
    score += 14;
    reasons.push("jó value odds");
  } else if (odds > 2.30 && odds <= 3.50) {
    score += 6;
    reasons.push("magasabb kockázatú odds");
  } else {
    score -= 8;
    reasons.push("kockázatos odds");
  }

  if (market.includes("over") || market.includes("gól")) {
    score += 8;
    reasons.push("gólpiac");
  }

  if (market.includes("btts") || market.includes("mindkét")) {
    score += 7;
    reasons.push("BTTS piac");
  }

  if (market.includes("lap")) {
    score += 6;
    reasons.push("lapos piac");
  }

  if (market.includes("szöglet")) {
    score += 6;
    reasons.push("szöglet piac");
  }

  if (market.includes("les")) {
    score += 5;
    reasons.push("les piac");
  }

  if (
    league.includes("premier") ||
    league.includes("serie") ||
    league.includes("liga") ||
    league.includes("bundesliga") ||
    league.includes("nb")
  ) {
    score += 5;
    reasons.push("ismert bajnokság");
  }

  score = Math.max(1, Math.min(95, score));

  let risk = "Magas";
  if (score >= 85) risk = "Alacsony";
  else if (score >= 70) risk = "Közepes";

  let marketLabel = "Óvatosan kezelendő";
  if (score >= 85) marketLabel = "Erős AI jel";
  else if (score >= 75) marketLabel = "Value bet jelölt";
  else if (score >= 65) marketLabel = "Közepes adatjel";

  return {
    score,
    market: marketLabel,
    confidence: score + "%",
    risk,
    reasons: reasons.join(", ")
  };
}
