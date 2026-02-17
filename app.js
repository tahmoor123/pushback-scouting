// Live Dashboard Auto Update
database.ref("matches").on("value", snapshot=>{
  let data = snapshot.val();
  let statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = "";

  if(!data){
    statsDiv.innerHTML = "<p>No data yet</p>";
    return;
  }

  let teamStats = {};

  Object.values(data).forEach(m=>{
    if(!teamStats[m.team]){
      teamStats[m.team] = {
        total:0,
        count:0,
        autoSuccess:0,
        endgameSuccess:0,
        offTotal:0,
        defTotal:0
      };
    }

    teamStats[m.team].total += m.total;
    teamStats[m.team].count++;
    if(m.auto > 0) teamStats[m.team].autoSuccess++;
    if(m.endgame > 0) teamStats[m.team].endgameSuccess++;
    teamStats[m.team].offTotal += m.off;
    teamStats[m.team].defTotal += m.def;
  });

  let rankings = [];

  Object.keys(teamStats).forEach(team=>{
    let t = teamStats[team];

    let avg = t.total / t.count;
    let autoPct = (t.autoSuccess / t.count) * 100;
    let endPct = (t.endgameSuccess / t.count) * 100;
    let offAvg = t.offTotal / t.count;
    let defAvg = t.defTotal / t.count;

    let pickScore =
      (avg * 0.4) +
      (autoPct * 0.2) +
      (endPct * 0.2) +
      (offAvg * 5 * 0.1) +
      (defAvg * 5 * 0.1);

    rankings.push({
      team,
      avg,
      autoPct,
      endPct,
      pickScore
    });
  });

  // Sort highest first
  rankings.sort((a,b)=>b.pickScore - a.pickScore);

  // Build table
  let table = `
    <table border="1" width="100%" style="border-collapse:collapse">
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Avg</th>
        <th>Auto%</th>
        <th>End%</th>
        <th>Pick Score</th>
      </tr>
  `;

  rankings.forEach((r,i)=>{
    table += `
      <tr>
        <td>${i+1}</td>
        <td>${r.team}</td>
        <td>${r.avg.toFixed(1)}</td>
        <td>${r.autoPct.toFixed(0)}%</td>
        <td>${r.endPct.toFixed(0)}%</td>
        <td>${r.pickScore.toFixed(1)}</td>
      </tr>
    `;
  });

  table += "</table>";

  statsDiv.innerHTML = table;
});
