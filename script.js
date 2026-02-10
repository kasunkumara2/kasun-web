// --- FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let userProfile = { name: "Guest", photo: "https://img.icons8.com/color/96/user.png" };
let selectedAvatarURL = ""; // To store selected avatar
let authMode = 'signin';

// --- AUTH FUNCTIONS ---
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.googleLogout = () => signOut(auth).then(() => location.reload());

window.toggleProfileAuth = (mode) => {
    authMode = mode;
    document.getElementById('btnSignIn').classList.toggle('active', mode === 'signin');
    document.getElementById('btnSignUp').classList.toggle('active', mode === 'signup');
    document.getElementById('actionBtn').innerText = (mode === 'signin') ? "Login" : "Register";
}

window.handleEmailAuth = async () => {
    const email = document.getElementById('emailInput').value;
    const pass = document.getElementById('passInput').value;
    if(!email || !pass) { alert("Enter email & password"); return; }
    try {
        if(authMode === 'signin') await signInWithEmailAndPassword(auth, email, pass);
        else {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(cred.user, { displayName: email.split('@')[0] });
        }
    } catch (e) { alert(e.message); }
}

// --- AVATAR SELECTION ---
window.selectAvatar = (url) => {
    selectedAvatarURL = url;
    document.getElementById('editProfilePic').src = url;
}

// --- LOAD USER DATA ---
onAuthStateChanged(auth, async (user) => {
    const loginView = document.getElementById('profileLoginView');
    const editView = document.getElementById('profileEditView');
    const topIcon = document.getElementById('topProfileImg');

    if (user) {
        currentUser = user;
        if(loginView) loginView.style.display = "none";
        if(editView) editView.style.display = "block";

        // Default Data
        let data = {
            name: user.displayName || "User",
            photo: user.photoURL || "https://img.icons8.com/color/96/user.png",
            phone: "", city: "", country: "", address: "", gender: "Male"
        };

        // Fetch from Firestore
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                data = { ...data, ...docSnap.data() }; // Merge defaults with saved data
            }
        } catch (e) { console.log(e); }

        userProfile = data;
        selectedAvatarURL = data.photo;

        // Set Values to Inputs
        document.getElementById('editProfilePic').src = data.photo;
        document.getElementById('editUsername').value = data.name;
        document.getElementById('editPhone').value = data.phone;
        document.getElementById('editCity').value = data.city;
        document.getElementById('editCountry').value = data.country;
        document.getElementById('editAddress').value = data.address;
        document.getElementById('editGender').value = data.gender;
        
        if(topIcon) topIcon.src = data.photo;
        
        loadMessages();
    } else {
        currentUser = null;
        if(loginView) loginView.style.display = "block";
        if(editView) editView.style.display = "none";
        if(topIcon) topIcon.src = "https://img.icons8.com/color/96/user.png";
    }
});

// --- SAVE PROFILE ---
window.saveProfile = async () => {
    if (!currentUser) return;
    
    const newData = {
        name: document.getElementById('editUsername').value,
        photo: selectedAvatarURL,
        phone: document.getElementById('editPhone').value,
        city: document.getElementById('editCity').value,
        country: document.getElementById('editCountry').value,
        address: document.getElementById('editAddress').value,
        gender: document.getElementById('editGender').value
    };

    try {
        await setDoc(doc(db, "users", currentUser.uid), newData, { merge: true });
        alert("Profile Saved!");
        location.reload();
    } catch(e) { alert("Error saving: " + e.message); }
}

// --- CHAT ---
window.postCommunity = async () => {
    if (!currentUser) {
        alert("Login first!");
        window.showPage('profile', document.getElementById('navProfile'));
        return;
    }
    const input = document.getElementById('commInput');
    const text = input.value.trim();
    if (text !== "") {
        await addDoc(collection(db, "messages"), {
            text: text, uid: currentUser.uid, 
            name: userProfile.name, photo: userProfile.photo, 
            createdAt: new Date()
        });
        input.value = "";
    }
}
window.handleCommEnter = (e) => { if (e.key === 'Enter') window.postCommunity(); }

