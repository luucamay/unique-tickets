import { createWalletClient, http } from '@arkiv-network/sdk';
import { mendoza } from '@arkiv-network/sdk/chains';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { ExpirationTime, jsonToPayload } from '@arkiv-network/sdk/utils';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set in the .env file.");
}

// Initialize Arkiv client
const account = privateKeyToAccount(privateKey);
const client = createWalletClient({
  chain: mendoza,
  transport: http(),
  account: account,
});

console.log(`Ticket Management Backend connected as: ${client.account.address}`);

// Express server setup
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Event configuration (in production, this could be a database)
const EVENT_CONFIG = {
  name: "Arkiv Conference 2025",
  venue: "Tech Convention Center",
  date: "2025-12-15",
  time: "10:00 AM",
  totalRows: 20,
  seatsPerRow: 25,
  priceMap: {
    // Front rows are more expensive
    'VIP': { rows: [1, 2, 3], price: 150 },
    'Premium': { rows: [4, 5, 6, 7, 8], price: 100 },
    'Standard': { rows: [9, 10, 11, 12, 13, 14, 15], price: 75 },
    'Economy': { rows: [16, 17, 18, 19, 20], price: 50 }
  }
};

// Helper function to get seat price
function getSeatPrice(row) {
  for (const [category, config] of Object.entries(EVENT_CONFIG.priceMap)) {
    if (config.rows.includes(row)) {
      return { category, price: config.price };
    }
  }
  return { category: 'Standard', price: 75 };
}

// Helper function to generate seat ID
function generateSeatId(row, column) {
  return `R${row.toString().padStart(2, '0')}-S${column.toString().padStart(2, '0')}`;
}

// Initialize event seating on Arkiv blockchain
async function initializeEvent() {
  try {
    console.log('Initializing event seating...');
    
    // Create event record
    const eventPayload = {
      payload: jsonToPayload({
        eventType: 'event_info',
        name: EVENT_CONFIG.name,
        venue: EVENT_CONFIG.venue,
        date: EVENT_CONFIG.date,
        time: EVENT_CONFIG.time,
        totalSeats: EVENT_CONFIG.totalRows * EVENT_CONFIG.seatsPerRow,
        priceCategories: EVENT_CONFIG.priceMap,
        timestamp: Date.now()
      }),
      contentType: 'application/json',
      attributes: [
        { key: 'type', value: 'event' },
        { key: 'status', value: 'active' }
      ],
      expiresIn: ExpirationTime.fromDays(30) // Event data expires in 30 days
    };

    // Initialize all seats as available
    const seatPayloads = [];
    for (let row = 1; row <= EVENT_CONFIG.totalRows; row++) {
      for (let column = 1; column <= EVENT_CONFIG.seatsPerRow; column++) {
        const seatId = generateSeatId(row, column);
        const { category, price } = getSeatPrice(row);
        
        seatPayloads.push({
          payload: jsonToPayload({
            seatType: 'seat_status',
            seatId: seatId,
            row: row,
            column: column,
            status: 'available',
            category: category,
            price: price,
            timestamp: Date.now()
          }),
          contentType: 'application/json',
          attributes: [
            { key: 'type', value: 'seat' },
            { key: 'seatId', value: seatId },
            { key: 'row', value: row.toString() },
            { key: 'status', value: 'available' }
          ],
          expiresIn: ExpirationTime.fromDays(30)
        });
      }
    }

    // Create all entities in batches (Arkiv has limits on batch size)
    const batchSize = 50;
    const allPayloads = [eventPayload, ...seatPayloads];
    
    for (let i = 0; i < allPayloads.length; i += batchSize) {
      const batch = allPayloads.slice(i, i + batchSize);
      const result = await client.mutateEntities({ creates: batch });
      console.log(`Created batch ${Math.floor(i/batchSize) + 1}: ${result.createdEntities.length} entities`);
    }

    console.log('Event initialization complete!');
    
  } catch (error) {
    console.error('Failed to initialize event:', error.message);
  }
}

