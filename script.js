// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAZton7bSKozxi8R3uUN3qZdrNwt09hKHs",
  authDomain: "kasun-portfolio-7553b.firebaseapp.com",
  projectId: "kasun-portfolio-7553b",
  storageBucket: "kasun-portfolio-7553b.firebasestorage.app",
  messagingSenderId: "619515163796",
  appId: "1:619515163796:web:f54786f0baa083541e7081",
  measurementId: "G-619H45RT8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 1. AUTHENTICATION LOGIC (LOGIN / LOGOUT)
// ==========================================
let currentUser = null;

// Login Function
window.googleLogin = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Logged in as:", result.user.displayName);
        }).catch((error) => {
            console.error("Login Error:", error);
            alert("Login Failed. Please try again.");
        });
}

// Logout Function
window.googleLogout = () => {
    signOut(auth).then(() => {
        alert("You have logged out.");
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
}

// Monitor Login State
onAuthStateChanged(auth, (user) => {
    const overlay = document.getElementById('loginOverlay');
    if (user) {
        currentUser = user;
        if(overlay) overlay.style.display = "none"; // Hide Login Screen
        loadMessages(); // Start loading chat
    } else {
        currentUser = null;
        if(overlay) overlay.style.display = "flex"; // Show Login Screen
    }
});

// ==========================================
// 2. COMMUNITY CHAT LOGIC (REAL-TIME DB)
// ==========================================

// Send Message
window.postCommunity = async () => {
    const input = document.getElementById('commInput');
    const text = input.value.trim();
    
    if (text !== "" && currentUser) {
        try {
            await addDoc(collection(db, "messages"), {
                text: text,
                uid: currentUser.uid,
                name: currentUser.displayName,
                photo: currentUser.photoURL,
                createdAt: new Date() // Timestamp for ordering
            });
            input.value = ""; // Clear input
        } catch (e) {
            console.error("Error sending message: ", e);
            alert("Error sending message. Check console.");
        }
    } else if (!currentUser) {
        alert("Please login first!");
    }
}

// Enter Key Support for Chat
window.handleCommEnter = function(e) { 
    if (e.key === 'Enter') window.postCommunity(); 
}

// Load Messages (Real-time Listener)
function loadMessages() {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
    const msgBoard = document.getElementById('commMessages');
    
    // This runs every time the database updates
    onSnapshot(q, (snapshot) => {
        msgBoard.innerHTML = ""; // Clear current list
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = currentUser && msg.uid === currentUser.uid;
            
            const div = document.createElement('div');
            div.className = `msg-container`;
            
            // HTML for Message Bubble
            div.innerHTML = `
                <div class="msg-info ${isMe ? 'sent' : 'received'}">
                    ${isMe ? '' : `<img src="${msg.photo}" class="profile-pic">`} 
                    <span>${isMe ? 'You' : msg.name.split(' ')[0]}</span>
                </div>
                <div class="msg ${isMe ? 'sent' : 'received'}">${msg.text}</div>
            `;
            msgBoard.appendChild(div);
        });
        // Auto Scroll to Bottom
        msgBoard.scrollTop = msgBoard.scrollHeight;
    });
}

