function calculateAI(match){
  let score = 45;
  let reasons = [];

  const odds = Number(match.odds || 0);
  const market = (match.market || "").toLowerCase();
  const league = (match.league || "").toLowerCase();

  if(odds >= 1.30 && odds <= 1.60){
    score += 14;
    reasons.push("stabil odds");
  }else if(odds > 1.60 && odds <= 2.15){
    score += 23;
    reasons.push("jó value odds");
  }else if(odds > 2.15 && odds <= 3.50){
    score += 9;
    reasons.push("magasabb odds, nagyobb kockázat");
  }else{
    score -= 10;
    reasons.push("kockázatos odds-tartomány");
  }

  if(market.includes("over") || market.includes("gól")){
    score += 10;
    reasons.push("gólos piac");
  }

  if(market.includes("btts") || market.includes("mindkét")){
    score += 9;
    reasons.push("BTTS piac");
  }

  if(market.includes("lap")){
    score += 8;
    reasons.push("lapos piac");
  }

  if(market.includes("szöglet") || market.includes("corner")){
    score += 8;
    reasons.push("szöglet piac");
  }

  if(market.includes("les") || market.includes("offside")){
    score += 6;
    reasons.push("les piac");
  }

  if(market.includes("győztes") || market.includes("hazai") || market.includes("vendég")){
    score += 5;
    reasons.push("eredmény piac");
  }

  if(
    league.includes("premier") ||
    league.includes("serie") ||
    league.includes("la liga") ||
    league.includes("bundesliga")
  ){
    score += 7;
    reasons.push("erős bajnokság");
  }

  if(league.includes("nb") || league.includes("magyar")){
    score += 4;
    reasons.push("magyar bajnokság");
  }

  score = Math.max(1, Math.min(98, score));

  let risk = "Magas";
  if(score >= 86) risk = "Alacsony";
  else if(score >= 72) risk = "Közepes";

  let label = "Gyenge jel";
  if(score >= 88) label = "Nagyon erős AI jel";
  else if(score >= 80) label = "Erős value jelölt";
  else if(score >= 70) label = "Közepes adatjel";

  return {
    score,
    label,
    confidence: score + "%",
    risk,
    reasons: reasons.join(", ")
  };
}
