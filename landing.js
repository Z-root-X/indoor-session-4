// indoor_event_live_score-main/landing.js
// Version 5.0 - Final Brand Integration & Full Functionality

// 🎯 গুরুত্বপূর্ণ কনফিগারেশন: এখানে আপনার নতুন Google Apps Script URL টি পেস্ট করতে হবে।
const API_URL = "https://script.google.com/macros/s/AKfycbxh2zabw1i80ieipn8JMPSwLswB1tbt2yy7TuqUUljBmfrTMcXc-v6MGpZzaY7wqKFyMg/exec"; // এই URL টি পরবর্তী ধাপে পাওয়া যাবে।
const GOOGLE_FORM_URL = "https://forms.gle/ouLjnUXDNcteXdRg6"; 
const SUBMISSION_DEADLINE = "০৬ অক্টোবর, রাত ৭ টা"; 

// --- শিটের কলামের নামের সাথে মিল রাখা হয়েছে ---
const SHEET_HEADERS = {
    ROLL: 'Roll',
    NAME: 'Name',
    EVENT_NAME: 'EventName',
    BATCH_NAME: 'BatchName'
};

// --- শিটের বাংলা ইভেন্টের নামকে ইংরেজি ফিল্টার ক্লাসের সাথে ম্যাপ করা হয়েছে ---
const EVENT_NAME_TO_FILTER = {
    'কুরআন তিলাওয়াত': 'kherat',
    'ক্বেরাত (কুরআন তিলাওয়াত)': 'kherat',
    'আযান': 'azaan',
    'নাশিদ': 'nasheed',
    'ইসলামি সংগীত': 'nasheed',
    'রোল প্লে / নাটিকা': 'roleplay',
    'রোল প্লে': 'roleplay',
    'একাডেমিক কুইজ': 'quiz',
    'কমিউনিকেশন গেম': 'communication',
};

// --- সম্পূর্ণ নিয়মাবলী (আপনার PDF থেকে নেওয়া) ---
const EVENT_RULES = {
    "all": { 
        name: "পূর্ণাঙ্গ নিয়মাবলী ও স্কোরিং", 
        rules: "সকল ইভেন্ট শেষে যে ব্যাচের সর্বমোট পয়েন্ট সবচেয়ে বেশি হবে, সেই ব্যাচকে \"চ্যাম্পিয়ন\" হিসেবে ঘোষণা করা হবে। প্রত্যেক অংশগ্রহণকারী নিজের ব্যাচের জন্য ২ পয়েন্ট করে পাবেন।", 
        players: "একজন প্রতিযোগী সর্বোচ্চ ৩টি ইভেন্টে অংশগ্রহণ করতে পারবে।", 
        submissionOpen: true 
    },
    "kherat": { 
        name: "ক্বেরাত (কুরআন তিলাওয়াত)", 
        rules: "এটি একটি একক পরিবেশনা। প্রত্যেক ব্যাচ থেকে কমপক্ষে ১ জন আলেম এবং ১ জন জেনারেল ব্যাকগ্রাউন্ডের প্রতিযোগী অংশ নেবেন। প্রত্যেকে তিলাওয়াতের জন্য সর্বোচ্চ ৩ মিনিট সময় পাবেন।", 
        players: "প্রতি ব্যাচ থেকে ২ জন (১জন জেনারেল থাকা বাধ্যতামূলক)।", 
        submissionOpen: true 
    },
    "azaan": { 
        name: "আযান", 
        rules: "এটি একটি একক পরিবেশনা। প্রত্যেক ব্যাচ থেকে ২ জন প্রতিযোগী অংশ নেবেন। প্রত্যেক প্রতিযোগী একটি পূর্ণাঙ্গ আযান দেবেন।", 
        players: "প্রতি ব্যাচ থেকে ২ জন।", 
        submissionOpen: true 
    },
    "nasheed": { 
        name: "ইসলামিক নাশিদ", 
        rules: "এটি একটি একক পরিবেশনা। প্রতি ব্যাচ থেকে ২ জন প্রতিযোগী অংশ নেবেন। সর্বোচ্চ সময় ৩ মিনিট।", 
        players: "প্রতি ব্যাচ থেকে ২ জন।", 
        submissionOpen: true 
    },
    "roleplay": { 
        name: "রোল প্লে (তাৎক্ষণিক অভিনয়)", 
        rules: "বিষয়বস্তু তাৎক্ষণিকভাবে দেওয়া হবে (যেমন: ট্রেনের হকার, ক্লাসের শিক্ষক ইত্যাদি)। সর্বোচ্চ সময় ৩ মিনিট।", 
        players: "প্রতি ব্যাচ থেকে ২ জন।", 
        submissionOpen: true 
    },
    "quiz": { 
        name: "একাডেমিক কুইজ", 
        rules: "বিষয়বস্তু: এমএস এক্সেল, এমএস ওয়ার্ড, ডিজিটাল মার্কেটিং, এআই টুলস, ইংরেজি এবং অন্যান্য বেসিক বিষয়ে Kahoot প্ল্যাটফর্মে পরীক্ষা হবে।", 
        players: "প্রতি ব্যাচ থেকে ৫ জন।", 
        submissionOpen: true 
    },
    "communication": { 
        name: "কমিউনিকেশন গেম (অঙ্গভঙ্গি)", 
        rules: "প্রতিটি দলে ১১ জন খেলোয়াড় থাকবেন। প্রথম খেলোয়াড়কে একটি অঙ্গভঙ্গি দেখানো হবে, যা তিনি কোনো শব্দ ছাড়া পরবর্তী খেলোয়াড়কে বোঝাবেন। এই প্রক্রিয়াটি দলের শেষ খেলোয়াড় পর্যন্ত চলবে।", 
        players: "প্রতি ব্যাচ থেকে ১১ জন।", 
        submissionOpen: true 
    },
};

