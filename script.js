import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot, limit, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let currentUser = null;
let currentChatMode = 'kasun';
let selectedAvatarUrl = "";

// MAGIC SNOWFALL
function createSnow() {
    const snowContainer = document.getElementById('magic-snow-container');
    if (!snowContainer) return;
    const snow = document.createElement('div');
    snow.classList.add('snowflake');
    snow.style.left = Math.random() * 100 + 'vw';
    snow.style.width = Math.random() * 4 + 2 + 'px';
    snow.style.height = snow.style.width;
    snow.style.animationDuration = Math.random() * 3 + 4 + 's';
    snowContainer.appendChild(snow);
    setTimeout(() => snow.remove(), 7000);
}
setInterval(createSnow, 150);

// CURSOR SPLIT
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
    outline.style.left = e.clientX + 'px'; outline.style.top = e.clientY + 'px';
    for (let i = 0; i < 2; i++) {
        const p = document.createElement('div');
        p.classList.add('split-particle');
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        p.style.setProperty('--mx', (Math.random() - 0.5) * 60 + 'px');
        p.style.setProperty('--my', (Math.random() - 0.5) * 60 + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
});

// AUTH
onAuthStateChanged(auth, async (user) => {
    const outUI = document.getElementById('loggedOutUI');
    const inUI = document.getElementById('loggedInUI');
    const topImg = document.getElementById('topProfileImg');
    if (user) {
        currentUser = user; outUI.style.display = 'none'; inUI.style.display = 'block';
        let userData = { name: user.displayName, photo: user.photoURL || "https://img.icons8.com/color/96/user.png" };
        try { const docSnap = await getDoc(doc(db, "users", user.uid)); if(docSnap.exists()) userData = { ...userData, ...docSnap.data() }; } catch(e) {}
        document.getElementById('userAvatar').src = userData.customPhoto || userData.photo;
        topImg.src = userData.customPhoto || userData.photo;
        if(window.Tawk_API) window.Tawk_API.visitor = { name: user.displayName, email: user.email };
    } else {
        currentUser = null; outUI.style.display = 'block'; inUI.style.display = 'none'; topImg.src = "https://img.icons8.com/color/96/user.png";
    }
});

// FUNCTIONS
window.googleLogin = () => signInWithPopup(auth, googleProvider);
window.facebookLogin = () => signInWithPopup(auth, facebookProvider);
window.logoutUser = () => signOut(auth).then(() => location.reload());
window.selectAvatar = (url) => { selectedAvatarUrl = url; document.getElementById('userAvatar').src = url; };
window.saveUserProfile = async () => {
    if(!currentUser) return;
    const data = { name: document.getElementById('editName').value, nickname: document.getElementById('editNick').value, phone: document.getElementById('editPhone').value, city: document.getElementById('editCity').value, country: document.getElementById('editCountry').value, gender: document.getElementById('editGender').value, customPhoto: selectedAvatarUrl };
    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true }); location.reload();
};

// CHAT
window.openChat = (mode) => {
    currentChatMode = mode;
    document.querySelectorAll('.chat-contact').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const area = document.getElementById('chatMessagesArea');
    area.innerHTML = '';
    if (mode === 'kasun') {
        if(currentUser) area.innerHTML = `<div class="msg received">Hi ${currentUser.displayName}! <br><button class="btn-primary" onclick="window.Tawk_API.maximize()" style="padding:10px; margin-top:10px;">Live Chat</button></div>`;
        else area.innerHTML = `<div class="msg received" style="color:red;">Login to Chat.</div>`;
    }
};

window.sendMessage = async () => {
    const input = document.getElementById('chatInput');
    if (!input.value.trim()) return;
    const area = document.getElementById('chatMessagesArea');
    area.innerHTML += `<div class="msg sent">${input.value}</div>`;
    input.value = ''; area.scrollTop = area.scrollHeight;
};
window.handleChatEnter = (e) => { if(e.key === 'Enter') window.sendMessage(); };

// UI UTILS
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
    document.querySelectorAll('.tab-box-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active');
};
window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
};
window.setTheme = (t) => document.body.className = 'theme-'+t;
window.sendBookingToWhatsApp = () => { window.open(`https://wa.me/+94717647693?text=Project Request`, '_blank'); };

// NEWS & COUNTERS
const categories = ['AI', 'Tech', 'Gaming', 'Men', 'Women', 'Design'];
const newsGrid = document.getElementById('newsGrid');
for(let i=1; i<=40; i++) {
    const el = document.createElement('div'); el.className = 'news-item';
    el.innerHTML = `<img src="https://picsum.photos/400/600?random=${i}"><div class="news-info-box"><h3>News #${i}</h3></div>`;
    newsGrid?.appendChild(el);
}

async function startCounters() {
    const snapshot = await getCountFromServer(collection(db, "users"));
    document.getElementById('clientCounter').innerText = 40 + snapshot.data().count + "+";
}

window.addEventListener("load", () => { setTimeout(() => { document.getElementById("preloader").style.display = "none"; startCounters(); }, 1000); });
