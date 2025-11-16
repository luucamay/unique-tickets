import { ArrowLeft, Wallet, Lock, CheckCircle, Loader2, ExternalLink, User, Shield } from 'lucide-react';
import { CartItem } from '../App';
import { Button } from './ui/button';
import { useState } from 'react';
import { Badge } from './ui/badge';

interface CheckoutProps {
  cart: CartItem[];
  onBack: () => void;
  onComplete: () => void;
}

export function Checkout({ cart, onBack, onComplete }: CheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [humanityVerified, setHumanityVerified] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');

  const subtotal = cart.reduce((sum, item) => 
    sum + item.seats.reduce((seatSum, seat) => seatSum + seat.price, 0), 0
  );
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  // Mock ETH conversion rate (1 ETH = ~$3000)
  const ethAmount = (total / 3000).toFixed(4);

  const handleConnectWallet = async () => {
    setIsProcessing(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...' + Math.random().toString(16).substring(2, 6).toUpperCase();
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      setIsProcessing(false);
    }, 1500);
  };

  const handleVerifyHumanity = async () => {
    setIsProcessing(true);
    
    // Simulate proof of humanity verification
    setTimeout(() => {
      setHumanityVerified(true);
      setIsProcessing(false);
    }, 2500);
  };

  const handlePayment = async () => {
    if (!walletConnected || !humanityVerified) {
      return;
    }

    setIsProcessing(true);
    setTransactionStatus('pending');
    
    // Simulate transaction
    setTimeout(() => {
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setTxHash(mockTxHash);
      setTransactionStatus('success');
      setIsProcessing(false);
      
      // Complete purchase after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Wallet Connection */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-purple-600" />
            <h2 className="text-gray-900">Step 1: Connect Wallet</h2>
          </div>

          {!walletConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-purple-900 mb-2">Connect your Web3 wallet to proceed</p>
                <p className="text-purple-700">Supported: MetaMask, WalletConnect, Coinbase Wallet</p>
              </div>
              <Button
                type="button"
                onClick={handleConnectWallet}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Wallet Connected</span>
              </div>
              <div className="text-green-700 break-all">{walletAddress}</div>
            </div>
          )}
        </div>

        {/* Proof of Humanity Verification */}
        {walletConnected && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900">Step 2: Verify Humanity</h2>
            </div>

            {!humanityVerified ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-900 mb-2">Verify you're human to prevent bot purchases</p>
                  <p className="text-blue-700">This helps ensure fair ticket distribution</p>
                </div>
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Complete verification</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyHumanity}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify I'm Human
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-900">Humanity Verified ✓</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Section */}
        {walletConnected && humanityVerified && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-purple-600" />
              <h2 className="text-gray-900">Step 3: Complete Payment</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Payment Amount</span>
                  <div className="text-right">
                    <div className="text-gray-900">{ethAmount} ETH</div>
                    <div className="text-gray-500">≈ ${total.toFixed(2)} USD</div>
                  </div>
                </div>
                <div className="text-gray-600 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                      Ethereum Network
                    </Badge>
                    <span className="text-gray-500">Gas fees included</span>
                  </div>
                </div>
              </div>

              {transactionStatus === 'pending' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-blue-900">Processing Transaction...</span>
                  </div>
                  <p className="text-blue-700 ml-8">Please confirm the transaction in your wallet</p>
                </div>
              )}

              {transactionStatus === 'success' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-900">Transaction Successful!</span>
                  </div>
                  <div className="text-green-700 mb-2">
                    <div className="mb-1">Transaction Hash:</div>
                    <div className="break-all bg-white p-2 rounded border border-green-200 text-green-800">
                      {txHash}
                    </div>
                  </div>
                  <a 
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 mt-2"
                  >
                    View on Etherscan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.event.id} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between text-gray-700 mb-2">
                  <span className="flex-1 line-clamp-1">{item.event.title}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.seats.map((seat) => (
                    <span key={seat.id} className="text-gray-600">
                      {seat.row}{seat.number} (${seat.price}){seat !== item.seats[item.seats.length - 1] ? ',' : ''}
                    </span>
                  ))}
                </div>
                <div className="text-gray-700 mt-2">
                  Subtotal: ${item.seats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <div className="text-right">
                  <div className="text-gray-900">${total.toFixed(2)}</div>
                  <div className="text-purple-600">{ethAmount} ETH</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
          <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-green-900">
            Secure blockchain transaction. Your wallet credentials are never stored.
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <Button
          onClick={handlePayment}
          disabled={!walletConnected || !humanityVerified || isProcessing || transactionStatus === 'success'}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full disabled:opacity-50"
        >
          {transactionStatus === 'pending' ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Transaction...
            </>
          ) : transactionStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Payment Complete!
            </>
          ) : !walletConnected ? (
            'Connect Wallet to Continue'
          ) : !humanityVerified ? (
            'Verify Humanity to Continue'
          ) : (
            `Pay ${ethAmount} ETH`
          )}
        </Button>
      </div>
    </div>
  );
}