// --- 1. MOUSE SCULPTING ---
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    setTimeout(() => {
        cursorBlob.style.left = e.clientX + 'px';
        cursorBlob.style.top = e.clientY + 'px';
    }, 100);

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

// --- 2. COUNTERS ---
window.addEventListener("load", function() {
    document.getElementById("preloader").style.display = "none";
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
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
                observer.unobserve(entry.target);
            }
        });
    });
    const statsSection = document.querySelector('.stats-row');
    if(statsSection) observer.observe(statsSection);
});

// --- 3. AUTO TYPE SKILLS ---
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer", "Social Media Manager"];
let i = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) {
        el.textContent = words[i % words.length];
        i++;
        setTimeout(type, 2000);
    }
}
type();

// --- 4. NEWS MAGAZINE ---
const newsData = [];
const categories = ['Country', 'Game', 'Tech', 'Funny', 'Girl', 'Men'];
for(let j=1; j<=40; j++) {
    const cat = categories[j % categories.length];
    const imgUrl = `https://picsum.photos/300/200?random=${j}`; 
    newsData.push({ id: j, tag: cat, title: `${cat} News Update #${j}`, img: imgUrl, desc: `Exclusive updates on ${cat} trends.`, date: 'Today' });
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

// --- 5. CONNECT HUB & SMART BOT (THE BRAIN) ---
window.switchConnect = function(tab) {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    if(tab === 'ai') setTimeout(() => document.getElementById('aiInput').focus(), 100);
    if(tab === 'community') setTimeout(() => document.getElementById('commInput').focus(), 100);
}

// *** SMART BOT LOGIC ***
window.askSmartBot = function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.toLowerCase().trim();
    if (!text) return;

    area.innerHTML += `<div class="msg user">${input.value}</div>`;
    input.value = ""; 
    area.scrollTop = area.scrollHeight;

    setTimeout(() => {
        let reply = "I didn't quite get that. Try asking about 'Skills', 'Price', 'Services', or 'Contact'.";

        // GREETINGS
        if(text.match(/hi|hello|hey|ayubowan|good morning|moko|kohomada/)) reply = "Hello! I am Kasun AI. How can I help you? 😊";
        
        // IDENTITY
        else if(text.match(/who|name|nama|kawuda|kasun/)) reply = "I am Kasun Padma Kumara, a Digital Creator, Video Editor & AI Artist.";
        
        // SERVICES / SKILLS
        else if(text.match(/skill|work|do|job|wada|video|photo|edit|design|art|dj|music/)) reply = "I specialize in: \n🎥 Video Editing\n📸 Photography\n🤖 AI Art\n🎨 Graphic Design\n🎧 DJ Remixing";
        
        // PRICE / BUDGET
        else if(text.match(/price|cost|budget|gana|money|salli|keeyada|rate|charge/)) reply = "Prices depend on the project scope. Please use the 'Hire Me' button to send your budget.";
        
        // CONTACT
        else if(text.match(/contact|number|phone|whatsapp|email|call|address|location|koheda/)) reply = "📍 Based in Avissawella, Sri Lanka.\n📞 WhatsApp: +94717647693";
        
        // TOOLS
        else if(text.match(/software|tool|app|pc|spec/)) reply = "I use Adobe Premiere Pro, After Effects, Photoshop, Lightroom, and various AI tools.";
        
        // FUN / PERSONAL
        else if(text.match(/age|old|school|love|gf/)) reply = "That's a secret! 🤫 Let's focus on work.";
        
        // THANKS
        else if(text.match(/thanks|thank|ela|jaya/)) reply = "You're welcome! Happy to help. 🚀";

        area.innerHTML += `<div class="msg bot">${reply}</div>`;
        area.scrollTop = area.scrollHeight;
    }, 500);
}

// COMMUNITY
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
    if(!name) { alert("Please enter name"); return; }
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
window.handleEnter = function(e) { if (e.key === 'Enter') window.askSmartBot(); }
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-box').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
window.setTheme = (t) => document.body.className = 'theme-'+t;
