// --- FIREBASE SDK SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const fbProvider = new FacebookAuthProvider();

// --- 1. MOUSE & UI EFFECTS (Your Original) ---
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    if(cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
    setTimeout(() => {
        if(cursorBlob) { cursorBlob.style.left = e.clientX + 'px'; cursorBlob.style.top = e.clientY + 'px'; }
    }, 100);

    document.querySelectorAll('.tilt-element').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if(x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
            const rotateX = ((y - (rect.height / 2)) / (rect.height / 2)) * -5;
            const rotateY = ((x - (rect.width / 2)) / (rect.width / 2)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        }
    });
});

// --- 2. AUTHENTICATION (New Integration) ---
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(err => alert(err.message));
window.facebookLogin = () => signInWithPopup(auth, fbProvider).catch(err => alert(err.message));
window.logout = () => signOut(auth).then(() => location.reload());

onAuthStateChanged(auth, (user) => {
    const loggedOutDiv = document.getElementById('userLoggedOut');
    const loggedInDiv = document.getElementById('userLoggedIn');
    if (user) {
        loggedOutDiv.style.display = 'none';
        loggedInDiv.style.display = 'block';
        document.getElementById('userPhoto').src = user.photoURL || 'https://img.icons8.com/color/96/user.png';
        document.getElementById('userName').innerText = user.displayName || user.email;
    } else {
        loggedOutDiv.style.display = 'block';
        loggedInDiv.style.display = 'none';
    }
});

// --- 3. OTHER ORIGINAL FUNCTIONS ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
}

window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';

window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(t==='auth') document.getElementById('tabAuth').classList.add('active');
    else document.getElementById('tabTheme').classList.add('active');
}

window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.remove('active'));
    if(t === 'signin') document.getElementById('signInBtn').classList.add('active');
    else document.getElementById('signUpBtn').classList.add('active');
}

window.switchConnect = (tab) => {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('liveSection').style.display = (tab === 'live') ? 'flex' : 'none';
    document.querySelectorAll('.connect-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Preloader hidden
window.addEventListener("load", () => {
    document.getElementById("preloader").style.display = "none";
});

// Typewriter
const words = ["Video Editor", "Photographer", "AI Artist", "Digital Creator"];
let i = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[i % words.length]; i++; setTimeout(type, 2000); }
}
type();

window.toggleTawkChat = () => { if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading..."); }
window.setTheme = (t) => document.body.className = 'theme-'+t;
