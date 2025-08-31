// =========================
// E-Waste Marketplace Dashboard JavaScript
// =========================

// ====== DOM Element Shortcuts ======
const postBtn = document.querySelector('.ew-post-btn');                     // "+ Post New Item" button
const grid = document.querySelector('.ew-grid');                            // Container for all item cards
const navProfile = document.querySelector('.nav-profile');                  // Top-right profile section
const navLinks = document.querySelectorAll('.nav-links a');                 // Navigation bar links

// --- Modals (popups) and their sub-elements ---
const postItemModal = document.getElementById('postItemModal');             // Modal: Post new item
const postItemForm = document.getElementById('postItemForm');               // Form inside post modal
const closeModalBtn = document.querySelector('.ew-close');                  // X button in post modal

const claimModal = document.getElementById('claimModal');                   // Modal: Claim item confirmation
const claimModalMsg = document.getElementById('claimModalMsg');             // Text prompt for claim confirmation
const claimModalClose = document.getElementById('claimModalClose');         // X button for claim modal
const claimCancelBtn = document.getElementById('claimCancelBtn');           // Cancel button in claim modal
const claimConfirmBtn = document.getElementById('claimConfirmBtn');         // Confirm button in claim modal

const successModal = document.getElementById('successModal');               // Modal: Success feedback
const successModalMsg = document.getElementById('successModalMsg');         // Text content for success modal
const successModalClose = document.getElementById('successModalClose');     // X button in success modal
const successOkBtn = document.getElementById('successOkBtn');               // OK button in success modal

// ====== In-memory Data (Resets on Reload) ======
let items = [
    {
        image: 'ElectricFan.jpg',
        title: 'Electric Fan',
        desc: 'Working condition, just upgraded. Free for pickup.',
        claimed: false,
    },
    {
        image: 'Redmagic.jpg',
        title: 'Smartphone',
        desc: 'Minor scratches, battery still OK. Available for trade or free.',
        claimed: false,
    },
    {
        image: 'Printer.jpg',
        title: 'Printer',
        desc: 'Needs ink refill. Good for parts or repair.',
        claimed: false,
    },
    {
        image: 'JblSpeaker.jpg',
        title: 'Bluetooth Speaker',
        desc: 'Still works, some cosmetic wear.',
        claimed: false,
    }
];

// Simulated user profile
let user = { name: 'User', avatar: 'DefaultPfp.jpg' };

let currentFilter = ''; // Used for search and navigation
let claimIdx = null;    // Index of the item being claimed (for modal)

// ====== UI Rendering Functions ======

// Render the top-right user profile section
function renderProfile() {
    navProfile.innerHTML = `
        <img src="${user.avatar}" alt="User" />
        <span>Hello, ${user.name}</span>
    `;
}

// Render all item cards in the grid, optionally filtered by search term
function renderItems(filter = '') {
    grid.innerHTML = ''; // Clear current cards

    // Filter items by search term (if any)
    const filtered = items.filter(item =>
        item.title.toLowerCase().includes(filter) ||
        item.desc.toLowerCase().includes(filter)
    );

    // If no items found, show a message
    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No items found.</p>`;
        return;
    }

    // Render each item card
    filtered.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'ew-item-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" />
            <h2>${item.title}</h2>
            <p>${item.desc}</p>
            <button class="ew-claim-btn" data-idx="${idx}" ${item.claimed ? 'disabled' : ''}>
                ${item.claimed ? 'Claimed' : 'Claim Item'}
            </button>
        `;
        grid.appendChild(card);
    });
}

// ====== Modal UI Feedback Functions ======

// Show the "Success" modal with HTML content (used for feedback and tips)
function showSuccess(msgHtml) {
    successModalMsg.innerHTML = msgHtml;
    successModal.style.display = 'flex';
}

// ====== Claim Item Flow ======

// Listen for clicks on "Claim Item" buttons in the grid
grid.addEventListener('click', function (e) {
    if (e.target.classList.contains('ew-claim-btn')) {
        claimIdx = +e.target.getAttribute('data-idx');
        if (items[claimIdx].claimed) return;
        // Show claim confirmation modal
        claimModalMsg.textContent = `Do you want to claim "${items[claimIdx].title}"?`;
        claimModal.style.display = 'flex';
    }
});

// Claim modal controls
claimModalClose.onclick = () => claimModal.style.display = 'none';
claimCancelBtn.onclick = () => claimModal.style.display = 'none';
claimConfirmBtn.onclick = () => {
    if (claimIdx === null) return;
    items[claimIdx].claimed = true;
    renderItems(currentFilter);
    claimModal.style.display = 'none';
    showSuccess('Item claimed! The owner will contact you soon.');
};

// Close modals if user clicks on background overlay
window.addEventListener('click', function(e) {
    if (e.target === claimModal) claimModal.style.display = 'none';
    if (e.target === successModal) successModal.style.display = 'none';
});

// Success modal controls
successModalClose.onclick = () => successModal.style.display = 'none';
successOkBtn.onclick = () => successModal.style.display = 'none';

// ====== Add New Item Flow ======

// Show the "Post New Item" modal when button is clicked
postBtn.addEventListener('click', function () {
    postItemModal.style.display = 'flex';
    postItemForm.reset();
});

// Close the post modal when user clicks X
if (closeModalBtn && postItemModal) {
    closeModalBtn.onclick = () => postItemModal.style.display = 'none';
}

// Handle submission of the post new item form
if (postItemForm) {
    postItemForm.onsubmit = (e) => {
        e.preventDefault();
        const title = postItemForm.title.value.trim();
        const desc = postItemForm.desc.value.trim();
        const image = postItemForm.image.value.trim() || 'ElectricFan.jpg';
        if (!title || !desc) return;
        items.unshift({ image, title, desc, claimed: false });
        renderItems(currentFilter);
        postItemModal.style.display = 'none';
        showSuccess('Your item has been posted!');
    };
}

// ====== Navigation Bar Links ======
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const page = link.textContent.trim();

        if (page === 'Home' || page === 'Browse') {
            // Show all items
            currentFilter = '';
            renderItems('');
        } else if (page === 'My Items') {
            // Show all items but dim claimed ones
            renderItems('');
            setTimeout(() => {
                Array.from(grid.children).forEach((card, idx) => {
                    if (items[idx].claimed) card.style.opacity = '0.6';
                });
            }, 10);
        } else if (page === 'Tips') {
            // Show tips using the success modal
            showSuccess(
                `E-Waste Tips:
                <ul style="margin-top:8px;text-align:left;">
                  <li>Donate usable electronics!</li>
                  <li>Recycle e-waste at certified centers.</li>
                  <li>Wipe personal data before giving away devices.</li>
                </ul>`
            );
        }
    });
});

// ====== Simple Search (Ctrl+F or Cmd+F) ======
document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const q = prompt('Search for an item:');
        if (q !== null) {
            currentFilter = q.trim().toLowerCase();
            renderItems(currentFilter);
        }
    }
});

// ====== Initial Render ======
renderProfile();
renderItems();