import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// --- 1. GENERATE 40 NEWS ITEMS ---
const newsGrid = document.getElementById('newsGrid');
const categories = ['Tech', 'Design', 'AI', 'Video'];
for(let i=1; i<=40; i++) {
    const cat = categories[i % 4];
    const item = document.createElement('div');
    item.className = 'news-item tilt-element';
    item.innerHTML = `
        <img src="https://picsum.photos/400/600?random=${i}">
        <div class="news-info-box">
            <span class="news-tag">${cat}</span>
            <h3 style="font-size:0.9rem; margin-top:5px;">Creative News Update #${i}</h3>
        </div>
    `;
    if(newsGrid) newsGrid.appendChild(item);
}

// --- 2. AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('loggedOutUI').style.display = 'none';
        document.getElementById('loggedInUI').style.display = 'block';
        document.getElementById('userAvatar').src = user.photoURL;
        document.getElementById('userNameDisplay').innerText = user.displayName;
    } else {
        document.getElementById('loggedOutUI').style.display = 'block';
        document.getElementById('loggedInUI').style.display = 'none';
    }
});
window.googleLogin = () => signInWithPopup(auth, googleProvider);
window.logoutUser = () => signOut(auth);

// --- 3. UI FUNCTIONS ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if(id === 'home') startCounters();
};

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

// Mouse Effects
document.addEventListener('mousemove', (e) => {
    document.querySelector('.cursor-dot').style.left = e.clientX + 'px';
    document.querySelector('.cursor-dot').style.top = e.clientY + 'px';
    setTimeout(() => {
        document.querySelector('.cursor-blob').style.left = e.clientX + 'px';
        document.querySelector('.cursor-blob').style.top = e.clientY + 'px';
    }, 80);
});

// Typing Text
const words = ["Video Editor", "Photographer", "AI Artist", "Graphic Designer"];
let wordIdx = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[wordIdx % words.length]; wordIdx++; setTimeout(type, 2000); }
}
type();

window.addEventListener("load", () => { document.getElementById("preloader").style.display = "none"; startCounters(); });
