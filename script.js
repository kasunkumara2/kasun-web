import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- CLICK OUTSIDE TO CLOSE ---
window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; };

// --- CURSOR ---
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
    outline.style.left = e.clientX + 'px'; outline.style.top = e.clientY + 'px';
});

// --- AUTH ---
window.selectAvatar = (url) => { selectedAvatarUrl = url; document.getElementById('userAvatar').src = url; };

onAuthStateChanged(auth, async (user) => {
    const outUI = document.getElementById('loggedOutUI');
    const inUI = document.getElementById('loggedInUI');
    const topImg = document.getElementById('topProfileImg');
    if (user) {
        currentUser = user; outUI.style.display = 'none'; inUI.style.display = 'block';
        let userData = { name: user.displayName, photo: user.photoURL || "https://img.icons8.com/color/96/user.png", phone: "", city: "", country: "", gender: "Male", nickname: "" };
        try { const docSnap = await getDoc(doc(db, "users", user.uid)); if(docSnap.exists()) userData = { ...userData, ...docSnap.data() }; } catch(e) {}
        const finalPhoto = userData.customPhoto || userData.photo;
        document.getElementById('userAvatar').src = finalPhoto; topImg.src = finalPhoto; selectedAvatarUrl = finalPhoto;
        document.getElementById('editName').value = userData.name; document.getElementById('editNick').value = userData.nickname || "";
        document.getElementById('editPhone').value = userData.phone; document.getElementById('editCity').value = userData.city;
        document.getElementById('editCountry').value = userData.country; document.getElementById('editGender').value = userData.gender;
    } else {
        currentUser = null; outUI.style.display = 'block'; inUI.style.display = 'none'; topImg.src = "https://img.icons8.com/color/96/user.png";
    }
});

window.saveUserProfile = async () => {
    if(!currentUser) return;
    const data = { name: document.getElementById('editName').value, nickname: document.getElementById('editNick').value, phone: document.getElementById('editPhone').value, city: document.getElementById('editCity').value, country: document.getElementById('editCountry').value, gender: document.getElementById('editGender').value, customPhoto: selectedAvatarUrl };
    try { await setDoc(doc(db, "users", currentUser.uid), data, { merge: true }); alert("Saved!"); location.reload(); } catch(e) { alert("Error: " + e.message); }
};

window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.logoutUser = () => signOut(auth).then(() => location.reload());
window.emailLogin = () => signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value).catch(e => alert(e.message));
window.emailRegister = () => createUserWithEmailAndPassword(auth, document.getElementById('regEmail').value, document.getElementById('regPass').value).catch(e => alert(e.message));

// --- CHAT LOGIC ---
window.openChat = (mode) => {
    currentChatMode = mode;
    document.querySelectorAll('.chat-contact').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const headerName = document.getElementById('chatHeaderName');
    const headerImg = document.getElementById('chatHeaderImg');
    const area = document.getElementById('chatMessagesArea');
    area.innerHTML = '';
    
    if (mode === 'kasun') { 
        headerName.innerText = "Chat with Kasun"; headerImg.src = "images/profile.jpg"; 
        area.innerHTML = `<div class="msg received">Hi! I am available on Live Chat.<br><br><button class="btn-primary" onclick="window.Tawk_API.maximize()" style="padding:10px; font-size:0.9rem;">Open Live Chat Widget</button></div>`; 
    }
    else if (mode === 'ai') { headerName.innerText = "AI Assistant"; headerImg.src = "https://img.icons8.com/color/96/bot.png"; area.innerHTML = `<div class="msg received">Hello! Ask me anything.</div>`; }
    else if (mode === 'community') { headerName.innerText = "Global Community"; headerImg.src = "https://img.icons8.com/color/96/group.png"; loadCommunityMessages(); }
};

window.sendMessage = async () => {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const area = document.getElementById('chatMessagesArea');
    area.innerHTML += `<div class="msg sent">${text}</div>`;
    input.value = ''; area.scrollTop = area.scrollHeight;

    if (currentChatMode === 'kasun') { setTimeout(() => { area.innerHTML += `<div class="msg received">Please use the Live Chat button above to contact me directly.</div>`; area.scrollTop = area.scrollHeight; }, 1000); }
    else if (currentChatMode === 'ai') { setTimeout(() => { let reply = "I am a bot. How can I help?"; area.innerHTML += `<div class="msg received">${reply}</div>`; area.scrollTop = area.scrollHeight; }, 800); }
    else if (currentChatMode === 'community' && currentUser) { await addDoc(collection(db, "community_messages"), { text: text, uid: currentUser.uid, name: currentUser.displayName, createdAt: new Date() }); }
};
window.handleChatEnter = (e) => { if(e.key === 'Enter') window.sendMessage(); };

function loadCommunityMessages() {
    const q = query(collection(db, "community_messages"), orderBy("createdAt", "asc"), limit(50));
    onSnapshot(q, (snapshot) => {
        if (currentChatMode !== 'community') return;
        const area = document.getElementById('chatMessagesArea');
        area.innerHTML = '';
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const type = (currentUser && msg.uid === currentUser.uid) ? 'sent' : 'received';
            area.innerHTML += `<div class="msg ${type}"><small>${msg.name}</small><br>${msg.text}</div>`;
        });
        area.scrollTop = area.scrollHeight;
    });
}

// --- NEWS LOGIC ---
const newsGrid = document.getElementById('newsGrid');
const categories = ['AI', 'Tech', 'Gaming', 'Men', 'Women', 'Design'];
const newsData = [];
for(let i=1; i<=60; i++) {
    const cat = categories[i % 6];
    newsData.push({ id: i, cat: cat, img: `https://picsum.photos/400/600?random=${i}`, title: `${cat} Update #${i}`, desc: `Full details about ${cat} news item #${i}. This includes analysis, trends, and future predictions.` });
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

// --- UI UTILS ---
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

window.addEventListener("load", () => {
    setTimeout(() => { document.getElementById("preloader").style.display = "none"; startCounters(); }, 1000);
});

const words = ["Video Editor", "Photographer", "AI Artist"]; let idx = 0;
function type() { const el = document.querySelector('.typing-text'); if(el) { el.textContent = words[idx % words.length]; idx++; setTimeout(type, 2000); } } type();
