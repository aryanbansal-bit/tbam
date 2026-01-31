'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Navbar from '@/app/components/Navbar-service';

const getTodayIST = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

export default function WhatsAppList() {
  /* =======================
     DATA
     ======================= */
  const [data, setData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    date: getTodayIST(),
  });

  const fetchData = useCallback(async () => {
    setLoadingTable(true);
    try {
      const params = new URLSearchParams({
        mode: 'whatsapp',
        date: filters.date,
      });

      const res = await fetch(`/api/user?${params.toString()}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setSelectedRows([]);
    } catch {
      setData([]);
    } finally {
      setLoadingTable(false);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================
     FILTERING
     ======================= */
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        (row.name || '').toLowerCase().includes(filters.name.toLowerCase()) &&
        (row.email || '').toLowerCase().includes(filters.email.toLowerCase()) &&
        (row.phone || '').toString().includes(filters.phone)
      );
    });
  }, [data, filters]);

  /* =======================
     SELECTION
     ======================= */
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRow = (row) => {
    setSelectedRows((prev) =>
      prev.some((r) => r.id === row.id)
        ? prev.filter((r) => r.id !== row.id)
        : [...prev, row]
    );
  };

  const isSelected = (id) => selectedRows.some((r) => r.id === id);

  /* =======================
     SEND STATES
     ======================= */
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingRealtime, setSendingRealtime] = useState(false);
  const [response, setResponse] = useState('');

  /* =======================
     REALTIME CONFIRMATION
     ======================= */
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!confirming) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [confirming]);

  /* =======================
     ACTIONS
     ======================= */
  const sendTest = async () => {
    if (selectedRows.length === 0) return;

    setSendingTest(true);
    setResponse('');

    try {
      const res = await fetch('/api/services/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({selectedRows}),
      });

      if (!res.ok) throw new Error('Failed to send test WhatsApp');

      setResponse('✅ Test WhatsApp sent successfully');
    } catch (err) {
      setResponse(`❌ ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const sendRealtime = async () => {
    setSendingRealtime(true);
    setResponse('');

    try {
      const res = await fetch('/api/services/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'whatsapp',
          data,
        }),
      });

      if (!res.ok) throw new Error('Failed to send realtime WhatsApp');

      setResponse('✅ Realtime WhatsApp sent to all users');
    } catch (err) {
      setResponse(`❌ ${err.message}`);
    } finally {
      setSendingRealtime(false);
      setConfirming(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Navbar />

      {/* FILTERS */}
      <div className="grid grid-cols-4 gap-4">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="border p-2 rounded"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="border p-2 rounded"
          value={filters.phone}
          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Select</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Event</th>
            </tr>
          </thead>

          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected(row.id)}
                      onChange={() => toggleRow(row)}
                    />
                  </td>
                  <td className="border px-4 py-2">{row.name || '-'}</td>
                  <td className="border px-4 py-2">{row.phone || '-'}</td>
                  <td className="border px-4 py-2">{row.email || '-'}</td>
                  <td className="border px-4 py-2">{row.eventType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SEND SECTION */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        {/* TEST */}
        <div className="border p-4 rounded space-y-4">
          <h3 className="font-semibold">Test WhatsApp</h3>

          <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm space-y-2">
            {selectedRows.length === 0 ? (
              <div className="text-gray-500 text-center">
                No users selected
              </div>
            ) : (
              selectedRows.map((row) => (
                <div
                  key={row.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <div>
                    <div className="font-medium">{row.name || '-'}</div>
                    <div className="text-xs text-gray-500">
                      ID: {row.id} | Event: {row.eventType}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedRows((p) =>
                        p.filter((r) => r.id !== row.id)
                      )
                    }
                    className="text-red-600 font-bold"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={sendTest}
            disabled={sendingTest || selectedRows.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </div>

        {/* REALTIME */}
        <div className="border p-4 rounded flex items-center justify-center min-h-[150px]">
          {!confirming && !sendingRealtime ? (
            <button
              onClick={() => setConfirming(true)}
              className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700"
            >
              Realtime to all users
            </button>
          ) : !sendingRealtime ? (
            <div className="text-center space-y-4">
              <div className="font-semibold">
                Send WhatsApp to <span className="text-red-600">ALL users</span>?
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2 border rounded"
                >
                  No
                </button>

                <button
                  disabled={countdown > 0}
                  onClick={sendRealtime}
                  className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Yes {countdown > 0 ? `(${countdown})` : ''}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full"></div>
              <div className="font-bold text-red-600">Sending WhatsApp...</div>
              <p className="text-xs text-gray-400">
                Please do not close this page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RESPONSE */}
      {response && (
        <div
          className={`border p-3 rounded font-medium ${
            response.includes('✅')
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {response}
        </div>
      )}
    </div>
  );
}
