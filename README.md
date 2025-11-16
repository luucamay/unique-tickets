# Arkiv Ticket Management System

A complete blockchain-powered event ticket management system built with the Arkiv Network. This system provides immutable seat tracking, secure ticket sales, and real-time seat management for events.

## 🎯 **Project Overview**

This ticket management system demonstrates how blockchain technology can revolutionize event management by providing:

- **Immutable Seat Records**: All seat statuses are recorded on the Arkiv blockchain
- **Real-Time Updates**: Live seat availability with instant visual feedback
- **Secure Transactions**: Blockchain-verified ticket purchases and reservations
- **Admin Dashboard**: Complete management interface for event organizers
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🏗️ **Architecture & Key Features**

### **Backend (Node.js + Express + Arkiv SDK)**
- RESTful API for seat management and ticket sales
- Direct integration with Arkiv blockchain for data storage
- Seat reservation system with time-based expiration
- Event initialization and configuration management
- Transaction recording and ticket generation

### **Frontend (Vanilla JavaScript + Modern CSS)**
- Interactive seat map with real-time availability
- Customer purchase flow with form validation
- Admin dashboard with sales analytics
- Responsive design for all screen sizes
- Accessible interface with keyboard navigation

### **Blockchain Integration (Arkiv Network)**
- **Seat Entities**: Each seat stored as individual blockchain entity
- **Reservation System**: Time-limited reservations with auto-expiration
- **Ticket Records**: Immutable purchase records with customer data
- **Event Configuration**: Blockchain-stored event information

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v18 or higher)
- npm package manager
- Arkiv Network wallet with Mendoza testnet tokens
- Private key from your Arkiv wallet

### 1. Install Dependencies
```bash
cd tutorial-source-code/ticket-management
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_arkiv_private_key_here
PORT=3001
```

### 3. Start the Backend
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Start the Frontend
```bash
# In a new terminal
npm run frontend
```

### 5. Access the Application
- **Customer Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin.html
- **API Health Check**: http://localhost:3001/health

## 📋 **Detailed Setup Guide**

### Backend Configuration

The backend automatically configures an event with the following default settings:
- **Event**: Arkiv Conference 2025
- **Venue**: Tech Convention Center  
- **Layout**: 20 rows × 25 seats = 500 total seats
- **Pricing Tiers**:
  - VIP (Rows 1-3): $150
  - Premium (Rows 4-8): $100
  - Standard (Rows 9-15): $75
  - Economy (Rows 16-20): $50

To customize the event, edit the `EVENT_CONFIG` object in `backend/index.js`:

```javascript
const EVENT_CONFIG = {
  name: "Your Event Name",
  venue: "Your Venue",
  date: "2025-12-15",
  time: "7:00 PM",
  totalRows: 25,
  seatsPerRow: 30,
  priceMap: {
    'VIP': { rows: [1, 2, 3], price: 200 },
    // Add your pricing tiers...
  }
};
```

### Frontend Configuration

The frontend connects to your backend API. If running on different ports or domains, update the API configuration in `frontend/script.js`:

```javascript
const API_BASE_URL = 'http://localhost:3001';
```

## 🔧 **API Documentation**

### Endpoints

#### **Event Management**
- `GET /api/event` - Get event information
- `GET /health` - System health check

#### **Seat Management**  
- `GET /api/seats` - Get all seat availability
- `POST /api/seats/reserve` - Reserve seats temporarily

#### **Ticket Operations**
- `POST /api/tickets/purchase` - Complete ticket purchase
- `GET /api/tickets/:ticketId` - Get ticket information

### API Examples

#### Reserve Seats
```bash
curl -X POST http://localhost:3001/api/seats/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "seatIds": ["R01-S01", "R01-S02"],
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

#### Purchase Tickets
```bash
curl -X POST http://localhost:3001/api/tickets/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "uuid-here",
    "paymentInfo": {
      "method": "credit_card",
      "amount": 300
    },
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

## 🎨 **Frontend Features**

### Customer Interface
- **Interactive Seat Map**: Click to select/deselect seats
- **Price Visualization**: Color-coded seats by price category  
- **Real-time Updates**: See seat availability changes instantly
- **Purchase Flow**: Complete form validation and checkout process
- **Responsive Design**: Works on all devices
- **Accessibility**: Keyboard navigation support

### Admin Dashboard
- **Sales Analytics**: Real-time statistics and revenue tracking
- **Seat Overview**: Mini-map showing current occupancy
- **Event Management**: Initialize and configure events
- **Data Export**: Download sales reports
- **Blockchain Integration**: View transaction records

## 🔐 **Blockchain Integration Details**

### Data Storage on Arkiv

#### Seat Entities
```javascript
{
  seatType: 'seat_status',
  seatId: 'R01-S01',
  row: 1,
  column: 1,
  status: 'available', // available, reserved, sold
  category: 'VIP',
  price: 150,
  timestamp: Date.now()
}
```

#### Reservation Records
```javascript
{
  seatType: 'seat_reservation',
  seatId: 'R01-S01',
  reservationId: 'uuid',
  status: 'reserved',
  customerInfo: { name: '...', email: '...' },
  expiresIn: '15 minutes'
}
```

#### Ticket Purchases
```javascript
{
  ticketType: 'ticket_purchase',
  ticketId: 'uuid',
  reservationId: 'uuid',
  status: 'sold',
  customerInfo: { /* customer data */ },
  paymentInfo: { /* payment details */ },
  timestamp: Date.now()
}
```

