// @ts-nocheck
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { getAdminPayments } from "@/api/constant";

export default function Payments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Payments ---------------- */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayments();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ---------------- Export CSV ---------------- */
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["User", "Amount", "Method", "Status", "Date"];
    const rows = data.map((p) => [
      p.user_name,
      p.amount,
      p.method,
      p.status,
      new Date(p.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------- Export PDF ---------------- */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Payments Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["User", "Amount", "Method", "Status", "Date"]],
      body: data.map((p) => [
        p.user_name,
        p.amount,
        p.method,
        p.status,
        new Date(p.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("payments.pdf");
  };

  /* ---------------- Table Columns ---------------- */
  const columns = [
    {
      id: "index",
      header: "#",
      cell: ({ row, table }) =>
        table.getFilteredRowModel().rows.findIndex((r) => r.id === row.id) + 1,
      enableSorting: false,
    },
    {
      accessorKey: "user_name",
      header: "User",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user_name}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <span>₹ {row.original.amount}</span>,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase">
          {row.original.method}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "success" ? "default" : "destructive"
          }
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout title="Payments">
      <div className="space-y-6">
        {/* ACTION BAR */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={exportCSV}>
            Download CSV
          </Button>
          <Button onClick={exportPDF}>Download PDF</Button>
        </div>

        {/* TABLE */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Search payments..."
        />
      </div>
    </AdminLayout>
  );
}
