/* ---
   ASSDI Advanced Scoreboard - scoreboard.js
   Version: 12.1 (Final & Complete Codebase with all fixes)
--- */

// --- Configuration & Constants ---
const SCORE_API_URL = "https://script.google.com/macros/s/AKfycbxh2zabw1i80ieipn8JMPSwLswB1tbt2yy7TuqUUljBmfrTMcXc-v6MGpZzaY7wqKFyMg/exec?sheet=scores";
const REFRESH_INTERVAL = 60000; // Auto-refresh every 60 seconds
const TOP_PLAYERS_COUNT = 8; // Number of top players to show in the bar chart
const CHART_COLOR_ARRAY = ['#88C03D', '#2D8B5E', '#E6912E', '#bbf7d0', '#fde047', '#f9a8d4', '#a5b4fc', '#7dd3fc'];

// --- State Management & DOM References ---
let state = { currentView: 'team', isFetching: false };
let chartInstance = null;
const mainContainer = document.getElementById('main-container');
const announcementsList = document.getElementById('announcements-list');
const leaderboardHead = document.getElementById('leaderboard-head');
const leaderboardBody = document.getElementById('leaderboard-body');
const chartCanvas = document.getElementById('leaderboard-chart');
const teamViewBtn = document.getElementById('btn-team-view');
const playerViewBtn = document.getElementById('btn-player-view');


/**
 * Fetches data from the API and orchestrates the rendering process.
 */
const fetchData = async () => {
    if (state.isFetching) return;
    state.isFetching = true;
    mainContainer.classList.add('is-updating');

    try {
        const response = await fetch(SCORE_API_URL);
        if (!response.ok) throw new Error(`API Error! Status: ${response.status}`);
        const data = await response.json();

        if (data.error) throw new Error(`API returned an error: ${data.message}`);
        
        // Handle the case where scores are set to not be published
        if (data.status === 'unpublished') {
            handleUnpublishedState();
            return;
        }
        
        renderAll(data);

    } catch (error) {
        console.error("Failed to fetch or render data:", error);
        handleFetchError();
    } finally {
        state.isFetching = false;
        mainContainer.classList.remove('is-updating');
    }
};

/**
 * Renders all components of the scoreboard.
 * @param {object} data - The complete data object from the API.
 */
function renderAll(data) {
    renderAnnouncements(data.announcements);
    renderLeaderboard(data);
    renderChart(data);
}

/**
 * Handles the UI state when scores are not published.
 */
