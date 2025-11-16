// Seat map generation and management

// Generate the interactive seat map
function generateSeatMap(seats) {
    const seatMapElement = document.getElementById('seat-map');
    
    if (!seats || seats.length === 0) {
        seatMapElement.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load seat map. Please refresh the page.</p>
            </div>
        `;
        return;
    }
    
    // Store seats data globally for other functions
    window.seatData = seats;
    
    // Clear loading message
    seatMapElement.innerHTML = '';
    
    // Group seats by row
    const seatsByRow = groupSeatsByRow(seats);
    const totalRows = Math.max(...Object.keys(seatsByRow).map(Number));
    
    // Create row elements
    for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
        const rowElement = createRowElement(rowNumber, seatsByRow[rowNumber] || []);
        seatMapElement.appendChild(rowElement);
    }
}

// Group seats by row number
function groupSeatsByRow(seats) {
    return seats.reduce((groups, seat) => {
        const row = seat.row;
        if (!groups[row]) {
            groups[row] = [];
        }
        groups[row].push(seat);
        return groups;
    }, {});
}

// Create a single row element
function createRowElement(rowNumber, rowSeats) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'seat-row';
    rowDiv.setAttribute('data-row', rowNumber);
    
    // Row label
    const rowLabel = document.createElement('div');
    rowLabel.className = 'row-label';
    rowLabel.textContent = rowNumber;
    rowDiv.appendChild(rowLabel);
    
    // Seats container
    const seatsContainer = document.createElement('div');
    seatsContainer.className = 'seats-container';
    
    // Sort seats by column
    rowSeats.sort((a, b) => a.column - b.column);
    
    // Add aisle breaks for better visual organization
    const seatsPerSection = Math.ceil(rowSeats.length / 3);
    
    rowSeats.forEach((seat, index) => {
        // Add aisle space
        if (index > 0 && index % seatsPerSection === 0) {
            const aisle = document.createElement('div');
            aisle.className = 'aisle';
            seatsContainer.appendChild(aisle);
        }
        
        const seatElement = createSeatElement(seat);
        seatsContainer.appendChild(seatElement);
    });
    
    rowDiv.appendChild(seatsContainer);
    
    // Row label (right side)
    const rowLabelRight = document.createElement('div');
    rowLabelRight.className = 'row-label row-label-right';
    rowLabelRight.textContent = rowNumber;
    rowDiv.appendChild(rowLabelRight);
    
    return rowDiv;
}

// Create a single seat element
function createSeatElement(seatData) {
    const seatElement = document.createElement('div');
    seatElement.className = `seat ${seatData.status} ${seatData.category.toLowerCase()}`;
    seatElement.setAttribute('data-seat-id', seatData.seatId);
    seatElement.setAttribute('data-row', seatData.row);
    seatElement.setAttribute('data-column', seatData.column);
    seatElement.setAttribute('data-price', seatData.price);
    seatElement.setAttribute('data-category', seatData.category);
    
    // Seat content
    seatElement.innerHTML = `
        <span class="seat-number">${seatData.column}</span>
        <div class="seat-tooltip">
            <div class="tooltip-content">
                <strong>${seatData.seatId}</strong><br>
                ${seatData.category} - $${seatData.price}<br>
                Status: ${seatData.status.charAt(0).toUpperCase() + seatData.status.slice(1)}
            </div>
        </div>
    `;
    
    // Add click handler for available seats
    if (seatData.status === 'available') {
        seatElement.addEventListener('click', () => {
            window.handleSeatClick(seatElement, seatData);
        });
        
        // Add hover effects
        seatElement.addEventListener('mouseenter', () => {
            if (!seatElement.classList.contains('selected')) {
                seatElement.classList.add('hover');
            }
        });
        
        seatElement.addEventListener('mouseleave', () => {
            seatElement.classList.remove('hover');
        });
    }
    
    return seatElement;
}

// Update seat status in real-time
function updateSeatStatus(seatId, newStatus) {
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (seatElement) {
        // Remove old status classes
        seatElement.classList.remove('available', 'selected', 'reserved', 'sold');
        // Add new status class
        seatElement.classList.add(newStatus);
        
        // Update data attribute
        seatElement.setAttribute('data-status', newStatus);
        
        // Update tooltip
        const tooltip = seatElement.querySelector('.tooltip-content');
        if (tooltip) {
            const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            const content = tooltip.innerHTML.replace(/Status: \w+/i, `Status: ${statusText}`);
            tooltip.innerHTML = content;
        }
        
        // Remove click handler if no longer available
        if (newStatus !== 'available') {
            seatElement.style.pointerEvents = 'none';
        } else {
            seatElement.style.pointerEvents = 'auto';
        }
    }
}

// Highlight seats by category
function highlightCategory(category) {
    document.querySelectorAll('.seat').forEach(seat => {
        if (seat.getAttribute('data-category').toLowerCase() === category.toLowerCase()) {
            seat.classList.add('highlight');
        } else {
            seat.classList.remove('highlight');
        }
    });
}

// Remove all highlights
function clearHighlights() {
    document.querySelectorAll('.seat').forEach(seat => {
        seat.classList.remove('highlight');
    });
}

// Get seat statistics
function getSeatStatistics() {
    const seats = window.seatData || [];
    const stats = {
        total: seats.length,
        available: 0,
        selected: 0,
        reserved: 0,
        sold: 0,
        byCategory: {}
    };
    
    seats.forEach(seat => {
        stats[seat.status]++;
        
        if (!stats.byCategory[seat.category]) {
            stats.byCategory[seat.category] = {
                total: 0,
                available: 0,
                selected: 0,
                reserved: 0,
                sold: 0
            };
        }
        
        stats.byCategory[seat.category].total++;
        stats.byCategory[seat.category][seat.status]++;
    });
    
    return stats;
}

// Auto-select best available seats
function autoSelectSeats(count, category = null) {
    const seats = window.seatData || [];
    const availableSeats = seats.filter(seat => {
        if (seat.status !== 'available') return false;
        if (category && seat.category.toLowerCase() !== category.toLowerCase()) return false;
        return true;
    });
    
    if (availableSeats.length < count) {
        window.showError(`Only ${availableSeats.length} seats available in the requested category.`);
        return;
    }
    
    // Sort by price (ascending) and row (ascending) for best value
    availableSeats.sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        return a.row - b.row;
    });
    
    // Clear current selection
    window.clearSelection();
    
    // Select the best seats
    for (let i = 0; i < count && i < availableSeats.length; i++) {
        const seat = availableSeats[i];
        const seatElement = document.querySelector(`[data-seat-id="${seat.seatId}"]`);
        if (seatElement) {
            window.handleSeatClick(seatElement, seat);
        }
    }
}

// Keyboard navigation support
function setupKeyboardNavigation() {
    let focusedSeat = null;
    
    document.addEventListener('keydown', (event) => {
        if (!focusedSeat) {
            // Focus on first available seat
            const firstAvailable = document.querySelector('.seat.available');
            if (firstAvailable) {
                focusedSeat = firstAvailable;
                focusedSeat.classList.add('keyboard-focus');
            }
            return;
        }
        
        const currentRow = parseInt(focusedSeat.getAttribute('data-row'));
        const currentColumn = parseInt(focusedSeat.getAttribute('data-column'));
        
        let newRow = currentRow;
        let newColumn = currentColumn;
        
        switch (event.key) {
            case 'ArrowUp':
                newRow = Math.max(1, currentRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(window.eventData?.totalRows || 20, currentRow + 1);
                break;
            case 'ArrowLeft':
                newColumn = Math.max(1, currentColumn - 1);
                break;
            case 'ArrowRight':
                newColumn = Math.min(window.eventData?.seatsPerRow || 25, currentColumn + 1);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (focusedSeat.classList.contains('available')) {
                    focusedSeat.click();
                }
                return;
            default:
                return;
        }
        
        event.preventDefault();
        
        // Find the new seat to focus
        const newSeat = document.querySelector(`[data-row="${newRow}"][data-column="${newColumn}"]`);
        if (newSeat) {
            focusedSeat.classList.remove('keyboard-focus');
            focusedSeat = newSeat;
            focusedSeat.classList.add('keyboard-focus');
            focusedSeat.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Initialize seat map when called from main script
window.generateSeatMap = generateSeatMap;
window.updateSeatStatus = updateSeatStatus;
window.highlightCategory = highlightCategory;
window.clearHighlights = clearHighlights;
window.getSeatStatistics = getSeatStatistics;
window.autoSelectSeats = autoSelectSeats;

// Setup keyboard navigation on load
document.addEventListener('DOMContentLoaded', () => {
    setupKeyboardNavigation();
});