import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let selectedAvatarUrl = "";

// --- CURSOR ---
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
    outline.style.left = e.clientX + 'px'; outline.style.top = e.clientY + 'px';
});

// --- AUTH & PROFILE ---
window.selectAvatar = (url) => {
    selectedAvatarUrl = url;
    document.getElementById('userAvatar').src = url;
};

onAuthStateChanged(auth, async (user) => {
    const outUI = document.getElementById('loggedOutUI');
    const inUI = document.getElementById('loggedInUI');
    const topImg = document.getElementById('topProfileImg');

    if (user) {
        currentUser = user;
        outUI.style.display = 'none';
        inUI.style.display = 'block';
        
        let userData = {
            name: user.displayName,
            photo: user.photoURL || "https://img.icons8.com/color/96/user.png",
            phone: "", city: "", country: "", gender: "Male", nickname: ""
        };

        try { const docSnap = await getDoc(doc(db, "users", user.uid)); if(docSnap.exists()) userData = { ...userData, ...docSnap.data() }; } catch(e) {}

        const finalPhoto = selectedAvatarUrl || userData.photo;
        document.getElementById('userAvatar').src = finalPhoto;
        topImg.src = finalPhoto;
        
        document.getElementById('editName').value = userData.name;
        document.getElementById('editNick').value = userData.nickname || "";
        document.getElementById('editPhone').value = userData.phone;
        document.getElementById('editCity').value = userData.city;
        document.getElementById('editCountry').value = userData.country;
        document.getElementById('editGender').value = userData.gender;

    } else {
        currentUser = null;
        outUI.style.display = 'block';
        inUI.style.display = 'none';
        topImg.src = "https://img.icons8.com/color/96/user.png";
    }
});

window.saveUserProfile = async () => {
    if(!currentUser) return;
    const data = {
        name: document.getElementById('editName').value,
        nickname: document.getElementById('editNick').value,
        phone: document.getElementById('editPhone').value,
        city: document.getElementById('editCity').value,
        country: document.getElementById('editCountry').value,
        gender: document.getElementById('editGender').value,
        photo: selectedAvatarUrl || currentUser.photoURL
    };
    try { await setDoc(doc(db, "users", currentUser.uid), data, { merge: true }); alert("Profile Saved!"); location.reload(); } catch(e) { alert("Error: " + e.message); }
};

window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.logoutUser = () => signOut(auth).then(() => location.reload());
window.emailLogin = () => signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value).catch(e => alert(e.message));
window.emailRegister = () => createUserWithEmailAndPassword(auth, document.getElementById('regEmail').value, document.getElementById('regPass').value).catch(e => alert(e.message));

// --- NEWS LOGIC (Detailed Descriptions) ---
const newsGrid = document.getElementById('newsGrid');
const categories = ['AI', 'Tech', 'Gaming', 'Men', 'Women', 'Design'];
const newsData = [];
for(let i=1; i<=60; i++) {
    const cat = categories[i % 6];
    newsData.push({ 
        id: i, 
        cat: cat, 
        img: `https://picsum.photos/400/600?random=${i}`, 
        title: `${cat} Trend #${i}: The Future of Creativity`, 
        desc: `In this exclusive update regarding ${cat}, we explore how modern technology is reshaping the industry. The integration of AI tools in ${cat} has allowed creators to push boundaries like never before. From automated workflows to generative design, the possibilities are endless. Stay tuned for more deep dives into how ${cat} is evolving in 2026 and beyond.`
    });
}
function renderNews(filter) {
    if(!newsGrid) return; newsGrid.innerHTML = '';
    newsData.forEach(item => {
        if(filter === 'all' || item.cat === filter) {
            const el = document.createElement('div'); el.className = 'news-item tilt-element';
            el.innerHTML = `<img src="${item.img}" loading="lazy"><div class="news-info-box"><span class="news-tag">${item.cat}</span><h3 style="font-size:0.9rem; margin-top:5px; color:white;">${item.title}</h3></div>`;
            el.onclick = () => openNewsPopup(item); newsGrid.appendChild(el);
        }
    });
}
renderNews('all');
window.filterNews = (f) => { document.querySelectorAll('.cat-box').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); renderNews(f); };
function openNewsPopup(item) {
    document.getElementById('popupImg').src = item.img; document.getElementById('popupTag').innerText = item.cat;
    document.getElementById('popupTitle').innerText = item.title; document.getElementById('popupDesc').innerText = item.desc;
    document.getElementById('newsModal').style.display = 'flex';
}
window.closeNewsModal = () => document.getElementById('newsModal').style.display = 'none';

// --- FULL CHAT LOGIC ---
window.sendFullChat = () => {
    const input = document.getElementById('fullChatInput');
    const area = document.getElementById('fullChatMessages');
    if(!input.value.trim()) return;
    area.innerHTML += `<div class="msg sent">${input.value}</div>`;
    input.value = "";
    area.scrollTop = area.scrollHeight;
    setTimeout(() => {
        area.innerHTML += `<div class="msg received">Thank you for your message! Kasun will reply shortly.</div>`;
        area.scrollTop = area.scrollHeight;
    }, 1000);
};
window.handleFullChatEnter = (e) => { if(e.key === 'Enter') window.sendFullChat(); };

// --- UI FUNCTIONS ---
window.showPage = (id, el) => { document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page')); document.getElementById(id).classList.add('active-page'); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); el.classList.add('active'); if(id === 'home') startCounters(); };
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';
window.switchTab = (t) => { document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none'); document.getElementById(t+'Tab').style.display = 'block'; document.querySelectorAll('.tab-box-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); };
window.toggleAuth = (t) => { document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none'; document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none'; document.getElementById('signInBtn').classList.toggle('active', t === 'signin'); document.getElementById('signUpBtn').classList.toggle('active', t === 'signup'); };
window.sendBookingToWhatsApp = () => { window.open(`https://wa.me/+94717647693?text=Hi, I am ${document.getElementById('clientName').value}. ${document.getElementById('clientMessage').value}`, '_blank'); };
window.setTheme = (t) => document.body.className = 'theme-'+t;
window.toggleTawkChat = () => { if(window.Tawk_API) window.Tawk_API.toggle(); };
function startCounters() { document.querySelectorAll('.counter').forEach(c => { c.innerText = '0'; const target = +c.dataset.target; let count = 0; const update = () => { count += target/50; if(count<target) { c.innerText = Math.ceil(count)+"+"; setTimeout(update,30); } else c.innerText = target+"+"; }; update(); }); }

// FAST LOAD FIX (1s)
window.addEventListener("load", () => {
    setTimeout(() => { document.getElementById("preloader").style.display = "none"; startCounters(); }, 1000);
});

// Click Outside Close
window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; };

const words = ["Video Editor", "Photographer", "AI Artist"]; let idx = 0;
function type() { const el = document.querySelector('.typing-text'); if(el) { el.textContent = words[idx % words.length]; idx++; setTimeout(type, 2000); } } type();
