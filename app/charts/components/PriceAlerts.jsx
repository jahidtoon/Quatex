'use client';

import { useState, useEffect } from 'react';

export default function PriceAlerts({ symbol, currentPrice }) {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ price: '', type: 'above' });
  const [showForm, setShowForm] = useState(false);

  // Check alerts
  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    alerts.forEach(alert => {
      const shouldTrigger = alert.type === 'above' 
        ? currentPrice >= alert.price 
        : currentPrice <= alert.price;

      if (shouldTrigger && !alert.triggered) {
        // Trigger notification
        if (Notification.permission === 'granted') {
          new Notification(`Price Alert - ${symbol}`, {
            body: `Price ${alert.type === 'above' ? 'reached' : 'dropped to'} $${alert.price.toFixed(4)}`,
            icon: '/favicon.ico'
          });
        }

        // Mark as triggered
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, triggered: true } : a
        ));
      }
    });
  }, [currentPrice, alerts, symbol]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addAlert = () => {
    if (!newAlert.price || isNaN(newAlert.price)) return;

    const alert = {
      id: Date.now(),
      price: parseFloat(newAlert.price),
      type: newAlert.type,
      triggered: false,
      createdAt: new Date()
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ price: '', type: 'above' });
    setShowForm(false);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          + Add Alert
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-3 bg-gray-600 rounded-lg">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white text-sm"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <input
                type="number"
                value={newAlert.price}
                onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Price"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white text-sm"
                step="0.0001"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={addAlert}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-400 text-sm">No alerts set</p>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2 rounded ${
                alert.triggered ? 'bg-green-900 bg-opacity-50' : 'bg-gray-600'
              }`}
            >
              <div className="text-sm">
                <span className="text-white">
                  {alert.type === 'above' ? '↗' : '↙'} ${alert.price.toFixed(4)}
                </span>
                {alert.triggered && (
                  <span className="ml-2 text-green-400 text-xs">✓ Triggered</span>
                )}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {currentPrice && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            Current: <span className="text-white">${currentPrice.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
