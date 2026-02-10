import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// --- 1. MOUSE EFFECTS ---
const blob = document.querySelector('.cursor-blob');
const dot = document.querySelector('.cursor-dot');
document.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
    setTimeout(() => { blob.style.left = e.clientX + 'px'; blob.style.top = e.clientY + 'px'; }, 80);
    document.querySelectorAll('.tilt-element').forEach(el => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
        el.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
    });
});

// --- 2. AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
    const outUI = document.getElementById('loggedOutUI');
    const inUI = document.getElementById('loggedInUI');
    if (user) {
        outUI.style.display = 'none'; inUI.style.display = 'block';
        document.getElementById('userAvatar').src = user.photoURL || 'https://img.icons8.com/color/96/user.png';
        document.getElementById('userNameDisplay').innerText = user.displayName;
        document.getElementById('userEmailDisplay').innerText = user.email;
    } else {
        outUI.style.display = 'block'; inUI.style.display = 'none';
    }
});
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.logoutUser = () => signOut(auth);

// --- 3. UI FUNCTIONS ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if (id === 'home') startCounters();
};
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';

// --- 4. COUNTERS ---
function startCounters() {
    document.querySelectorAll('.counter').forEach(c => {
        c.innerText = '0';
        const target = +c.dataset.target;
        let count = 0;
        const update = () => {
            count += target / 50;
            if (count < target) { c.innerText = Math.ceil(count) + "+"; setTimeout(update, 30); }
            else { c.innerText = target + "+"; }
        };
        update();
    });
}

// --- 5. AI BOT ---
window.askSmartBot = () => {
    const inp = document.getElementById('aiInput');
    const box = document.getElementById('aiMessages');
    if (!inp.value.trim()) return;
    box.innerHTML += `<div class="msg user">${inp.value}</div>`;
    const text = inp.value.toLowerCase(); inp.value = "";
    setTimeout(() => {
        let res = "I am Kasun AI. Ask about Skills or Contact.";
        if (text.match(/hi|hello/)) res = "Hello! How can I help? 😊";
        if (text.match(/contact|whatsapp/)) res = "WhatsApp: +94717647693";
        if (text.match(/skill|video/)) res = "I specialize in Video Editing, AI Art and Photography.";
        box.innerHTML += `<div class="msg bot">${res}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
};

window.handleEnter = (e) => { if (e.key === 'Enter') window.askSmartBot(); };
window.toggleTawkChat = () => { if(window.Tawk_API) window.Tawk_API.toggle(); };
window.setTheme = (t) => document.body.className = 'theme-' + t;
window.switchTab = (t) => {
    document.getElementById('authTab').style.display = (t === 'auth') ? 'block' : 'none';
    document.getElementById('themeTab').style.display = (t === 'theme') ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
};
window.addEventListener("load", () => { 
    document.getElementById("preloader").style.display = "none";
    startCounters();
});

// Auto Type
const words = ["Video Editor", "Photographer", "AI Artist", "Graphic Designer"];
let wordIdx = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if (el) { el.textContent = words[wordIdx % words.length]; wordIdx++; setTimeout(type, 2000); }
}
type();