// API Routes

// Get event information
app.get('/api/event', async (req, res) => {
  try {
    res.json({
      success: true,
      event: EVENT_CONFIG
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get seat availability
app.get('/api/seats', async (req, res) => {
  try {
    // In a production system, we would query Arkiv for current seat status
    // For now, we'll return a mock response showing the structure
    const seats = [];
    
    for (let row = 1; row <= EVENT_CONFIG.totalRows; row++) {
      for (let column = 1; column <= EVENT_CONFIG.seatsPerRow; column++) {
        const seatId = generateSeatId(row, column);
        const { category, price } = getSeatPrice(row);
        
        seats.push({
          seatId: seatId,
          row: row,
          column: column,
          status: 'available', // In production: query from Arkiv
          category: category,
          price: price
        });
      }
    }

    res.json({
      success: true,
      seats: seats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reserve seats (temporarily hold them)
app.post('/api/seats/reserve', async (req, res) => {
  try {
    const { seatIds, customerInfo } = req.body;
    
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid seat selection' });
    }

    // Generate reservation ID
    const reservationId = uuidv4();
    
    // Create reservation records on Arkiv
    const reservationPayloads = seatIds.map(seatId => {
      const [row, column] = seatId.match(/R(\d+)-S(\d+)/).slice(1, 3).map(Number);
      const { category, price } = getSeatPrice(row);
      
      return {
        payload: jsonToPayload({
          seatType: 'seat_reservation',
          seatId: seatId,
          row: row,
          column: column,
          status: 'reserved',
          reservationId: reservationId,
          category: category,
          price: price,
          customerInfo: customerInfo,
          timestamp: Date.now()
        }),
        contentType: 'application/json',
        attributes: [
          { key: 'type', value: 'reservation' },
          { key: 'seatId', value: seatId },
          { key: 'reservationId', value: reservationId },
          { key: 'status', value: 'reserved' }
        ],
        expiresIn: ExpirationTime.fromMinutes(15) // Reservations expire in 15 minutes
      };
    });

    const result = await client.mutateEntities({ creates: reservationPayloads });
    
    res.json({
      success: true,
      reservationId: reservationId,
      seats: seatIds,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Purchase tickets (finalize the sale)
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const { reservationId, paymentInfo, customerInfo } = req.body;
    
    if (!reservationId) {
      return res.status(400).json({ success: false, error: 'Reservation ID required' });
    }

    // Generate ticket IDs
    const ticketId = uuidv4();
    
    // Create ticket purchase record
    const purchasePayload = {
      payload: jsonToPayload({
        ticketType: 'ticket_purchase',
        ticketId: ticketId,
        reservationId: reservationId,
        status: 'sold',
        customerInfo: customerInfo,
        paymentInfo: {
          method: paymentInfo.method,
          amount: paymentInfo.amount,
          transactionId: uuidv4()
        },
        timestamp: Date.now()
      }),
      contentType: 'application/json',
      attributes: [
        { key: 'type', value: 'ticket' },
        { key: 'ticketId', value: ticketId },
        { key: 'reservationId', value: reservationId },
        { key: 'status', value: 'sold' }
      ],
      expiresIn: ExpirationTime.fromDays(365) // Tickets stored for 1 year
    };

    const result = await client.mutateEntities({ creates: [purchasePayload] });
    
    res.json({
      success: true,
      ticketId: ticketId,
      message: 'Tickets purchased successfully!',
      transactionId: purchasePayload.payload.paymentInfo?.transactionId
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get ticket information
app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // In production, query Arkiv for ticket details
    res.json({
      success: true,
      ticket: {
        ticketId: ticketId,
        event: EVENT_CONFIG,
        status: 'valid',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'Ticket Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Ticket Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Uncomment to initialize event on startup (run once)
  // initializeEvent();
});

export default app;