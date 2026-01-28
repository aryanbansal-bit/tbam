'use client';

import { useEffect, useState, useMemo } from "react";
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
  const [selectedId, setSelectedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    date: getTodayIST(),
  });

  const fetchData = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      mode: "whatsapp",
      date: filters.date,
    });

    try {
      const res = await fetch(`/api/user?${params.toString()}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setCurrentPage(1); // reset page on reload
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.date]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const name = (row.name || "").toLowerCase();
      const email = (row.email || "").toLowerCase();
      const phone = (row.phone || "").toString();

      return (
        name.includes(filters.name.toLowerCase()) &&
        email.includes(filters.email.toLowerCase()) &&
        phone.includes(filters.phone)
      );
    });
  }, [data, filters]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="bg-white rounded shadow p-4">
      <Navbar/>
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

      {/* TABLE */}
      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
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

            {!loading &&
              paginatedData.map(row => (
                <tr key={row.id}>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="whatsappSelect"
                      checked={selectedId === row.id}
                      onChange={() => setSelectedId(row.id)}
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

      {/* PAGINATION CONTROLS */}
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
    </div>
  );
}
