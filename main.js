/* ---
   ASSDI Advanced Scoreboard - main.js
   Version: 7.0 (Adapted from example project)
--- */

const API_URL = "https://script.google.com/macros/s/AKfycbxh2zabw1i80ieipn8JMPSwLswB1tbt2yy7TuqUUljBmfrTMcXc-v6MGpZzaY7wqKFyMg/exec"; 
const REFRESH_INTERVAL = 60000;
const TOP_PLAYERS_COUNT = 10;
const CHART_COLOR_ARRAY = ['#88C03D', '#2D8B5E', '#E6912E', '#bbf7d0', '#fde047', '#f9a8d4', '#a5b4fc', '#7dd3fc'];

let state = { currentView: 'team', isFetching: false };
let chartInstance = null;

const mainContainer = document.getElementById('main-container');
const announcementsList = document.getElementById('announcements-list');
const leaderboardHead = document.getElementById('leaderboard-head');
const leaderboardBody = document.getElementById('leaderboard-body');
const chartCanvas = document.getElementById('leaderboard-chart');
const teamViewBtn = document.getElementById('btn-team-view');
const playerViewBtn = document.getElementById('btn-player-view');

const fetchData = async () => {
    if (state.isFetching) return;
    state.isFetching = true;
    mainContainer.classList.add('is-updating');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API Error! Status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(`API returned an error: ${data.message}`);
        
        renderAll(data);

    } catch (error) {
        console.error("Failed to fetch or render data:", error);
        leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger p-4">ডেটা লোড করা সম্ভব হয়নি।</td></tr>`;
    } finally {
        state.isFetching = false;
        mainContainer.classList.remove('is-updating');
    }
};

function renderAll(data) {
    renderAnnouncements(data.announcements);
    renderLeaderboard(data);
    renderChart(data);
}

function renderAnnouncements(announcements) {
    if (!announcements || announcements.length === 0) {
        announcementsList.innerHTML = '<p class="text-muted p-3">কোনো নতুন ঘোষণা নেই...</p>';
        return;
    }
    announcementsList.innerHTML = announcements.slice(0, 10).map(item => {
        const time = new Date(item.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        return `<div class="announcement-item"><p class="mb-1">${item.text}</p><small class="announcement-time">${time}</small></div>`;
    }).join('');
}

function renderLeaderboard(data) {
    leaderboardBody.innerHTML = '';
    if (state.currentView === 'team') {
        leaderboardHead.innerHTML = `<tr><th scope="col" class="text-center">#</th><th scope="col">দলের নাম</th><th scope="col" class="text-end">মোট পয়েন্ট</th></tr>`;
        const teams = data.team_leaderboard.sort((a,b) => b.points - a.points);
        if (teams.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-muted">এখনো কোনো ফলাফল জমা দেওয়া হয়নি।</td></tr>`;
            return;
        }
        leaderboardBody.innerHTML = teams.map((team, index) => `<tr><th scope="row" class="text-center">${index + 1}</th><td>${team.name}</td><td class="text-end fw-bold">${team.points}</td></tr>`).join('');
    } else {
        leaderboardHead.innerHTML = `<tr><th scope="col" class="text-center">#</th><th scope="col">প্লেয়ারের নাম</th><th scope="col">দল</th><th scope="col" class="text-end">পয়েন্ট</th></tr>`;
        const players = data.player_leaderboard.sort((a,b) => b.points - a.points);
        if (players.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-muted">এখনো কোনো ফলাফল জমা দেওয়া হয়নি।</td></tr>`;
            return;
        }
        leaderboardBody.innerHTML = players.map((player, index) => `<tr><th scope="row" class="text-center">${index + 1}</th><td>${player.name}</td><td>${player.team}</td><td class="text-end fw-bold">${player.points}</td></tr>`).join('');
    }
}

function renderChart(data) {
    if (chartInstance) chartInstance.destroy();
    
    const chartConfig = state.currentView === 'team'
        ? getChartConfig(data.team_leaderboard.sort((a,b)=>b.points-a.points), 'Team Points', 'line')
        : getChartConfig(data.player_leaderboard.sort((a,b)=>b.points-a.points).slice(0, TOP_PLAYERS_COUNT).reverse(), 'Player Points', 'bar');
    
    chartInstance = new Chart(chartCanvas.getContext('2d'), chartConfig);
}

function getChartConfig(dataset, label, type) {
    const labels = dataset.map(d => d.name);
    const points = dataset.map(d => d.points);
    const isBar = type === 'bar';

    return {
        type,
        data: {
            labels,
            datasets: [{
                label, data: points,
                backgroundColor: isBar ? CHART_COLOR_ARRAY.map(c => `${c}E6`) : 'rgba(136, 192, 61, 0.1)',
                borderColor: isBar ? CHART_COLOR_ARRAY : 'rgba(136, 192, 61, 1)',
                borderWidth: isBar ? 1 : 2,
                pointBackgroundColor: '#FFFFFF', tension: 0.4, fill: !isBar
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: isBar ? 'y' : 'x',
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#FFFFFF' } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#FFFFFF' } }
            }
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('leaderboard-chart')) {
        teamViewBtn.addEventListener('click', () => {
            if (state.currentView === 'team') return;
            state.currentView = 'team';
            playerViewBtn.classList.remove('active');
            teamViewBtn.classList.add('active');
            fetchData();
        });

        playerViewBtn.addEventListener('click', () => {
            if (state.currentView === 'player') return;
            state.currentView = 'player';
            teamViewBtn.classList.remove('active');
            playerViewBtn.classList.add('active');
            fetchData();
        });

        fetchData();
        setInterval(fetchData, REFRESH_INTERVAL);
    }
});