let allParticipantsData = []; 

// Google Sheet থেকে পাওয়া ডেটা প্রসেস করার ফাংশন
function processFetchedData(rawData) {
    const participants = [];
    rawData.forEach(row => {
        const name = row[SHEET_HEADERS.NAME] || 'N/A';
        const roll = row[SHEET_HEADERS.ROLL] || 'N/A';
        const batch = row[SHEET_HEADERS.BATCH_NAME] || 'N/A';
        const rawEvent = row[SHEET_HEADERS.EVENT_NAME] || 'Unknown';
        const filterClass = EVENT_NAME_TO_FILTER[rawEvent.trim()] || 'unknown'; 
        
        if (name && name.trim() !== '' && filterClass !== 'unknown') {
             participants.push({ name, roll, batch, eventTag: rawEvent, filterClass });
        }
    });
    return Array.from(new Map(participants.map(p => [`${p.name}-${p.batch}-${p.eventTag}`, p])).values());
}

// অংশগ্রহণকারীদের তালিকা লোড এবং প্রদর্শনের মূল ফাংশন
async function fetchAndDisplayParticipants() {
    const grid = document.querySelector('.showcase-grid');
    if (!grid) return;

    try {
        if (API_URL === "YOUR_NEW_GOOGLE_APPS_SCRIPT_URL_HERE" || !API_URL) {
            throw new Error("API URL is not configured. Please deploy the Apps Script and update the URL in landing.js.");
        }
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const rawData = await response.json();
        if (rawData.error) throw new Error(rawData.error);

        allParticipantsData = processFetchedData(rawData); 
        
        grid.innerHTML = ''; // লোডিং স্পিনার অপসারণ
        if(allParticipantsData.length === 0){
             grid.innerHTML = `<p class="text-center text-muted w-100">এখনো কোনো অংশগ্রহণকারীকে যুক্ত করা হয়নি।</p>`;
        } else {
            buildParticipantCards();
        }
        filterSelection("all"); // ডিফল্টভাবে সব ইভেন্ট দেখানো

    } catch (error) {
        console.error("Could not fetch participant data:", error);
        grid.innerHTML = `<div class="alert alert-danger w-100 mx-auto mt-4" style="background: #581515; border-color: #ff4d4d; color: #ffacac;" role="alert">
            <strong>ত্রুটি:</strong> অংশগ্রহণকারীদের তালিকা লোড করা যায়নি। (${error.message})
        </div>`;
    }
}

// অংশগ্রহণকারীদের কার্ড তৈরি করার ফাংশন
function buildParticipantCards() {
    const grid = document.querySelector('.showcase-grid');
    grid.innerHTML = allParticipantsData.map(p => `
        <div class="participant-showcase-card filterDiv ${p.filterClass}">
            <span class="event-tag">${p.eventTag}</span>
            <span class="name">${p.name}</span>
            <span class="batch">${p.batch}</span>
            <span class="roll">রোল: ${p.roll}</span>
        </div>
    `).join('');
}

// ফিল্টার বাটন ক্লিক করলে কার্ড ও নিয়মাবলী পরিবর্তন করার ফাংশন
function filterSelection(c) {
    const eventNameElement = document.getElementById('current-event-name');
    const rulesContentElement = document.getElementById('event-rules-content');
    const eventData = EVENT_RULES[c] || EVENT_RULES['all'];
    
    let rulesHtml = `
        <h5 class="mt-4 fw-bold" style="color: var(--text-bright);">বিস্তারিত নিয়মাবলী:</h5>
        <ul class="list-unstyled">
            <li><i class="bi bi-info-circle-fill me-2" style="color: var(--brand-light-green);"></i> ${eventData.rules}</li>
            <li><i class="bi bi-person-circle me-2" style="color: var(--brand-light-green);"></i> অংশগ্রহণের কোটা: ${eventData.players}</li>
            <li><i class="bi bi-award-fill me-2" style="color: var(--brand-orange);"></i> পয়েন্ট সিস্টেম: ১ম: ১০, ২য়: ৭, ৩য়: ৫ পয়েন্ট।</li>
        </ul>
    `;
    
    if (eventData.submissionOpen) {
        rulesHtml += `
            <hr class="my-4" style="border-color: #333;">
            <p class="fw-bold mb-2" style="color: var(--brand-orange);">নাম জমা দেওয়ার শেষ সময়: ${SUBMISSION_DEADLINE}</p>
            <a href="${GOOGLE_FORM_URL}" target="_blank" class="btn btn-primary hero-btn-main">
                <i class="bi bi-box-arrow-in-right"></i> প্লেয়ারের নাম জমা দিন
            </a>
        `;
    }

    eventNameElement.textContent = eventData.name;
    rulesContentElement.innerHTML = rulesHtml;

    document.querySelectorAll('.filterDiv').forEach(card => {
        card.classList.remove('visible');
        if (c === 'all' || card.classList.contains(c)) {
            card.classList.add('visible');
        }
    });
}

// পেজ লোড হলে এই ফাংশনগুলো রান হবে
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayParticipants(); 
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            filterSelection(filterValue); 
        });
    });
});