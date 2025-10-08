"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import AdminActionModal from '../components/AdminActionModal';
import StatCard from '../components/StatCard';

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const filterTickets = (tickets, search) => {
  if (!search) return tickets;
  const term = search.toLowerCase();
  return tickets.filter((ticket) =>
    [ticket.subject, ticket.email, ticket.name, ticket.message]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  );
};

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTicket, setModalTicket] = useState(null);
  const [modalType, setModalType] = useState('');
  const [search, setSearch] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/support', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load support tickets (${response.status})`);
      const payload = await response.json();
      const fetched = payload.items || payload;
      setTickets(fetched);
      setSelectedTicket((current) => {
        if (current) {
          const updated = fetched.find((item) => item.id === current.id);
          if (updated) return updated;
        }
        return fetched[0] || null;
      });
    } catch (err) {
      setError(err.message || 'Unable to load support tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => filterTickets(tickets, search), [tickets, search]);

  const stats = useMemo(() => {
    if (!tickets.length) {
      return {
        total: 0,
        last24h: 0,
        uniqueUsers: 0,
        averagePerDay: 0,
        oldestAgeDays: 0
      };
    }
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const timestamps = tickets
      .map((ticket) => new Date(ticket.createdAt || 0).getTime())
      .filter((time) => Number.isFinite(time) && time > 0);
    const last24h = timestamps.filter((time) => now - time <= dayMs).length;
    const earliest = timestamps.length ? Math.min(...timestamps) : now;
    const spanDays = Math.max(1, Math.round((now - earliest) / dayMs));
    const uniqueUsers = new Set(
      tickets.map((ticket) => ticket.email || ticket.user_id || ticket.name || 'unknown')
    ).size;
    const oldestAgeDays = Math.max(0, Math.floor((now - earliest) / dayMs));
    return {
      total: tickets.length,
      last24h,
      uniqueUsers,
      averagePerDay: Number((tickets.length / spanDays).toFixed(1)),
      oldestAgeDays
    };
  }, [tickets]);

  const handleTicketAction = (action, ticket) => {
    setModalType(action);
    setModalTicket(ticket);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTicket(null);
    setModalType('');
  };

  const handleReplyTicket = (ticketId) => {
    console.log('Replying to ticket:', ticketId);
    closeModal();
  };

  return (
    <div>
      <AdminPageHeader
        title="Support Management"
        subtitle="Monitor inbound support requests and respond to traders"
        actions={
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="flex items-center justify-between text-sm text-red-200">
            <span>{error}</span>
            <button
              onClick={fetchTickets}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tickets" value={stats.total.toString()} hint="All time" />
        <StatCard label="Last 24h" value={stats.last24h.toString()} hint="New submissions" />
        <StatCard label="Unique Customers" value={stats.uniqueUsers.toString()} hint="Distinct senders" />
        <StatCard label="Avg / Day" value={stats.averagePerDay.toString()} hint="Since first ticket" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Support Tickets">
            <div className="p-4 border-b border-[#262b40] flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by subject, email, or message"
                  className="w-full px-3 py-2 bg-[#101527] border border-[#262b40] rounded-lg text-sm text-white placeholder-gray-500"
                />
              </div>
              <div className="text-xs text-gray-400">
                Showing {filteredTickets.length} of {tickets.length}
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
                Loading support tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-lg">No tickets found</p>
                <p className="text-sm">Try adjusting your search or check back later.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#101527] text-gray-300">
                    <tr>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Subject</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Created</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={`border-b border-[#262b40] hover:bg-[#1a1f33] cursor-pointer ${
                          selectedTicket?.id === ticket.id ? 'bg-[#1a1f33]' : ''
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="p-3 font-medium">#{ticket.id?.toString().slice(0, 8)}</td>
                        <td className="p-3 max-w-xs truncate">{ticket.subject || 'No subject'}</td>
                        <td className="p-3">{ticket.name || '—'}</td>
                        <td className="p-3">
                          <span className="text-blue-300">{ticket.email || 'Unknown'}</span>
                        </td>
                        <td className="p-3 text-gray-400">{formatDateTime(ticket.createdAt)}</td>
                        <td className="p-3">
                          <button
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleTicketAction('view', ticket);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={selectedTicket ? `Ticket #${selectedTicket.id?.toString().slice(0, 8)}` : 'Select a Ticket'}>
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading ticket...</div>
            ) : selectedTicket ? (
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Subject</div>
                  <div className="font-medium text-white">{selectedTicket.subject || 'No subject provided'}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Customer</div>
                    <div>{selectedTicket.name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-blue-300">{selectedTicket.email || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">User ID</div>
                    <div className="font-mono text-xs text-gray-400">{selectedTicket.user_id || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Submitted</div>
                    <div>{formatDateTime(selectedTicket.createdAt)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Message</div>
                  <div className="p-4 bg-[#101527] border border-[#262b40] rounded-lg text-sm text-gray-200 whitespace-pre-line">
                    {selectedTicket.message || 'No message body provided.'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#262b40]">
                  <button
                    onClick={() => handleTicketAction('reply', selectedTicket)}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleTicketAction('archive', selectedTicket)}
                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">Select a ticket from the list to view details</div>
            )}
          </Card>

          <Card title="Support Insights">
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending replies last 24h</span>
                <span className="text-blue-300">{stats.last24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Oldest ticket age</span>
                <span className="text-green-300">{tickets.length ? `${stats.oldestAgeDays} days` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Most active sender</span>
                <span className="text-gray-200">
                  {tickets.length
                    ? Object.entries(
                        tickets.reduce((acc, ticket) => {
                          const key = ticket.email || ticket.name || 'Unknown';
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b[1] - a[1])[0][0]
                    : '—'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AdminActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalType === 'reply'
            ? 'Reply to Ticket'
            : modalType === 'archive'
            ? 'Archive Ticket'
            : 'Ticket Details'
        }
        content={
          modalTicket && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Ticket ID</label>
                  <p className="text-white font-medium">#{modalTicket.id?.toString().slice(0, 8)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Submitted</label>
                  <p className="text-white">{formatDateTime(modalTicket.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <p className="text-white">{modalTicket.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <p className="text-blue-300">{modalTicket.email || 'Unknown'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400">Subject</label>
                  <p className="text-white">{modalTicket.subject || 'No subject provided'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Message</label>
                <div className="bg-[#0f1320] border border-[#2a3142] rounded p-3 text-gray-200 whitespace-pre-line">
                  {modalTicket.message || 'No message body provided.'}
                </div>
              </div>

              {modalType === 'reply' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Your Reply</label>
                  <textarea
                    rows="4"
                    placeholder="Type your reply here..."
                    className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white placeholder-gray-500 resize-none"
                  />
                </div>
              )}

              {modalType === 'archive' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200 text-xs">
                  Archiving removes the ticket from the active queue but keeps it for audit purposes.
                </div>
              )}
            </div>
          )
        }
        actions={
          modalType === 'reply' ? (
            <div className="flex gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                Cancel
              </button>
              <button
                onClick={() => handleReplyTicket(modalTicket?.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Send Reply
              </button>
            </div>
          ) : modalType === 'archive' ? (
            <div className="flex gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Confirm Archive
              </button>
            </div>
          ) : (
            <button onClick={closeModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
              Close
            </button>
          )
        }
      />
    </div>
  );
}