function handleUnpublishedState() {
    announcementsList.innerHTML = '<div class="offline-message p-3">স্কোরবোর্ড বর্তমানে অফলাইন আছে।</div>';
    leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 offline-message">ফলাফল শীঘ্রই প্রকাশ করা হবে।</td></tr>`;
    leaderboardHead.innerHTML = ''; // Clear table headers as well
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    // Clear the canvas area
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Handles the UI state when there is a fetch error.
 */
function handleFetchError() {
    const errorHtml = `<tr><td colspan="4" class="text-center text-danger p-4">ডেটা লোড করা সম্ভব হয়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</td></tr>`;
    leaderboardHead.innerHTML = '';
    leaderboardBody.innerHTML = errorHtml;
    announcementsList.innerHTML = `<div class="offline-message p-3 text-danger">সার্ভারের সাথে সংযোগ বিচ্ছিন্ন।</div>`;
}


/**
 * Renders the announcements list.
 */
function renderAnnouncements(announcements) {
    if (!announcements || announcements.length === 0) {
        announcementsList.innerHTML = '<p class="text-muted p-3">কোনো নতুন ঘোষণা নেই...</p>';
        return;
    }
    announcementsList.innerHTML = announcements.slice(0, 10).map(item => {
        const time = new Date(item.timestamp).toLocaleString('bn-BD', { hour: 'numeric', minute: 'numeric', hour12: true });
        return `<div class="announcement-item"><p class="mb-1">${item.text}</p><small class="announcement-time">${time}</small></div>`;
    }).join('');
}

/**
 * Renders the team or player leaderboard table with rank medals.
 */
function renderLeaderboard(data) {
    leaderboardBody.innerHTML = '';
    
    const getMedal = (rank) => {
        if (rank === 1) return '<span class="rank-medal">🥇</span>';
        if (rank === 2) return '<span class="rank-medal">🥈</span>';
        if (rank === 3) return '<span class="rank-medal">🥉</span>';
        return '';
    };

    if (state.currentView === 'team') {
        leaderboardHead.innerHTML = `<tr><th scope="col" class="text-center">Rank</th><th scope="col">দলের নাম</th><th scope="col" class="text-end">মোট পয়েন্ট</th></tr>`;
        const teams = data.team_leaderboard.sort((a,b) => b.points - a.points);
        if (teams.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-muted">এখনো কোনো দলীয় ফলাফল জমা দেওয়া হয়নি।</td></tr>`;
            return;
        }
        leaderboardBody.innerHTML = teams.map((team, index) => `
            <tr>
                <th scope="row" class="text-center">${getMedal(index + 1)} ${index + 1}</th>
                <td>${team.name}</td>
                <td class="text-end fw-bold">${team.points}</td>
            </tr>
        `).join('');
    } else { // Player View
        leaderboardHead.innerHTML = `<tr><th scope="col" class="text-center">Rank</th><th scope="col">প্লেয়ারের নাম</th><th scope="col">দল</th><th scope="col" class="text-end">পয়েন্ট</th></tr>`;
        const players = data.player_leaderboard.sort((a,b) => b.points - a.points);
        if (players.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-muted">এখনো কোনো একক ফলাফল জমা দেওয়া হয়নি।</td></tr>`;
            return;
        }
        leaderboardBody.innerHTML = players.map((player, index) => `
            <tr>
                <th scope="row" class="text-center">${getMedal(index + 1)} ${index + 1}</th>
                <td>${player.name}</td>
                <td>${player.team}</td>
                <td class="text-end fw-bold">${player.points}</td>
            </tr>
        `).join('');
    }
}

/**
 * Renders the chart based on the current view (team or player).
 */
function renderChart(data) {
    if (chartInstance) chartInstance.destroy();
    
    const chartConfig = state.currentView === 'team'
        ? getChartConfig(data.team_leaderboard.sort((a,b)=>b.points-a.points), 'দলীয় পয়েন্ট', 'line')
        : getChartConfig(data.player_leaderboard.sort((a,b)=>b.points-a.points).slice(0, TOP_PLAYERS_COUNT).reverse(), 'প্লেয়ার পয়েন্ট', 'bar');
    
    chartInstance = new Chart(chartCanvas.getContext('2d'), chartConfig);
}

/**
 * A helper function to generate chart configuration.
 */
function getChartConfig(dataset, label, type) {
    const labels = dataset.map(d => d.name);
    const points = dataset.map(d => d.points);
    const isBar = type === 'bar';
    const axisColor = 'rgba(255, 255, 255, 0.8)';

    return {
        type,
        data: {
            labels,
            datasets: [{
                label, data: points,
                backgroundColor: isBar ? CHART_COLOR_ARRAY.map(c => `${c}E6`) : 'rgba(136, 192, 61, 0.2)',
                borderColor: isBar ? CHART_COLOR_ARRAY : '#88C03D',
                borderWidth: isBar ? 1 : 2,
                pointBackgroundColor: axisColor, pointRadius: 4, pointHoverRadius: 6,
                tension: 0.4, fill: !isBar
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: isBar ? 'y' : 'x',
            plugins: { 
                legend: { display: false },
                tooltip: {
                    enabled: true, backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF', bodyColor: '#FFFFFF',
                    titleFont: { family: "'Poppins', sans-serif", weight: 'bold', size: 14 },
                    bodyFont: { family: "'Poppins', sans-serif", size: 12 },
                    padding: 12, cornerRadius: 8, displayColors: false,
                }
            },
            scales: {
                x: { 
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                    ticks: { color: axisColor, font: { family: "'Poppins', sans-serif" } } 
                },
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                    ticks: { color: axisColor, font: { family: "'Poppins', sans-serif" } } 
                }
            }
        }
    };
}

// --- Event Listeners & Initialization ---
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

        // Initial fetch when the page loads
        fetchData();
        // Set up auto-refresh
        setInterval(fetchData, REFRESH_INTERVAL);
    }
});