import { ArrowLeft, Calendar, MapPin, Clock, ShoppingCart, Ticket } from 'lucide-react';
import { Event } from '../App';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

interface EventDetailProps {
  event: Event;
  onSelectSeats: () => void;
  onCartClick: () => void;
  onTicketsClick: () => void;
  cartItemCount: number;
}

export function EventDetail({ event, onSelectSeats, onCartClick, onTicketsClick, cartItemCount }: EventDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      <div className="relative h-80">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Top Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="flex gap-2">
            {/* Empty space for symmetry */}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onTicketsClick}
              className="p-2 bg-white/90 rounded-full backdrop-blur-sm hover:bg-white transition-colors"
            >
              <Ticket className="w-6 h-6 text-gray-900" />
            </button>
            <button
              onClick={onCartClick}
              className="relative p-2 bg-white/90 rounded-full backdrop-blur-sm hover:bg-white transition-colors"
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

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm capitalize">
            {event.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        <h1 className="text-gray-900 mb-4">{event.title}</h1>

        {/* Event Info Cards */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-gray-500 mb-1">Date & Time</div>
              <div className="text-gray-900">{formatDate(event.date)}</div>
              <div className="text-gray-700">{event.time}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-gray-500 mb-1">Venue</div>
              <div className="text-gray-900">{event.venue}</div>
              <div className="text-gray-700">{event.location}</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-3">About Event</h2>
          <p className="text-gray-600 leading-relaxed">
            Experience an unforgettable evening at {event.title}. This {event.category} event promises to deliver 
            world-class entertainment in one of the finest venues. Don't miss this opportunity to be part of 
            something special. Limited tickets available!
          </p>
        </div>

        {/* Ticket Types */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-3">Ticket Types</h2>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-gray-900 mb-1">VIP</div>
                  <div className="text-gray-600">Front rows (A-B) with premium view</div>
                </div>
                <div className="text-amber-600">$150</div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-gray-900 mb-1">Premium</div>
                  <div className="text-gray-600">Middle rows (C-E) with great view</div>
                </div>
                <div className="text-blue-600">$120</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-gray-900 mb-1">Standard</div>
                  <div className="text-gray-600">Back rows (F-J) with good view</div>
                </div>
                <div className="text-gray-600">$89</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-purple-900">Ticket Information</span>
          </div>
          <ul className="space-y-1 text-gray-700 ml-7">
            <li>• Mobile tickets accepted</li>
            <li>• Entry time: 30 minutes before showtime</li>
            <li>• Tickets are non-refundable</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="mb-3">
            <div className="text-gray-500">Starting from</div>
            <div className="text-gray-900">${event.price}</div>
          </div>
          
          <Button
            onClick={onSelectSeats}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full"
          >
            Select Seats
          </Button>
        </div>
      </div>
    </div>
  );
}