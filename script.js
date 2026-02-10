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

// --- AUTH & PROFILE ---
onAuthStateChanged(auth, async (user) => {
    const outUI = document.getElementById('loggedOutUI');
    const inUI = document.getElementById('loggedInUI');
    const topImg = document.getElementById('topProfileImg');

    if (user) {
        currentUser = user;
        outUI.style.display = 'none';
        inUI.style.display = 'block';
        
        // Fetch User Data from Firestore
        let userData = {
            name: user.displayName,
            photo: user.photoURL || "https://img.icons8.com/color/96/user.png",
            phone: "", city: "", country: "", gender: "Male"
        };

        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if(docSnap.exists()) userData = { ...userData, ...docSnap.data() };
        } catch(e) { console.log(e); }

        // Update UI
        document.getElementById('userAvatar').src = userData.photo;
        topImg.src = userData.photo;
        document.getElementById('editName').value = userData.name;
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

// Save Profile Function
window.saveUserProfile = async () => {
    if(!currentUser) return;
    const data = {
        name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        city: document.getElementById('editCity').value,
        country: document.getElementById('editCountry').value,
        gender: document.getElementById('editGender').value,
        photo: currentUser.photoURL || "https://img.icons8.com/color/96/user.png"
    };
    try {
        await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
        alert("Profile Saved!");
    } catch(e) { alert("Error saving profile: " + e.message); }
};

window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.logoutUser = () => signOut(auth).then(() => location.reload());

window.emailLogin = () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};
window.emailRegister = () => {
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    createUserWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};

// --- TABS & MODALS ---
window.switchTab = (t) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(t+'Tab').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
};
window.toggleAuth = (t) => {
    document.getElementById('signInForm').style.display = (t === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (t === 'signup') ? 'block' : 'none';
    document.getElementById('signInBtn').classList.toggle('active', t === 'signin');
    document.getElementById('signUpBtn').classList.toggle('active', t === 'signup');
};

// --- NEWS (40 ITEMS) ---
const newsGrid = document.getElementById('newsGrid');
if(newsGrid) {
    const cats = ['AI', 'Tech', 'Design', 'Video'];
    for(let i=1; i<=40; i++) {
        const cat = cats[i % 4];
        const item = document.createElement('div');
        item.className = 'news-item tilt-element';
        item.innerHTML = `
            <img src="https://picsum.photos/400/600?random=${i}">
            <div class="news-info-box"><span class="news-tag">${cat}</span><h3 style="font-size:0.9rem; margin-top:5px;">News Update #${i}</h3></div>`;
        newsGrid.appendChild(item);
    }
}

// --- STANDARD FUNCTIONS ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if(id === 'home') startCounters();
};
window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';
window.sendBookingToWhatsApp = () => {
    const name = document.getElementById('clientName').value;
    const msg = document.getElementById('clientMessage').value;
    window.open(`https://wa.me/+94717647693?text=Hi, I am ${name}. ${msg}`, '_blank');
};
window.setTheme = (t) => document.body.className = 'theme-'+t;
window.toggleTawkChat = () => { if(window.Tawk_API) window.Tawk_API.toggle(); };

// --- COUNTERS & MOUSE ---
function startCounters() {
    document.querySelectorAll('.counter').forEach(c => {
        c.innerText = '0';
        const target = +c.dataset.target;
        let count = 0;
        const update = () => {
            count += target / 50;
            if(count < target) { c.innerText = Math.ceil(count) + "+"; setTimeout(update, 30); }
            else { c.innerText = target + "+"; }
        };
        update();
    });
}
document.addEventListener('mousemove', (e) => {
    document.querySelector('.cursor-dot').style.left = e.clientX + 'px';
    document.querySelector('.cursor-dot').style.top = e.clientY + 'px';
    setTimeout(() => {
        document.querySelector('.cursor-blob').style.left = e.clientX + 'px';
        document.querySelector('.cursor-blob').style.top = e.clientY + 'px';
    }, 80);
});
window.addEventListener("load", () => {
    document.getElementById("preloader").style.display = "none";
    startCounters();
});

// Typing Effect
const words = ["Video Editor", "Photographer", "AI Artist"];
let idx = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[idx % words.length]; idx++; setTimeout(type, 2000); }
}
type();
