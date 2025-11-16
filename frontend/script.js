// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// Global state
let eventData = null;
let seatData = [];
let selectedSeats = new Set();
let reservationData = null;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Try to load data with fallback to mock data
        if (window.loadDataWithFallback) {
            const data = await window.loadDataWithFallback();
            eventData = data.event;
            seatData = data.seats;
            
            // Make data globally available
            window.seatData = seatData;
            window.eventData = eventData;
            
            // Display the loaded data
            displayEventInfo();
            displayPriceCategories();
            window.generateSeatMap(seatData);
        } else {
            // Original loading method
            await loadEventData();
            await loadSeatData();
        }
        
        setupEventListeners();
        console.log('Ticket management system initialized with', seatData.length, 'seats');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load ticket system. Please refresh the page.');
    }
});

// Load event information
async function loadEventData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/event`);
        const data = await response.json();
        
        if (data.success) {
            eventData = data.event;
            displayEventInfo();
            displayPriceCategories();
        } else {
            throw new Error(data.error || 'Failed to load event data');
        }
    } catch (error) {
        console.error('Error loading event data:', error);
        throw error;
    }
}

// Load seat data
async function loadSeatData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/seats`);
        const data = await response.json();
        
        if (data.success) {
            seatData = data.seats;
            // Make data globally available for other modules
            window.seatData = seatData;
            window.eventData = eventData;
            // Generate seat map with the loaded data
            window.generateSeatMap(seatData);
        } else {
            throw new Error(data.error || 'Failed to load seat data');
        }
    } catch (error) {
        console.error('Error loading seat data:', error);
        throw error;
    }
}

// Display event information
function displayEventInfo() {
    const eventInfoElement = document.getElementById('event-info');
    const date = new Date(eventData.date);
    
    eventInfoElement.innerHTML = `
        <h2>${eventData.name}</h2>
        <div class="event-details">
            <p><i class="fas fa-map-marker-alt"></i> ${eventData.venue}</p>
            <p><i class="fas fa-calendar"></i> ${date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
            <p><i class="fas fa-clock"></i> ${eventData.time}</p>
        </div>
    `;
}

// Display price categories
function displayPriceCategories() {
    const priceContainer = document.getElementById('price-categories');
    
    const priceHtml = Object.entries(eventData.priceMap)
        .map(([category, info]) => `
            <div class="price-category ${category.toLowerCase()}">
                <span class="category-name">${category}</span>
                <span class="category-price">$${info.price}</span>
                <span class="category-rows">Rows ${info.rows.join(', ')}</span>
            </div>
        `).join('');
    
    priceContainer.innerHTML = priceHtml;
}

// Handle seat selection
function handleSeatClick(seatElement, seatData) {
    const seatId = seatData.seatId;
    
    if (seatData.status !== 'available') {
        return; // Cannot select unavailable seats
    }
    
    if (selectedSeats.has(seatId)) {
        // Deselect seat
        selectedSeats.delete(seatId);
        seatElement.classList.remove('selected');
    } else {
        // Select seat
        selectedSeats.add(seatId);
        seatElement.classList.add('selected');
    }
    
    updateSelectionSummary();
}

// Update selection summary
function updateSelectionSummary() {
    const summaryElement = document.getElementById('selection-summary');
    const selectedSeatsElement = document.getElementById('selected-seats');
    const totalPriceElement = document.getElementById('total-price');
    
    if (selectedSeats.size === 0) {
        summaryElement.style.display = 'none';
        return;
    }
    
    summaryElement.style.display = 'block';
    
    let totalPrice = 0;
    const selectedSeatData = Array.from(selectedSeats).map(seatId => {
        const seat = seatData.find(s => s.seatId === seatId);
        if (seat) {
            totalPrice += seat.price;
        }
        return seat;
    }).filter(Boolean);
    
    const seatsHtml = selectedSeatData.map(seat => `
        <div class="selected-seat-item">
            <span class="seat-id">${seat.seatId}</span>
            <span class="seat-category">${seat.category}</span>
            <span class="seat-price">$${seat.price}</span>
        </div>
    `).join('');
    
    selectedSeatsElement.innerHTML = seatsHtml;
    totalPriceElement.textContent = totalPrice;
}

