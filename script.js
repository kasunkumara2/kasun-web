// --- API CONFIG (Direct Fetch Fix) ---
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 

// --- 1. PRELOADER & COUNTERS ---
window.addEventListener("load", function() {
    const loader = document.getElementById("preloader");
    setTimeout(function() { 
        loader.style.display = "none";
        
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / 100;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target + "+";
                }
            };
            updateCount();
        });

    }, 1500);
});

// --- 2. MAGIC CURSOR ---
const cursor = document.querySelector(".cursor");
const cursor2 = document.querySelector(".cursor2");
document.addEventListener("mousemove", function(e) {
    cursor.style.cssText = cursor2.style.cssText = "left: " + e.clientX + "px; top: " + e.clientY + "px;";
});

// --- 3. AUTO TYPING ---
const textElement = document.querySelector(".typing-text");
if(textElement) {
    const words = ["Video Editor", "Photographer", "AI Artist", "DJ & Remixer"];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    function typeEffect() {
        const currentWord = words[wordIndex];
        if (isDeleting) textElement.textContent = currentWord.substring(0, charIndex--);
        else textElement.textContent = currentWord.substring(0, charIndex++);
        
        let typeSpeed = isDeleting ? 100 : 200;
        if (!isDeleting && charIndex === currentWord.length) { isDeleting = true; typeSpeed = 2000; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; typeSpeed = 500; }
        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();
}

// --- 4. 3D TILT EFFECT ---
document.addEventListener('mousemove', function(e) {
    document.querySelectorAll('.glass-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            const rotateX = ((y - rect.height/2) / (rect.height/2)) * -2; // අඩු කරා -2 ට
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 2;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        }
    });
});

// --- 5. AI CHAT (FIXED FETCH METHOD) ---
window.askGeminiAI = async function() {
    const input = document.getElementById('aiInput');
    const msgArea = document.getElementById('aiMessages');
    const sendBtn = document.getElementById('sendBtn');
    const userText = input.value.trim();

    if (userText === "") return;
    
    // User Message
    msgArea.innerHTML += `<div class="msg user-msg">${userText}</div>`;
    input.value = ""; 
    msgArea.scrollTop = msgArea.scrollHeight;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    sendBtn.disabled = true;

    // Direct API Call (Fixes SDK Errors)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "You are Kasun AI. You speak Singlish or English. Keep it short. User asks: " + userText
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            msgArea.innerHTML += `<div class="msg bot-msg">${text}</div>`;
        } else {
            msgArea.innerHTML += `<div class="msg bot-msg">Mata therune na machan. Aaye kiyanna.</div>`;
        }

    } catch (error) {
        console.error("AI Error:", error);
        msgArea.innerHTML += `<div class="msg bot-msg" style="color:red;">Internet aulak wage. Please check.</div>`;
    }

    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>'; 
    sendBtn.disabled = false; 
    msgArea.scrollTop = msgArea.scrollHeight;
}

// --- 6. COMMUNITY (WhatsApp Style) ---
window.postToCommunity = function() {
    const input = document.getElementById('communityInput');
    const board = document.getElementById('communityBoard');
    const text = input.value.trim();
    
    if(text !== "") {
        // Get current time
        const now = new Date();
        const time = now.getHours() + ":" + (now.getMinutes()<10?'0':'') + now.getMinutes();
        
        const newMsg = `
            <div class="wa-msg sent">
                <div class="sender-name">You</div>
                <div class="msg-text">${text}</div>
                <div class="msg-time">${time}</div>
            </div>
        `;
        board.innerHTML += newMsg;
        input.value = "";
        board.scrollTop = board.scrollHeight; // Scroll to bottom
    }
}

// --- STANDARD FUNCTIONS ---
window.showPage = function(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(element) element.classList.add('active');
}
window.toggleAIChat = function() {
    const box = document.getElementById('aiChatBox');
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
    if(box.style.display === 'flex') document.getElementById('aiInput').focus();
}
window.toggleTawkChat = function() {
    if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading...");
}
window.openLogin = function() { document.getElementById('loginModal').style.display = 'flex'; }
window.closeLogin = function() { document.getElementById('loginModal').style.display = 'none'; }
window.userLogin = function() { if(document.getElementById('usernameInput').value) { closeLogin(); } }
window.handleEnter = function(e) { if (e.key === 'Enter') window.askGeminiAI(); }
