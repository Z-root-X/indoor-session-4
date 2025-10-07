/* ---
   ASSDI Indoor Olympiad - landing.js
   Version: 11.0 (Final Complete Code with Winner Badges)
--- */

// --- Configuration ---
const API_URL = "https://script.google.com/macros/s/AKfycbxh2zabw1i80ieipn8JMPSwLswB1tbt2yy7TuqUUljBmfrTMcXc-v6MGpZzaY7wqKFyMg/exec";
const PARTICIPANT_API_URL = API_URL;
const SCORE_API_URL = `${API_URL}?sheet=scores`;

// --- Event Schedule Data (in 24-hour format) for Dynamic Timeline ---
const EVENT_SCHEDULE = [
    { start: "09:00", end: "09:30", title: "রিপোর্টিং ও আসন গ্রহণ", category: "স্থান: আবাসিক", type: "event" },
    { start: "09:30", end: "09:45", title: "উদ্বোধনী অনুষ্ঠান", category: "পবিত্র কুরআন তিলাওয়াত ও স্বাগত বক্তব্য", type: "event" },
    { start: "09:45", end: "12:45", title: "ইসলামী সংস্কৃতি প্রতিযোগিতা", category: "ক্বেরাত, আযান, ইসলামিক নাশিদ", type: "event" },
    { start: "12:45", end: "13:15", title: "বিরতি ও যোহরের নামাজ", category: "জামাত দুপুর ১:০০ টায়", type: "break" },
    { start: "13:15", end: "14:15", title: "কমিউনিকেশন গেম", category: "স্থান: আবাসিক", type: "event" },
    { start: "14:15", end: "15:00", title: "একাডেমিক কুইজ", category: "স্থান: ল্যাব ২", type: "event" },
    { start: "15:00", end: "15:45", title: "মধ্যাহ্নভোজ", category: "বিরতি", type: "break" },
    { start: "15:45", end: "16:15", title: "রোল প্লে", category: "স্থান: আবাসিক", type: "event" },
    { start: "16:40", end: "17:50", title: "পুরস্কার বিতরণী অনুষ্ঠান", category: "সমাপনী অনুষ্ঠান", type: "event" }
];

// --- Mapping & Rules Data ---
const EVENT_NAME_TO_FILTER = {
    'কুরআন তিলাওয়াত': 'kherat', 'ক্বেরাত (কুরআন তিলাওয়াত)': 'kherat', 'আযান': 'azaan',
    'নাশিদ': 'nasheed', 'ইসলামিক নাশিদ': 'nasheed', 'ইসলামি সংগীত': 'nasheed',
    'রোল প্লে / নাটিকা': 'roleplay', 'রোল প্লে': 'roleplay', 'একাডেমিক কুইজ': 'quiz',
    'কমিউনিকেশন গেম': 'communication',
};
const EVENT_RULES = {
    "all": { name: "পূর্ণাঙ্গ নিয়মাবলী", rules: "সকল ইভেন্ট শেষে যে ব্যাচের সর্বমোট পয়েন্ট সবচেয়ে বেশি হবে, সেই ব্যাচকে \"চ্যাম্পিয়ন\" হিসেবে ঘোষণা করা হবে।", players: "একজন প্রতিযোগী সর্বোচ্চ ৩টি ইভেন্টে অংশ নিতে পারবে।" },
    "kherat": { name: "ক্বেরাত (কুরআন তিলাওয়াত)", rules: "এটি একটি একক পরিবেশনা। প্রত্যেক ব্যাচ থেকে কমপক্ষে ১ জন আলেম এবং ১ জন জেনারেল ব্যাকগ্রাউন্ডের প্রতিযোগী অংশ নেবেন। সর্বোচ্চ ৩ মিনিট সময় পাবেন।", players: "প্রতি ব্যাচ থেকে ২ জন।" },
    "azaan": { name: "আযান", rules: "এটি একটি একক পরিবেশনা। প্রত্যেক ব্যাচ থেকে ২ জন প্রতিযোগী অংশ নেবেন।", players: "প্রতি ব্যাচ থেকে ২ জন।" },
    "nasheed": { name: "ইসলামিক নাশিদ", rules: "এটি একটি একক পরিবেশনা। প্রতি ব্যাচ থেকে ২ জন প্রতিযোগী অংশ নেবেন। সর্বোচ্চ সময় ৩ মিনিট।", players: "প্রতি ব্যাচ থেকে ২ জন।" },
    "roleplay": { name: "রোল প্লে", rules: "বিষয়বস্তু তাৎক্ষণিকভাবে দেওয়া হবে। সর্বোচ্চ সময় ৩ মিনিট।", players: "প্রতি ব্যাচ থেকে ২ জন।" },
    "quiz": { name: "একাডেমিক কুইজ", rules: "Kahoot প্ল্যাটফর্মে এমএস এক্সেল, ওয়ার্ড, ডিজিটাল মার্কেটিং ইত্যাদি বিষয়ে পরীক্ষা হবে।", players: "প্রতি ব্যাচ থেকে ৫ জন।" },
    "communication": { name: "কমিউনিকেশন গেম", rules: "প্রতিটি দলে ১১ জন খেলোয়াড় থাকবেন এবং অঙ্গভঙ্গির মাধ্যমে বার্তা চালাচালি করবেন।", players: "প্রতি ব্যাচ থেকে ১১ জন।" },
};

// --- Main Execution on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    buildTimeline();
    fetchDataAndRender();
    setupFilterButtons();
    filterSelection("all");
});

