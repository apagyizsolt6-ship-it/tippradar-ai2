
function calculateAI(match){
  let base = 50;

  if(match.odds >= 1.50 && match.odds <= 2.10){
    base += 20;
  }

  if(match.odds > 2.10 && match.odds <= 3.00){
    base += 10;
  }

  if(match.league.toLowerCase().includes("premier")){
    base += 8;
  }

  if(match.league.toLowerCase().includes("la liga")){
    base += 7;
  }

  if(match.league.toLowerCase().includes("nb")){
    base += 5;
  }

  let score = Math.min(base, 95);

  let market = "Over 1.5 / esélyes piac";

  if(score >= 80){
    market = "Erős AI jel";
  }

  if(match.odds >= 1.70 && match.odds <= 2.20){
    market = "Value bet jelölt";
  }

  return {
    score: score,
    market: market,
    confidence: score + "%"
  };
}
