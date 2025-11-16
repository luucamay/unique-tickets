import { createWalletClient, createPublicClient, http } from '@arkiv-network/sdk';
import { mendoza } from '@arkiv-network/sdk/chains';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { ExpirationTime, jsonToPayload } from '@arkiv-network/sdk/utils';
import { eq, gt } from '@arkiv-network/sdk/query';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set in the .env file.");
}

// Initialize Arkiv clients
const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  chain: mendoza,
  transport: http(),
  account: account,
});

const publicClient = createPublicClient({
  chain: mendoza,
  transport: http(),
});

console.log(`Ticket Management Backend connected as: ${walletClient.account.address}`);

// Express server setup
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Event configuration (in production, this could be a database)
const EVENT_CONFIG = {
  name: "Sub0 Conference 2025",
  venue: "Tech Convention Center",
  date: "2025-12-25",
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

// Helper function to query seat status from Arkiv
async function getSeatStatusFromArkiv(seatId) {
  try {
    const query = publicClient.buildQuery();
    const seatEntities = await query
      .where(eq('type', 'seat'))
      .where(eq('seatId', seatId))
      .withAttributes(true)
      .fetch();

    if (seatEntities && seatEntities.length > 0) {
      // Get the most recent status (assumes the last entity is most recent)
      const entity = seatEntities[seatEntities.length - 1];
      const status = entity.attributes.find(attr => attr.key === 'status')?.value;
      return status || 'available';
    }
    
    return 'available'; // Default if no entity found
  } catch (error) {
    console.warn(`Failed to get seat status for ${seatId}:`, error);
    return 'available'; // Default on error
  }
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
      const results = await Promise.all(
        batch.map(payload => walletClient.createEntity(payload))
      );
      console.log(`Created batch ${Math.floor(i/batchSize) + 1}: ${results.length} entities`);
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
    // Query Arkiv for event information
    console.log('Querying Arkiv for event data...');
    
    const query = publicClient.buildQuery();
    const eventEntities = await query
      .where(eq('type', 'event'))
      .withAttributes(true)
      .withPayload(true)
      .fetch();

    let eventData = EVENT_CONFIG; // Default fallback

    if (eventEntities && eventEntities.length > 0) {
      try {
        const eventEntity = eventEntities[0];
        const arkivEventData = JSON.parse(eventEntity.payload);
        
        if (arkivEventData.eventType === 'event_info') {
          // Use Arkiv data if available
          eventData = {
            name: arkivEventData.name || EVENT_CONFIG.name,
            venue: arkivEventData.venue || EVENT_CONFIG.venue,
            date: arkivEventData.date || EVENT_CONFIG.date,
            time: arkivEventData.time || EVENT_CONFIG.time,
            totalRows: EVENT_CONFIG.totalRows, // Keep config values for layout
            seatsPerRow: EVENT_CONFIG.seatsPerRow,
            priceMap: arkivEventData.priceCategories || EVENT_CONFIG.priceMap
          };
          
          console.log('Successfully loaded event data from Arkiv');
        }
      } catch (parseError) {
        console.warn('Failed to parse event entity from Arkiv, using config:', parseError);
      }
    } else {
      console.log('No event data found in Arkiv, using config');
    }

    res.json({
      success: true,
      event: eventData,
      source: eventEntities?.length > 0 ? 'arkiv' : 'config'
    });
  } catch (error) {
    console.error('Error querying Arkiv for event:', error);
    
    // Fallback to config if Arkiv query fails
    res.json({
      success: true,
      event: EVENT_CONFIG,
      source: 'fallback',
      warning: 'Arkiv query failed, using config data'
    });
  }
});

// Get seat availability
app.get('/api/seats', async (req, res) => {
  try {
    // Query Arkiv for current seat status
    console.log('Querying Arkiv for seat data...');
    
    const query = publicClient.buildQuery();
    const seatEntities = await query
      .where(eq('type', 'seat'))
      .withAttributes(true)
      .withPayload(true)
      .fetch();

    const seats = [];
    
    if (seatEntities && seatEntities.length > 0) {
      console.log(`Found ${seatEntities.length} seat entities in Arkiv`);
      
      // Parse seat data from Arkiv entities
      for (const entity of seatEntities) {
        try {
          const seatData = JSON.parse(entity.payload);
          
          // Extract seat info from the entity
          const seatId = entity.attributes.find(attr => attr.key === 'seatId')?.value;
          const row = parseInt(entity.attributes.find(attr => attr.key === 'row')?.value || '0');
          const status = entity.attributes.find(attr => attr.key === 'status')?.value || 'available';
          
          if (seatData.seatType === 'seat_status' && seatId && row) {
            seats.push({
              seatId: seatId,
              row: seatData.row || row,
              column: seatData.column,
              status: status,
              category: seatData.category,
              price: seatData.price
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse seat entity:', parseError);
          continue;
        }
      }
    }
    
    // If no seats found in Arkiv or parsing failed, fall back to generating seats
    if (seats.length === 0) {
      console.log('No seats found in Arkiv, generating default seat layout...');
      
      for (let row = 1; row <= EVENT_CONFIG.totalRows; row++) {
        for (let column = 1; column <= EVENT_CONFIG.seatsPerRow; column++) {
          const seatId = generateSeatId(row, column);
          const { category, price } = getSeatPrice(row);
          
          seats.push({
            seatId: seatId,
            row: row,
            column: column,
            status: 'available',
            category: category,
            price: price
          });
        }
      }
    }

    // Sort seats by row and column for consistent ordering
    seats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });

    res.json({
      success: true,
      seats: seats,
      source: seatEntities?.length > 0 ? 'arkiv' : 'generated'
    });
    
  } catch (error) {
    console.error('Error querying Arkiv for seats:', error);
    
    // Fallback to generated seats if Arkiv query fails
    const seats = [];
    for (let row = 1; row <= EVENT_CONFIG.totalRows; row++) {
      for (let column = 1; column <= EVENT_CONFIG.seatsPerRow; column++) {
        const seatId = generateSeatId(row, column);
        const { category, price } = getSeatPrice(row);
        
        seats.push({
          seatId: seatId,
          row: row,
          column: column,
          status: 'available',
          category: category,
          price: price
        });
      }
    }
    
    res.json({
      success: true,
      seats: seats,
      source: 'fallback',
      warning: 'Arkiv query failed, using fallback data'
    });
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

    const reservationResults = await Promise.all(
      reservationPayloads.map(payload => walletClient.createEntity(payload))
    );
    
    res.json({
      success: true,
      reservationId: reservationId,
      seats: seatIds,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      transactions: reservationResults.map(r => r.txHash)
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

    const purchaseResult = await walletClient.createEntity(purchasePayload);
    
    res.json({
      success: true,
      ticketId: ticketId,
      message: 'Tickets purchased successfully!',
      transactionId: purchasePayload.payload.paymentInfo?.transactionId,
      entityKey: purchaseResult.entityKey,
      txHash: purchaseResult.txHash
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

// Admin route to initialize event on Arkiv blockchain
app.post('/api/admin/initialize', async (req, res) => {
  try {
    console.log('Admin requested event initialization...');
    await initializeEvent();
    
    res.json({
      success: true,
      message: 'Event initialized successfully on Arkiv blockchain',
      totalSeats: EVENT_CONFIG.totalRows * EVENT_CONFIG.seatsPerRow,
      event: EVENT_CONFIG
    });
    
  } catch (error) {
    console.error('Admin initialization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize event on Arkiv blockchain',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Ticket Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Uncomment to initialize event on startup (run once)
  // initializeEvent();
});

export default app;