// Clear selection
function clearSelection() {
    selectedSeats.clear();
    
    // Remove selected class from all seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    updateSelectionSummary();
}

// Proceed to checkout
function proceedToCheckout() {
    if (selectedSeats.size === 0) {
        showError('Please select at least one seat.');
        return;
    }
    
    showPurchaseModal();
}

// Show purchase modal
function showPurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    const purchaseSeatsElement = document.getElementById('purchase-seats');
    const purchaseTotalElement = document.getElementById('purchase-total');
    
    let totalPrice = 0;
    const selectedSeatData = Array.from(selectedSeats).map(seatId => {
        const seat = seatData.find(s => s.seatId === seatId);
        if (seat) {
            totalPrice += seat.price;
        }
        return seat;
    }).filter(Boolean);
    
    const seatsHtml = selectedSeatData.map(seat => `
        <div class="purchase-seat-item">
            <span>${seat.seatId} - ${seat.category} - $${seat.price}</span>
        </div>
    `).join('');
    
    purchaseSeatsElement.innerHTML = seatsHtml;
    purchaseTotalElement.textContent = totalPrice;
    
    modal.style.display = 'flex';
}

// Close purchase modal
function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    modal.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Purchase form submission
    const purchaseForm = document.getElementById('purchase-form');
    purchaseForm.addEventListener('submit', handlePurchase);
    
    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Handle purchase form submission
async function handlePurchase(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const customerInfo = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    const paymentInfo = {
        method: 'credit_card',
        cardNumber: formData.get('cardNumber'),
        expiry: formData.get('expiry'),
        cvv: formData.get('cvv'),
        amount: Array.from(selectedSeats).reduce((total, seatId) => {
            const seat = seatData.find(s => s.seatId === seatId);
            return total + (seat ? seat.price : 0);
        }, 0)
    };
    
    try {
        showLoading(true);
        
        // First, reserve the seats
        const reserveResponse = await fetch(`${API_BASE_URL}/api/seats/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seatIds: Array.from(selectedSeats),
                customerInfo: customerInfo
            })
        });
        
        const reserveData = await reserveResponse.json();
        
        if (!reserveData.success) {
            throw new Error(reserveData.error || 'Failed to reserve seats');
        }
        
        // Then, complete the purchase
        const purchaseResponse = await fetch(`${API_BASE_URL}/api/tickets/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservationId: reserveData.reservationId,
                paymentInfo: paymentInfo,
                customerInfo: customerInfo
            })
        });
        
        const purchaseData = await purchaseResponse.json();
        
        if (!purchaseData.success) {
            throw new Error(purchaseData.error || 'Failed to complete purchase');
        }
        
        // Show success
        showPurchaseSuccess(purchaseData);
        
    } catch (error) {
        console.error('Purchase error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Show purchase success
function showPurchaseSuccess(purchaseData) {
    closePurchaseModal();
    
    const modal = document.getElementById('success-modal');
    const ticketIdElement = document.getElementById('ticket-id');
    const transactionIdElement = document.getElementById('transaction-id');
    
    ticketIdElement.textContent = purchaseData.ticketId;
    transactionIdElement.textContent = purchaseData.transactionId;
    
    modal.style.display = 'flex';
}

// Download ticket (placeholder)
function downloadTicket() {
    // In a real implementation, this would generate a PDF ticket
    showInfo('Ticket download feature coming soon! Check your email for confirmation.');
}

// Reset booking
function resetBooking() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'none';
    
    clearSelection();
    
    // Reset form
    const form = document.getElementById('purchase-form');
    form.reset();
    
    // Refresh seat data
    loadSeatData();
}

// Utility functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    alert('Error: ' + message); // In production, use a proper toast/notification system
}

function showInfo(message) {
    alert('Info: ' + message); // In production, use a proper toast/notification system
}

// Export functions for global access
window.clearSelection = clearSelection;
window.proceedToCheckout = proceedToCheckout;
window.closePurchaseModal = closePurchaseModal;
window.downloadTicket = downloadTicket;
window.resetBooking = resetBooking;
window.handleSeatClick = handleSeatClick;