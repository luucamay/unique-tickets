import { ArrowLeft, Calendar, MapPin, Download, Share2 } from 'lucide-react';
import { Ticket } from '../App';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useEffect, useRef } from 'react';

interface MyTicketsProps {
  tickets: Ticket[];
  onBack: () => void;
}

// QR Code Generator Component
function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code generation (matrix representation)
    const qrSize = 25; // 25x25 matrix
    const cellSize = size / qrSize;
    
    // Generate a deterministic pattern based on the value
    const hash = value.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Generate QR pattern
    ctx.fillStyle = '#000000';
    
    // Add position markers (corners)
    const drawPositionMarker = (x: number, y: number) => {
      // Outer square
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawPositionMarker(0, 0); // Top-left
    drawPositionMarker(qrSize - 7, 0); // Top-right
    drawPositionMarker(0, qrSize - 7); // Bottom-left

    // Generate data pattern
    let seed = hash;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        // Skip position markers
        if ((x < 8 && y < 8) || (x >= qrSize - 8 && y < 8) || (x < 8 && y >= qrSize - 8)) {
          continue;
        }

        if (random() > 0.5) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg border-2 border-gray-300"
    />
  );
}

export function MyTickets({ tickets, onBack }: MyTicketsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPurchaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Separate upcoming and past tickets
  const now = new Date();
  const upcomingTickets = tickets.filter(ticket => new Date(ticket.event.date) >= now);
  const pastTickets = tickets.filter(ticket => new Date(ticket.event.date) < now);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white">My Tickets</h1>
            <p className="text-purple-100">
              {tickets.reduce((sum, ticket) => sum + ticket.seats.length, 0)} total seats
            </p>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-gray-900 mb-2">No tickets yet</h2>
          <p className="text-gray-500 text-center mb-6">
            Your purchased tickets will appear here
          </p>
          <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white">
            Browse Events
          </Button>
        </div>
      ) : (
        <div className="px-4 py-6 space-y-6">
          {/* Upcoming Tickets */}
          {upcomingTickets.length > 0 && (
            <div>
              <h2 className="text-gray-900 mb-3">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="relative h-40">
                      <ImageWithFallback
                        src={ticket.event.image}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white">
                          Active
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-gray-900 mb-3">{ticket.event.title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(ticket.event.date)} • {ticket.event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.event.venue}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-gray-500 mb-1">Seats</div>
                            <div className="flex flex-wrap gap-1">
                              {ticket.seats.map((seat) => (
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
                                  {seat.row}{seat.number}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-500 mb-1">Purchased</div>
                            <div className="text-gray-900">{formatPurchaseDate(ticket.purchaseDate)}</div>
                          </div>
                        </div>
                        
                        {/* QR Code Placeholder */}
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
                          <QRCode value={ticket.qrCode} size={160} />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Tickets */}
          {pastTickets.length > 0 && (
            <div>
              <h2 className="text-gray-900 mb-3">Past Events</h2>
              <div className="space-y-4">
                {pastTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl shadow-md overflow-hidden opacity-75">
                    <div className="flex gap-3 p-4">
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={ticket.event.image}
                          alt={ticket.event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 mb-1 line-clamp-1">{ticket.event.title}</h3>
                        <div className="text-gray-500 mb-2">
                          {formatDate(ticket.event.date)}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {ticket.seats.map((seat) => (
                            <span key={seat.id} className="text-gray-600">
                              {seat.row}{seat.number}
                            </span>
                          ))}
                        </div>
                        <Badge className="bg-gray-200 text-gray-700">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}