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

  const allVisibleSelected =
    filteredData.length > 0 &&
    filteredData.every((row) =>
      selectedRows.some((r) => r.id === row.id)
    );

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedRows((prev) =>
        prev.filter((r) => !filteredData.some((row) => row.id === r.id))
      );
    } else {
      setSelectedRows((prev) => {
        const map = new Map(prev.map((r) => [r.id, r]));
        filteredData.forEach((row) => map.set(row.id, row));
        return Array.from(map.values());
      });
    }
  };

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
      ACTIONS (Payload Updated)
     ======================= */
  
  const formatPayload = (userArray) => {
    return userArray.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      annposter: user.annposter,
      eventType: user.eventType,
      partner_id: user.partner_id || null,
      partner_name: user.partner_name || null,
      partner_annposter: user.partner_annposter ?? null,
    }));
  };

  const sendTest = async () => {
    if (selectedRows.length === 0) return;
    setSendingTest(true);
    setResponse('');

    try {
      const res = await fetch('/api/services/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: "test",
          list: formatPayload(selectedRows) 
        }),
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
          type: "real",
          list: formatPayload(data), 
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
              <th className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Event</th>
            </tr>
          </thead>

          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">Loading data...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">No data available</td>
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
        <div className="border p-4 rounded space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-blue-700">Test Selection ({selectedRows.length})</h3>
            {selectedRows.length > 0 && (
                <button 
                    onClick={() => setSelectedRows([])}
                    className="text-xs text-gray-500 hover:text-red-600 underline"
                >
                    Clear all
                </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm space-y-2">
            {selectedRows.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No users selected for test</div>
            ) : (
              selectedRows.map((row) => (
                <div key={row.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div>
                    <div className="font-medium">{row.name || '-'}</div>
                    <div className="text-xs text-gray-500">
                      ID: {row.id} | {row.eventType}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRows((p) => p.filter((r) => r.id !== row.id))}
                    className="text-red-500 hover:text-red-700 font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={sendTest}
            disabled={sendingTest || selectedRows.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50 transition-colors hover:bg-blue-700"
          >
            {sendingTest ? 'Sending Test...' : 'Send Test WhatsApp'}
          </button>
        </div>

        <div className="border p-4 rounded flex items-center justify-center min-h-[150px] bg-red-50/30">
          {!confirming && !sendingRealtime ? (
            <button
              onClick={() => setConfirming(true)}
              className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition-all shadow-md"
            >
              Realtime to all {data.length} users
            </button>
          ) : !sendingRealtime ? (
            <div className="text-center space-y-4">
              <div className="font-semibold">
                Send WhatsApp to <span className="text-red-600 underline">ALL {data.length} users</span>?
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setConfirming(false)} className="px-4 py-2 border bg-white rounded hover:bg-gray-50">Cancel</button>
                <button
                  disabled={countdown > 0}
                  onClick={sendRealtime}
                  className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 min-w-[100px]"
                >
                  Confirm {countdown > 0 ? `(${countdown})` : ''}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full"></div>
              <div className="font-bold text-red-600">Processing Realtime Queue...</div>
            </div>
          )}
        </div>
      </div>

      {response && (
        <div className={`border p-3 rounded font-medium transition-all animate-in fade-in slide-in-from-bottom-2 ${response.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {response}
        </div>
      )}
    </div>
  );
}