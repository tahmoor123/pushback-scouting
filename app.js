let pitData = JSON.parse(localStorage.getItem("pitData")) || {};
let matchData = JSON.parse(localStorage.getItem("matchData")) || [];

function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

function loadTeams(){
let pitSelect=document.getElementById("pitTeam");
let matchSelect=document.getElementById("matchTeam");
teams.forEach(team=>{
pitSelect.innerHTML+=`<option>${team}</option>`;
matchSelect.innerHTML+=`<option>${team}</option>`;
});
}

function savePit(){
let team=document.getElementById("pitTeam").value;
pitData[team]={
drive:driveType.value,
auto:autoStrategy.value,
cycle:cycleSpeed.value,
strengths:strengths.value,
weaknesses:weaknesses.value
};
localStorage.setItem("pitData",JSON.stringify(pitData));
alert("Pit Data Saved");
}

function saveMatch(){
let entry={
team:matchTeam.value,
match:matchNumber.value,
auto:autoPoints.value,
driver:driverPoints.value,
endgame:endgamePoints.value,
off:offRating.value,
def:defRating.value
};
matchData.push(entry);
localStorage.setItem("matchData",JSON.stringify(matchData));
alert("Match Saved");
}

function generateAnalytics(){
let statsDiv=document.getElementById("stats");
statsDiv.innerHTML="";
teams.forEach(team=>{
let matches=matchData.filter(m=>m.team===team);
if(matches.length>0){
let avg=matches.reduce((sum,m)=>sum+
(Number(m.auto)+Number(m.driver)+Number(m.endgame)),0)/matches.length;
statsDiv.innerHTML+=`<p>${team} Avg Score: ${avg.toFixed(1)}</p>`;
}
});
}

function exportCSV(){
let csv="Team,Match,Auto,Driver,Endgame,Off,Def\n";
matchData.forEach(m=>{
csv+=`${m.team},${m.match},${m.auto},${m.driver},${m.endgame},${m.off},${m.def}\n`;
});
let blob=new Blob([csv]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="scouting_data.csv";
a.click();
}

loadTeams();
showPage("pit");
