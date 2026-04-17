// ============================================================
// src/pages/admin/Users.jsx — Manajemen Pengguna (Indonesia)
// ============================================================
import { useState } from "react";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";

var ROLE_LABEL = { customer: "Pelanggan", vendor: "Vendor", admin: "Admin" };
var ROLE_VARIANT = { customer: "info", vendor: "gold", admin: "dark" };

var MOCK_USERS = [
  {
    id: 1,
    name: "Rina Kusuma",
    email: "rina@gmail.com",
    phone: "081234567890",
    role: "customer",
    joined: "2024-03-10",
    bookings: 2,
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    phone: "082345678901",
    role: "customer",
    joined: "2024-04-15",
    bookings: 1,
  },
  {
    id: 3,
    name: "Sofia Wahyuni",
    email: "sofia@gmail.com",
    phone: "083456789012",
    role: "customer",
    joined: "2024-05-20",
    bookings: 3,
  },
  {
    id: 4,
    name: "Maya Putri",
    email: "maya@gmail.com",
    phone: "084567890123",
    role: "customer",
    joined: "2024-06-05",
    bookings: 0,
  },
  {
    id: 5,
    name: "Clara Dewi",
    email: "clara@gmail.com",
    phone: "085678901234",
    role: "customer",
    joined: "2024-07-12",
    bookings: 1,
  },
  {
    id: 6,
    name: "Anisa Dewi",
    email: "vendor@amaranta.id",
    phone: "082222222222",
    role: "vendor",
    joined: "2024-01-15",
    bookings: 0,
  },
  {
    id: 7,
    name: "Julian Ahmad",
    email: "julian@jvfilms.com",
    phone: "086789012345",
    role: "vendor",
    joined: "2024-02-20",
    bookings: 0,
  },
  {
    id: 8,
    name: "Maya Florencia",
    email: "maya@petals.com",
    phone: "087890123456",
    role: "vendor",
    joined: "2024-03-01",
    bookings: 0,
  },
  {
    id: 9,
    name: "Admin AMARANTA",
    email: "admin@amaranta.id",
    phone: "081111111111",
    role: "admin",
    joined: "2023-01-01",
    bookings: 0,
  },
  {
    id: 10,
    name: "Hendra Wijaya",
    email: "hendra@melody.com",
    phone: "088901234567",
    role: "vendor",
    joined: "2024-04-10",
    bookings: 0,
  },
  {
    id: 11,
    name: "Lisa Permata",
    email: "lisa@gmail.com",
    phone: "089012345678",
    role: "customer",
    joined: "2024-08-01",
    bookings: 2,
  },
  {
    id: 12,
    name: "Reza Mahendra",
    email: "reza@gmail.com",
    phone: "081123456789",
    role: "customer",
    joined: "2024-09-10",
    bookings: 1,
  },
];

function AdminUsers() {
  var [users, setUsers] = useState(MOCK_USERS);
  var [filter, setFilter] = useState("all");
  var [search, setSearch] = useState("");
  var [page, setPage] = useState(1);
  var [delTarget, setDelTarget] = useState(null);
  var [detail, setDetail] = useState(null);
  var PER_PAGE = 10;

  var filtered = users
    .filter(function (u) {
      return filter === "all" || u.role === filter;
    })
    .filter(function (u) {
      if (!search) return true;
      return (
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    });

  var totalPages = Math.ceil(filtered.length / PER_PAGE);
  var paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  var COLUMNS = [
    {
      key: "name",
      label: "Nama",
      render: function (row) {
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-parchment)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[var(--color-gold)] font-[var(--font-sans)]">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                {row.name}
              </p>
              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                {row.email}
              </p>
            </div>
          </div>
        );
      },
    },
    { key: "phone", label: "No. HP" },
    {
      key: "role",
      label: "Peran",
      render: function (row) {
        return (
          <Badge variant={ROLE_VARIANT[row.role]}>{ROLE_LABEL[row.role]}</Badge>
        );
      },
    },
    {
      key: "bookings",
      label: "Booking",
      render: function (row) {
        return (
          <span className="text-sm font-[var(--font-sans)] text-[var(--color-dark)]">
            {row.bookings}
          </span>
        );
      },
    },
    { key: "joined", label: "Bergabung" },
    {
      key: "actions",
      label: "",
      render: function (row) {
        return (
          <div className="flex gap-1.5">
            <Button
              size="xs"
              variant="outline"
              onClick={function () {
                setDetail(row);
              }}
            >
              Detail
            </Button>
            {row.role !== "admin" && (
              <Button
                size="xs"
                variant="danger"
                onClick={function () {
                  setDelTarget(row);
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Kelola semua akun pelanggan, vendor, dan admin.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={function (e) {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama atau email..."
          className="px-4 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors w-60"
        />
        <div className="flex gap-2">
          {[
            { val: "all", label: "Semua" },
            { val: "customer", label: "Pelanggan" },
            { val: "vendor", label: "Vendor" },
            { val: "admin", label: "Admin" },
          ].map(function (f) {
            return (
              <button
                key={f.val}
                onClick={function () {
                  setFilter(f.val);
                  setPage(1);
                }}
                className={[
                  "px-3 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all",
                  filter === f.val
                    ? "bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]"
                    : "border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
          {filtered.length} pengguna
        </span>
      </div>

      <div className="bg-white border border-[var(--color-cream-border)] mb-6">
        <Table
          columns={COLUMNS}
          data={paginated}
          rowKey="id"
          emptyText="Tidak ada pengguna ditemukan."
        />
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal detail */}
      <Modal
        isOpen={!!detail}
        onClose={function () {
          setDetail(null);
        }}
        title={detail ? "Detail: " + detail.name : ""}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--color-gold-pale)] flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--color-gold)] font-[var(--font-display)]">
                  {detail.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                  {detail.name}
                </p>
                <Badge variant={ROLE_VARIANT[detail.role]}>
                  {ROLE_LABEL[detail.role]}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Email", value: detail.email },
                { label: "No. HP", value: detail.phone },
                { label: "Peran", value: ROLE_LABEL[detail.role] },
                { label: "Bergabung", value: detail.joined },
                {
                  label: "Total Booking",
                  value: detail.bookings + " pemesanan",
                },
              ].map(function (item) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 py-2 border-b border-[var(--color-cream-border)] last:border-0"
                  >
                    <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] uppercase tracking-widest w-28 flex-shrink-0">
                      {item.label}
                    </span>
                    <span className="text-sm text-[var(--color-dark)] font-[var(--font-sans)]">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hapus */}
      <Modal
        isOpen={!!delTarget}
        onClose={function () {
          setDelTarget(null);
        }}
        title="Hapus Pengguna"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={function () {
                setDelTarget(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={function () {
                setUsers(function (p) {
                  return p.filter(function (u) {
                    return u.id !== delTarget.id;
                  });
                });
                setDelTarget(null);
              }}
            >
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
          Hapus akun{" "}
          <strong className="text-[var(--color-dark)]">
            {delTarget && delTarget.name}
          </strong>
          ? Data pemesanan terkait juga akan dihapus.
        </p>
      </Modal>
    </div>
  );
}

export default AdminUsers;
