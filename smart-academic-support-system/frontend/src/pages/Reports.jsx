import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText, Printer, RefreshCw } from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { Empty, ErrorBox, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const colors = ["#2563eb", "#0f766e", "#f59e0b", "#e11d48", "#7c3aed", "#0891b2", "#475569", "#16a34a"];

const ChartCard = ({ title, children }) => (
  <section className="card h-80">
    <h3 className="mb-4 font-bold">{title}</h3>
    {children}
  </section>
);

const DataTable = ({ title, rows, columns, empty }) => (
  <section className="card">
    <h3 className="font-bold">{title}</h3>
    {rows?.length ? (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-100">
            <tr>{columns.map((column) => <th className="p-3" key={column.key}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr className="border-t border-slate-200" key={row._id || row.label || index}>
                {columns.map((column) => <td className="p-3" key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <div className="mt-4"><Empty title={empty || "No data available"} text="This report will populate as activity grows." /></div>}
  </section>
);

const Reports = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api("/reports/admin").then(setReport).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const inventorySplit = useMemo(() => report ? [
    { label: "Available", value: report.availableCopies },
    { label: "Issued", value: report.issuedCopies }
  ] : [], [report]);

  if (!report && !error) return <Loading label="Generating reports" />;
  if (error && !report) return <ErrorBox message={error} />;

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `library-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Book Titles", report.totalBooks],
      ["Total Copies", report.totalCopies],
      ["Available Copies", report.availableCopies],
      ["Issued Copies", report.issuedCopies],
      ["Overdue Books", report.overdueBooks],
      ["Active Students", report.activeStudents],
      ["Pending Requests", report.pendingRequests],
      ["Active Reservations", report.activeReservations],
      ["Low Stock Titles", report.lowStockCount],
      ["Unavailable Titles", report.unavailableCount],
      ["Utilization Rate", `${report.utilizationRate}%`],
      ["Estimated Fine Exposure", `Rs. ${report.estimatedFineExposure}`],
      ["Average Rating", report.averageRating]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `library-report-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-slate-500">Analyze library inventory, issue activity, reservations, overdue risk, student engagement, and popular resources.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</button>
          <button className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" /> CSV</button>
          <button className="btn-secondary" onClick={exportJson}><FileText className="h-4 w-4" /> JSON</button>
          <button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Book Titles" value={report.totalBooks} />
        <StatCard label="Total Copies" value={report.totalCopies} tone="teal" />
        <StatCard label="Issued Copies" value={report.issuedCopies} tone="amber" />
        <StatCard label="Utilization" value={`${report.utilizationRate}%`} tone="blue" />
        <StatCard label="Overdue" value={report.overdueBooks} tone="rose" />
        <StatCard label="Fine Exposure" value={`Rs. ${report.estimatedFineExposure}`} tone="rose" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-500">Pending issue requests</p><p className="mt-1 text-3xl font-bold text-brand">{report.pendingRequests}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Active reservations</p><p className="mt-1 text-3xl font-bold text-mint">{report.activeReservations}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Low-stock titles</p><p className="mt-1 text-3xl font-bold text-amber-600">{report.lowStockCount}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Active students</p><p className="mt-1 text-3xl font-bold text-slate-900">{report.activeStudents}</p><p className="mt-2 text-sm text-slate-500">{report.newStudentsThisWeek} new this week</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Library Overview">
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={report.chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Issue Request Trend">
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={report.issueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Inventory Split">
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={inventorySplit} dataKey="value" nameKey="label" outerRadius={85} label>
                {inventorySplit.map((entry, index) => <Cell key={entry.label} fill={colors[index]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Request Status">
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={report.requestStatusDistribution} dataKey="value" nameKey="label" outerRadius={85} label>
                {report.requestStatusDistribution.map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reservation Status">
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={report.reservationStatusDistribution} dataKey="value" nameKey="label" outerRadius={85} label>
                {report.reservationStatusDistribution.map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Books by Category">
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={report.categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department Activity">
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={report.departmentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Most Popular Books"
          rows={report.popularBooks}
          columns={[
            { key: "title", label: "Title" },
            { key: "author", label: "Author" },
            { key: "issueCount", label: "Issues" },
            { key: "averageRating", label: "Rating" }
          ]}
        />
        <DataTable
          title="Top Authors by Issue Count"
          rows={report.topAuthors}
          columns={[
            { key: "label", label: "Author" },
            { key: "titles", label: "Titles" },
            { key: "value", label: "Issues" }
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Low Stock Books"
          rows={report.lowStockBooks}
          empty="No low-stock titles"
          columns={[
            { key: "title", label: "Title" },
            { key: "category", label: "Category" },
            { key: "shelfLocation", label: "Shelf", render: (row) => row.shelfLocation || "Not assigned" },
            { key: "availableCopies", label: "Stock", render: (row) => `${row.availableCopies}/${row.totalCopies}` }
          ]}
        />
        <DataTable
          title="Unavailable Books"
          rows={report.unavailableBooks}
          empty="No unavailable books"
          columns={[
            { key: "title", label: "Title" },
            { key: "author", label: "Author" },
            { key: "issueCount", label: "Issues" },
            { key: "shelfLocation", label: "Shelf", render: (row) => row.shelfLocation || "Not assigned" }
          ]}
        />
      </div>

      <DataTable
        title="Overdue Books and Fine Exposure"
        rows={report.overdueIssueList}
        empty="No overdue books"
        columns={[
          { key: "student", label: "Student", render: (row) => row.student?.name || "Unknown" },
          { key: "book", label: "Book", render: (row) => row.book?.title || "Unknown" },
          { key: "dueDate", label: "Due Date", render: (row) => fmtDate(row.dueDate) },
          { key: "daysOverdue", label: "Days Overdue" },
          { key: "fine", label: "Est. Fine", render: (row) => `Rs. ${row.daysOverdue * 5}` }
        ]}
      />

      <DataTable
        title="Recent Issue Activity"
        rows={report.recentIssueRequests}
        columns={[
          { key: "student", label: "Student", render: (row) => row.student?.name || "Unknown" },
          { key: "book", label: "Book", render: (row) => row.book?.title || "Unknown" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Date", render: (row) => fmtDate(row.createdAt) }
        ]}
      />
    </div>
  );
};

export default Reports;
