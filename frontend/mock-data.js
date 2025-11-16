// Mock seat data for development/testing
function generateMockSeatData() {
    const seats = [];
    const totalRows = 10; // Smaller for testing
    const seatsPerRow = 15;
    
    const priceMap = {
        'VIP': { rows: [1, 2], price: 150 },
        'Premium': { rows: [3, 4, 5], price: 100 },
        'Standard': { rows: [6, 7, 8], price: 75 },
        'Economy': { rows: [9, 10], price: 50 }
    };
    
    function getSeatCategory(row) {
        for (const [category, config] of Object.entries(priceMap)) {
            if (config.rows.includes(row)) {
                return { category, price: config.price };
            }
        }
        return { category: 'Standard', price: 75 };
    }
    
    function generateSeatId(row, column) {
        return `R${row.toString().padStart(2, '0')}-S${column.toString().padStart(2, '0')}`;
    }
    
    for (let row = 1; row <= totalRows; row++) {
        for (let column = 1; column <= seatsPerRow; column++) {
            const seatId = generateSeatId(row, column);
            const { category, price } = getSeatCategory(row);
            
            // Randomly make some seats sold/reserved for demo
            let status = 'available';
            const random = Math.random();
            if (random < 0.1) status = 'sold';
            else if (random < 0.15) status = 'reserved';
            
            seats.push({
                seatId: seatId,
                row: row,
                column: column,
                status: status,
                category: category,
                price: price
            });
        }
    }
    
    return seats;
}

// Mock event data
function generateMockEventData() {
    return {
        name: "Arkiv Conference 2025",
        venue: "Tech Convention Center",
        date: "2025-12-15",
        time: "10:00 AM",
        totalRows: 10,
        seatsPerRow: 15,
        priceMap: {
            'VIP': { rows: [1, 2], price: 150 },
            'Premium': { rows: [3, 4, 5], price: 100 },
            'Standard': { rows: [6, 7, 8], price: 75 },
            'Economy': { rows: [9, 10], price: 50 }
        }
    };
}

// Function to use mock data if API is not available
async function loadDataWithFallback() {
    try {
        // Try to load from API first
        const response = await fetch(`${API_BASE_URL}/api/event`);
        if (!response.ok) throw new Error('API not available');
        
        const eventData = await response.json();
        const seatsResponse = await fetch(`${API_BASE_URL}/api/seats`);
        const seatsData = await seatsResponse.json();
        
        return {
            event: eventData.event,
            seats: seatsData.seats
        };
    } catch (error) {
        console.warn('API not available, using mock data:', error.message);
        
        // Fall back to mock data
        return {
            event: generateMockEventData(),
            seats: generateMockSeatData()
        };
    }
}

// Make functions available globally
window.generateMockSeatData = generateMockSeatData;
window.generateMockEventData = generateMockEventData;
window.loadDataWithFallback = loadDataWithFallback;