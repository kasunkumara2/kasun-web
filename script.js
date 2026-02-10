// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZton7bSKozxi8R3uUN3qZdrNwt09hKHs",
  authDomain: "kasun-portfolio-7553b.firebaseapp.com",
  projectId: "kasun-portfolio-7553b",
  storageBucket: "kasun-portfolio-7553b.firebasestorage.app",
  messagingSenderId: "619515163796",
  appId: "1:619515163796:web:f54786f0baa083541e7081",
  measurementId: "G-619H45RT8Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// --- AUTH STATE OBSERVER ---
onAuthStateChanged(auth, (user) => {
    const loggedOutUI = document.getElementById('loggedOutUI');
    const loggedInUI = document.getElementById('loggedInUI');
    if (user) {
        loggedOutUI.style.display = 'none';
        loggedInUI.style.display = 'block';
        document.getElementById('userAvatar').src = user.photoURL || "https://img.icons8.com/color/96/user.png";
        document.getElementById('userNameDisplay').innerText = user.displayName || "User";
        document.getElementById('userEmailDisplay').innerText = user.email;
    } else {
        loggedOutUI.style.display = 'block';
        loggedInUI.style.display = 'none';
    }
});

// --- LOGIN FUNCTIONS ---
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(err => alert(err.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(err => alert(err.message));
window.logoutUser = () => signOut(auth);

window.emailLogin = () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

window.emailRegister = () => {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    createUserWithEmailAndPassword(auth, email, pass)
        .then(res => updateProfile(res.user, { displayName: name }))
        .catch(err => alert(err.message));
};

// --- MOUSE & TILT ---
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');
document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px';
    setTimeout(() => { cursorBlob.style.left = e.clientX + 'px'; cursorBlob.style.top = e.clientY + 'px'; }, 100);
    document.querySelectorAll('.tilt-element').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        if(x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        } else { card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`; }
    });
});

// --- COUNTERS ---
window.addEventListener("load", function() {
    document.getElementById("preloader").style.display = "none";
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    counter.innerText = '0';
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; const step = target / (duration / 20); 
                    let current = 0;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { clearInterval(timer); counter.innerText = target + "+"; } 
                        else { counter.innerText = Math.ceil(current); }
                    }, 20);
                }); observer.unobserve(entry.target);
            }
        });
    });
    const statsSection = document.querySelector('.stats-row');
    if(statsSection) observer.observe(statsSection);
});

// --- AUTO TYPE ---
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer", "Social Media Manager"];
let i = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[i % words.length]; i++; setTimeout(type, 2000); }
}
type();

// --- NEWS MAGAZINE ---
const newsData = [];
const categories = ['Country', 'Game', 'Tech', 'Funny', 'Girl', 'Men'];
for(let j=1; j<=40; j++) {
    const cat = categories[j % categories.length];
    newsData.push({ id: j, tag: cat, title: `${cat} News #${j}`, img: `https://picsum.photos/300/200?random=${j}`, desc: `Updates on ${cat} trends.`, date: 'Today' });
}
function renderNews(filter) {
    const grid = document.getElementById('newsGrid'); if(!grid) return;
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
    event.target.classList.add('active'); renderNews(f);
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

// --- CONNECT HUB & SMART BOT ---
window.switchConnect = function(tab) {
    document.getElementById('aiSection').style.display = 'flex';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}
window.askSmartBot = function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.toLowerCase().trim(); if (!text) return;
    area.innerHTML += `<div class="msg user">${input.value}</div>`;
    input.value = ""; area.scrollTop = area.scrollHeight;
    setTimeout(() => {
        let reply = "I am Kasun AI. Try asking about 'Skills' or 'Contact'.";
        if(text.match(/hi|hello|kohomada/)) reply = "Hello! I am Kasun AI. 😊";
        else if(text.match(/who|kasun/)) reply = "I am Kasun Padma Kumara, a Digital Creator.";
        else if(text.match(/skill|video|art/)) reply = "I specialized in Video Editing, AI Art, and DJing.";
        else if(text.match(/price|keeyada/)) reply = "Prices vary. Please use the Hire Me button.";
        else if(text.match(/contact|whatsapp/)) reply = "WhatsApp: +94717647693";
        area.innerHTML += `<div class="msg bot">${reply}</div>`;
        area.scrollTop = area.scrollHeight;
    }, 500);
}

// --- COMMON UI ---
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
    window.open(`https://wa.me/+94717647693?text=Hi, I am ${name}. I need ${srv}.`, '_blank');
}
window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.getElementById('signInBtn').classList.toggle('active', t === 'signin');
    document.getElementById('signUpBtn').classList.toggle('active', t === 'signup');
}
window.switchTab = (t) => {
    document.getElementById('authTab').style.display = (t === 'auth') ? 'block' : 'none';
    document.getElementById('themeTab').style.display = (t === 'theme') ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
window.setTheme = (t) => document.body.className = 'theme-'+t;
window.toggleTawkChat = () => { if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading..."); }
window.handleEnter = (e) => { if (e.key === 'Enter') window.askSmartBot(); }
