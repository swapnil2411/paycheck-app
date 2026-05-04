// import React from 'react'

// const Dashboard = () => {
//   return (
//     <div>index</div>
//   )
// }

// export default Dashboard

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../services/supabaseClient";
import { useAuth } from "../../context/authContext/AuthContext";
import Loader from "../../components/loader";
// import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    overdueCount: 0,
  });

  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const STATUS_CONFIG = {
    Paid:    { color: "#22c55e", bg: "#dcfce7", text: "#166534" },
    Created: { color: "#534AB7", bg: "#ede9fe", text: "#3730a3" },
    Sent:    { color: "#3b82f6", bg: "#dbeafe", text: "#1e40af" },
    Pending: { color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
    Overdue: { color: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount)}`;
  };

  const formatFullCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const daysSince = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        supabaseClient
          .from("clients")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
        supabaseClient
          .from("invoices")
          .select("*, clients(company_name)")
          .eq("user_id", user.id)
          .eq("is_deleted", false),
      ]);

      const allInvoices = invoicesRes.data || [];
      const totalClients = clientsRes.count || 0;
      const totalInvoices = allInvoices.length;

      const totalRevenue = allInvoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const pendingAmount = allInvoices
        .filter((inv) => inv.status !== "Paid")
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const overdueInvs = allInvoices.filter((inv) => inv.status === "Overdue");
      const overdueAmount = overdueInvs.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      setStats({ totalClients, totalInvoices, totalRevenue, pendingAmount, overdueAmount, overdueCount: overdueInvs.length });

      // Revenue by month
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = Array(12).fill(0);
      allInvoices
        .filter((inv) => inv.status === "Paid" && inv.invoice_date?.startsWith(String(currentYear)))
        .forEach((inv) => {
          const month = new Date(inv.invoice_date).getMonth();
          monthlyRevenue[month] += inv.total_amount || 0;
        });

      const maxRevenue = Math.max(...monthlyRevenue, 1);
      setRevenueByMonth(
        MONTHS.map((label, i) => ({
          label,
          amount: monthlyRevenue[i],
          pct: Math.round((monthlyRevenue[i] / maxRevenue) * 100),
        }))
      );

      // Status breakdown
      const statusCounts = {};
      allInvoices.forEach((inv) => {
        statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
      });
      setStatusBreakdown(
        Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
      );

      // Recent invoices
      const sorted = [...allInvoices].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentInvoices(sorted.slice(0, 5));

      // Overdue invoices
      setOverdueInvoices(
        overdueInvs.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard_page">
       <div className="page_header">
        <h2 className='section_title'>Dashboard</h2>
        <div className="dashboard_header_btn_grp">
          <button className='btn filled_btn' onClick={() => navigate("/clients")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="" d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z" />
          </svg>
          <span>Add Client</span>
        </button>

        <button className='btn filled_btn' onClick={() => navigate("/invoices/new")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="" d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z" />
          </svg>
          <span>Create Invoice</span>
        </button>
        </div>
      </div>

      {/* ── Overdue Alert ── */}
      {stats.overdueCount > 0 && (
        <div className="dashboard_overdue_alert">
          <div className="dashboard_overdue_alert_left">
            <span className="dashboard_overdue_alert_icon">!</span>
            <div>
              <div className="dashboard_overdue_alert_title">
                {stats.overdueCount} overdue invoice{stats.overdueCount > 1 ? "s" : ""} require attention
              </div>
              <div className="dashboard_overdue_alert_sub">
                Total overdue: {formatFullCurrency(stats.overdueAmount)}
              </div>
            </div>
          </div>
          <button className="dashboard_overdue_alert_btn" onClick={() => navigate("/invoices")}>
            View all
          </button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="dashboard_stats_grid">
        <div className="dashboard_stat_card primary">
          <div className="dashboard_stat_label">Total Clients</div>
          <div className="dashboard_stat_value">{stats.totalClients}</div>
          <div className="dashboard_stat_sub">Active accounts</div>
        </div>
        <div className="dashboard_stat_card secondary">
          <div className="dashboard_stat_label">Total Invoices</div>
          <div className="dashboard_stat_value">{stats.totalInvoices}</div>
          <div className="dashboard_stat_sub">All time</div>
        </div>
        <div className="dashboard_stat_card tertiary">
          <div className="dashboard_stat_label">Total Revenue</div>
          <div className="dashboard_stat_value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="dashboard_stat_sub">From paid invoices</div>
        </div>
        <div className="dashboard_stat_card quaternary">
          <div className="dashboard_stat_label">Pending Amount</div>
          <div className="dashboard_stat_value">{formatCurrency(stats.pendingAmount)}</div>
          <div className="dashboard_stat_sub">Pending + Overdue invoices</div>
        </div>

        <div className="dashboard_stat_card accent">
          <div className="dashboard_stat_label">Overdue Invoices</div>
          <div className="dashboard_stat_value danger">{(stats.overdueCount)}</div>
          <div className="dashboard_stat_sub">Overdue count</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="dashboard_charts_row">

        {/* Revenue by Month */}
        <div className="dashboard_card">
          <div className="dashboard_card_header">
            <span className="dashboard_card_title">Revenue by month</span>
            <span className="dashboard_card_meta">{new Date().getFullYear()}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {revenueByMonth.map((m) => (
              <div key={m.label} className="dashboard_bar_row">
                <span className="dashboard_bar_label">{m.label}</span>
                <div className="dashboard_bar_track">
                  <div className="dashboard_bar_fill" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="dashboard_bar_val">{m.amount > 0 ? formatCurrency(m.amount) : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="dashboard_card">
          <div className="dashboard_card_header">
            <span className="dashboard_card_title">Invoice status</span>
            <span className="dashboard_card_meta">{stats.totalInvoices} total</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {statusBreakdown.length === 0 && (
              <p className="dashboard_empty">No invoices yet</p>
            )}
            {statusBreakdown.map(({ status, count }) => {
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Created;
              const pct = stats.totalInvoices > 0
                ? Math.round((count / stats.totalInvoices) * 100)
                : 0;
              return (
                <div key={status} className="dashboard_status_row">
                  <span className="dashboard_status_dot" style={{ background: cfg.color }} />
                  <span className="dashboard_status_name">{status}</span>
                  <div className="dashboard_status_bar_track">
                    <div
                      className="dashboard_status_bar_fill"
                      style={{ width: `${pct}%`, background: cfg.color }}
                    />
                  </div>
                  <span className="dashboard_status_count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div className="dashboard_tables_row">

        {/* Recent Invoices */}
        <div className="dashboard_card">
          <div className="dashboard_card_header">
            <span className="dashboard_card_title">Recent invoices</span>
            <button className="dashboard_link_btn" onClick={() => navigate("/invoices")}>
              View all
            </button>
          </div>
          {recentInvoices.length === 0 && (
            <p className="dashboard_empty">No invoices yet</p>
          )}
          {recentInvoices.map((inv) => {
            const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.Created;
            return (
              <div key={inv.id} className="dashboard_table_row">
                <div>
                  <div className="dashboard_table_row_title">{inv.clients?.company_name || "—"}</div>
                  <div className="dashboard_table_row_sub">{inv.invoice_number} · {inv.invoice_date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="dashboard_badge"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {inv.status}
                  </span>
                  <span className="dashboard_table_row_amount">
                    {formatFullCurrency(inv.total_amount || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overdue Invoices */}
        <div className="dashboard_card">
          <div className="dashboard_card_header">
            <span className="dashboard_card_title">Overdue invoices</span>
            <span className="dashboard_card_meta">
              {overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? "s" : ""}
            </span>
          </div>
          {overdueInvoices.length === 0 && (
            <p className="dashboard_empty success">No overdue invoices</p>
          )}
          {overdueInvoices.map((inv) => (
            <div key={inv.id} className="dashboard_table_row">
              <div>
                <div className="dashboard_table_row_title">{inv.clients?.company_name || "—"}</div>
                <div className="dashboard_table_row_sub">
                  Due {inv.due_date} · {daysSince(inv.due_date)} days overdue
                </div>
              </div>
              <span className="dashboard_table_row_amount danger">
                {formatFullCurrency(inv.total_amount || 0)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;