// ==========================================
// 3. SMART BOT (KASUN AI) - NO API KEY NEEDED
// ==========================================
window.askSmartBot = function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.toLowerCase().trim();
    if (!text) return;

    // Show User Message
    area.innerHTML += `<div class="msg user">${input.value}</div>`;
    input.value = ""; 
    area.scrollTop = area.scrollHeight;

    // Bot Response Logic
    setTimeout(() => {
        let reply = "I didn't catch that. Ask about 'Skills', 'Price', or 'Contact'.";

        if(text.match(/hi|hello|hey|ayubowan|good morning/)) reply = "Hello! I am Kasun AI. How can I help you today? 😊";
        else if(text.match(/who|name|nama|kawuda/)) reply = "I am Kasun Padma Kumara, a Digital Creator & Video Editor.";
        else if(text.match(/skill|work|do|job|wada|video|photo|edit/)) reply = "I specialize in: 🎥 Video Editing, 📸 Photography, 🤖 AI Art, and 🎧 DJ Remixing.";
        else if(text.match(/price|cost|budget|gana|money|salli/)) reply = "Prices depend on the project. Use the 'Hire Me' button to send your budget.";
        else if(text.match(/contact|number|phone|whatsapp|call/)) reply = "📞 WhatsApp: +94717647693 (Available 24/7)";
        else if(text.match(/location|koheda|address/)) reply = "📍 Based in Avissawella, Sri Lanka.";
        else if(text.match(/software|tool|app/)) reply = "I use Adobe Premiere Pro, After Effects, Photoshop, and AI tools.";
        else if(text.match(/thanks|thank|ela/)) reply = "You're welcome! 🚀";

        area.innerHTML += `<div class="msg bot">${reply}</div>`;
        area.scrollTop = area.scrollHeight;
    }, 600);
}
// AI Chat Enter Key
window.handleEnter = function(e) { if (e.key === 'Enter') window.askSmartBot(); }


// ==========================================
// 4. UI EFFECTS (COUNTERS, TILT, NEWS)
// ==========================================

// Preloader & Counters
window.addEventListener("load", function() {
    const preloader = document.getElementById("preloader");
    if(preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = "none", 500);
    }
    
    // Animated Counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    counter.innerText = '0';
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const step = target / 100;
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
    const statsSection = document.getElementById('counterSection');
    if(statsSection) observer.observe(statsSection);
});

// Auto Typing Text
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer"];
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

// Mouse Sculpting
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');
document.addEventListener('mousemove', (e) => {
    if(cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
    if(cursorBlob) { setTimeout(() => { cursorBlob.style.left = e.clientX + 'px'; cursorBlob.style.top = e.clientY + 'px'; }, 100); }
    
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

// News Data & Functions
const newsData = [];
const categories = ['Country', 'Game', 'Tech', 'Funny', 'Girl', 'Men'];
for(let j=1; j<=40; j++) {
    const cat = categories[j % categories.length];
    newsData.push({
        id: j, tag: cat, title: `${cat} Update #${j}: New Trends`, 
        img: `https://picsum.photos/300/200?random=${j}`, 
        desc: `Latest updates on ${cat} specifically curated for you.`, date: 'Today' 
    });
}

window.renderNews = (filter) => {
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
// Init News
document.addEventListener('DOMContentLoaded', () => window.renderNews('all'));

window.filterNews = (f) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    window.renderNews(f);
}

window.openNewsModal = (item) => {
    document.getElementById('popupImg').src = item.img;
    document.getElementById('popupTag').innerText = item.tag;
    document.getElementById('popupTitle').innerText = item.title;
    document.getElementById('popupDate').innerText = item.date;
    document.getElementById('popupDesc').innerText = item.desc;
    document.getElementById('newsModal').style.display = 'flex';
}
window.closeNewsModal = () => document.getElementById('newsModal').style.display = 'none';

// ==========================================
// 5. COMMON UTILS & NAVIGATION
// ==========================================
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

window.switchConnect = (tab) => {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    if(tab === 'ai') setTimeout(() => document.getElementById('aiInput').focus(), 100);
    if(tab === 'community') setTimeout(() => document.getElementById('commInput').focus(), 100);
}

window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.remove('active'));
    if(t === 'signin') document.getElementById('signInBtn').classList.add('active');
    if(t === 'signup') document.getElementById('signUpBtn').classList.add('active');
}

window.sendBookingToWhatsApp = () => {
    const name = document.getElementById('clientName').value;
    const srv = document.getElementById('serviceType').value;
    const bud = document.getElementById('clientBudget').value;
    const msg = document.getElementById('clientMessage').value;
    if(!name) { alert("Please enter name"); return; }
    window.open(`https://wa.me/+94717647693?text=Name:${name}%0AService:${srv}%0ABudget:${bud}%0ADetails:${msg}`, '_blank');
}

window.setTheme = (t) => document.body.className = 'theme-'+t;
window.toggleTawkChat = function() { if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading..."); }
