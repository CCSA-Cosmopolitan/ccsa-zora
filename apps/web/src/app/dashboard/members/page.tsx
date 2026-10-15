"use client";

import React, { useState } from "react";
import {
  Users2,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useWorkspace, EnterpriseMember } from "@/context/workspace-context";

export default function MembersPage() {
  const { members, addMember, toggleMemberStatus, enterpriseName } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Farmer" | "Extension Officer" | "Agronomist">("Farmer");
  const [newCluster, setNewCluster] = useState("Bichi Irrigation Zone");
  const [newState, setNewState] = useState("Kano");
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(50);
  const [addSuccessMessage, setAddSuccessMessage] = useState("");

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cluster.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || m.role === roleFilter;
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newFullName || !newPhone) return;

    addMember({
      fullName: newFullName,
      phone: newPhone,
      email: newEmail || `${newFullName.toLowerCase().replace(/\s+/g, ".")}@${enterpriseName.toLowerCase().replace(/\s+/g, "")}.ng`,
      role: newRole,
      cluster: newCluster,
      state: newState,
      monthlyLimit: Number(newMonthlyLimit) || 50,
    });

    setAddSuccessMessage(`Successfully registered ${newFullName}!`);
    setTimeout(() => {
      setAddSuccessMessage("");
      setIsAddModalOpen(false);
      setNewFullName("");
      setNewPhone("");
      setNewEmail("");
    }, 1500);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Users2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Farmers & Field Agents Roster
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage member accounts, assign voice consultation limits, and monitor field agent activity for {enterpriseName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member / Agent</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Registered Members
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-mono">
            {members.length + 1835}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            +18 enrolled this week
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Active Field Agents
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-mono">
            24
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            Covering 6 Local Gov Areas
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Monthly Diagnoses
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-mono">
            4,392
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            94.2% pest resolution rate
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Cooperative Quota Used
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-mono">
            14.3%
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            42,850 tokens remaining
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by farmer name, phone number, or farming cluster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="Farmer">Farmers</option>
              <option value="Extension Officer">Extension Officers</option>
              <option value="Agronomist">Agronomists</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Farming Cluster</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Voice Queries Used</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredMembers.map((m) => {
                const percent = Math.min(100, Math.round((m.queriesUsed / m.monthlyLimit) * 100));
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-xs text-stone-700 dark:text-stone-300 shrink-0">
                          {m.fullName
                            .split(" ")
                            .map((p) => p[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-stone-100">
                            {m.fullName}
                          </div>
                          <div className="text-xs text-stone-400">Enrolled {m.joinedDate}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {m.role === "Extension Officer" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          Extension Officer
                        </span>
                      )}
                      {m.role === "Agronomist" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                          Lead Agronomist
                        </span>
                      )}
                      {m.role === "Farmer" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          Member Farmer
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{m.cluster}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 ml-5">{m.state} State</div>
                    </td>

                    <td className="px-4 py-4 text-xs space-y-0.5 text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {m.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {m.email}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {m.queriesUsed}
                          </span>
                          <span className="text-stone-400">/ {m.monthlyLimit}</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 85 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === "Active" ? "bg-emerald-500" : "bg-stone-400"
                          }`}
                        />
                        {m.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => toggleMemberStatus(m.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          m.status === "Active"
                            ? "border-stone-200 dark:border-stone-800 hover:border-red-400 text-stone-500 hover:text-red-500"
                            : "border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        {m.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Register Farmer or Field Agent
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Add a member to {enterpriseName} with allocated monthly Zora voice quota.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                ✕
              </button>
            </div>

            {addSuccessMessage ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                {addSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleCreateMember} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aliyu Abubakar"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+234 803 000 0000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full text-sm font-mono bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                      Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) =>
                        setNewRole(e.target.value as "Farmer" | "Extension Officer" | "Agronomist")
                      }
                      className="w-full text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Extension Officer">Extension Officer</option>
                      <option value="Agronomist">Agronomist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                    Farming Cluster / LGA
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bichi Irrigation Zone"
                    value={newCluster}
                    onChange={(e) => setNewCluster(e.target.value)}
                    className="w-full text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                      State
                    </label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                      Monthly Query Limit
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={newMonthlyLimit}
                      onChange={(e) => setNewMonthlyLimit(Number(e.target.value))}
                      className="w-full text-sm font-mono bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    Register Member
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
