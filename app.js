let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentView = "all";
let ticketMode = "safe";

function loadManualMatches() {
  const text = document.getElementById("matchInput").value.trim();

  if (!text) {
    alert("Adj meg legalább egy meccset!");
    return;
  }

  matches = [];

  text.split("\n").forEach(line => {
    const p = line.split("|");

    if (p.length >= 4) {
      const odds = parseFloat(p[3].replace(",", "."));

      if (!isNaN(odds)) {
        matches.push({
          league: p[0].trim(),
          home: p[1].trim(),
          away: p[2].trim(),
          odds,
          market: p[4] ? p[4].trim() : "Alap piac"
        });
      }
    }
  });

  currentView = "all";
  hideTicket();
  renderMatches();
}

function matchId(match) {
  return `${match.league}_${match.home}_${match.away}_${match.odds}_${match.market}`;
}

function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter(x => x !== id)
    : [...favorites, id];

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMatches();
}

function getFilteredMatches() {
  const q = (document.getElementById("searchInput").value || "").toLowerCase();

  let list = [...matches];

  if (currentView === "top") {
    list = list
      .sort((a, b) => calculateAI(b).score - calculateAI(a).score)
      .slice(0, 10);
  }

  if (currentView === "favorites") {
    list = list.filter(m => favorites.includes(matchId(m)));
  }

  return list.filter(m =>
    m.home.toLowerCase().includes(q) ||
    m.away.toLowerCase().includes(q) ||
    m.league.toLowerCase().includes(q) ||
    (m.market || "").toLowerCase().includes(q)
  );
}

function renderCard(match) {
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
      <p><b>Ajánlás:</b> ${ai.market}</p>
      <p><b>Confidence:</b> ${ai.confidence}</p>
      <p><b>Kockázat:</b> ${ai.risk}</p>
      <p class="small"><b>Indoklás:</b> ${ai.reasons}</p>

      <button onclick="toggleFavorite('${id}')">
        ${saved ? "⭐ Mentve" : "☆ Kedvenchez adás"}
      </button>
    </div>
  `;
}

function renderMatches() {
  const list = document.getElementById("matches");
  const filtered = getFilteredMatches();

  if (!filtered.length) {
    list.innerHTML = "<div class='card'>Nincs találat.</div>";
    return;
  }

  list.innerHTML = filtered.map(renderCard).join("");
}

function showTop() {
  currentView = "top";
  hideTicket();
  renderMatches();
}

function showFavorites() {
  currentView = "favorites";
  hideTicket();
  renderMatches();
}

function showAll() {
  currentView = "all";
  hideTicket();
  renderMatches();
}

function hideTicket() {
  const box = document.getElementById("ticketBox");
  if (box) {
    box.classList.add("hidden");
    box.innerHTML = "";
  }
}

function buildTicket(mode = "safe") {
  ticketMode = mode;

  let count = 3;
  let minScore = 70;

  if (mode === "value") {
    count = 4;
    minScore = 75;
  }

  if (mode === "high") {
    count = 6;
    minScore = 65;
  }

  const selected = [...matches]
    .filter(m => calculateAI(m).score >= minScore)
    .sort((a, b) => calculateAI(b).score - calculateAI(a).score)
    .slice(0, count);

  if (!selected.length) {
    document.getElementById("ticketBox").classList.remove("hidden");
    document.getElementById("ticketBox").innerHTML =
      "<h2>🧾 AI szelvény</h2><p>Nincs elég erős meccs a szelvényhez.</p>";
    return;
  }

  let odds = 1;
  let html = `<h2>🧾 AI szelvény</h2>`;

  html += `
    <p>
      <button onclick="buildTicket('safe')">Biztonságos</button>
      <button onclick="buildTicket('value')">Value</button>
      <button onclick="buildTicket('high')">Magas odds</button>
    </p>
  `;

  selected.forEach(m => {
    odds *= m.odds;
    const ai = calculateAI(m);

    html += `
      <p>
        <b>${m.home} - ${m.away}</b><br>
        Liga: ${m.league}<br>
        Piac: ${m.market}<br>
        Odds: ${m.odds}<br>
        AI: ${ai.score}/100<br>
        Kockázat: ${ai.risk}
      </p>
    `;
  });

  html += `
    <p><b>Szelvény típusa:</b> ${mode === "safe" ? "Biztonságos" : mode === "value" ? "Value" : "Magas odds"}</p>
    <p><b>Össz odds:</b> ${odds.toFixed(2)}</p>
    <p class="small">Ez nem biztos tipp, hanem döntéstámogató AI-javaslat.</p>
  `;

  const box = document.getElementById("ticketBox");
  box.classList.remove("hidden");
  box.innerHTML = html;
}

renderMatches();
