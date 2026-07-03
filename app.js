let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentView = "all";

function parseMatchLine(line){
  const p = line.split("|").map(x => x.trim()).filter(Boolean);

  if(p.length >= 5){
    return {
      league: p[0],
      home: p[1],
      away: p[2],
      odds: parseFloat(p[3].replace(",", ".")),
      market: p[4]
    };
  }

  if(p.length >= 3 && p[0].includes("-")){
    const teams = p[0].split("-").map(x => x.trim());

    return {
      league: "Kézi import",
      home: teams[0],
      away: teams[1],
      odds: parseFloat(p[1].replace(",", ".")),
      market: p[2]
    };
  }

  return null;
}

function loadManualMatches(){
  const text = document.getElementById("matchInput").value.trim();

  if(!text){
    alert("Adj meg legalább egy meccset!");
    return;
  }

  matches = [];
  let errors = [];

  text.split("\n").forEach((line,index)=>{
    const match = parseMatchLine(line);

    if(match && match.home && match.away && !isNaN(match.odds)){
      matches.push(match);
    }else{
      errors.push(index + 1);
    }
  });

  currentView = "all";
  hideTicket();
  renderMatches();

  alert(
    errors.length
      ? `Betöltve: ${matches.length} meccs. Hibás sorok: ${errors.join(", ")}`
      : `Sikeres import: ${matches.length} meccs.`
  );
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

function getVisibleMatches(){
  const q = (document.getElementById("searchInput").value || "").toLowerCase();
  let list = [...matches];

  if(currentView === "top"){
    list = list.sort((a,b)=>calculateAI(b).score - calculateAI(a).score).slice(0,10);
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
    <div class="statBox"><b>${total}</b><span>Meccs</span></div>
    <div class="statBox"><b>${topCount}</b><span>Top AI</span></div>
    <div class="statBox"><b>${avg}%</b><span>Átlag AI</span></div>
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
  const filtered = getVisibleMatches();

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
  if(!box) return;

  box.classList.add("hidden");
  box.innerHTML = "";
}

function getTicketSettings(mode){
  if(mode === "value") return { count:4, minScore:78, name:"Value" };
  if(mode === "high") return { count:6, minScore:65, name:"Magas odds" };
  return { count:3, minScore:70, name:"Biztonságos" };
}

function buildTicket(mode = "safe"){
  const settings = getTicketSettings(mode);

  const selected = [...matches]
    .filter(m => calculateAI(m).score >= settings.minScore)
    .sort((a,b)=>calculateAI(b).score - calculateAI(a).score)
    .slice(0, settings.count);

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

  const stake = Number(document.getElementById("stakeInput")?.value || 0);
  const win = Math.round(stake * odds);

  html += `
    <p><b>Szelvény típusa:</b> ${settings.name}</p>
    <p><b>Össz odds:</b></p>
    <div class="ticketOdds">${odds.toFixed(2)}</div>
    <p><b>Tét:</b> ${stake} Ft</p>
    <p><b>Várható nyeremény:</b> ${win} Ft</p>
    <p class="small">Ez nem biztos tipp, hanem döntéstámogató AI-javaslat.</p>
    <button onclick="copyTicket()">📋 Szelvény másolása</button>
  `;

  box.innerHTML = html;
  box.scrollIntoView({behavior:"smooth"});
}

function copyTicket(){
  const text = document.getElementById("ticketBox").innerText;

  if(navigator.clipboard){
    navigator.clipboard.writeText(text);
    alert("Szelvény kimásolva!");
  }else{
    alert(text);
  }
}

renderMatches();
