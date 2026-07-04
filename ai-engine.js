/* TippRadar AI v4.0 - AI Engine
   Szabályalapú döntéstámogató motor.
   Nem garantál nyereményt.
*/

function detectMarketType(marketText){
  const market = (marketText || "").toLowerCase();

  if(market.includes("btts") || market.includes("mindkét")) return "BTTS";
  if(market.includes("gól") || market.includes("over") || market.includes("under")) return "GÓL";
  if(market.includes("lap") || market.includes("sárga")) return "LAP";
  if(market.includes("szöglet") || market.includes("corner")) return "SZÖGLET";
  if(market.includes("les") || market.includes("offside")) return "LES";
  if(market.includes("szabálytalanság") || market.includes("fault") || market.includes("foul")) return "SZABÁLYTALANSÁG";
  if(market.includes("döntetlen") || market === "x") return "DÖNTETLEN";
  if(market.includes("győztes") || market.includes("hazai") || market.includes("vendég")) return "GYŐZTES";

  return "EGYÉB";
}

function oddsScore(odds){
  odds = Number(odds || 0);

  if(odds >= 1.30 && odds <= 1.60) return { points:14, reason:"stabil odds" };
  if(odds > 1.60 && odds <= 2.15) return { points:23, reason:"jó value odds" };
  if(odds > 2.15 && odds <= 3.50) return { points:10, reason:"magasabb odds, nagyobb kockázat" };
  return { points:-10, reason:"kockázatos odds-tartomány" };
}

function marketScore(type){
  switch(type){
    case "GÓL": return { points:10, reason:"gólos piac" };
    case "BTTS": return { points:9, reason:"BTTS piac" };
    case "LAP": return { points:11, reason:"lapos piac" };
    case "SZÖGLET": return { points:10, reason:"szöglet piac" };
    case "LES": return { points:8, reason:"les piac" };
    case "SZABÁLYTALANSÁG": return { points:8, reason:"szabálytalanság piac" };
    case "DÖNTETLEN": return { points:4, reason:"döntetlen piac, magasabb kockázat" };
    case "GYŐZTES": return { points:5, reason:"eredmény piac" };
    default: return { points:2, reason:"általános piac" };
  }
}

function leagueScore(leagueText){
  const league = (leagueText || "").toLowerCase();

  if(
    league.includes("premier") ||
    league.includes("serie") ||
    league.includes("la liga") ||
    league.includes("bundesliga") ||
    league.includes("bajnokok")
  ){
    return { points:7, reason:"erős bajnokság" };
  }

  if(league.includes("nb") || league.includes("magyar")){
    return { points:4, reason:"magyar bajnokság" };
  }

  return { points:2, reason:"általános bajnokság" };
}

function getRisk(score){
  if(score >= 86) return "Alacsony";
  if(score >= 72) return "Közepes";
  return "Magas";
}

function getLabel(score){
  if(score >= 88) return "Nagyon erős AI jel";
  if(score >= 80) return "Erős value jelölt";
  if(score >= 70) return "Közepes adatjel";
  return "Gyenge jel";
}

function calculateAI(match){
  let score = 45;
  let reasons = [];

  const type = detectMarketType(match.market);
  const oddsPart = oddsScore(match.odds);
  const marketPart = marketScore(type);
  const leaguePart = leagueScore(match.league);

  score += oddsPart.points;
  score += marketPart.points;
  score += leaguePart.points;

  reasons.push(oddsPart.reason);
  reasons.push(marketPart.reason);
  reasons.push(leaguePart.reason);

  score = Math.max(1, Math.min(98, score));

  return {
    score,
    label:getLabel(score),
    confidence:score + "%",
    risk:getRisk(score),
    marketType:type,
    reasons:reasons.join(", ")
  };
}
