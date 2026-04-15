// @ts-nocheck
import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import {
  getAdminUsers,
  deleteAdminUser,
} from "@/api/constant";

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      setData(res?.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Export users to CSV
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["Name", "Email", "Role", "Location", "Joined"];
    const rows = data.map((u) => [
      u.name,
      u.email,
      u.role,
      u.location || "Not set",
      new Date(u.created_at).toLocaleDateString(),
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
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export users to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Users Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Name", "Email", "Role", "Location", "Joined"]],
      body: data.map((u) => [
        u.name,
        u.email,
        u.role,
        u.location || "Not set",
        new Date(u.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("users.pdf");
  };

  // Delete user after confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await deleteAdminUser(selectedUser.id);
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Table column definitions
  const columns = [
    {
      id: "index",
      header: "#",
      cell: ({ row, table }) =>
        table.getFilteredRowModel().rows.findIndex((r) => r.id === row.id) + 1,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const variant = role === "poster" ? "default" : "secondary";
        return (
          <Badge variant={variant} className="capitalize">
            {role === "poster" ? "Job Poster" : "Service Provider"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.location || "Not set"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedUser(row.original);
              setDeleteDialogOpen(true);
            }}
            title="Delete user"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Job Posters</p>
            <p className="text-2xl font-bold">
              {data.filter((u) => u.role === "poster").length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Service Providers</p>
            <p className="text-2xl font-bold">
              {data.filter((u) => u.role === "provider").length}
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
          searchPlaceholder="Search users..."
        />

        {/* Delete confirmation dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AdminLayout>
  );
}
