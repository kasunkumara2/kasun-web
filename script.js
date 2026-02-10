import { GoogleGenerativeAI } from "@google/generative-ai";

// CONFIG
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let chatSession = model.startChat();

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

// --- 2. MAGAZINE NEWS DATA (More Categories) ---
const newsData = [
    { id: 1, tag: 'Country', title: 'Sri Lanka Tourism Booms in 2026', img: 'https://images.unsplash.com/photo-1586861635167-e5223aeb4227?w=500', desc: 'Tourism in Sri Lanka has reached an all-time high with new eco-zones opening in Nuwara Eliya and Ella.', date: 'Today' },
    { id: 2, tag: 'Game', title: 'GTA 6 Map Leaked?', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500', desc: 'Gamers are excited as new leaks suggest the Vice City map is 3x larger than GTA 5.', date: 'Yesterday' },
    { id: 3, tag: 'Funny', title: 'Cat Elected Mayor', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500', desc: 'A ginger cat named Ginger has been honorary mayor of a small town for a day.', date: '2 days ago' },
    { id: 4, tag: 'Girl', title: 'Cyberpunk Fashion Trends', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', desc: 'Neon aesthetics and tech-wear are dominating the 2026 fashion week.', date: 'Today' },
    { id: 5, tag: 'Men', title: 'Future of Muscle Cars', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500', desc: 'Electric muscle cars are now faster than ever, hitting 0-60 in 1.9 seconds.', date: 'Just Now' },
    { id: 6, tag: 'Game', title: 'Valorant New Agent', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', desc: 'Riot Games reveals a new controller agent with time-bending abilities.', date: '3 days ago' }
];

function renderNews(filter) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';
    newsData.forEach(item => {
        if (filter === 'all' || item.tag.toLowerCase() === filter.toLowerCase()) {
            const div = document.createElement('div');
            div.className = 'news-item tilt-element';
            div.onclick = () => openNewsModal(item); // Open Popup on Click
            div.innerHTML = `
                <img src="${item.img}">
                <div class="news-overlay">
                    <span class="news-tag">${item.tag}</span>
                    <h3 class="news-title">${item.title}</h3>
                </div>
            `;
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

// --- NEWS POPUP LOGIC ---
function openNewsModal(item) {
    document.getElementById('popupImg').src = item.img;
    document.getElementById('popupTitle').innerText = item.title;
    document.getElementById('popupDate').innerText = item.date;
    document.getElementById('popupDesc').innerText = item.desc;
    document.getElementById('newsModal').style.display = 'flex';
}
window.closeNewsModal = () => document.getElementById('newsModal').style.display = 'none';

// --- 3. COUNTERS ---
window.addEventListener("load", function() {
    document.getElementById("preloader").style.display = "none";
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const inc = target / 50; 
        const updateCount = () => {
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count) + "+";
                setTimeout(updateCount, 30);
            } else { counter.innerText = target + "+"; }
        };
        updateCount();
    });
});

// --- 4. CONNECT HUB & AI ---
window.switchConnect = function(tab) {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

window.askGeminiAI = async function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.trim();
    if (!text) return;

    area.innerHTML += `<div class="msg user">${text}</div>`;
    input.value = "";
    area.scrollTop = area.scrollHeight;

    try {
        const result = await chatSession.sendMessage(text);
        const response = await result.response;
        area.innerHTML += `<div class="msg bot">${response.text()}</div>`;
    } catch (e) {
        area.innerHTML += `<div class="msg bot" style="color:red">Error connecting to AI.</div>`;
    }
    area.scrollTop = area.scrollHeight;
}

// --- 5. COMMON FUNCTIONS ---
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
    window.open(`https://wa.me/+94717647693?text=Name:${name}%0AService:${srv}%0ABudget:${bud}%0ADetails:${msg}`, '_blank');
}

window.postCommunity = () => {
    const inp = document.getElementById('commInput');
    const board = document.getElementById('commMessages');
    if(inp.value) {
        board.innerHTML += `<div class="msg sent">${inp.value}</div>`;
        inp.value = "";
        board.scrollTop = board.scrollHeight;
    }
}

// Auth & Theme
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.getElementById('signInBtn').classList.toggle('active', t === 'signin');
    document.getElementById('signUpBtn').classList.toggle('active', t === 'signup');
}
window.setTheme = (t) => document.body.className = 'theme-'+t;

// Auto Type
const words = ["Video Editor", "Photographer", "AI Artist", "DJ"];
let i = 0;
function type() {
    let word = words[i % words.length];
    document.querySelector('.typing-text').textContent = word;
    i++;
    setTimeout(type, 2000);
}
type();
