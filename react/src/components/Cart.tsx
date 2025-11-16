import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../App';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

interface CartProps {
  cart: CartItem[];
  onBack: () => void;
  onRemove: (seatIds: string[]) => void;
  onCheckout: () => void;
}

export function Cart({ cart, onBack, onRemove, onCheckout }: CartProps) {
  const subtotal = cart.reduce((sum, item) => 
    sum + item.seats.reduce((seatSum, seat) => seatSum + seat.price, 0), 0
  );
  const serviceFee = subtotal * 0.1; // 10% service fee
  const total = subtotal + serviceFee;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalSeats = cart.reduce((sum, item) => sum + item.seats.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div>
            <h1 className="text-gray-900">My Cart</h1>
            <p className="text-gray-500">{totalSeats} {totalSeats === 1 ? 'seat' : 'seats'}</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-6">
            Browse events and select seats to add to your cart
          </p>
          <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white">
            Browse Events
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 py-4 space-y-4">
            {cart.map((item) => (
              <div key={item.event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={item.event.image}
                      alt={item.event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1 line-clamp-2">{item.event.title}</h3>
                    <p className="text-gray-500 mb-2">
                      {formatDate(item.event.date)} • {item.event.time}
                    </p>
                    <div className="text-purple-600">{item.seats.length} {item.seats.length === 1 ? 'seat' : 'seats'}</div>
                  </div>
                </div>

                <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                  <div className="mb-3">
                    <div className="text-gray-700 mb-2">Selected Seats:</div>
                    <div className="flex flex-wrap gap-2">
                      {item.seats.map((seat) => (
                        <Badge 
                          key={seat.id} 
                          className={`${
                            seat.type === 'vip' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : seat.type === 'premium'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}
                        >
                          {seat.row}{seat.number} - ${seat.price}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-gray-900">
                      ${item.seats.reduce((sum, seat) => sum + seat.price, 0)}
                    </div>
                    <button
                      onClick={() => onRemove(item.seats.map((seat) => seat.id))}
                      className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove All
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="px-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <Button
              onClick={onCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full"
            >
              Proceed to Checkout • ${total.toFixed(2)}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}