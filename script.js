import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIG ---
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let chatSession = model.startChat();

// --- 1. MOUSE SCULPTING & TILT EFFECT ---
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    // Move Cursor
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    
    // Delayed Blob movement
    setTimeout(() => {
        cursorBlob.style.left = e.clientX + 'px';
        cursorBlob.style.top = e.clientY + 'px';
    }, 100);

    // 3D TILT LOGIC for Cards
    document.querySelectorAll('.tilt-element').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Only tilt if mouse is near/over
        if(x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg tilt
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        }
    });
});

// --- 2. CONNECT HUB SWITCHER ---
window.switchConnect = function(tab) {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- 3. MAGAZINE NEWS DATA ---
const newsData = [
    { id: 1, tag: 'Lanka', title: 'Sri Lanka Tourism Booms in 2026', img: 'https://images.unsplash.com/photo-1586861635167-e5223aeb4227?w=500', featured: true },
    { id: 2, tag: 'Tech', title: 'AI Takes Over Editing', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500' },
    { id: 3, tag: 'Game', title: 'GTA 6 Map Leaked?', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500' },
    { id: 4, tag: 'Tech', title: 'New Camera Gear 2026', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
    { id: 5, tag: 'Lanka', title: 'Colombo Night Races', img: 'https://images.unsplash.com/photo-1590523278135-1e672957b23d?w=500' }
];

function renderNews(filter) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';
    newsData.forEach(item => {
        if (filter === 'all' || item.tag.toLowerCase() === filter.toLowerCase()) {
            grid.innerHTML += `
                <div class="news-item tilt-element ${item.featured ? 'featured' : ''}">
                    <img src="${item.img}">
                    <div class="news-overlay">
                        <span class="news-tag">${item.tag}</span>
                        <h3 class="news-title">${item.title}</h3>
                    </div>
                </div>
            `;
        }
    });
}
// Init News
renderNews('all');
window.filterNews = (f) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderNews(f);
}

// --- 4. AI CHAT LOGIC ---
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

// --- 5. MODAL & NAVIGATION ---
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
    if(!name) return alert('Name required');
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

// Settings Tabs
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
window.setTheme = (t) => document.body.className = 'theme-'+t;

// Auto Type
const words = ["Editor", "Photographer", "Designer"];
let i = 0, timer;
function type() {
    let word = words[i % words.length];
    document.querySelector('.typing-text').textContent = word;
    i++;
    setTimeout(type, 2000);
}
type();
