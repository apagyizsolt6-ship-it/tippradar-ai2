let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

function loadManualMatches() {
  const text = document.getElementById("matchInput").value.trim();

  if (text === "") {
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

  renderMatches();
}

function matchId(match) {
  return match.league + "_" + match.home + "_" + match.away + "_" + match.odds;
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(x => x !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMatches();
}

function getRisk(score) {
  if (score >= 85) return "Alacsony";
  if (score >= 70) return "Közepes";
  return "Magas";
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
      <p><b>Kockázat:</b> ${getRisk(ai.score)}</p>

      <button onclick="toggleFavorite('${id}')">
        ${saved ? "⭐ Mentve" : "☆ Kedvenchez adás"}
      </button>
    </div>
  `;
}

function getFilteredMatches() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  return matches.filter(m =>
    m.home.toLowerCase().includes(q) ||
    m.away.toLowerCase().includes(q) ||
    m.league.toLowerCase().includes(q) ||
    (m.market && m.market.toLowerCase().includes(q))
  );
}

function renderMatches() {
  const list = document.getElementById("matches");
  list.innerHTML = "";

  getFilteredMatches().forEach(match => {
    list.innerHTML += renderCard(match);
  });
}

function showTop() {
  const list = document.getElementById("matches");
  list.innerHTML = "";

  [...matches]
    .sort((a, b) => calculateAI(b).score - calculateAI(a).score)
    .slice(0, 10)
    .forEach(match => {
      list.innerHTML += renderCard(match);
    });
}

function showFavorites() {
  const list = document.getElementById("matches");
  list.innerHTML = "";

  matches
    .filter(m => favorites.includes(matchId(m)))
    .forEach(match => {
      list.innerHTML += renderCard(match);
    });

  if (list.innerHTML === "") {
    list.innerHTML = "<div class='card'>Még nincs kedvenc meccsed.</div>";
  }
}

function buildTicket() {
  let top = [...matches]
    .sort((a, b) => calculateAI(b).score - calculateAI(a).score)
    .slice(0, 3);

  let html = "<h2>🧾 AI szelvény</h2>";
  let odds = 1;

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
    <p class="small">Ez nem biztos tipp, csak AI alapú szelvényjavaslat.</p>
  `;

  document.getElementById("ticketBox").classList.remove("hidden");
  document.getElementById("ticketBox").innerHTML = html;
}

renderMatches();
