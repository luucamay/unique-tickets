// Mock data utilities for React app
// Adapted from ../../../frontend/mock-data.js

export type MockSeat = {
  seatId: string;
  row: number;
  column: number;
  status: 'available' | 'sold' | 'reserved';
  category: 'VIP' | 'Premium' | 'Standard' | 'Economy';
  price: number;
};

export type MockEvent = {
  name: string;
  venue: string;
  date: string;
  time: string;
  totalRows: number;
  seatsPerRow: number;
  priceMap: {
    [category: string]: {
      rows: number[];
      price: number;
    };
  };
};

// Generate mock seat data (adapted from frontend/mock-data.js)
export function generateMockSeatData(): MockSeat[] {
  const seats: MockSeat[] = [];
        console.warn('API not available, using mock data:', error.message);
        
        // Fall back to mock data
        return {
            event: generateMockEventData(),
            seats: generateMockSeatData()
  const totalRows = 10; // Smaller for testing
  const seatsPerRow = 15;
  
  const priceMap = {
    'VIP': { rows: [1, 2], price: 150 },
    'Premium': { rows: [3, 4, 5], price: 100 },
    'Standard': { rows: [6, 7, 8], price: 75 },
    'Economy': { rows: [9, 10], price: 50 }
  };
  
  function getSeatCategory(row: number): { category: 'VIP' | 'Premium' | 'Standard' | 'Economy'; price: number } {
    for (const [category, config] of Object.entries(priceMap)) {
      if (config.rows.includes(row)) {
        return { category: category as 'VIP' | 'Premium' | 'Standard' | 'Economy', price: config.price };
      }
    }
    return { category: 'Standard', price: 75 };
  }
  
  function generateSeatId(row: number, column: number): string {
    return `R${row.toString().padStart(2, '0')}-S${column.toString().padStart(2, '0')}`;
  }
  
  for (let row = 1; row <= totalRows; row++) {
    for (let column = 1; column <= seatsPerRow; column++) {
      const seatId = generateSeatId(row, column);
      const { category, price } = getSeatCategory(row);
      
      // Randomly make some seats sold/reserved for demo
      let status: 'available' | 'sold' | 'reserved' = 'available';
      const random = Math.random();
      if (random < 0.1) status = 'sold';
      else if (random < 0.15) status = 'reserved';
      
      seats.push({
        seatId,
        row,
        column,
        status,
        category,
        price
      });
    }
  }
  
  return seats;
}

// Generate mock event data (adapted from frontend/mock-data.js)
export function generateMockEventData(): MockEvent {
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

// Transform mock data to App.tsx types
export function transformMockEventToAppEvent(mockEvent: MockEvent): import('../App').Event {
  return {
    id: '1',
    title: mockEvent.name,
    date: mockEvent.date,
    time: mockEvent.time,
    venue: mockEvent.venue,
    location: mockEvent.venue, // Using venue as location since mock doesn't have separate location
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlfGVufDB8fHx8MTczMjU4ODgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: Math.min(...Object.values(mockEvent.priceMap).map(p => p.price)), // Use lowest price as base price
    category: 'festival', // Default category
  };
}

export function transformMockSeatsToAppSeats(mockSeats: MockSeat[]): import('../App').Seat[] {
  return mockSeats
    .filter(seat => seat.status === 'available') // Only include available seats for booking
    .filter(seat => seat.category !== 'Economy') // Filter out economy since App.tsx only supports vip/premium/standard
    .map(seat => ({
      id: seat.seatId,
      row: `R${seat.row.toString().padStart(2, '0')}`,
      number: seat.column,
      type: seat.category.toLowerCase() as 'vip' | 'premium' | 'standard',
      price: seat.price,
      isAvailable: seat.status === 'available',
    }));
}

// Get available seats by category with realistic distribution
export function getAvailableSeatsByCategory(mockSeats: MockSeat[]): {
  vip: MockSeat[];
  premium: MockSeat[];
  standard: MockSeat[];
  economy: MockSeat[];
} {
  const availableSeats = mockSeats.filter(seat => seat.status === 'available');
  
  return {
    vip: availableSeats.filter(seat => seat.category === 'VIP'),
    premium: availableSeats.filter(seat => seat.category === 'Premium'),
    standard: availableSeats.filter(seat => seat.category === 'Standard'),
    economy: availableSeats.filter(seat => seat.category === 'Economy'),
  };
}

// Simulate API call with fallback (like frontend/mock-data.js loadDataWithFallback)
export async function loadDataWithFallback(): Promise<{
  event: MockEvent;
  seats: MockSeat[];
}> {
  try {
    // In a real implementation, this would try to fetch from API first
    // For now, we'll just use mock data directly
    console.warn('Using mock data (API integration not implemented in React app yet)');
    
    return {
      event: generateMockEventData(),
      seats: generateMockSeatData()
    };
  } catch (error) {
    console.warn('Fallback to mock data:', error);
    return {
      event: generateMockEventData(),
      seats: generateMockSeatData()
    };
  }
}