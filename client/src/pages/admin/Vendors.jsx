// ============================================================
// src/pages/admin/Vendors.jsx
// Admin kelola vendor + LIHAT DETAIL vendor (tema, paket, info)
// ============================================================
import { useState } from "react";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { VENDORS, MAIN_PACKAGES, formatRupiah } from "../../data/packages";

var STATUS_VARIANT = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

// Data vendor dari data/packages.js + tambah status admin
var MOCK_VENDORS = VENDORS.map(function (v, i) {
  return Object.assign({}, v, {
    status: i === 0 ? "approved" : i === 3 ? "pending" : "approved",
    joinedDate: "2024-0" + (i + 1) + "-15",
    totalBookings: [48, 31, 22, 8, 15, 41][i] || 10,
  });
});

function AdminVendors() {
  var [vendors, setVendors] = useState(MOCK_VENDORS);
  var [filter, setFilter] = useState("all");
  var [search, setSearch] = useState("");
  var [page, setPage] = useState(1);
  var [detail, setDetail] = useState(null); // vendor yang dibuka detail-nya
  var [delTarget, setDelTarget] = useState(null);

  var PER_PAGE = 8;

  var filtered = vendors
    .filter(function (v) {
      return filter === "all" || v.status === filter;
    })
    .filter(function (v) {
      if (!search) return true;
      return (
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase())
      );
    });

  var totalPages = Math.ceil(filtered.length / PER_PAGE);
  var paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleApprove(id) {
    setVendors(function (prev) {
      return prev.map(function (v) {
        return v.id === id ? Object.assign({}, v, { status: "approved" }) : v;
      });
    });
  }
  function handleReject(id) {
    setVendors(function (prev) {
      return prev.map(function (v) {
        return v.id === id ? Object.assign({}, v, { status: "rejected" }) : v;
      });
    });
  }
  function handleDelete() {
    setVendors(function (prev) {
      return prev.filter(function (v) {
        return v.id !== delTarget.id;
      });
    });
    setDelTarget(null);
  }

  var COLUMNS = [
    {
      key: "name",
      label: "Nama Vendor",
      render: function (row) {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-[var(--color-parchment)]">
              <img
                src={row.img}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                {row.name}
              </p>
              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                {row.location}
              </p>
            </div>
          </div>
        );
      },
    },
    { key: "category", label: "Kategori" },
    {
      key: "rating",
      label: "Rating",
      render: function (row) {
        return (
          <span className="text-sm text-[var(--color-gold)] font-[var(--font-sans)]">
            ★ {row.rating} ({row.reviews})
          </span>
        );
      },
    },
    { key: "totalBookings", label: "Booking" },
    {
      key: "status",
      label: "Status",
      render: function (row) {
        var label = {
          approved: "Disetujui",
          pending: "Menunggu",
          rejected: "Ditolak",
        };
        return (
          <Badge variant={STATUS_VARIANT[row.status]} dot>
            {label[row.status]}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Aksi",
      render: function (row) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* TOMBOL DETAIL — fitur baru */}
            <Button
              size="xs"
              variant="outline"
              onClick={function () {
                setDetail(row);
              }}
            >
              Detail
            </Button>
            {row.status === "pending" && (
              <>
                <Button
                  size="xs"
                  variant="gold"
                  onClick={function () {
                    handleApprove(row.id);
                  }}
                >
                  Setujui
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={function () {
                    handleReject(row.id);
                  }}
                >
                  Tolak
                </Button>
              </>
            )}
            <Button
              size="xs"
              variant="danger"
              onClick={function () {
                setDelTarget(row);
              }}
            >
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Manajemen Vendor
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Tinjau, setujui, dan kelola semua vendor AMARANTA.
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
          placeholder="Cari nama atau lokasi..."
          className="px-4 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors w-60"
        />
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map(function (f) {
            var label = {
              all: "Semua",
              pending: "Menunggu",
              approved: "Disetujui",
              rejected: "Ditolak",
            };
            return (
              <button
                key={f}
                onClick={function () {
                  setFilter(f);
                  setPage(1);
                }}
                className={[
                  "px-3 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all",
                  filter === f
                    ? "bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]"
                    : "border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]",
                ].join(" ")}
              >
                {label[f]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-[var(--color-cream-border)] mb-6">
        <Table
          columns={COLUMNS}
          data={paginated}
          rowKey="id"
          emptyText="Tidak ada vendor ditemukan."
        />
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* ── MODAL DETAIL VENDOR ── */}
      <Modal
        isOpen={!!detail}
        onClose={function () {
          setDetail(null);
        }}
        title={detail ? detail.name : ""}
        size="xl"
      >
        {detail && (
          <div className="space-y-6">
            {/* Info dasar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Kategori", value: detail.category },
                { label: "Lokasi", value: detail.location },
                {
                  label: "Rating",
                  value:
                    "★ " + detail.rating + " (" + detail.reviews + " ulasan)",
                },
                { label: "Berdiri", value: detail.since || "2015" },
              ].map(function (item) {
                return (
                  <div
                    key={item.label}
                    className="border border-[var(--color-cream-border)] p-3"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Deskripsi */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                Deskripsi
              </p>
              <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] leading-relaxed">
                {detail.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {/* Tags / Tema */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                Tag / Tema
              </p>
              <div className="flex flex-wrap gap-2">
                {(detail.tags || []).map(function (t) {
                  return (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] font-[var(--font-sans)] uppercase tracking-widest"
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Paket yang ditawarkan */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
                Paket yang Ditawarkan
              </p>
              <div className="space-y-2">
                {(detail.packages || []).map(function (pkg) {
                  var mainPkg = MAIN_PACKAGES.find(function (p) {
                    return p.id === pkg.tierId;
                  });
                  if (!mainPkg) return null;
                  return (
                    <div
                      key={pkg.tierId}
                      className="flex items-center justify-between p-3 border border-[var(--color-cream-border)] bg-[var(--color-cream)]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: mainPkg.color }}
                        />
                        <span className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                          Paket {mainPkg.tier}
                        </span>
                        <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                          {mainPkg.guests}
                        </span>
                      </div>
                      <span className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                        {formatRupiah(pkg.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Galeri */}
            {detail.gallery && detail.gallery.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
                  Galeri
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {detail.gallery.map(function (img, i) {
                    return (
                      <div key={i} className="aspect-square overflow-hidden">
                        <img
                          src={img}
                          alt={"galeri " + i}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tim */}
            {detail.team && detail.team.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
                  Tim
                </p>
                <div className="flex flex-wrap gap-3">
                  {detail.team.map(function (member) {
                    return (
                      <div
                        key={member.name}
                        className="flex items-center gap-3 p-3 border border-[var(--color-cream-border)] bg-white"
                      >
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                            {member.name}
                          </p>
                          <p className="text-xs text-[var(--color-gold)] font-[var(--font-sans)]">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aksi admin */}
            <div className="flex gap-3 pt-3 border-t border-[var(--color-cream-border)]">
              {detail.status === "pending" && (
                <>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={function () {
                      handleApprove(detail.id);
                      setDetail(null);
                    }}
                  >
                    Setujui Vendor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      handleReject(detail.id);
                      setDetail(null);
                    }}
                  >
                    Tolak
                  </Button>
                </>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={function () {
                  setDelTarget(detail);
                  setDetail(null);
                }}
              >
                Hapus Vendor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        isOpen={!!delTarget}
        onClose={function () {
          setDelTarget(null);
        }}
        title="Hapus Vendor"
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
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Hapus Permanen
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
          Yakin ingin menghapus{" "}
          <strong className="text-[var(--color-dark)]">
            {delTarget && delTarget.name}
          </strong>
          ? Aksi ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}

export default AdminVendors;
