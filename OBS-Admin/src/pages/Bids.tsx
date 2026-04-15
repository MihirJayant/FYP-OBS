// @ts-nocheck
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { getAdminBids } from "@/api/constant";

export default function Bids() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all bids
  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await getAdminBids();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  // Export to CSV
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["Provider", "Job ID", "Diamonds", "Est. Days", "Status", "Message", "Date"];
    const rows = data.map((b) => [
      b.provider_name || "Unknown",
      b.job_id,
      b.diamonds_used,
      b.estimated_days,
      b.status,
      b.message || "-",
      new Date(b.created_at).toLocaleDateString(),
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
    link.setAttribute("download", "bids.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Bids Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Provider", "Diamonds", "Est. Days", "Status", "Message", "Date"]],
      body: data.map((b) => [
        b.provider_name || "Unknown",
        `${b.diamonds_used} 💎`,
        b.estimated_days,
        b.status,
        b.message || "-",
        new Date(b.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("bids.pdf");
  };

  // Status badge styling
  const getStatusVariant = (status) => {
    switch (status) {
      case "accepted":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Table columns
  const columns = [
    {
      id: "index",
      header: "#",
      cell: ({ row, table }) =>
        table.getFilteredRowModel().rows.findIndex((r) => r.id === row.id) + 1,
      enableSorting: false,
    },
    {
      accessorKey: "provider_name",
      header: "Provider",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.provider_name || "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "diamonds_used",
      header: "Bid Amount",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.diamonds_used} 💎</Badge>
      ),
    },
    {
      accessorKey: "estimated_days",
      header: "Est. Days",
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[250px] block text-sm">
          {row.original.message || "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={getStatusVariant(row.original.status)}
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout title="Bids Management">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Bids</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {data.filter((b) => b.status === "accepted").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {data.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {data.filter((b) => b.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={exportCSV}>
            Download CSV
          </Button>
          <Button onClick={exportPDF}>Download PDF</Button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Search bids..."
        />
      </div>
    </AdminLayout>
  );
}