function loadMessages() {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
    onSnapshot(q, (snapshot) => {
        const board = document.getElementById('commMessages');
        board.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = currentUser && msg.uid === currentUser.uid;
            const div = document.createElement('div');
            div.className = `msg-container`;
            div.innerHTML = `
                <div class="msg-info ${isMe ? 'sent' : 'received'}">
                    ${isMe ? '' : `<img src="${msg.photo}" class="profile-pic" style="width:25px; height:25px; border-radius:50%; margin-right:5px; object-fit:cover;">`} 
                    <span style="font-size:0.7rem; color:#aaa;">${isMe ? 'You' : msg.name}</span>
                </div>
                <div class="msg ${isMe ? 'sent' : 'received'}" style="padding:8px 12px; border-radius:15px; margin:2px 0; max-width:70%; ${isMe ? 'background:var(--primary); align-self:flex-end;' : 'background:#333; align-self:flex-start;'}">${msg.text}</div>
            `;
            div.style.display = "flex"; div.style.flexDirection = "column";
            board.appendChild(div);
        });
        board.scrollTop = board.scrollHeight;
    });
}

// --- STANDARD UTILS ---
window.askSmartBot = function() {
    const input = document.getElementById('aiInput');
    const area = document.getElementById('aiMessages');
    const text = input.value.toLowerCase().trim();
    if (!text) return;
    area.innerHTML += `<div class="msg user">${input.value}</div>`;
    input.value = ""; area.scrollTop = area.scrollHeight;
    setTimeout(() => {
        let reply = "I can help with Skills, Price, or Contact.";
        if(text.match(/hi|hello/)) reply = "Hello! I am Kasun AI.";
        else if(text.match(/price|cost/)) reply = "Click 'Hire Me' for pricing.";
        else if(text.match(/contact/)) reply = "WhatsApp: +94717647693";
        area.innerHTML += `<div class="msg bot">${reply}</div>`;
        area.scrollTop = area.scrollHeight;
    }, 600);
}
window.handleEnter = (e) => { if (e.key === 'Enter') window.askSmartBot(); }

window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; }
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';

window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
}
window.switchConnect = (tab) => {
    document.getElementById('aiSection').style.display = (tab === 'ai') ? 'flex' : 'none';
    document.getElementById('communitySection').style.display = (tab === 'community') ? 'flex' : 'none';
}
window.setTheme = (t) => document.body.className = 'theme-'+t;
window.sendBookingToWhatsApp = () => {
    const name = document.getElementById('clientName').value;
    window.open(`https://wa.me/+94717647693?text=Hi, I am ${name}`, '_blank');
}
window.toggleTawkChat = function() { if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading..."); }

// Mouse & Loaders
window.addEventListener("load", function() {
    const preloader = document.getElementById("preloader");
    if(preloader) { preloader.style.opacity = '0'; setTimeout(() => preloader.style.display = "none", 500); }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    counter.innerText = '0';
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const timer = setInterval(() => {
                        current += Math.ceil(target / 100);
                        if (current >= target) { clearInterval(timer); counter.innerText = target + "+"; } 
                        else { counter.innerText = current; }
                    }, 20);
                });
                observer.unobserve(entry.target);
            }
        });
    });
    const stats = document.getElementById('counterSection');
    if(stats) observer.observe(stats);
});
const cursorBlob = document.querySelector('.cursor-blob');
const cursorDot = document.querySelector('.cursor-dot');
document.addEventListener('mousemove', (e) => {
    if(cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
    if(cursorBlob) { setTimeout(() => { cursorBlob.style.left = e.clientX + 'px'; cursorBlob.style.top = e.clientY + 'px'; }, 100); }
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
const newsData = [{id:1, tag:'Tech', title:'AI Update', img:'https://picsum.photos/300/200', desc:'News', date:'Today'}];
window.renderNews = () => {
    const grid = document.getElementById('newsGrid');
    if(grid) {
        grid.innerHTML = '';
        newsData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'news-item tilt-element';
            div.onclick = () => window.openNewsModal(item);
            div.innerHTML = `<img src="${item.img}"><div class="news-info-box"><span class="news-tag">${item.tag}</span><h3 class="news-title">${item.title}</h3></div>`;
            grid.appendChild(div);
        });
    }
}
window.openNewsModal = (item) => {
    document.getElementById('popupImg').src = item.img;
    document.getElementById('newsModal').style.display = 'flex';
}
window.closeNewsModal = () => document.getElementById('newsModal').style.display = 'none';
document.addEventListener('DOMContentLoaded', () => window.renderNews());
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer"];
let i = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[i % words.length]; i++; setTimeout(type, 2000); }
}
type();