/**
 * Builds the timeline dynamically and highlights the current event.
 */
function buildTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer) return;
    const now = new Date();
    let activeEventFound = false;

    const timelineHTML = EVENT_SCHEDULE.map((event, index) => {
        const position = index % 2 === 0 ? 'right' : 'left';
        const eventClass = event.type === 'break' ? 'break' : '';
        const startTime = new Date(now.toDateString() + ' ' + event.start);
        const endTime = new Date(now.toDateString() + ' ' + event.end);
        let isActive = '';
        if (!activeEventFound && now >= startTime && now < endTime) {
            isActive = 'active-event';
            activeEventFound = true;
        }
        return `
            <div class="timeline-item ${position} ${eventClass} ${isActive}">
                <div class="timeline-content">
                    <div class="event-time">${event.start} - ${event.end}</div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-category">${event.category}</p>
                </div>
            </div>
        `;
    }).join('');
    timelineContainer.innerHTML = timelineHTML;
}

/**
 * Fetches both participant and score data, then renders the showcase.
 */
async function fetchDataAndRender() {
    const grid = document.getElementById('showcase-grid');
    try {
        const [participantRes, scoreRes] = await Promise.all([
            fetch(PARTICIPANT_API_URL),
            fetch(SCORE_API_URL)
        ]);

        if (!participantRes.ok) throw new Error("Failed to fetch participant data.");
        
        const participants = await participantRes.json();
        let scores = { player_leaderboard: [] };
        if (scoreRes.ok) {
            const scoreData = await scoreRes.json();
            if (scoreData.status !== 'unpublished') {
                scores = scoreData;
            }
        } else {
            console.warn("Could not fetch score data. Winner badges will not be shown.");
        }
        
        const processedParticipants = mergeWinnerData(participants, scores.player_leaderboard);
        renderParticipantCards(processedParticipants);
        filterSelection("all");

    } catch (error) {
        console.error("Data fetching error:", error);
        grid.innerHTML = `<div class="alert alert-danger w-100">ডেটা লোড করা সম্ভব হয়নি।</div>`;
    }
}

/**
 * Merges winner information from scores into the participant list.
 */
function mergeWinnerData(participants, playerScores) {
    const winnerMap = new Map();
    if (playerScores && Array.isArray(playerScores)) {
        playerScores.forEach(player => {
            const key = `${player.event}-${player.roll}`;
            if (player.roll && player.position && player.position <= 3) {
                 winnerMap.set(key, player.position);
            }
        });
    }

    return participants.map(p => {
        const filterClass = EVENT_NAME_TO_FILTER[p.EventName.trim()] || 'unknown';
        const key = `${p.EventName}-${p.Roll}`;
        const position = winnerMap.get(key);
        let badge = '';
        if (position === 1) badge = 'gold';
        if (position === 2) badge = 'silver';
        if (position === 3) badge = 'bronze';
        
        return { ...p, filterClass, badge };
    });
}

/**
 * Renders participant cards to the grid.
 */
function renderParticipantCards(participants) {
    const grid = document.getElementById('showcase-grid');
    grid.innerHTML = '';
    if (!participants || participants.length === 0) {
        grid.innerHTML = `<p class="text-center text-muted w-100">কোনো অংশগ্রহণকারী পাওয়া যায়নি।</p>`;
        return;
    }
    const cardsHTML = participants.map(p => {
        const badgeHTML = p.badge ? `<span class="winner-badge">${p.badge === 'gold' ? '🥇' : p.badge === 'silver' ? '🥈' : '🥉'}</span>` : '';
        return `
            <div class="participant-showcase-card filterDiv ${p.filterClass}" data-roll="${p.Roll}" data-event="${p.EventName}">
                ${badgeHTML}
                <span class="event-tag">${p.EventName}</span>
                <span class="name">${p.Name}</span>
                <span class="batch">${p.BatchName}</span>
                <span class="roll">রোল: ${p.Roll}</span>
            </div>
        `;
    }).join('');
    grid.innerHTML = cardsHTML;
}

/**
 * Sets up event listeners for filter buttons.
 */
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterSelection(button.getAttribute('data-filter')); 
        });
    });
}

/**
 * Filters participant cards and updates the rules display.
 */
function filterSelection(c) {
    const eventNameElement = document.getElementById('current-event-name');
    const rulesContentElement = document.getElementById('event-rules-content');
    const eventData = EVENT_RULES[c] || EVENT_RULES['all'];
    eventNameElement.textContent = eventData.name;
    rulesContentElement.innerHTML = `
        <h5 class="mt-4 fw-bold" style="color: var(--text-bright);">বিস্তারিত নিয়মাবলী:</h5>
        <ul class="list-unstyled">
            <li><i class="bi bi-info-circle-fill me-2" style="color: var(--brand-light-green);"></i> ${eventData.rules}</li>
            <li><i class="bi bi-person-circle me-2" style="color: var(--brand-light-green);"></i> অংশগ্রহণের কোটা: ${eventData.players}</li>
            <li><i class="bi bi-award-fill me-2" style="color: var(--brand-orange);"></i> পয়েন্ট সিস্টেম: ১ম: ১০, ২য়: ৭, ৩য়: ৫ পয়েন্ট। অংশগ্রহণ: ২ পয়েন্ট।</li>
        </ul>
    `;
    document.querySelectorAll('.filterDiv').forEach(card => {
        card.classList.remove('visible');
        if (c === 'all' || card.classList.contains(c)) {
            setTimeout(() => card.classList.add('visible'), 10);
        }
    });
}