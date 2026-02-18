// Load Teams
function loadTeams(){
  let teamList = document.getElementById("teamList");

  teams.forEach(team=>{
    teamList.innerHTML += `<option value="${team}">`;
  });
}


// Show Page
function showPage(id){
  document.querySelectorAll(".page")
    .forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
}

// Save Pit Data
function savePit(){
  let team=document.getElementById("pitTeam").value;

  let data={
  drive:driveType.value,
  auto:autoStrategy.value,
  cycle:cycleSpeed.value,
  strengths:strengths.value,
  weaknesses:weaknesses.value,
  comments:pitComments.value,
  timestamp:Date.now()
};

  database.ref("pit/"+team).set(data);
  alert("Pit Data Synced");
}

// Save Match Data
function saveMatch(){
  let entry={
    team:matchTeam.value,
    match:matchNumber.value,
    auto:Number(autoPoints.value),
    driver:Number(driverPoints.value),
    endgame:Number(endgamePoints.value),
    off:Number(offRating.value),
    def:Number(defRating.value),
    comments: matchComments.value,
    total:Number(autoPoints.value)+
          Number(driverPoints.value)+
          Number(endgamePoints.value),
    timestamp:Date.now()
  };

  database.ref("matches").push(entry);
  alert("Match Synced");
}

// Live Dashboard
// Live Dashboard + Pick Score
database.ref("matches").on("value", snapshot=>{
  let data = snapshot.val();
  let statsDiv = document.getElementById("stats");

  if(!statsDiv) return;

  if(!data){
    statsDiv.innerHTML = "<p>No data yet</p>";
    return;
  }

  let teamStats = {};

  Object.values(data).forEach(m=>{
    if(!teamStats[m.team]){
      teamStats[m.team] = {
        scores: [],
        off:0,
        def:0,
        count:0
      };
    }

    teamStats[m.team].scores.push(m.total);
    teamStats[m.team].off += m.off;
    teamStats[m.team].def += m.def;
    teamStats[m.team].count++;
  });

  let rankings = [];

  Object.keys(teamStats).forEach(team=>{
    let scores = teamStats[team].scores;
    let avg = scores.reduce((a,b)=>a+b,0) / scores.length;

    // Consistency (standard deviation)
    let variance = scores.reduce((sum,score)=>{
      return sum + Math.pow(score - avg,2);
    },0) / scores.length;

    let stdDev = Math.sqrt(variance);

    let avgOff = teamStats[team].off / teamStats[team].count;
    let avgDef = teamStats[team].def / teamStats[team].count;

    // 🔥 PICK SCORE WITH CONSISTENCY BONUS
    let pickScore =
      (avg * 0.5) +
      (avgOff * 0.15) +
      (avgDef * 0.15) -
      (stdDev * 0.2);   // penalize inconsistency

    rankings.push({
      team,
      avg,
      avgOff,
      avgDef,
      pickScore,
      stdDev
    });
  });

  rankings.sort((a,b)=>b.pickScore - a.pickScore);

  let table = "<table border='1' width='100%'>";
  table += "<tr><th>Rank</th><th>Team</th><th>Avg</th><th>Cons.</th><th>Pick Score</th></tr>";

  rankings.forEach((r,i)=>{
    let highlight = i < 8 ? "style='background:#1f3d1f'" : "";

    table += `<tr ${highlight}>
      <td>${i+1}</td>
      <td onclick="searchTeam('${r.team}')" style="cursor:pointer;color:lightblue;">
        ${r.team}
      </td>
      <td>${r.avg.toFixed(1)}</td>
      <td>${r.stdDev.toFixed(1)}</td>
      <td>${r.pickScore.toFixed(1)}</td>
    </tr>`;
  });

  table += "</table>";

  statsDiv.innerHTML = table;

  window.currentRankings = rankings;
});


function searchTeam(teamFromClick){
  let teamNumber = teamFromClick || document.getElementById("teamSearch").value;
  let resultDiv = document.getElementById("teamDetails");

  if(!window.currentRankings){
    resultDiv.innerHTML = "No data loaded yet.";
    return;
  }

  let team = window.currentRankings.find(t => t.team == teamNumber);

  if(!team){
    resultDiv.innerHTML = "Team not found.";
    return;
  }

  // Load Pit Data
  database.ref("pit/"+teamNumber).once("value").then(pitSnap=>{
    let pitData = pitSnap.val();

    // Load Match Data
    database.ref("matches").once("value").then(matchSnap=>{
      let matches = matchSnap.val();

      let matchComments = [];

      if(matches){
        Object.values(matches).forEach(m=>{
          if(m.team == teamNumber && m.comments){
            matchComments.push(
              `<li><b>Match ${m.match}:</b> ${m.comments}</li>`
            );
          }
        });
      }

      resultDiv.innerHTML = `
        <h3>Team ${team.team}</h3>
        <p><b>Avg Score:</b> ${team.avg.toFixed(1)}</p>
        <p><b>Off Rating:</b> ${team.avgOff.toFixed(1)}</p>
        <p><b>Def Rating:</b> ${team.avgDef.toFixed(1)}</p>
        <p><b>Pick Score:</b> ${team.pickScore.toFixed(1)}</p>

        <hr>

        <h4>Pit Notes</h4>
        <p><b>Drive:</b> ${pitData?.drive || "N/A"}</p>
        <p><b>Auto:</b> ${pitData?.auto || "N/A"}</p>
        <p><b>Cycle:</b> ${pitData?.cycle || "N/A"}</p>
        <p><b>Strengths:</b> ${pitData?.strengths || "N/A"}</p>
        <p><b>Weaknesses:</b> ${pitData?.weaknesses || "N/A"}</p>
        <p><b>Comments:</b> ${pitData?.comments || "None"}</p>

        <hr>

        <h4>Match Comments</h4>
        <ul style="max-height:150px; overflow-y:auto;">
          ${matchComments.length ? matchComments.join("") : "No match comments yet."}
        </ul>
      `;
    });
  });
}


// Initialize
loadTeams();
showPage("pit");







