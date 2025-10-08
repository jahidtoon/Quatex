"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const extractTimestamp = (line) => {
  if (!line) return null;
  const match = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  if (!match) return null;
  const date = new Date(match[0]);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const detectLevel = (line = '') => {
  if (/error/i.test(line)) return 'error';
  if (/warn/i.test(line)) return 'warn';
  if (/info/i.test(line) || /\[0m/i.test(line)) return 'info';
  return 'log';
};

const levelStyles = {
  error: 'text-red-400 bg-red-900/30',
  warn: 'text-yellow-400 bg-yellow-900/30',
  info: 'text-blue-400 bg-blue-900/30',
  log: 'text-gray-300 bg-gray-700/20'
};

export default function SystemPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSource, setSelectedSource] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/system', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load system logs (${response.status})`);
      const payload = await response.json();
      const items = payload.items || payload;
      const enriched = items.map((entry, index) => ({
        ...entry,
        id: `${entry.source}-${index}`,
        timestamp: extractTimestamp(entry.line),
        level: detectLevel(entry.line)
      }));
      setLogs(enriched);
      setSelectedLog((current) => {
        if (current) {
          const updated = enriched.find((log) => log.id === current.id);
          if (updated) return updated;
        }
        return enriched[0] || null;
      });
    } catch (err) {
      setError(err.message || 'Unable to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const sources = useMemo(() => ['all', ...new Set(logs.map((log) => log.source))], [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedSource !== 'all' && log.source !== selectedSource) return false;
      if (!search) return true;
      return log.line.toLowerCase().includes(search.toLowerCase());
    });
  }, [logs, selectedSource, search]);

  useEffect(() => {
    if (!filteredLogs.length) {
      setSelectedLog(null);
      return;
    }
    setSelectedLog((current) => {
      if (!current) return filteredLogs[0];
      const exists = filteredLogs.find((log) => log.id === current.id);
      return exists || filteredLogs[0];
    });
  }, [filteredLogs]);

  const stats = useMemo(() => {
    if (!logs.length) {
      return {
        total: 0,
        sources: 0,
        errors: 0,
        lastTimestamp: null
      };
    }
    const errors = logs.filter((log) => log.level === 'error').length;
    const timestamps = logs
      .map((log) => log.timestamp?.getTime())
      .filter((value) => Number.isFinite(value));
    const mostRecent = timestamps.length ? Math.max(...timestamps) : null;
    return {
      total: logs.length,
      sources: new Set(logs.map((log) => log.source)).size,
      errors,
      lastTimestamp: mostRecent ? new Date(mostRecent) : null
    };
  }, [logs]);

  return (
    <div>
      <AdminPageHeader
        title="System Management"
        subtitle="Inspect runtime logs across all services"
        actions={
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh' }
          </button>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="flex items-center justify-between text-sm text-red-200">
            <span>{error}</span>
            <button
              onClick={fetchLogs}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Log Entries" value={stats.total.toString()} hint="Latest fetch" />
        <StatCard label="Sources" value={stats.sources.toString()} hint="Files scanned" />
        <StatCard label="Errors" value={stats.errors.toString()} hint="Matching /error/i" />
        <StatCard
          label="Last Timestamp"
          value={stats.lastTimestamp ? formatDateTime(stats.lastTimestamp) : '—'}
          hint="Most recent log"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Log Stream">
            <div className="p-4 border-b border-[#262b40] flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search log lines"
                  className="w-full px-3 py-2 bg-[#101527] border border-[#262b40] rounded-lg text-sm text-white placeholder-gray-500"
                />
              </div>
              <div>
                <select
                  value={selectedSource}
                  onChange={(event) => setSelectedSource(event.target.value)}
                  className="px-3 py-2 bg-[#101527] border border-[#262b40] rounded-lg text-sm text-white"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source === 'all' ? 'All Sources' : source}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
                Loading system logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-lg">No logs match the current filters</p>
                <p className="text-sm">Adjust the search query or choose another source.</p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto divide-y divide-[#1f253b]">
                {filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#1a1f33] transition flex gap-3 ${
                      selectedLog?.id === log.id ? 'bg-[#1a1f33] border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <span className={`px-2 py-1 rounded text-xs h-fit ${levelStyles[log.level]}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-1">
                        <span className="font-mono text-blue-300">{log.source}</span>
                        <span>{log.timestamp ? formatDateTime(log.timestamp) : 'No timestamp'}</span>
                      </div>
                      <div className="font-mono text-[13px] text-gray-200 whitespace-pre-wrap">
                        {log.line}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Log Details">
            {selectedLog ? (
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Source</span>
                  <span className="font-mono text-blue-300">{selectedLog.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className={`px-2 py-1 rounded text-xs ${levelStyles[selectedLog.level]}`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Timestamp</span>
                  <span>{selectedLog.timestamp ? formatDateTime(selectedLog.timestamp) : 'Not detected'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Raw line</span>
                  <div className="bg-[#101527] border border-[#262b40] rounded p-3 font-mono text-xs text-gray-200 whitespace-pre-wrap">
                    {selectedLog.line}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block">Copy</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(selectedLog.line)}
                    className="mt-2 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">
                Select a log entry to inspect details
              </div>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="p-4 space-y-3 text-sm">
              <button className="w-full px-4 py-2 bg-[#101527] border border-[#262b40] rounded-lg hover:bg-[#1a1f33] text-white">
                Download Logs
              </button>
              <button className="w-full px-4 py-2 bg-red-600/20 border border-red-600/40 rounded-lg text-red-200 hover:bg-red-600/30">
                Clear Log Files
              </button>
              <p className="text-xs text-gray-500">
                Log maintenance actions are placeholders. Hook these buttons to automation scripts or CLI commands if desired.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
