import { ArrowLeft, ShoppingCart, Info } from 'lucide-react';
import { Event, Seat } from '../App';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface SeatSelectionProps {
  event: Event;
  onBack: () => void;
  onAddToCart: (seats: Seat[]) => void;
  onCartClick: () => void;
  cartItemCount: number;
  bookedSeats: string[];
}

// Generate seat layout
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 10;

  rows.forEach((row, rowIndex) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      let type: 'vip' | 'premium' | 'standard';
      let price: number;

      if (rowIndex < 2) {
        type = 'vip';
        price = 150;
      } else if (rowIndex < 5) {
        type = 'premium';
        price = 120;
      } else {
        type = 'standard';
        price = 89;
      }

      // Randomly make some seats unavailable
      const isAvailable = Math.random() > 0.3;

      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        type,
        price,
        isAvailable,
      });
    }
  });

  return seats;
};

export function SeatSelection({ event, onBack, onAddToCart, onCartClick, cartItemCount, bookedSeats }: SeatSelectionProps) {
  const [seats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleSeat = (seat: Seat) => {
    if (!seat.isAvailable || bookedSeats.includes(seat.id)) return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) return;
    onAddToCart(selectedSeats);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedSeats([]);
    }, 1500);
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const getSeatColor = (seat: Seat) => {
    if (bookedSeats.includes(seat.id)) return 'bg-purple-600 cursor-not-allowed';
    if (!seat.isAvailable) return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeats.some((s) => s.id === seat.id)) return 'bg-green-500';
    
    switch (seat.type) {
      case 'vip':
        return 'bg-amber-400 hover:bg-amber-500';
      case 'premium':
        return 'bg-blue-400 hover:bg-blue-500';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div>
              <h1 className="text-gray-900">Select Seats</h1>
              <p className="text-gray-500">{event.venue}</p>
            </div>
          </div>
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-b from-purple-600 to-purple-400 rounded-2xl py-4 mb-6 shadow-lg">
          <div className="text-center text-white">STAGE</div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-purple-600" />
            <span className="text-gray-900">Seat Legend</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-400 rounded"></div>
              <span className="text-gray-700">VIP - $150</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span className="text-gray-700">Premium - $120</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span className="text-gray-700">Standard - $89</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <span className="text-gray-700">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
              <span className="text-gray-700">In Cart</span>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <div className="min-w-max">
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center gap-2 mb-2">
                <div className="w-8 text-center text-gray-700">{row}</div>
                <div className="flex gap-1">
                  {rowSeats.slice(0, 5).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={!seat.isAvailable || bookedSeats.includes(seat.id)}
                      className={`w-8 h-8 rounded transition-all ${getSeatColor(seat)} ${
                        selectedSeats.some((s) => s.id === seat.id) ? 'scale-110 shadow-lg' : ''
                      }`}
                      title={`${seat.row}${seat.number} - $${seat.price}`}
                    />
                  ))}
                </div>
                <div className="w-4"></div>
                <div className="flex gap-1">
                  {rowSeats.slice(5, 10).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={!seat.isAvailable || bookedSeats.includes(seat.id)}
                      className={`w-8 h-8 rounded transition-all ${getSeatColor(seat)} ${
                        selectedSeats.some((s) => s.id === seat.id) ? 'scale-110 shadow-lg' : ''
                      }`}
                      title={`${seat.row}${seat.number} - $${seat.price}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-gray-900 mb-3">Selected Seats ({selectedSeats.length})</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSeats.map((seat) => (
                <Badge key={seat.id} className="bg-green-100 text-green-800 border border-green-300">
                  {seat.row}{seat.number} - ${seat.price}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-700">Total:</span>
              <span className="text-gray-900">${totalPrice}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-gray-500">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
              </div>
              <div className="text-gray-900">Total: ${totalPrice}</div>
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={selectedSeats.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showSuccess ? '✓ Added to Cart!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
