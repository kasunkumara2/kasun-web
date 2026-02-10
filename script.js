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
let authMode = 'signin';
let selectedAvatar = "https://img.icons8.com/color/96/user.png";

// --- AUTH OBSERVER ---
onAuthStateChanged(auth, async (user) => {
    const outUI = document.getElementById('profileLoggedOut');
    const inUI = document.getElementById('profileLoggedIn');
    const topImg = document.getElementById('topProfileImg');

    if (user) {
        currentUser = user;
        outUI.style.display = 'none'; inUI.style.display = 'block';
        
        // Fetch extra details from Firestore
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('profName').value = data.name || user.displayName;
            document.getElementById('profPhone').value = data.phone || "";
            document.getElementById('profCity').value = data.city || "";
            document.getElementById('profCountry').value = data.country || "";
            document.getElementById('profGender').value = data.gender || "Male";
            document.getElementById('editProfilePic').src = data.photo || user.photoURL || selectedAvatar;
            topImg.src = data.photo || user.photoURL || selectedAvatar;
        } else {
            document.getElementById('profName').value = user.displayName;
            document.getElementById('editProfilePic').src = user.photoURL || selectedAvatar;
            topImg.src = user.photoURL || selectedAvatar;
        }
    } else {
        currentUser = null;
        outUI.style.display = 'block'; inUI.style.display = 'none';
        topImg.src = selectedAvatar;
    }
});

// --- AUTH FUNCTIONS ---
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.logoutUser = () => signOut(auth).then(() => location.reload());

window.toggleAuthPage = (mode) => {
    authMode = mode;
    document.getElementById('btnSignIn').classList.toggle('active', mode === 'signin');
    document.getElementById('btnSignUp').classList.toggle('active', mode === 'signup');
};

window.handleEmailAuth = () => {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    if(authMode === 'signin') signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
    else createUserWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};

// --- PROFILE ACTIONS ---
window.setAvatar = (src) => {
    selectedAvatar = src;
    document.getElementById('editProfilePic').src = src;
};

window.saveUserProfile = async () => {
    if (!currentUser) return;
    const data = {
        name: document.getElementById('profName').value,
        phone: document.getElementById('profPhone').value,
        city: document.getElementById('profCity').value,
        country: document.getElementById('profCountry').value,
        gender: document.getElementById('profGender').value,
        photo: document.getElementById('editProfilePic').src
    };
    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
    alert("Profile Updated Successfully!");
};

// --- COMMON UI ---
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    if(id === 'home') startCounters();
};

window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.openBooking = () => document.getElementById('bookingModal').style.display = 'flex';
window.closeBooking = () => document.getElementById('bookingModal').style.display = 'none';
window.setTheme = (t) => document.body.className = 'theme-' + t;

window.sendBookingToWhatsApp = () => {
    const name = document.getElementById('clientName').value;
    const msg = document.getElementById('clientMessage').value;
    window.open(`https://wa.me/+94717647693?text=Hi, I am ${name}. Project Info: ${msg}`, '_blank');
};

// Mouse Effects
document.addEventListener('mousemove', (e) => {
    document.querySelector('.cursor-dot').style.left = e.clientX + 'px';
    document.querySelector('.cursor-dot').style.top = e.clientY + 'px';
    setTimeout(() => {
        document.querySelector('.cursor-blob').style.left = e.clientX + 'px';
        document.querySelector('.cursor-blob').style.top = e.clientY + 'px';
    }, 80);
});

// Counters
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

// Auto Type
const words = ["Digital Creator", "Videographer", "AI Artist", "Designer"];
let wordIdx = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if (el) { el.textContent = words[wordIdx % words.length]; wordIdx++; setTimeout(type, 2000); }
}
type();

window.addEventListener("load", () => { 
    document.getElementById("preloader").style.display = "none"; 
    startCounters();
});
