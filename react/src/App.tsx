import { useState, useEffect } from 'react';
import { EventDetail } from './components/EventDetail';
import { SeatSelection } from './components/SeatSelection';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { MyTickets } from './components/MyTickets';
import { 
  loadDataWithFallback, 
  transformMockEventToAppEvent, 
  transformMockSeatsToAppSeats,
  type MockEvent,
  type MockSeat
} from './utils/mockData';

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
  price: number;
  category: 'concert' | 'sports' | 'theater' | 'festival';
};

export type Seat = {
  id: string;
  row: string;
  number: number;
  type: 'vip' | 'premium' | 'standard';
  price: number;
  isAvailable: boolean;
};

export type CartItem = {
  event: Event;
  seats: Seat[];
};

export type Ticket = {
  id: string;
  event: Event;
  seats: Seat[];
  purchaseDate: string;
  qrCode: string;
};

export type Page = 'event' | 'seats' | 'cart' | 'checkout' | 'tickets';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('event');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadDataWithFallback();
        
        // Transform mock data to App types
        const transformedEvent = transformMockEventToAppEvent(data.event);
        const transformedSeats = transformMockSeatsToAppSeats(data.seats);
        
        setFeaturedEvent(transformedEvent);
        setAvailableSeats(transformedSeats);
      } catch (error) {
        console.error('Failed to load event data:', error);
        // Fallback to a basic event if everything fails
        setFeaturedEvent({
          id: '1',
          title: 'Event Loading Failed',
          date: '2025-12-15',
          time: '10:00 AM',
          venue: 'Unknown Venue',
          location: 'Unknown Location',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          price: 50,
          category: 'festival',
        });
        setAvailableSeats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Early return if still loading or no event loaded
  if (isLoading || !featuredEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  const addToCart = (seats: Seat[]) => {
    setCart((prevCart: CartItem[]) => {
      const existingItem = prevCart.find((item: CartItem) => item.event.id === featuredEvent.id);
      if (existingItem) {
        return prevCart.map((item: CartItem) =>
          item.event.id === featuredEvent.id
            ? { ...item, seats: [...item.seats, ...seats] }
            : item
        );
      }
      return [...prevCart, { event: featuredEvent, seats }];
    });
  };

  const removeFromCart = (seatIds: string[]) => {
    setCart((prevCart: CartItem[]) =>
      prevCart.map((item: CartItem) => ({
        ...item,
        seats: item.seats.filter((seat: Seat) => !seatIds.includes(seat.id)),
      })).filter((item: CartItem) => item.seats.length > 0)
    );
  };

  const completePurchase = () => {
    const newTickets: Ticket[] = cart.map((item: CartItem) => ({
      id: `ticket-${Date.now()}-${Math.random()}`,
      event: item.event,
      seats: item.seats,
      purchaseDate: new Date().toISOString(),
      qrCode: `QR-${Date.now()}-${Math.random()}`,
    }));
    setTickets([...tickets, ...newTickets]);
    setCart([]);
    setCurrentPage('tickets');
  };

  const navigateToSeats = () => {
    setCurrentPage('seats');
  };

  const navigateToCart = () => {
    setCurrentPage('cart');
  };

  const navigateToCheckout = () => {
    setCurrentPage('checkout');
  };

  const navigateToEvent = () => {
    setCurrentPage('event');
  };

  const navigateToTickets = () => {
    setCurrentPage('tickets');
  };

  const totalCartItems = cart.reduce((sum: number, item: CartItem) => sum + item.seats.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'event' && (
        <EventDetail
          event={featuredEvent}
          onSelectSeats={navigateToSeats}
          onCartClick={navigateToCart}
          onTicketsClick={navigateToTickets}
          cartItemCount={totalCartItems}
        />
      )}
      {currentPage === 'seats' && (
        <SeatSelection
          event={featuredEvent}
          onBack={navigateToEvent}
          onAddToCart={addToCart}
          onCartClick={navigateToCart}
          cartItemCount={totalCartItems}
          bookedSeats={cart.flatMap((item: CartItem) => item.seats.map((seat: Seat) => seat.id))}
        />
      )}
      {currentPage === 'cart' && (
        <Cart
          cart={cart}
          onBack={navigateToEvent}
          onRemove={removeFromCart}
          onCheckout={navigateToCheckout}
        />
      )}
      {currentPage === 'checkout' && (
        <Checkout
          cart={cart}
          onBack={() => setCurrentPage('cart')}
          onComplete={completePurchase}
        />
      )}
      {currentPage === 'tickets' && (
        <MyTickets
          tickets={tickets}
          onBack={navigateToEvent}
        />
      )}
    </div>
  );
}