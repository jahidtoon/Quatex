"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import AdminActionModal from '../components/AdminActionModal';

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalTicket, setModalTicket] = useState(null);

  const handleTicketAction = (action, ticket) => {
    setModalType(action);
    setModalTicket(ticket);
    setModalOpen(true);
  };

  const handleReplyTicket = (ticketId) => {
    // Implementation for replying to ticket
    console.log('Replying to ticket:', ticketId);
    setModalOpen(false);
  };

  const handleResolveTicket = (ticketId) => {
    // Implementation for resolving ticket
    console.log('Resolving ticket:', ticketId);
    setModalOpen(false);
  };

  const handleCloseTicket = (ticketId) => {
    // Implementation for closing ticket
    console.log('Closing ticket:', ticketId);
    setModalOpen(false);
  };

  // Mock support tickets data
  const tickets = [
    {
      id: 1,
      user: 'john.doe@email.com',
      subject: 'Unable to withdraw funds',
      priority: 'High',
      status: 'Open',
      created: '2024-01-15 10:30',
      lastReply: '2024-01-15 14:20',
      category: 'Withdrawal',
      messages: [
        {
          id: 1,
          from: 'john.doe@email.com',
          message: 'I have been trying to withdraw $500 for the past 3 days but the transaction keeps failing. Can you please help?',
          timestamp: '2024-01-15 10:30'
        },
        {
          id: 2,
          from: 'Support',
          message: 'Hello John, thank you for contacting us. We are looking into your withdrawal request. Please provide your transaction ID.',
          timestamp: '2024-01-15 14:20'
        }
      ]
    },
    {
      id: 2,
      user: 'maria.garcia@email.com',
      subject: 'Account verification issues',
      priority: 'Medium',
      status: 'In Progress',
      created: '2024-01-14 16:45',
      lastReply: '2024-01-15 09:15',
      category: 'Account',
      messages: [
        {
          id: 1,
          from: 'maria.garcia@email.com',
          message: 'My account verification has been pending for over a week. When will it be approved?',
          timestamp: '2024-01-14 16:45'
        }
      ]
    },
    {
      id: 3,
      user: 'alex.smith@email.com',
      subject: 'Trading platform bug',
      priority: 'Low',
      status: 'Resolved',
      created: '2024-01-13 11:20',
      lastReply: '2024-01-14 08:30',
      category: 'Technical',
      messages: [
        {
          id: 1,
          from: 'alex.smith@email.com',
          message: 'The chart is not loading properly on mobile devices.',
          timestamp: '2024-01-13 11:20'
        }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-600/20 text-red-400';
      case 'In Progress': return 'bg-yellow-600/20 text-yellow-400';
      case 'Resolved': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-600/20 text-red-400';
      case 'Medium': return 'bg-yellow-600/20 text-yellow-400';
      case 'Low': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Support Management" 
        subtitle="Manage customer support tickets and communications." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card title="Support Tickets">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#101527] text-gray-300">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Priority</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="border-b border-[#262b40] hover:bg-[#1a1f33] cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="p-3 font-medium">#{ticket.id}</td>
                      <td className="p-3">{ticket.user}</td>
                      <td className="p-3 max-w-xs truncate">{ticket.subject}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{ticket.created}</td>
                      <td className="p-3">
                        <button 
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
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
          </Card>
        </div>

        {/* Ticket Details */}
        <div>
          <Card title={selectedTicket ? `Ticket #${selectedTicket.id}` : "Select a Ticket"}>
            {selectedTicket ? (
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Subject</div>
                  <div className="font-medium">{selectedTicket.subject}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">User</div>
                  <div>{selectedTicket.user}</div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Priority</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Status</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Category</div>
                  <div>{selectedTicket.category}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Messages</div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.messages.map((message) => (
                      <div key={message.id} className="p-3 bg-[#101527] rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-400">{message.from}</span>
                          <span className="text-xs text-gray-400">{message.timestamp}</span>
                        </div>
                        <div className="text-sm text-gray-300">{message.message}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#262b40]">
                  <button 
                    onClick={() => handleTicketAction('reply', selectedTicket)}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button 
                    onClick={() => handleTicketAction('resolve', selectedTicket)}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button 
                    onClick={() => handleTicketAction('close', selectedTicket)}
                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                Select a ticket from the list to view details
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card title="Support Stats" className="mt-4">
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Open Tickets</span>
                <span className="text-red-400 font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Progress</span>
                <span className="text-yellow-400 font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolved Today</span>
                <span className="text-green-400 font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="text-blue-400 font-medium">2.5h</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Admin Action Modal */}
      <AdminActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === 'view' ? 'Ticket Details' :
          modalType === 'reply' ? 'Reply to Ticket' :
          modalType === 'resolve' ? 'Resolve Ticket' :
          modalType === 'close' ? 'Close Ticket' : ''
        }
        content={
          modalTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Ticket ID</label>
                  <p className="text-white font-medium">#{modalTicket.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">User Email</label>
                  <p className="text-white">{modalTicket.user}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Subject</label>
                  <p className="text-white">{modalTicket.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Category</label>
                  <p className="text-white">{modalTicket.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Priority</label>
                  <p className={
                    modalTicket.priority === 'High' ? 'text-red-400' :
                    modalTicket.priority === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                  }>
                    {modalTicket.priority}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <p className={
                    modalTicket.status === 'Open' ? 'text-red-400' :
                    modalTicket.status === 'In Progress' ? 'text-yellow-400' : 'text-green-400'
                  }>
                    {modalTicket.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Created</label>
                  <p className="text-white">{modalTicket.created}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Reply</label>
                  <p className="text-white">{modalTicket.lastReply}</p>
                </div>
              </div>

              {/* Messages */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Conversation</label>
                <div className="max-h-60 overflow-y-auto space-y-3 bg-[#0f1320] border border-[#2a3142] rounded p-3">
                  {modalTicket.messages?.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-400">{message.from}</span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <div className="text-sm text-gray-300">{message.message}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {modalType === 'reply' && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Your Reply</label>
                  <textarea 
                    rows="4"
                    placeholder="Type your reply here..."
                    className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white placeholder-gray-400 resize-none"
                  />
                </div>
              )}

              {(modalType === 'resolve' || modalType === 'close') && (
                <div className="mt-4 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded">
                  <p className="text-yellow-400 text-sm">
                    {modalType === 'resolve' && 'Are you sure you want to resolve this ticket? This will mark it as completed.'}
                    {modalType === 'close' && 'Are you sure you want to close this ticket? This action will close the ticket without resolution.'}
                  </p>
                </div>
              )}
            </div>
          )
        }
        actions={
          modalType === 'view' ? (
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Close
            </button>
          ) : modalType === 'reply' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReplyTicket(modalTicket?.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Send Reply
              </button>
            </div>
          ) : modalType === 'resolve' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveTicket(modalTicket?.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Resolve Ticket
              </button>
            </div>
          ) : modalType === 'close' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCloseTicket(modalTicket?.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Close Ticket
              </button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
