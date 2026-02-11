import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// --- CYBER SNOW LOGIC ---
function createSnow() {
    const container = document.getElementById('magic-snow-container');
    if (!container) return;
    const snow = document.createElement('div');
    snow.classList.add('snowflake');
    snow.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 4 + 2 + 'px';
    snow.style.width = size; snow.style.height = size;
    snow.style.animationDuration = Math.random() * 3 + 4 + 's';
    container.appendChild(snow);
    setTimeout(() => snow.remove(), 7000);
}
setInterval(createSnow, 100);

// --- CURSOR SPLIT EFFECT ---
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
    outline.style.left = e.clientX + 'px'; outline.style.top = e.clientY + 'px';

    // Split particles logic
    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.classList.add('split-p');
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        p.style.setProperty('--x', (Math.random() - 0.5) * 80 + 'px');
        p.style.setProperty('--y', (Math.random() - 0.5) * 80 + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
    }
});

// --- AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('loggedOutUI').style.display = 'none';
        document.getElementById('loggedInUI').style.display = 'block';
        if(window.Tawk_API) window.Tawk_API.visitor = { name: user.displayName, email: user.email };
    } else {
        document.getElementById('loggedOutUI').style.display = 'block';
        document.getElementById('loggedInUI').style.display = 'none';
    }
});

window.googleLogin = () => signInWithPopup(auth, googleProvider);
window.facebookLogin = () => signInWithPopup(auth, facebookProvider);
window.logoutUser = () => signOut(auth).then(() => location.reload());

// --- UI LOGIC ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active'); if(id === 'home') startCounters();
};
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-box-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
};
window.setTheme = (t) => document.body.className = 'theme-'+t;

// --- COUNTERS ---
async function startCounters() {
    const snap = await getCountFromServer(collection(db, "users"));
    document.getElementById('clientCounter').innerText = 40 + snap.data().count + "+";
}

window.addEventListener("load", () => {
    setTimeout(() => { document.getElementById("preloader").style.display = "none"; startCounters(); }, 1000);
});
