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
let selectedAvatarURL = ""; 

// --- AUTH ---
window.googleLogin = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.facebookLogin = () => signInWithPopup(auth, facebookProvider).catch(e => alert(e.message));
window.googleLogout = () => signOut(auth).then(() => location.reload());

window.toggleProfileAuth = (mode) => {
    document.getElementById('btnSignIn').classList.toggle('active', mode === 'signin');
    document.getElementById('btnSignUp').classList.toggle('active', mode === 'signup');
    document.getElementById('actionBtn').innerText = (mode === 'signin') ? "Login" : "Register";
}

onAuthStateChanged(auth, async (user) => {
    const loginView = document.getElementById('profileLoginView');
    const editView = document.getElementById('profileEditView');
    const topIcon = document.getElementById('topProfileImg');

    if (user) {
        currentUser = user;
        if(loginView) loginView.style.display = "none";
        if(editView) editView.style.display = "block";

        let data = {
            name: user.displayName || "User",
            photo: user.photoURL || "https://img.icons8.com/color/96/user.png",
            phone: "", city: "", country: "", address: "", gender: "Male"
        };

        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) data = { ...data, ...docSnap.data() }; 
        } catch (e) { console.log(e); }

        userProfile = data;
        selectedAvatarURL = data.photo;
        document.getElementById('editProfilePic').src = data.photo;
        document.getElementById('editUsername').value = data.name;
        if(topIcon) topIcon.src = data.photo;
        
        loadMessages();
    } else {
        currentUser = null;
        if(loginView) loginView.style.display = "block";
        if(editView) editView.style.display = "none";
    }
});

// --- CHAT LOGIC (FIXED) ---
window.postCommunity = async () => {
    if (!currentUser) { alert("Login first!"); return; }
    const input = document.getElementById('commInput');
    const text = input.value.trim();
    if (text !== "") {
        await addDoc(collection(db, "messages"), {
            text: text, 
            uid: currentUser.uid, 
            name: userProfile.name || "Anonymous", 
            photo: userProfile.photo || "https://img.icons8.com/color/96/user.png", 
            createdAt: new Date()
        });
        input.value = "";
    }
}
window.handleCommEnter = (e) => { if (e.key === 'Enter') window.postCommunity(); }

function loadMessages() {
    // දිනය අනුව පෝලිම් කරනවා
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
    
    onSnapshot(q, (snapshot) => {
        const board = document.getElementById('commMessages');
        board.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = currentUser && msg.uid === currentUser.uid;
            
            // පින්තූරයක් නැත්නම් Default එකක් දානවා (FIX)
            const userImg = msg.photo || "https://img.icons8.com/color/96/user.png";
            
            const div = document.createElement('div');
            div.className = `msg-container`;
            div.style.display = "flex";
            div.style.flexDirection = "column";
            div.innerHTML = `
                <div class="msg-info ${isMe ? 'sent' : 'received'}" style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; display: flex; align-items: center; gap: 5px;">
                    ${isMe ? '' : `<img src="${userImg}" style="width:25px; height:25px; border-radius:50%; object-fit:cover;">`} 
                    <span style="font-size:0.7rem; color:#aaa;">${isMe ? 'You' : (msg.name || "User")}</span>
                </div>
                <div class="msg ${isMe ? 'sent' : 'received'}" style="padding:8px 12px; border-radius:15px; margin:2px 0; max-width:70%; ${isMe ? 'background:var(--primary); align-self:flex-end; color:white;' : 'background:#333; align-self:flex-start; color:white;'}">${msg.text}</div>
            `;
            board.appendChild(div);
        });
        board.scrollTop = board.scrollHeight;
    });
}

// --- OTHER UTILS ---
window.selectAvatar = (url) => { selectedAvatarURL = url; document.getElementById('editProfilePic').src = url; }
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
    await setDoc(doc(db, "users", currentUser.uid), newData, { merge: true });
    alert("Saved!"); location.reload();
}

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

window.addEventListener("load", () => {
    document.getElementById("preloader").style.display = "none";
});

// Cursor
document.addEventListener('mousemove', (e) => {
    const dot = document.querySelector('.cursor-dot');
    const blob = document.querySelector('.cursor-blob');
    if(dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; }
    if(blob) { blob.style.left = e.clientX + 'px'; blob.style.top = e.clientY + 'px'; }
});
