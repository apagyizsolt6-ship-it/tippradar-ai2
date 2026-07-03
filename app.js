let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentView = "all";

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
      matches.push({
        league: p[0].trim(),
        home: p[1].trim(),
        away: p[2].trim(),
        odds: parseFloat(p[3]),
        market: p[4] ? p[4].trim() : "Alap piac"
      });
    }
  });

  currentView = "all";
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
  const q = document.getElementById("searchInput").value.toLowerCase();

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
  renderMatches();
}

function showFavorites() {
  currentView = "favorites";
  renderMatches();
}

function buildTicket(type = "safe") {
  let count = 3;

  if (type === "medium") count = 5;
  if (type === "high") count = 8;

  const top = [...matches]
    .sort((a, b) => calculateAI(b).score - calculateAI(a).score)
    .slice(0, count);

  let odds = 1;
  let html = `<h2>🧾 AI szelvény</h2>`;

  top.forEach(m => {
    odds *= m.odds;
    const ai = calculateAI(m);

    html += `
      <p>
        <b>${m.home} - ${m.away}</b><br>
        Piac: ${m.market}<br>
        Odds: ${m.odds}<br>
        AI: ${ai.score}/100
      </p>
    `;
  });

  html += `
    <p><b>Össz odds:</b> ${odds.toFixed(2)}</p>
    <p class="small">Ez nem biztos tipp, hanem döntéstámogató AI-javaslat.</p>
  `;

  const box = document.getElementById("ticketBox");
  box.classList.remove("hidden");
  box.innerHTML = html;
}

renderMatches();
