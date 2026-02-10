// --- 1. MOUSE SCULPTING & TILT ---
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    setTimeout(() => {
        cursorBlob.style.left = e.clientX + 'px';
        cursorBlob.style.top = e.clientY + 'px';
    }, 100);

    // Tilt Effect
    document.querySelectorAll('.tilt-element').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if(x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        }
    });
});

// --- 2. COUNTERS (ANIMATED 150+, 40+, 5+) ---
window.addEventListener("load", function() {
    // Hide Preloader
    const preloader = document.getElementById("preloader");
    if(preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = "none", 500);
    }
    
    // Start Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.innerText = '0';
        const target = +counter.getAttribute('data-target');
        const duration = 2000; 
        const step = target / (duration / 20); 
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                clearInterval(timer);
                counter.innerText = target + "+";
            } else {
                counter.innerText = Math.ceil(current);
            }
        }, 20);
    });
});

// --- 3. AUTO TYPE SKILLS ---
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer", "Social Media Manager"];
let i = 0;
function type() {
    const textElement = document.querySelector('.typing-text');
    if(textElement) {
        let word = words[i % words.length];
        textElement.textContent = word;
        i++;
        setTimeout(type, 2000);
    }
}
type();

// --- 4. NEWS MAGAZINE (40 Items) ---
const newsData = [];
const categories = ['Country', 'Game', 'Tech', 'Funny', 'Girl', 'Men'];
for(let j=1; j<=40; j++) {
    const cat = categories[j % categories.length];
    // Reliable Image Source
    const imgUrl = `https://picsum.photos/300/200?random=${j}`; 
    newsData.push({
        id: j, tag: cat, title: `${cat} Update: Trending Topic #${j}`, img: imgUrl,
        desc: `This is a major update regarding ${cat}. It involves new trends, viral content, and future predictions for 2026. Stay tuned for more details!`, date: 'Today'
    });
}

function renderNews(filter) {
    const grid = document.getElementById('newsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    newsData.forEach(item => {
        if (filter === 'all' || item.tag.toLowerCase() === filter.toLowerCase()) {
            const div = document.createElement('div');
            div.className = 'news-item tilt-element';
            div.onclick = () => openNewsModal(item);
            div.innerHTML = `<img src="${item.img}"><div class="news-info-box"><span class="news-tag">${item.tag}</span><h3 class="news-title">${item.title}</h3></div>`;
            grid.appendChild(div);
        }
    });
}
renderNews('all');
window.filterNews = (f) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderNews(f);
}

function openNewsModal(item) {
    document.getElementById('popupImg').src = item.img;
    document.getElementById('popupTag').innerText = item.tag;
    document.getElementById('popupTitle').innerText = item.title;
    document.getElementById('popupDate').innerText = item.date;
    document.getElementById('popupDesc').innerText = item.desc;
    document.getElementById('newsModal').style.display = 'flex';
}
window.closeNewsModal = () => document.getElementById('newsModal').style.display = 'none';

// --- 5. CONNECT HUB & SMART CHATBOT (NO API KEY NEEDED) ---
window.switchConnect = function(tab) {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    if(tab === 'ai') setTimeout(() => document.getElementById('aiInput').focus(), 100);
    if(tab === 'community') setTimeout(() => document.getElementById('commInput').focus(), 100);
}

// SMART BOT LOGIC (100% Working Free AI)
window.askGeminiAI = function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.toLowerCase().trim();
    if (!text) return;

    // Show User Message
    area.innerHTML += `<div class="msg user">${input.value}</div>`;
    input.value = ""; 
    area.scrollTop = area.scrollHeight;

    // Bot Thinking Delay
    setTimeout(() => {
        let reply = "Mata therune na machan. 'Skills', 'Price', 'Contact' gana ahanna."; // Default

        // Smart Answers
        if(text.includes("hi") || text.includes("hello") || text.includes("kohomada")) {
            reply = "Haai! Mama Kasun AI. Oyaata monawada dana ganna one?";
        } else if(text.includes("name") || text.includes("nama")) {
            reply = "Mage nama Kasun Padma Kumara.";
        } else if(text.includes("skill") || text.includes("wada") || text.includes("karanna puluwan")) {
            reply = "Mata Video Editing, Photography, AI Art, saha DJ Remixing supiriyatama puluwan!";
        } else if(text.includes("price") || text.includes("gana") || text.includes("budget")) {
            reply = "Gana thiranaya wenne wada anuwa. 'Hire Me' button eka obala budget eka ewanna.";
        } else if(text.includes("contact") || text.includes("number") || text.includes("phone")) {
            reply = "WhatsApp: +94717647693";
        } else if(text.includes("video")) {
            reply = "Ow, mama Cinematic Video Editing karanawa.";
        } else if(text.includes("photo")) {
            reply = "Mama Wedding & Event Photography karanawa.";
        } else if(text.includes("bye")) {
            reply = "Ela, Passe set wemu! 👋";
        }

        area.innerHTML += `<div class="msg bot">${reply}</div>`;
        area.scrollTop = area.scrollHeight;
    }, 600);
}

// COMMUNITY CHAT
window.postCommunity = function() {
    const input = document.getElementById('commInput');
    const board = document.getElementById('commMessages');
    const text = input.value.trim();
    if(text !== "") {
        board.innerHTML += `<div class="msg sent">${text}</div>`;
        input.value = "";
        board.scrollTop = board.scrollHeight;
    }
}
window.handleCommEnter = function(e) { if (e.key === 'Enter') window.postCommunity(); }

// --- 6. COMMON ---
window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; }
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';

window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

window.sendBookingToWhatsApp = () => {
    const name = document.getElementById('clientName').value;
    const srv = document.getElementById('serviceType').value;
    const bud = document.getElementById('clientBudget').value;
    const msg = document.getElementById('clientMessage').value;
    if(!name) { alert("Please enter your name"); return; }
    window.open(`https://wa.me/+94717647693?text=Name:${name}%0AService:${srv}%0ABudget:${bud}%0ADetails:${msg}`, '_blank');
}

window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.remove('active'));
    if(t === 'signin') document.getElementById('signInBtn').classList.add('active');
    if(t === 'signup') document.getElementById('signUpBtn').classList.add('active');
}
window.toggleTawkChat = function() { if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading..."); }
window.handleEnter = function(e) { if (e.key === 'Enter') window.askGeminiAI(); }
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-box').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
window.setTheme = (t) => document.body.className = 'theme-'+t;
