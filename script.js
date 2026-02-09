// --- Page Navigation ---
function showPage(pageId, element) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    // Show selected page
    document.getElementById(pageId).classList.add('active-page');
    
    // Update Menu Icon Color
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if(element) element.classList.add('active');
}

// --- Login Modal ---
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// --- User Logic & Chat ---
let currentUser = "Guest";

function userLogin() {
    const nameInput = document.getElementById('usernameInput').value;
    if(nameInput.trim() !== "") {
        currentUser = nameInput;
        alert("Welcome " + currentUser + "! You can now chat.");
        closeLogin();
        // Go to chat page
        const chatBtn = document.querySelectorAll('.nav-item')[4];
        showPage('chat', chatBtn);
    } else {
        alert("Please enter a name");
    }
}

function sendMessage() {
    const input = document.getElementById('msgInput');
    const area = document.getElementById('messageArea');
    const text = input.value;

    if(text.trim() !== "") {
        // My Message
        area.innerHTML += `
            <div class="message outgoing">
                <p>${text}</p>
            </div>
        `;
        input.value = "";
        area.scrollTop = area.scrollHeight;

        // Auto Reply
        setTimeout(() => {
            area.innerHTML += `
                <div class="message incoming">
                    <p>Thanks ${currentUser}! I'm busy right now, but I'll reply soon.</p>
                </div>
            `;
            area.scrollTop = area.scrollHeight;
        }, 1000);
    }
}

// --- Community Post ---
function postToCommunity() {
    const input = document.getElementById('communityInput');
    const board = document.getElementById('communityBoard');
    const text = input.value;

    if(text.trim() !== "") {
        board.innerHTML = `
            <div class="post">
                <div class="post-header"><strong>${currentUser}</strong> <span>Just Now</span></div>
                <p>${text}</p>
            </div>
        ` + board.innerHTML;
        input.value = "";
    }
}