
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
  scout: getScoutName(),
  timestamp:Date.now()
};

  database.ref("pit/"+team).set(data);
  alert("Pit Data Synced");
}
// Clear pit fields (optional but recommended)
driveType.value = "";
autoStrategy.value = "";
cycleSpeed.value = "";
strengths.value = "";
weaknesses.value = "";
pitComments.value = "";

// Focus team field
pitTeam.focus();


// Save Match Data
function saveMatch(){

  let team = matchTeam.value;
  let matchNum = matchNumber.value;

  if(!team || !matchNum){
    alert("Please enter Team and Match Number");
    return;
  }

  database.ref("matches")
    .orderByChild("team")
    .equalTo(team)
    .once("value", snapshot=>{

      let exists = false;

      snapshot.forEach(child=>{
        let data = child.val();
        if(data.match == matchNum){
          exists = true;
        }
      });

      if(exists){
        alert("⚠️ This team already has data for this match!");
        return;
      }

      // 🔥 NEW SCORING CALCULATION
      let totalScore =
        Number(matchAuton.value) +
        Number(descoring.value) +
        Number(intake.value) +
        Number(tongue.value) +
        Number(scoring.value) +
        Number(design.value) +
        Number(driving.value);

      let entry = {
        team: team,
        match: matchNum,

        auton: Number(matchAuton.value),
        descoring: Number(descoring.value),
        intake: Number(intake.value),
        tongue: Number(tongue.value),
        scoring: Number(scoring.value),
        design: Number(design.value),
        driving: Number(driving.value),

        total: totalScore,
        comments: matchComments.value,
        scout: getScoutName(),
        timestamp: Date.now()
      };

      database.ref("matches").push(entry);

      alert("Match Synced");

      // Auto-clear
      matchNumber.value = "";
      matchComments.value = "";

      matchNumber.focus();
    });
}



// Live Dashboard
// Live Dashboard + Pick Score
database.ref("matches").on("value", snapshot=>{
  let data = snapshot.val();
  console.log("Snapshot data:", data);
  if(data){
    Object.values(data).forEach(m=>{
      console.log("Match entry:", m);
    });
  }
  let statsDiv = document.getElementById("match");

  if(!statsDiv) return;

  if(!data){
    statsDiv.innerHTML = "<p>No data yet</p>";
    return;
  }

  let teamStats = {};

  Object.values(data).forEach(m=>{
    if(!teamStats[m.team]){
      teamStats[m.team] = {
        scores: []
      };
    }

    teamStats[m.team].scores.push(m.total || 0);
  });
  console.log("TeamStats:", teamStats);
  let rankings = [];
  Object.keys(teamStats).forEach(team=>{
  let scores = teamStats[team].scores;

  let avg = scores.reduce((a,b)=>a+b,0) / scores.length;

  let variance = scores.reduce((sum,score)=>{
    return sum + Math.pow(score - avg,2);
  },0) / scores.length;

  let stdDev = Math.sqrt(variance);

  let pickScore = (avg * 0.8) - (stdDev * 0.2);

  rankings.push({
    team: team,
    avg: avg,
    stdDev: stdDev,
    pickScore: pickScore
  });

});  // ← closes Object.keys forEach


// 🔥 SORT MUST BE OUTSIDE THE LOOP
rankings.sort((a,b)=>b.pickScore - a.pickScore);
 console.log("Rankings built:", rankings);
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
            `<li><b>Match ${m.match}</b> (${m.scout || "Unknown"}): ${m.comments}</li>`
            );
          }
        });
      }

      resultDiv.innerHTML = `
        <h3>Team ${team.team}</h3>
        <p><b>Avg Score:</b> ${team.avg.toFixed(1)}</p>
        <p><b>Consistency:</b> ${team.stdDev.toFixed(1)}</p>
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

document.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    if(document.getElementById("match").style.display === "block"){
      saveMatch();
    }
  }
});
function saveScoutName(){
  let name = document.getElementById("scoutName").value;

  if(!name){
    alert("Please enter your name");
    return;
  }

  localStorage.setItem("scoutName", name);
  alert("Name Saved!");
}

function getScoutName(){
  return localStorage.getItem("scoutName") || "Unknown";
}


// Initialize
loadTeams();
showPage("pit");




















