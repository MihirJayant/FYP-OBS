// @ts-nocheck
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { getAdminRatings } from "@/api/constant";

export default function Ratings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Ratings ---------------- */
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await getAdminRatings();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load ratings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  /* ---------------- Export CSV ---------------- */
  const exportCSV = () => {
    if (!data.length) return;

    const headers = [
      "Job Title",
      "Reviewer Name",
      "Reviewer Email",
      "Provider Name",
      "Provider Email",
      "Rating",
      "Review",
      "Date",
    ];

    const rows = data.map((r) => [
      r.review_title,
      r.reviewer_name,
      r.reviewer_email,
      r.provider_name,
      r.provider_email,
      r.rating,
      r.review_detail,
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ratings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------- Export PDF ---------------- */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Ratings & Reviews Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Job", "Reviewer", "Provider", "Rating", "Review", "Date"]],
      body: data.map((r) => [
        r.review_title,
        r.reviewer_email,
        r.provider_email,
        r.rating,
        r.review_detail || "-",
        new Date(r.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        6: { cellWidth: 60 }, // Review column
      },
    });

    doc.save("ratings.pdf");
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
      accessorKey: "review_title",
      header: "Job Title",
    },
    {
      accessorKey: "reviewer_email",
      header: "Reviewer Email",
    },
    {
      accessorKey: "provider_email",
      header: "Provider Email",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <span className="text-yellow-500">
          {"⭐".repeat(row.original.rating)}
        </span>
      ),
    },
    {
      accessorKey: "review_detail",
      header: "Review",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[320px] block">
          {row.original.review_detail || "-"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout title="Ratings & Reviews">
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
          searchPlaceholder="Search ratings..."
        />
      </div>
    </AdminLayout>
  );
}
