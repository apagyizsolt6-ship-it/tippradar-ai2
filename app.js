
function loadManualMatches(){

  const text = document.getElementById("matchInput").value.trim();

  if(text===""){
    alert("Adj meg legalább egy meccset!");
    return;
  }

  matches=[];

  text.split("\n").forEach(line=>{

    const p=line.split("|");

    if(p.length>=4){

      matches.push({
        league:p[0].trim(),
        home:p[1].trim(),
        away:p[2].trim(),
        odds:parseFloat(p[3])
      });

    }

  });

  renderMatches();

}

function renderMatches(){

  const list=document.getElementById("matches");
  const q=document.getElementById("searchInput").value.toLowerCase();

  list.innerHTML="";

  matches
  .filter(m=>
      m.home.toLowerCase().includes(q) ||
      m.away.toLowerCase().includes(q) ||
      m.league.toLowerCase().includes(q)
  )
  .forEach(match=>{

      const ai=calculateAI(match);

      list.innerHTML+=`

<div class="card">

<div class="league">${match.league}</div>

<div class="match">${match.home} - ${match.away}</div>

<p><b>Odds:</b> <span class="odd">${match.odds}</span></p>

<p class="ai">

🤖 AI: ${ai.score}/100

</p>

<p>

<b>Ajánlás:</b>

${ai.market}

</p>

<p>

Confidence:

${ai.confidence}

</p>

</div>

`;

  });

}

function showTop(){

  matches.sort((a,b)=>calculateAI(b).score-calculateAI(a).score);

  renderMatches();

}

function buildTicket(){

  let top=[...matches]
  .sort((a,b)=>calculateAI(b).score-calculateAI(a).score)
  .slice(0,3);

  let html="<h2>AI szelvény</h2>";

  let odds=1;

  top.forEach(m=>{

      odds*=m.odds;

      html+=`
      <p>
      ${m.home} - ${m.away}
      (${m.odds})
      </p>
      `;

  });

  html+=`

<p>

Össz odds:

<b>${odds.toFixed(2)}</b>

</p>

`;

  document.getElementById("ticketBox").classList.remove("hidden");

  document.getElementById("ticketBox").innerHTML=html;

}

function showFavorites(){

  alert("A kedvencek funkció a következő verzióban érkezik.");

}

renderMatches();
