// Load Teams
function loadTeams(){
  let pitSelect=document.getElementById("pitTeam");
  let matchSelect=document.getElementById("matchTeam");

  teams.forEach(team=>{
    pitSelect.innerHTML+=`<option>${team}</option>`;
    matchSelect.innerHTML+=`<option>${team}</option>`;
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
    total:Number(autoPoints.value)+
          Number(driverPoints.value)+
          Number(endgamePoints.value),
    timestamp:Date.now()
  };

  database.ref("matches").push(entry);
  alert("Match Synced");
}

// Live Dashboard
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
      teamStats[m.team] = { total:0, count:0 };
    }
    teamStats[m.team].total += m.total;
    teamStats[m.team].count++;
  });

  let rankings = [];

  Object.keys(teamStats).forEach(team=>{
    let avg = teamStats[team].total / teamStats[team].count;
    rankings.push({ team, avg });
  });

  rankings.sort((a,b)=>b.avg - a.avg);

  let table = "<table border='1' width='100%'>";
  table += "<tr><th>Rank</th><th>Team</th><th>Avg</th></tr>";

  rankings.forEach((r,i)=>{
    table += `<tr>
      <td>${i+1}</td>
      <td>${r.team}</td>
      <td>${r.avg.toFixed(1)}</td>
    </tr>`;
  });

  table += "</table>";

  statsDiv.innerHTML = table;
});

// Initialize
loadTeams();
showPage("pit");
