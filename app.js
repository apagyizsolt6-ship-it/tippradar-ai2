let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentView = "all";

function loadManualMatches(){
  const text = document.getElementById("matchInput").value.trim();

  if(!text){
    alert("Adj meg legalább egy meccset!");
    return;
  }

  matches = [];

  text.split("\n").forEach(line=>{
    const p = line.split("|");

    if(p.length >= 4){
      const odds = parseFloat(p[3].trim().replace(",", "."));

      if(!isNaN(odds)){
        matches.push({
          league: p[0].trim(),
          home: p[1].trim(),
          away: p[2].trim(),
          odds: odds,
          market: p[4] ? p[4].trim() : "Alap piac"
        });
      }
    }
  });

  currentView = "all";
  hideTicket();
  renderMatches();
}

function matchId(match){
  return `${match.league}_${match.home}_${match.away}_${match.odds}_${match.market}`;
}

function toggleFavorite(id){
  favorites = favorites.includes(id)
    ? favorites.filter(x => x !== id)
    : [...favorites, id];

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMatches();
}

function getFilteredMatches(){
  const q = (document.getElementById("searchInput").value || "").toLowerCase();
  let list = [...matches];

  if(currentView === "top"){
    list = list
      .sort((a,b)=>calculateAI(b).score - calculateAI(a).score)
      .slice(0,10);
  }

  if(currentView === "favorites"){
    list = list.filter(m => favorites.includes(matchId(m)));
  }

  return list.filter(m =>
    m.home.toLowerCase().includes(q) ||
    m.away.toLowerCase().includes(q) ||
    m.league.toLowerCase().includes(q) ||
    (m.market || "").toLowerCase().includes(q)
  );
}

function renderStats(){
  const box = document.getElementById("statsBox");
  if(!box) return;

  const total = matches.length;
  const topCount = matches.filter(m => calculateAI(m).score >= 78).length;
  const avg = total
    ? Math.round(matches.reduce((sum,m)=>sum + calculateAI(m).score,0) / total)
    : 0;

  box.innerHTML = `
    <div class="statBox">
      <b>${total}</b>
      <span>Meccs</span>
    </div>
    <div class="statBox">
      <b>${topCount}</b>
      <span>Top AI</span>
    </div>
    <div class="statBox">
      <b>${avg}%</b>
      <span>Átlag AI</span>
    </div>
  `;
}

function badgeByRisk(risk){
  if(risk === "Alacsony") return "badge-green";
  if(risk === "Közepes") return "badge-yellow";
  return "badge-red";
}

function renderCard(match){
  const ai = calculateAI(match);
  const id = matchId(match);
  const saved = favorites.includes(id);

  return `
    <div class="card">
      <div class="league">${match.league}</div>
      <div class="match">${match.home} - ${match.away}</div>

      <p><b>Piac:</b> ${match.market}</p>
      <p><b>Odds:</b> <span class="odd">${match.odds}</span></p>

      <p class="ai">🤖 AI pont: ${ai.score}/100</p>

      <span class="badge ${badgeByRisk(ai.risk)}">${ai.risk} kockázat</span>
      <span class="badge badge-green">${ai.confidence} confidence</span>

      <p><b>Ajánlás:</b> ${ai.label}</p>
      <p class="small"><b>Indoklás:</b> ${ai.reasons}</p>

      <button class="favoriteBtn" onclick="toggleFavorite('${id}')">
        ${saved ? "⭐ Mentve" : "☆ Kedvenchez adás"}
      </button>
    </div>
  `;
}

function renderMatches(){
  renderStats();

  const list = document.getElementById("matches");
  const filtered = getFilteredMatches();

  if(!filtered.length){
    list.innerHTML = "<div class='card'>Nincs találat.</div>";
    return;
  }

  list.innerHTML = filtered.map(renderCard).join("");
}

function showAll(){
  currentView = "all";
  hideTicket();
  renderMatches();
}

function showTop(){
  currentView = "top";
  hideTicket();
  renderMatches();
}

function showFavorites(){
  currentView = "favorites";
  hideTicket();
  renderMatches();
}

function hideTicket(){
  const box = document.getElementById("ticketBox");
  if(box){
    box.classList.add("hidden");
    box.innerHTML = "";
  }
}

function buildTicket(mode = "safe"){
  let count = 3;
  let minScore = 70;

  if(mode === "value"){
    count = 4;
    minScore = 78;
  }

  if(mode === "high"){
    count = 6;
    minScore = 65;
  }

  const selected = [...matches]
    .filter(m => calculateAI(m).score >= minScore)
    .sort((a,b)=>calculateAI(b).score - calculateAI(a).score)
    .slice(0,count);

  const box = document.getElementById("ticketBox");
  box.classList.remove("hidden");

  if(!selected.length){
    box.innerHTML = `
      <h2>🧾 AI szelvény</h2>
      <p>Nincs elég erős meccs ehhez a szelvénytípushoz.</p>
    `;
    return;
  }

  let odds = 1;
  let html = `<h2>🧾 AI szelvény</h2>`;

  selected.forEach(m=>{
    odds *= m.odds;
    const ai = calculateAI(m);

    html += `
      <div class="ticketItem">
        <b>${m.home} - ${m.away}</b><br>
        Liga: ${m.league}<br>
        Piac: ${m.market}<br>
        Odds: ${m.odds}<br>
        AI: ${ai.score}/100
      </div>
    `;
  });

  html += `
    <p><b>Szelvény típusa:</b> ${
      mode === "safe" ? "Biztonságos" :
      mode === "value" ? "Value" :
      "Magas odds"
    }</p>

    <p>Össz odds:</p>
    <div class="ticketOdds">${odds.toFixed(2)}</div>

    <p class="small">
      Ez nem biztos tipp, hanem döntéstámogató AI-javaslat.
    </p>
  `;

  box.innerHTML = html;
}

renderMatches();