### Entity Attributes for Querying
- `type`: 'seat', 'reservation', 'ticket', 'event'
- `seatId`: For seat-specific queries
- `status`: 'available', 'reserved', 'sold'
- `ticketId`: For ticket lookups
- `reservationId`: For reservation tracking

## 🚀 **Deployment Guide**

### Local Development
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend  
npm run frontend
```

### Production Deployment

#### Backend (Node.js hosting)
```bash
# Prepare for deployment
npm ci --only=production

# Set environment variables
export PRIVATE_KEY=your_production_private_key
export PORT=3001

# Start production server
npm start
```

#### Frontend (Static hosting)
Deploy the `frontend/` folder to any static hosting service:
- **Vercel**: `vercel --prod frontend/`
- **Netlify**: Drag & drop the `frontend/` folder
- **GitHub Pages**: Commit and push to gh-pages branch

#### Docker Deployment
```bash
# Build image
docker build -t arkiv-tickets .

# Run container
docker run -d \
  -p 3001:3001 \
  -e PRIVATE_KEY=your_private_key \
  arkiv-tickets
```

## 🔧 **Customization Guide**

### Adding New Price Categories
1. Update `EVENT_CONFIG.priceMap` in `backend/index.js`
2. Add corresponding CSS classes in `frontend/style.css`
3. Update the legend and price display components

### Changing Seat Layout
1. Modify `totalRows` and `seatsPerRow` in `EVENT_CONFIG`
2. Adjust CSS grid layouts for different seat arrangements
3. Update pricing tier row assignments

### Adding Payment Integrations
1. Extend the `paymentInfo` object structure
2. Add payment processor API calls in the purchase flow
3. Update the frontend payment form with required fields

### Blockchain Query Customization
The system uses Arkiv's query system with attributes:

```javascript
// Query available seats in VIP section
const vipSeats = await client.buildQuery()
  .where(eq('type', 'seat'))
  .where(eq('status', 'available'))
  .where(eq('category', 'VIP'))
  .ownedBy(USER_ADDRESS)
  .fetch();
```

## 🔍 **Troubleshooting**

### Common Issues

#### Backend Won't Start
- **Check Node.js version**: Must be v18+
- **Verify .env file**: Ensure PRIVATE_KEY is set
- **Check port availability**: Default port 3001 must be free
- **Arkiv connection**: Verify wallet has testnet tokens

#### Frontend Not Loading Seats
- **API connectivity**: Check if backend is running on port 3001
- **CORS issues**: Ensure backend CORS is configured for your domain
- **JavaScript errors**: Check browser console for error messages

#### Blockchain Transactions Failing
- **Insufficient funds**: Ensure wallet has enough Mendoza testnet tokens
- **Network issues**: Check Arkiv network status
- **Private key format**: Verify private key is valid hex string

### Debug Mode
Enable detailed logging by setting NODE_ENV=development:

```bash
NODE_ENV=development npm run dev
```

## 🧪 **Testing**

### Manual Testing Checklist
- [ ] Load event information
- [ ] Display seat map correctly
- [ ] Select/deselect seats
- [ ] Calculate pricing correctly
- [ ] Complete reservation process
- [ ] Process payment form
- [ ] Generate ticket confirmation
- [ ] Admin dashboard loads
- [ ] View sales statistics

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test event data
curl http://localhost:3001/api/event

# Test seat availability
curl http://localhost:3001/api/seats
```

## 🎯 **Use Cases**

This ticket management system is perfect for:
- **Conferences & Workshops**: Professional events with tiered seating
- **Concerts & Shows**: Entertainment venues with reserved seating
- **Sports Events**: Stadiums and arenas with section-based pricing
- **Theater Productions**: Traditional venue seating with row/seat numbers
- **Corporate Events**: Company meetings and presentations

## 📈 **Scaling Considerations**

### For Large Venues (1000+ seats):
- Implement seat batch loading for frontend
- Add database caching layer for frequently accessed data
- Use WebSocket connections for real-time updates
- Implement seat locking during selection process

### High-Traffic Events:
- Add load balancing for multiple backend instances  
- Implement queue system for ticket purchases
- Cache seat availability data with short TTL
- Use CDN for frontend static assets

## 🔮 **Future Enhancements**

### Planned Features
- **Mobile App**: Native iOS/Android applications
- **QR Code Generation**: Downloadable tickets with QR codes
- **Email Integration**: Automated confirmation emails
- **Payment Processing**: Stripe/PayPal integration
- **Multi-Event Support**: Manage multiple events simultaneously
- **Advanced Analytics**: Detailed sales reporting and insights
- **Social Integration**: Share purchases on social media

### Technical Improvements
- **Real-time Sync**: WebSocket-based live updates
- **Offline Support**: PWA with offline capability
- **Multi-language**: i18n support for international events
- **Accessibility**: Enhanced screen reader support
- **Performance**: Seat map virtualization for large venues

## 📚 **Learning Resources**

### Arkiv Network
- [Arkiv Documentation](https://docs.arkiv.network/)
- [Arkiv SDK Reference](https://arkiv-network.github.io/sdk/)
- [Mendoza Testnet](https://mendoza.arkiv.network/)

### Technologies Used
- [Express.js](https://expressjs.com/) - Backend framework
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Modern CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) - Layout system

## 🤝 **Contributing**

This is a tutorial project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 **Get Started Now!**

Ready to build your own blockchain-powered ticket management system? Follow the Quick Start guide above and you'll have a working system in minutes!

For questions or support, check the troubleshooting section or open an issue in the repository.

**Happy coding with Arkiv! 🚀**