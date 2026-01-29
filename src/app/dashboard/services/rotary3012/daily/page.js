'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/app/components/Navbar-service';

export default function DailySendPage() {

  /* =======================
     TABLE DATA
     ======================= */
  const [data, setData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchData = useCallback(async () => {
    setLoadingTable(true);
    try {
      const params = new URLSearchParams({
        filterType: 'list',
        ...filters,
      });

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      setData([]);
    } finally {
      setLoadingTable(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

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

  const removeSelectedRow = (id) => {
    setSelectedRows(prev => prev.filter(r => r.id !== id));
  };

  const isSelected = (id) => selectedRows.some((r) => r.id === id);

  /* =======================
     SEND LOGIC
     ======================= */
  const [date, setDate] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingRealtime, setSendingRealtime] = useState(false);
  const [response, setResponse] = useState('');

  const sendEmail = async (type) => {
    type === 'test' ? setSendingTest(true) : setSendingRealtime(true);
    setResponse('');

    try {
      const res = await fetch('/api/email/rotary3012/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          date: type === 'test' ? date : undefined,
          listOfEmails: selectedRows.map((r) => r.email),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error');
      setResponse(`✅ ${json.message}`);
    } catch (err) {
      setResponse(`❌ ${err.message}`);
    } finally {
      if (type === 'test') {
        setSendingTest(false);
      } else {
        setSendingRealtime(false);
        setConfirming(false);
      }
    }
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Navbar />

      {/* FILTERS */}
      <div className="grid grid-cols-3 gap-4">
        <input name="name" placeholder="Name" onChange={handleFilterChange} className="border p-2 rounded" />
        <input name="email" placeholder="Email" onChange={handleFilterChange} className="border p-2 rounded" />
        <input name="phone" placeholder="Phone" onChange={handleFilterChange} className="border p-2 rounded" />
      </div>

      {/* MAIN TABLE */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Select</th>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Phone</th>
            </tr>
          </thead>

          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-6 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected(row.id)}
                      onChange={() => toggleRow(row)}
                    />
                  </td>
                  <td className="border px-4 py-2">{row.id}</td>
                  <td className="border px-4 py-2">{row.name}</td>
                  <td className="border px-4 py-2">{row.email}</td>
                  <td className="border px-4 py-2">{row.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SEND SECTION */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">

        {/* TEST EMAIL */}
        <div className="border p-4 rounded space-y-4">
          <h3 className="font-semibold">Test Email</h3>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full"
          />

          {/* ✅ SELECTED ROWS INSIDE TEST SECTION */}
          <div className="border rounded max-h-48 overflow-y-auto">
            <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
              Selected Recipients ({selectedRows.length})
            </div>

            {selectedRows.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No recipients selected
              </div>
            ) : (
              <table className="min-w-full text-xs">
                <tbody>
                  {selectedRows.map(row => (
                    <tr key={`test-${row.id}`} className="hover:bg-red-50">
                      <td className="px-2 py-1">{row.name}</td>
                      <td className="px-2 py-1">{row.email}</td>
                      <td className="px-2 py-1 text-right">
                        <button
                          onClick={() => removeSelectedRow(row.id)}
                          className="text-red-600 font-bold px-2"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button
            onClick={() => sendEmail('test')}
            disabled={sendingTest || !date || selectedRows.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {sendingTest ? 'Test Sending...' : 'Send Test'}
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
                Send realtime email to <span className="text-red-600">ALL users</span>?
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => setConfirming(false)} className="px-4 py-2 border rounded">
                  No
                </button>

                <button
                  disabled={countdown > 0}
                  onClick={() => sendEmail('realtime')}
                  className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Yes {countdown > 0 ? `(${countdown})` : ''}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full"></div>
              <div className="font-bold text-red-600">Sending Realtime Emails...</div>
            </div>
          )}
        </div>
      </div>

      {response && (
        <div className={`border p-3 rounded font-medium ${response.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {response}
        </div>
      )}
    </div>
  );
}
