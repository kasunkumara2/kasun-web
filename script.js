import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

let currentUser = null;
let userProfile = { name: "Guest", photo: "https://img.icons8.com/color/96/user.png" };

// CURSOR MOVEMENT LOGIC
document.addEventListener('mousemove', (e) => {
    const dot = document.querySelector('.cursor-dot');
    const blob = document.querySelector('.cursor-blob');
    if(dot && blob) {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        setTimeout(() => {
            blob.style.left = e.clientX + 'px';
            blob.style.top = e.clientY + 'px';
        }, 80);
    }
});

// COUNTER ANIMATION (0 to Target)
function startCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.innerText = '0';
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 50;
        const update = () => {
            count += speed;
            if(count < target) {
                counter.innerText = Math.ceil(count) + "+";
                setTimeout(update, 30);
            } else {
                counter.innerText = target + "+";
            }
        };
        update();
    });
}

// GLOBAL UI FUNCTIONS
window.showPage = (id, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    if(id === 'home') startCounters(); // Restart counters on home
};

window.openSettings = () => document.getElementById('settingsModal').style.display = 'flex';
window.closeSettings = () => document.getElementById('settingsModal').style.display = 'none';
window.setTheme = (t) => document.body.className = 'theme-' + t;

// FIREBASE AUTH
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => console.log(e));
window.googleLogout = () => signOut(auth).then(() => location.reload());

// CHAT SYSTEM (REAL-TIME)
window.postCommunity = async () => {
    const input = document.getElementById('commInput');
    if (!currentUser || !input.value.trim()) return;
    try {
        await addDoc(collection(db, "messages"), {
            text: input.value.trim(),
            uid: currentUser.uid,
            name: userProfile.name || currentUser.displayName,
            photo: userProfile.photo || currentUser.photoURL,
            createdAt: new Date()
        });
        input.value = "";
    } catch (e) { console.log(e); }
};

window.handleCommEnter = (e) => { if (e.key === 'Enter') window.postCommunity(); };

function loadMessages() {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
    onSnapshot(q, (snapshot) => {
        const board = document.getElementById('commMessages');
        if(!board) return;
        board.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = currentUser && msg.uid === currentUser.uid;
            const div = document.createElement('div');
            div.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
            div.style.background = isMe ? 'var(--primary)' : '#222';
            div.style.padding = '10px 15px';
            div.style.borderRadius = '15px';
            div.style.maxWidth = '75%';
            div.style.color = '#fff';
            div.innerHTML = `<small style="display:block; font-size:0.6rem; opacity:0.7;">${isMe ? 'You' : msg.name}</small>${msg.text}`;
            board.appendChild(div);
        });
        board.scrollTop = board.scrollHeight;
    });
}

// PROFILE LOGIC
window.saveProfile = async () => {
    if (!currentUser) return;
    const data = {
        name: document.getElementById('editUsername').value,
        photo: userProfile.photo, // Add avatar logic if needed
    };
    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
    alert("Saved!");
    location.reload();
};

// INITIALIZATION
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) userProfile = docSnap.data();
        
        document.getElementById('profileLoginView').style.display = "none";
        document.getElementById('profileEditView').style.display = "block";
        document.getElementById('topProfileImg').src = userProfile.photo || user.photoURL;
        document.getElementById('editUsername').value = userProfile.name || user.displayName;
    }
    loadMessages();
    startCounters();
});

window.addEventListener("load", () => {
    document.getElementById("preloader").style.display = "none";
});

// TYPING TEXT EFFECT
const words = ["Video Editor", "Photographer", "AI Artist", "DJ / Remixer"];
let i = 0;
function type() {
    const el = document.querySelector('.typing-text');
    if(el) { el.textContent = words[i % words.length]; i++; setTimeout(type, 2000); }
}
type();
