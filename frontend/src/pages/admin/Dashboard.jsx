import { useEffect, useMemo, useState } from "react";
import { Activity, MoreVertical, RefreshCw } from "lucide-react";

import {
  PageTitle,
  StatCard,
  StatusPill,
} from "../../components/admin/SidebarPage";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeDiplomas: 0,
    revokedDiplomas: 0,
  });

  const [recentAnchoring, setRecentAnchoring] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const [error, setError] = useState("");

  const institutionId = profile?.institution_id;

  const loadDashboard = async (isRefresh = false) => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // =========================================================
      // 1. TOTAL ALUMNI
      // =========================================================
      const { count: totalAlumni, error: alumniError } = await supabase
        .from("alumni")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("institution_id", institutionId);

      if (alumniError) {
        throw alumniError;
      }

      // =========================================================
      // 2. TOTAL IJAZAH ACTIVE
      // =========================================================
      const { count: activeDiplomas, error: activeError } =
        await supabase
          .from("diplomas")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("institution_id", institutionId)
          .eq("validity_status", "active");

      if (activeError) {
        throw activeError;
      }

      // =========================================================
      // 3. TOTAL IJAZAH REVOKED
      // =========================================================
      const { count: revokedDiplomas, error: revokedError } =
        await supabase
          .from("diplomas")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("institution_id", institutionId)
          .eq("validity_status", "revoked");

      if (revokedError) {
        throw revokedError;
      }

      setStats({
        totalAlumni: totalAlumni || 0,
        activeDiplomas: activeDiplomas || 0,
        revokedDiplomas: revokedDiplomas || 0,
      });

      // =========================================================
      // 4. AMBIL DIPLOMA YANG SUDAH DI-ANCHOR
      // =========================================================
      const { data: anchoredDiplomas, error: diplomaError } =
        await supabase
          .from("diplomas")
          .select(`
            id,
            diploma_number,
            nisn,
            major,
            validity_status,
            ocr_status,
            anchored_at,
            alumni_id
          `)
          .eq("institution_id", institutionId)
          .not("anchored_at", "is", null)
          .order("anchored_at", {
            ascending: false,
          })
          .limit(50);

      if (diplomaError) {
        throw diplomaError;
      }

      // =========================================================
      // 5. AMBIL DATA ALUMNI UNTUK RECENT ANCHORING
      // =========================================================
      const alumniIds = [
        ...new Set(
          (anchoredDiplomas || [])
            .map((item) => item.alumni_id)
            .filter(Boolean)
        ),
      ];

      let alumniMap = {};

      if (alumniIds.length > 0) {
        const { data: alumniData, error: alumniDataError } =
          await supabase
            .from("alumni")
            .select(`
              id,
              full_name,
              nisn,
              major
            `)
            .in("id", alumniIds);

        if (alumniDataError) {
          throw alumniDataError;
        }

        alumniMap = (alumniData || []).reduce((acc, alumni) => {
          acc[alumni.id] = alumni;
          return acc;
        }, {});
      }

      // =========================================================
      // 6. AMBIL TRANSACTION HASH DARI DIPLOMA_ANCHORS
      // =========================================================
      const diplomaIds = (anchoredDiplomas || []).map(
        (item) => item.id
      );

      let anchorMap = {};

      if (diplomaIds.length > 0) {
        const { data: anchors, error: anchorError } =
          await supabase
            .from("diploma_anchors")
            .select(`
              diploma_id,
              polygon_tx_hash,
              network,
              status,
              anchored_at
            `)
            .in("diploma_id", diplomaIds)
            .order("created_at", {
              ascending: false,
            });

        if (anchorError) {
          throw anchorError;
        }

        anchorMap = (anchors || []).reduce((acc, anchor) => {
          // Simpan anchor terbaru untuk setiap diploma
          if (!acc[anchor.diploma_id]) {
            acc[anchor.diploma_id] = anchor;
          }

          return acc;
        }, {});
      }

      // =========================================================
      // 7. BENTUK DATA RECENT ANCHORING
      // =========================================================
      const recentRows = (anchoredDiplomas || [])
        .slice(0, 8)
        .map((diploma) => {
          const alumni = alumniMap[diploma.alumni_id];
          const anchor = anchorMap[diploma.id];

          return {
            id: diploma.id,
            diplomaNumber: diploma.diploma_number,
            name: alumni?.full_name || "-",
            major:
              diploma.major ||
              alumni?.major ||
              "-",
            status:
              diploma.validity_status === "revoked"
                ? "Revoked"
                : anchor?.status === "processing"
                  ? "Pending"
                  : anchor?.status === "failed"
                    ? "Failed"
                    : "Active",
            transactionHash:
              anchor?.polygon_tx_hash ||
              "Belum tersedia",
            anchoredAt: diploma.anchored_at,
          };
        });

      setRecentAnchoring(recentRows);

      // =========================================================
      // 8. DATA CHART 6 BULAN TERAKHIR
      // =========================================================
      const months = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();

        date.setMonth(date.getMonth() - i);

        months.push({
          key: `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`,
          label: date.toLocaleDateString("id-ID", {
            month: "short",
          }),
          count: 0,
        });
      }

      (anchoredDiplomas || []).forEach((diploma) => {
        if (!diploma.anchored_at) return;

        const date = new Date(diploma.anchored_at);

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const target = months.find(
          (month) => month.key === key
        );

        if (target) {
          target.count += 1;
        }
      });

      setActivityData(months);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.message ||
        "Gagal mengambil data dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [institutionId]);

  // ===========================================================
  // MAX CHART VALUE
  // ===========================================================
  const maxActivity = useMemo(() => {
    const max = Math.max(
      ...activityData.map((item) => item.count),
      1
    );

    return max;
  }, [activityData]);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusType = (status) => {
    if (status === "Active") return "lime";
    if (status === "Pending") return "blue";
    return "red";
  };

  if (loading) {
    return (
      <div>
        <PageTitle
          title="Overview"
          subtitle="Real-time metrics for diploma anchoring and verification."
        />

        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#aaa5b3]">
            <RefreshCw
              size={16}
              className="animate-spin"
            />
            Memuat dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* =======================================================
          HEADER
      ======================================================== */}
      <PageTitle
        title="Overview"
        subtitle="Real-time metrics for diploma anchoring and verification."
        action={
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-[#3a3942] bg-[#202024] px-3 py-2 text-xs text-[#ddd8e7] transition hover:bg-[#29282e] disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        }
      />

      {/* =======================================================
          ERROR
      ======================================================== */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* =======================================================
          STAT CARDS
      ======================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Alumni"
          value={formatNumber(stats.totalAlumni)}
          detail="Registered"
        />

        <StatCard
          label="Ijazah Active"
          value={formatNumber(
            stats.activeDiplomas
          )}
          detail="● Secured"
        />

        <StatCard
          label="Ijazah Revoked"
          value={formatNumber(
            stats.revokedDiplomas
          )}
          detail={
            stats.revokedDiplomas > 0
              ? "Needs attention"
              : "No revoked diploma"
          }
          accent="red"
        />

        <StatCard
          label="Database Status"
          value="ONLINE"
          detail="Supabase"
        />
      </div>

      {/* =======================================================
          CHART + RECENT ANCHORING
      ======================================================== */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[215px_1fr]">
        {/* =====================================================
            ANCHORING ACTIVITY
        ====================================================== */}
        <div className="dvms-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#3a3942] px-3 py-3 text-sm">
            <div className="flex items-center gap-2">
              <Activity size={14} />
              Anchoring Activity
            </div>

            <MoreVertical size={14} />
          </div>

          <div className="h-[265px] p-3">
            <div className="flex h-full items-end gap-2 border-b border-[#2b2b30]">
              {activityData.map((item) => {
                const height =
                  item.count === 0
                    ? 4
                    : Math.max(
                      (item.count /
                        maxActivity) *
                      100,
                      8
                    );

                return (
                  <div
                    key={item.key}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div className="text-[8px] text-[#aaa5b3]">
                      {item.count}
                    </div>

                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#3217c7] to-[#5c33ff] transition-all"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.count} anchoring`}
                    />

                    <div className="text-[8px] text-[#77737f]">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT ANCHORING
        ====================================================== */}
        <div className="dvms-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#3a3942] px-3 py-3 text-sm">
            <span>Recent Anchoring</span>

            <span className="text-[10px] text-[#d0c7e6]">
              {recentAnchoring.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#1c1c1f] text-[#b6b2be]">
                <tr>
                  <th className="p-3">
                    No. Ijazah
                  </th>

                  <th className="p-3">
                    Name
                  </th>

                  <th className="p-3">
                    Jurusan
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Transaction Hash
                  </th>

                  <th className="p-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAnchoring.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-[#77737f]"
                    >
                      Belum ada diploma yang
                      di-anchor.
                    </td>
                  </tr>
                ) : (
                  recentAnchoring.map(
                    (row) => (
                      <tr
                        key={row.id}
                        className="border-t border-[#36353d]"
                      >
                        <td className="p-3">
                          {row.diplomaNumber}
                        </td>

                        <td className="p-3">
                          {row.name}
                        </td>

                        <td className="p-3">
                          {row.major}
                        </td>

                        <td className="p-3">
                          <StatusPill
                            type={getStatusType(
                              row.status
                            )}
                          >
                            {row.status}
                          </StatusPill>
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              row.transactionHash ===
                                "Belum tersedia"
                                ? "text-[#77737f]"
                                : "mono"
                            }
                          >
                            {row.transactionHash ===
                              "Belum tersedia"
                              ? row.transactionHash
                              : row.transactionHash.length >
                                18
                                ? `${row.transactionHash.slice(
                                  0,
                                  10
                                )}...${row.transactionHash.slice(
                                  -8
                                )}`
                                : row.transactionHash}
                          </span>
                        </td>

                        <td className="p-3 text-[#aaa5b3]">
                          {formatDate(
                            row.anchoredAt
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =======================================================
          INFO
      ======================================================== */}
      <div className="mt-4 flex items-center gap-2 text-[10px] text-[#77737f]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#b8ff3d]" />

        Data dashboard diperbarui langsung dari
        database DVMS.
      </div>
    </div>
  );
}