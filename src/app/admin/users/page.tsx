"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

type User = {
  id: string;
  fullName: string;
  staffId: string | null;
  personType: "STAFF" | "INTERN";
  department: string | null;
  role: "STAFF" | "ADMIN";
  status: "PENDING" | "APPROVED" | "DEACTIVATED";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING">("ALL");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, body: object) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  const visible = filter === "PENDING" ? users.filter((u) => u.status === "PENDING") : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Users</h1>
        <div className="flex rounded-lg bg-white shadow-card p-1">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-sm rounded-md ${filter === "ALL" ? "bg-mtn-yellow" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 text-sm rounded-md ${filter === "PENDING" ? "bg-mtn-yellow" : ""}`}
          >
            Pending
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-mtn-grey">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-black/5 text-mtn-grey">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{u.fullName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{u.staffId ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{u.personType === "STAFF" ? "Staff" : "Intern/NSP"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{u.department ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge value={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge value={u.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {u.status !== "APPROVED" && (
                        <button
                          onClick={() => act(u.id, { action: "SET_STATUS", status: "APPROVED" })}
                          className="text-xs font-medium text-status-success underline"
                        >
                          Approve
                        </button>
                      )}
                      {u.status !== "DEACTIVATED" && (
                        <button
                          onClick={() => act(u.id, { action: "SET_STATUS", status: "DEACTIVATED" })}
                          className="text-xs font-medium text-status-error underline"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() =>
                          act(u.id, { action: "SET_ROLE", role: u.role === "ADMIN" ? "STAFF" : "ADMIN" })
                        }
                        className="text-xs font-medium underline"
                      >
                        {u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                      </button>
                      <button
                        onClick={() => {
                          const pw = prompt(`New password/PIN for ${u.fullName}:`);
                          if (pw) act(u.id, { action: "RESET_PASSWORD", newPassword: pw });
                        }}
                        className="text-xs font-medium underline"
                      >
                        Reset password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
