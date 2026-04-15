// @ts-nocheck
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { getAdminWalletLedger } from "@/api/constant";

export default function WalletLedger() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Wallet Ledger ---------------- */
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await getAdminWalletLedger();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load wallet ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  /* ---------------- Export CSV ---------------- */
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["User", "Type", "Diamonds", "Balance", "Date"];
    const rows = data.map((l) => [
      l.email,
      l.type,
      l.diamonds,
      l.balance,
      new Date(l.created_at).toLocaleDateString(),
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
    link.setAttribute("download", "wallet-ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------- Export PDF ---------------- */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Wallet Ledger Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["User", "Type", "Diamonds", "Balance", "Date"]],
      body: data.map((l) => [
        l.email,
        l.type,
        l.diamonds,
        l.balance,
        new Date(l.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("wallet-ledger.pdf");
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
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "diamonds",
      header: "Diamonds",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.diamonds} 💎</span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.balance} 💎</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout title="Wallet Ledger">
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
          searchPlaceholder="Search ledger..."
        />
      </div>
    </AdminLayout>
  );
}
