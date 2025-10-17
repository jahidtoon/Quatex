"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../../../components/MainAppLayout';
import P2PHeader from '../../components/P2PHeader';

function getAuthHeader() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  // Fallback to demo user
  return { Authorization: 'Bearer DEVUSER:demo@example.com' };
}

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
      // Notify app that balances might have changed (release/cancel)
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet:balance-updated'));
        }
      } catch {}
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/p2p/orders/${id}`, { headers: { ...getAuthHeader() } });
      if (!res.ok) {
        throw new Error(`Failed to load order (${res.status})`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response');
      }
      
      const data = await res.json();
      setOrder(data.order);
    } catch (e) {
      console.error('Load order error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function loadChat() {
    setChatLoading(true);
    try {
      const res = await fetch(`/api/p2p/orders/${id}/messages`, { headers: { ...getAuthHeader() } });
      if (!res.ok) {
        console.error('Failed to load messages:', res.status);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response for messages');
        return;
      }
      
      const data = await res.json();
      const newMessages = data.items || [];
      if (newMessages.length > chat.length) {
        setHasNewMessages(true);
        // Auto-scroll to new messages
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }
      setChat(newMessages);
    } catch (e) {
      console.error('Load chat error:', e);
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    let timer;
    loadChat();
    timer = setInterval(loadChat, 4000);
    return () => clearInterval(timer);
  }, [id]);

  async function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    try {
      const res = await fetch(`/api/p2p/orders/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || 'Failed to send');
      }
      await loadChat();
    } catch (e) {
      alert(e.message);
    }
  }

  async function postAction(actionPath) {
    setBusy(true);
    try {
      const res = await fetch(`/api/p2p/orders/${id}/${actionPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Action failed:', errorText);
        throw new Error(`Action failed (${res.status})`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response');
      }
      
      const data = await res.json();
      await load();
      
      // Show appropriate message based on action
      if (actionPath === 'mark-paid' && data.message) {
        alert(data.message);
      } else {
        alert('Success');
      }
    } catch (e) {
      console.error('Post action error:', e);
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <MainAppLayout currentPage="p2p">
      <div className="min-h-screen bg-gray-900 text-white">
        <P2PHeader 
          title="Order Detail" 
          subtitle={order ? `${order.reference_code}` : ''}
          currentPath="/p2p/orders"
        />
        <div className="p-6">

      {loading && <div className="text-gray-300">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {order && (
        <div className="bg-gray-800 border border-gray-700 rounded p-6">
          {/* Order Status Alert */}
          {(order.status === 'PAID' || order.status === 'ESCROW_HELD') && (
            <div className="mb-4 p-4 bg-yellow-900/40 border border-yellow-700 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-bell text-yellow-400 mr-3"></i>
                <div>
                  <div className="font-semibold text-yellow-200">
                    {order.status === 'PAID' ? 'Both Parties Confirmed Payment!' : 'Action Required!'}
                  </div>
                  <div className="text-sm text-yellow-300">
                    {order.status === 'PAID' 
                      ? 'Payment confirmed by both parties. Seller can now release funds.'
                      : 'Order is active and funds are held in escrow. Both parties need to confirm payment.'
                    }
                  </div>
                  {order.status === 'ESCROW_HELD' && (
                    <div className="text-xs text-yellow-200 mt-2">
                      <div>• Seller confirmed: {order.maker_confirmed ? '✅ Yes' : '❌ No'}</div>
                      <div>• Buyer confirmed: {order.taker_confirmed ? '✅ Yes' : '❌ No'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg flex items-center">
                {order.side} USD • {order.fiat_currency}
                <span className={`ml-3 px-3 py-1 rounded text-sm ${
                  order.status === 'ESCROW_HELD' ? 'bg-blue-600' :
                  order.status === 'PAID' ? 'bg-yellow-600' :
                  order.status === 'RELEASED' ? 'bg-green-600' :
                  order.status === 'CANCELED' ? 'bg-red-600' : 'bg-gray-600'
                }`}>{order.status}</span>
              </div>
              <div className="text-sm text-gray-400">{order.amount_asset} USD @ {order.price} → {order.amount_fiat} {order.fiat_currency}</div>
              <div className="text-xs text-gray-500">Ref: {order.reference_code}</div>
            </div>
          </div>

          <div className="flex gap-3">
            {(order.status === 'ESCROW_HELD' || order.status === 'PENDING') && (
              <button 
                disabled={busy} 
                onClick={()=>postAction('mark-paid')} 
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded flex items-center"
              >
                <i className="fas fa-check mr-2"></i>
                Confirm Payment
                {order.maker_confirmed && order.maker_id === order.maker_id && (
                  <span className="ml-2 text-green-300">✅</span>
                )}
                {order.taker_confirmed && order.taker_id === order.taker_id && (
                  <span className="ml-2 text-green-300">✅</span>
                )}
              </button>
            )}
            {order.status === 'PAID' && (
              <button 
                disabled={busy} 
                onClick={()=>postAction('release')} 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded flex items-center"
              >
                <i className="fas fa-unlock mr-2"></i>
                Release Funds
              </button>
            )}
            {['ESCROW_HELD','PENDING','PAID'].includes(order.status) && (
              <button 
                disabled={busy} 
                onClick={()=>postAction('cancel')} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded flex items-center"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel Order
              </button>
            )}
          </div>

          {/* Chat Panel */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <i className="fas fa-comments mr-2"></i>
              Chat
              {hasNewMessages && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded animate-pulse">
                  New Messages
                </span>
              )}
            </h3>
            <div 
              id="chat-container"
              className="h-64 overflow-y-auto bg-gray-900 border border-gray-700 rounded p-3 space-y-3"
              onClick={() => setHasNewMessages(false)}
            >
              {chatLoading && <div className="text-gray-400">Loading messages...</div>}
              {chat.length === 0 && !chatLoading && <div className="text-gray-500">No messages yet. Start the conversation!</div>}
              {chat.map(m => (
                <div key={m.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-indigo-300 font-medium">
                      {m.sender_id === order.maker_id ? 'Seller' : (m.sender_id === order.taker_id ? 'Buyer' : 'User')}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-200 bg-gray-800 p-2 rounded ml-2">
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input 
                value={chatInput} 
                onChange={(e)=>setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..." 
                className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded focus:border-indigo-500"
              />
              <button 
                onClick={sendMessage} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded flex items-center"
              >
                <i className="fas fa-paper-plane mr-2"></i>Send
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </MainAppLayout>
  );
}
