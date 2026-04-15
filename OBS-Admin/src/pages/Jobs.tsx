// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, XCircle, Ban } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import {
  getAdminJobs,
  updateAdminJobStatus,
  deleteAdminJob,
} from "@/api/constant";

export default function Jobs() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getAdminJobs();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Export to CSV
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["Title", "Category", "Budget", "Status", "Poster", "Date"];
    const rows = data.map((j) => [
      j.title,
      j.category,
      j.budget,
      j.status,
      j.poster_name || "Unknown",
      new Date(j.created_at).toLocaleDateString(),
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
    link.setAttribute("download", "jobs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Jobs Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Title", "Category", "Budget", "Status", "Poster", "Date"]],
      body: data.map((j) => [
        j.title,
        j.category,
        `£${j.budget}`,
        j.status,
        j.poster_name || "Unknown",
        new Date(j.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("jobs.pdf");
  };

  // Cancel a job
  const handleCancelJob = async (job) => {
    try {
      await updateAdminJobStatus(job.id, { status: "cancelled" });
      toast.success("Job cancelled successfully");
      fetchJobs();
    } catch (err) {
      toast.error(err.message || "Failed to cancel job");
    }
  };

  // Close a job
  const handleCloseJob = async (job) => {
    try {
      await updateAdminJobStatus(job.id, { status: "closed" });
      toast.success("Job closed successfully");
      fetchJobs();
    } catch (err) {
      toast.error(err.message || "Failed to close job");
    }
  };

  // Delete a job
  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;

    try {
      await deleteAdminJob(selectedJob.id);
      toast.success("Job deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Status badge colour
  const getStatusVariant = (status) => {
    switch (status) {
      case "open":
        return "default";
      case "awarded":
        return "secondary";
      case "in_progress":
        return "outline";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      case "closed":
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
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => <span>£{row.original.budget}</span>,
    },
    {
      accessorKey: "poster_name",
      header: "Posted By",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.poster_name || "Unknown"}
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        const isActive = job.status === "open" || job.status === "awarded";

        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/jobs/${job.id}`)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancelJob(job)}
                title="Cancel job"
              >
                <Ban className="h-4 w-4 text-orange-500" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedJob(job);
                setDeleteDialogOpen(true);
              }}
              title="Delete job"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout title="Jobs Management">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-green-600">
              {data.filter((j) => j.status === "open").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Awarded</p>
            <p className="text-2xl font-bold text-blue-600">
              {data.filter((j) => j.status === "awarded").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-gray-600">
              {data.filter((j) => j.status === "completed").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">
              {data.filter((j) => j.status === "cancelled").length}
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
          searchPlaceholder="Search jobs..."
        />

        {/* Delete confirmation */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AdminLayout>
  );
}
