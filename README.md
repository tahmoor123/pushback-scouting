Parsec Pushback Scouting System
Parsec is a VEX team located in Mississauga, Ontario

A live, Firebase-powered scouting system built for robotics competitions (VEX / WRO / FLL style events).

This system allows multiple scouts to collect, sync, and analyze match + pit data in real time.

Features

Live Dashboard

  Weighted Alliance Pick Score
  Consistency scoring (standard deviation penalty)
  Auto-sorted rankings
  Top 8 teams highlighted
  Click the team name to view a detailed breakdown

Pit Scouting
  Drive type
  Auto strategy
  Cycle speed
  Strengths & weaknesses
  Additional comments
  Scout name tracking

Match Scouting

  Auto points
  Driver points
  Endgame points
  Offensive & defensive ratings
  Match comments
  Duplicate match prevention
  Auto-clear after submission
  Keyboard-friendly data entry

Team Search
  Average score
  Pick score
  Consistency score
  Pit notes
  Full match comment history
  Scout attribution for accountability

Scout Tracking

  Scouts enter name once
  Stored locally per device
  Automatically attached to all entries

Live Sync

  Powered by Firebase Realtime Database
  Multi-device support
  Instant dashboard updates

Pick Score Formula
  Pick Score =
  (Avg Score × 0.5)
  + (Off Rating × 0.15)
  + (Def Rating × 0.15)
  - (Consistency Std Dev × 0.2)

This rewards:
  
  High scoring teams
  Strong offense
  Strong defense
  Consistent performance

  
Tech Stack

  HTML
  CSS
  Vanilla JavaScript
  Firebase Realtime Database
  LocalStorage (Scout Name Tracking)

Setup Instructions

  Clone the repo:
  git clone https://github.com/YOUR_USERNAME/pushback-scouting.git
  Add your Firebase config inside firebase.js.

Deploy using:

  GitHub Pages
  OR
  Firebase Hosting

Hard refresh the browser after updates.

Competition Workflow:

  Scouts enter their name once.
  Pit scouting cis ompleted before matches.
  Match scouts enter data live.
  Dashboard auto-updates rankings.
  Strategy team uses search tool during alliance selection.

Recommended Usage

  Use tablets or laptops
  Assign 1 scout per field robot
  Train scouts on rating consistency
  Use dashboard for elimination planning



Built For
Designed to give competitive teams a strategic edge during qualification and elimination rounds.
