'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * DAILY SEND PAGE
 * - Top half: filters + list (copied & adapted from home.js)
 * - Bottom half: Test Email + Daily (Advance) + Realtime
 * - Only Daily Mail is functional
 * - Personal Email & WhatsApp are placeholders
 * - Sending logic copied from tbam.js
 */

export default function DailySendPage() {
  /* ---------------- TOP HALF (LIST) ---------------- */
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', phone: '', date: '' });

  const fetchData = useCallback(async () => {
    const queryParams = new URLSearchParams({ filterType: 'list', ...filters });
    const res = await fetch(`/api/users?${queryParams.toString()}`);
    const json = await res.json();
    setData(json || []);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ---------------- BOTTOM HALF (SEND) ---------------- */
  const [date, setDate] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const toggleId = (row) => {
    setSelectedIds((prev) => {
      const exists = prev.find((r) => r.id === row.id);
      if (exists) return prev.filter((r) => r.id !== row.id);
      return [...prev, row];
    });
  };

  const sendEmail = async (type) => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/email/rotary3012/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          date: type === 'test' ? date : undefined,
          listOfEmails: selectedIds,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResponse(`✅ ${json.message}`);
    } catch (err) {
      setResponse(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* MODE SWITCH (UI ONLY) */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Daily Mail</button>
        <button className="px-4 py-2 bg-gray-300 rounded">Personal Email</button>
        <button className="px-4 py-2 bg-gray-300 rounded">WhatsApp</button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-4 gap-4">
        <input name="name" placeholder="Name" onChange={handleFilterChange} className="border p-2 rounded" />
        <input name="email" placeholder="Email" onChange={handleFilterChange} className="border p-2 rounded" />
        <input name="phone" placeholder="Phone" onChange={handleFilterChange} className="border p-2 rounded" />
        <input type="date" name="date" onChange={handleFilterChange} className="border p-2 rounded" />
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Select</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">
                  <input type="checkbox" onChange={() => toggleId(row)} />
                </td>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">{row.email}</td>
                <td className="border p-2">{row.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEND SECTION */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        {/* TEST EMAIL */}
        <div className="border p-4 rounded space-y-4">
          <h3 className="font-semibold">Test Email</h3>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded w-full" />

          <div className="space-y-2">
            {selectedIds.map((r) => (
              <div key={r.id} className="flex items-center justify-between border p-2 rounded text-sm">
                <div>
                  <div><b>ID:</b> {r.id}</div>
                  <div><b>Name:</b> {r.name}</div>
                  <div><b>Email:</b> {r.email}</div>
                  <div><b>Phone:</b> {r.phone}</div>
                </div>
                <button onClick={() => toggleId(r)} className="text-red-600 font-bold">✕</button>
              </div>
            ))}
          </div>

          <button
            onClick={() => sendEmail('test')}
            disabled={loading || !date || selectedIds.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Test
          </button>
        </div>

        {/* REALTIME */}
        <div className="border p-4 rounded space-y-4">
          <h3 className="font-semibold">Realtime Alert</h3>
          <button
            onClick={() => sendEmail('realtime')}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Now
          </button>
        </div>Q
      </div>

      {/* CONSOLE LOG */}
      {response && <div className="border p-3 rounded bg-gray-50">{response}</div>}
    </div>
  );
}
