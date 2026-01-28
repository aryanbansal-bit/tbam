'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from '@/app/components/Navbar-service';

const getTodayIST = () => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return now.toISOString().split("T")[0];
};

export default function WhatsAppList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // selected rows (FULL objects)
  const [selectedRows, setSelectedRows] = useState([]);

  const [sendingTest, setSendingTest] = useState(false);
  const [sendingRealtime, setSendingRealtime] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    date: getTodayIST(),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams({
      mode: "whatsapp",
      date: filters.date,
    });

    try {
      const res = await fetch(`/api/user?${params.toString()}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setCurrentPage(1);
      setSelectedRows([]); // reset selections on reload
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return (
        (row.name || "").toLowerCase().includes(filters.name.toLowerCase()) &&
        (row.email || "").toLowerCase().includes(filters.email.toLowerCase()) &&
        (row.phone || "").toString().includes(filters.phone)
      );
    });
  }, [data, filters]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const toggleRow = (row) => {
    setSelectedRows(prev => {
      const exists = prev.find(r => r.id === row.id);
      if (exists) {
        return prev.filter(r => r.id !== row.id);
      }
      return [...prev, row];
    });
  };

  const removeFromTestTable = (id) => {
    setSelectedRows(prev => prev.filter(r => r.id !== id));
  };

  const isChecked = (id) => {
    return selectedRows.some(r => r.id === id);
  };


  const sendTest = async () => {
    if (selectedRows.length === 0) return;

    setSendingTest(true);

    await fetch('/api/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: "whatsapp",
        data: selectedRows,
      }),
    });

    setSendingTest(false);
  };

  const sendRealtime = async () => {
    setSendingRealtime(true);

    await fetch('/api/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: "whatsapp",
        data: data,
      }),
    });

    setSendingRealtime(false);
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <Navbar />

      {/* FILTERS */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <input
          placeholder="Name"
          className="border px-2 py-1 rounded"
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="border px-2 py-1 rounded"
          value={filters.email}
          onChange={e => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="border px-2 py-1 rounded"
          value={filters.phone}
          onChange={e => setFilters({ ...filters, phone: e.target.value })}
        />
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={filters.date}
          onChange={e => setFilters({ ...filters, date: e.target.value })}
        />
      </div>

      {/* MAIN TABLE */}
      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 w-16">Action</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Event Type</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Loading data...
                </td>
              </tr>
            )}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No data found
                </td>
              </tr>
            )}

            {!loading && paginatedData.map(row => (
              <tr key={row.id}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={isChecked(row.id)}
                    onChange={() => toggleRow(row)}
                  />
                </td>
                <td className="border p-2">{row.name || "-"}</td>
                <td className="border p-2">{row.phone || "-"}</td>
                <td className="border p-2">{row.email || "-"}</td>
                <td className="border p-2">{row.eventType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* TEST + REALTIME */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* TEST TABLE */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Test WhatsApp</h3>

          {selectedRows.map(row => (
            <div
              key={row.id}
              className="flex justify-between items-center mb-2"
            >
              <span>
                ID: {row.id}, Name: {row.name}, Event: {row.eventType}
              </span>
              <button
                onClick={() => removeFromTestTable(row.id)}
                className="text-red-600 font-bold"
              >
                ❌
              </button>
            </div>
          ))}

          <button
            onClick={sendTest}
            disabled={sendingTest || selectedRows.length === 0}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {sendingTest ? "Sending..." : "Test"}
          </button>
        </div>

        {/* REALTIME */}
        <div className="border rounded p-4 flex flex-col justify-between">
          <h3 className="font-semibold mb-4">Realtime Alert</h3>
          <button
            onClick={sendRealtime}
            disabled={sendingRealtime}
            className="bg-blue-600 text-white py-3 rounded disabled:opacity-50"
          >
            {sendingRealtime ? "Sending..." : "Send Now"}
          </button>
        </div>

      </div>
    </div>
  );
}
