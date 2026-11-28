
import {
  Fragment,
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
  Tags,
  LogOut,
  RefreshCw,
  ScrollText,
  Search,
  Download,
  Check,
  X,
  Menu,
  MessageSquare,
  Mail,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

import * as XLSX from 'xlsx';

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

async function request(path, { token, ...opts } = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      ...(opts.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...opts.headers
    }
  });

  const type = res.headers.get('content-type') || '';

  const data = type.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw Error(data?.message || 'Request failed');
  }

  return data;
}

function exportRows(rows, name, excel = false) {
  if (!rows.length) {
    alert('No records to export.');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'RAIC');

  XLSX.writeFile(
    wb,
    `${name}.${excel ? 'xlsx' : 'csv'}`,
    excel ? { bookType: 'xlsx' } : { bookType: 'csv' }
  );
}

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function date(v) {
  return v ? new Date(v).toLocaleString('en-IN') : '—';
}

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem('raicAdminToken') || ''
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({});
  const [tiers, setTiers] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mobile, setMobile] = useState(false);

  // NEW: Tracks the expanded registration row.
  const [expandedTeam, setExpandedTeam] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // =====================================
  // LOAD PAGE DATA
  // =====================================

  const load = useCallback(async () => {
    if (!token) return;

    setBusy(true);
    setError('');

    try {
      if (page === 'dashboard') {
        setData(await request('/admin/dashboard', { token }));
      }

      if (page === 'registrations' || page === 'payments') {
        const q = new URLSearchParams({
          search,
          status,
          tier: tierFilter
        });

        setData(
          await request(`/admin/${page}?${q}`, { token })
        );
      }

      if (page === 'participants') {
        setData(
          await request(
            `/admin/participants?search=${encodeURIComponent(search)}`,
            { token }
          )
        );
      }

      if (page === 'logs') {
        setData(
          await request(
            `/admin/logs?search=${encodeURIComponent(search)}`,
            { token }
          )
        );
      }

      if (page === 'tiers') {
        const d = await request('/tiers/admin/all', { token });
        setTiers(d.tiers || []);
      }

      if (page === 'enquiries') {
        const q = new URLSearchParams({
          search,
          status
        });

        setData(
          await request(`/admin/enquiries?${q}`, { token })
        );
      }

      // Keep sidebar unread count updated.
      const count = await request(
        '/admin/enquiries/unread-count',
        { token }
      );

      setUnreadCount(count.unread || 0);

    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [token, page, search, status, tierFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // =====================================
  // LOGIN / LOGOUT
  // =====================================

  const login = async event => {
    event.preventDefault();

    setError('');
    setBusy(true);

    try {
      const d = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (d.user.role !== 'admin') {
        throw Error(
          'This account does not have administrator access.'
        );
      }

      localStorage.setItem('raicAdminToken', d.token);
      setToken(d.token);

    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('raicAdminToken');

    setToken('');
    setPassword('');
    setPage('dashboard');
  };

  // =====================================
  // PAYMENT REVIEW
  // =====================================

  const review = async (id, next) => {
    let remarks = '';

    if (next === 'rejected') {
      remarks =
        window.prompt(
          'Enter the reason for rejection (required):'
        ) || '';

      if (!remarks.trim()) return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${next} this payment?`
      )
    ) {
      return;
    }

    try {
      await request(`/admin/payments/${id}/review`, {
        token,
        method: 'PATCH',
        body: JSON.stringify({ status: next, remarks })
      });

      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // =====================================
  // TIER MANAGEMENT
  // =====================================

  const saveTier = async tier => {
    try {
      await request(`/tiers/admin/${tier._id}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify({
          price: Number(tier.price),
          description: tier.description,
          isActive: tier.isActive
        })
      });

      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // =====================================
  // PAYMENT PROOF
  // =====================================

  const viewProof = async id => {
    try {
      const res = await fetch(
        `${API}/admin/payments/${id}/proof`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw Error(d.message || 'Unable to open proof');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank', 'noopener');

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setError(e.message);
    }
  };

  // =====================================
  // RECEIPT DOWNLOAD
  // =====================================

  const receipt = async id => {
    try {
      const res = await fetch(
        `${API}/payments/${id}/receipt`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw Error(d.message || 'Unable to download receipt');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `RAIC-Receipt-${id}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  // =====================================
  // CONTACT ENQUIRY ACTIONS
  // =====================================

  const markEnquiry = async (id, nextStatus) => {
    try {
      await request(
        `/admin/enquiries/${id}/${nextStatus}`,
        {
          token,
          method: 'PATCH'
        }
      );

      setSelectedEnquiry(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteEnquiry = async id => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this enquiry?'
      )
    ) {
      return;
    }

    try {
      await request(`/admin/enquiries/${id}`, {
        token,
        method: 'DELETE'
      });

      setSelectedEnquiry(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // =====================================
  // NAVIGATION
  // =====================================

  const nav = [
    ['dashboard', 'Overview', LayoutDashboard],
    ['registrations', 'Registrations', ClipboardList],
    ['payments', 'Payments', CreditCard],
    ['enquiries', 'Enquiries', MessageSquare],
    ['tiers', 'Tier Management', Tags],
    ['participants', 'Participants', Users],
    ['logs', 'Activity Logs', ScrollText]
  ];

  // =====================================
  // LOGIN PAGE
  // =====================================

  if (!token) {
    return (
      <main className="login">
        <form onSubmit={login}>
          <div className="mark">RAIC</div>

          <h1>Administrator Login</h1>

          <p>
            Sign in to manage hackathon registrations
            and payments.
          </p>

          {error && <div className="error">{error}</div>}

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  // =====================================
  // ADMIN APPLICATION
  // =====================================

  return (
    <div className="shell">

      <aside className={mobile ? 'open' : ''}>

        <div className="brand">
          RAIC
          <small>ADMINISTRATION</small>
        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        {nav.map(([id, label, Icon]) => (
          <button
            key={id}
            className={page === id ? 'active' : ''}
            onClick={() => {
              setPage(id);
              setSearch('');
              setStatus('all');
              setTierFilter('all');
              setSelectedEnquiry(null);
              setExpandedTeam(null);
              setMobile(false);
            }}
          >
            <Icon size={18} />

            <span>{label}</span>

            {id === 'enquiries' && unreadCount > 0 && (
              <span className="nav-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        ))}

        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Sign out
        </button>

      </aside>

      <main className="content">

        <header>
          <button
            className="mobile-menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>

          <div>
            <span>RAIC HACKATHON MANAGEMENT</span>
            <h1>
              {nav.find(x => x[0] === page)?.[1]}
            </h1>
          </div>

          <button className="refresh" onClick={load}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="error">{error}</div>
        )}

        {busy && (
          <p className="hint">Loading data…</p>
        )}

        {/* DASHBOARD */}

        {page === 'dashboard' && (
          <>
            <div className="stats">
              {[
                ['Website visitors', data.stats?.participants],
                ['All registrations', data.stats?.totalRegistrations],
                ['Active registrations', data.stats?.activeRegistrations],
                ['Cancelled registrations', data.stats?.cancelledRegistrations],
                ['Pending payments', data.stats?.pendingPayments],
                ['Approved payments', data.stats?.approvedPayments],
                ['Rejected payments', data.stats?.rejectedPayments],
                ['Verified collection', money(data.stats?.verifiedCollections)]
              ].map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value ?? '—'}</strong>
                </article>
              ))}
            </div>

            <section className="panel">
              <h2>Tier-wise active registrations</h2>

              <div className="tier-counts">
                {(data.tierCounts || []).map(x => (
                  <div key={x._id}>
                    <b>{x._id}</b>
                    <strong>{x.count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <h2>Recent registrations</h2>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Registration ID</th>
                      <th>Team</th>
                      <th>Participant</th>
                      <th>Tier</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data.recentRegistrations || []).map(r => (
                      <tr key={r._id}>
                        <td>{r.registrationId}</td>
                        <td>{r.teamName}</td>
                        <td>
                          {r.userId?.name}
                          <small>{r.userId?.email}</small>
                        </td>
                        <td>{r.tier}</td>
                        <td>{date(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* REGISTRATIONS / PAYMENTS / PARTICIPANTS / LOGS */}

        {[
          'registrations',
          'payments',
          'participants',
          'logs'
        ].includes(page) && (
          <>
            <div className="filters">

              <div className="search">
                <Search size={17} />

                <input
                  placeholder="Search records…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {(page === 'registrations' || page === 'payments') && (
                <>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="all">All statuses</option>

                    {(page === 'payments'
                      ? ['pending', 'approved', 'rejected']
                      : ['active', 'cancelled']
                    ).map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>

                  <select
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                  >
                    <option value="all">All tiers</option>
                    {['Basic', 'Advanced', 'Hard'].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </>
              )}

              {(page === 'registrations' || page === 'payments') && (
                <button
                  className="export"
                  onClick={() => {
                    const rows = (data.items || []).map(x =>
                      page === 'registrations'
                        ? {
                            'Registration ID': x.registrationId,
                            Team: x.teamName,
                            College: x.collegeName,
                            Participant: x.userId?.name,
                            Email: x.userId?.email,
                            'Team Members': (x.members || [])
                              .map((member, index) =>
                                `${index + 1}. ${member.name || ''} | ${member.email || ''} | ${member.phone || ''}`
                              )
                              .join(' ; '),
                            Tier: x.tier,
                            Amount: x.amount,
                            Status: x.status,
                            'Payment Status':
                              x.latestPayment?.status || 'not_submitted',
                            Created: date(x.createdAt)
                          }
                        : {
                            'Transaction ID': x.transactionId,
                            'Registration ID':
                              x.registrationId?.registrationId,
                            Team: x.registrationId?.teamName,
                            Participant: x.userId?.name,
                            Amount: x.amount,
                            Status: x.status,
                            Remarks: x.remarks,
                            Created: date(x.createdAt)
                          }
                    );

                    exportRows(rows, `raic-${page}`);
                  }}
                >
                  <Download size={15} />
                  Export CSV
                </button>
              )}
            </div>

            <div className="table-wrap">

              {page === 'registrations' && (
                <table>
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Team / College</th>
                      <th>Participant</th>
                      <th>Team Members</th>
                      <th>Tier</th>
                      <th>Fee</th>
                      <th>Registration</th>
                      <th>Payment</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data.items || []).map(x => {
                      const members = Array.isArray(x.members)
                        ? x.members
                        : [];

                      const isExpanded = expandedTeam === x._id;
                      const leaderEmail = x.userId?.email?.toLowerCase();

                      return (
                        <Fragment key={x._id}>
                          <tr>
                            <td>
                              {x.registrationId}
                              <small>{date(x.createdAt)}</small>
                            </td>

                            <td>
                              {x.teamName}
                              <small>{x.collegeName}</small>
                            </td>

                            <td>
                              {x.userId?.name}
                              <small>{x.userId?.email}</small>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="team-members-toggle"
                                onClick={() =>
                                  setExpandedTeam(
                                    isExpanded ? null : x._id
                                  )
                                }
                                aria-expanded={isExpanded}
                              >
                                <Users size={15} />
                                {members.length} Members
                                <span>{isExpanded ? '−' : '+'}</span>
                              </button>
                            </td>

                            <td>{x.tier}</td>

                            <td>{money(x.amount)}</td>

                            <td>
                              <span className={`pill ${x.status}`}>
                                {x.status}
                              </span>
                            </td>

                            <td>
                              <span className={`pill ${x.latestPayment?.status || 'neutral'}`}>
                                {x.latestPayment?.status || 'not submitted'}
                              </span>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="team-members-expanded">
                              <td colSpan={8}>
                                <div className="team-members-container">

                                  <div className="team-members-title">
                                    <div>
                                      <h3>
                                        {x.teamName} — Team Members
                                      </h3>
                                      <p>
                                        {members.length} registered members
                                      </p>
                                    </div>

                                    <span className="team-tier-label">
                                      {x.tier}
                                    </span>
                                  </div>

                                  {members.length > 0 ? (
                                    <div className="team-members-grid">
                                      {members.map((member, index) => {
                                        const isLeader =
                                          member.email?.toLowerCase() ===
                                          leaderEmail;

                                        return (
                                          <div
                                            className="team-member-card"
                                            key={`${x._id}-${index}`}
                                          >
                                            <div className="team-member-number">
                                              {String(index + 1).padStart(2, '0')}
                                            </div>

                                            <div className="team-member-info">
                                              <div className="team-member-name">
                                                <strong>
                                                  {member.name || 'Name unavailable'}
                                                </strong>

                                                {isLeader && (
                                                  <span className="team-leader-label">
                                                    TEAM LEADER
                                                  </span>
                                                )}
                                              </div>

                                              <span>
                                                {member.email || 'Email unavailable'}
                                              </span>

                                              <span>
                                                {member.phone || 'Phone unavailable'}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="team-members-empty">
                                      No member information is included in this registration response.
                                    </p>
                                  )}

                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}

                    {(data.items || []).length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty-state">
                          No registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {page === 'payments' && (
                <table>
                  <thead>
                    <tr>
                      <th>Registration / Team</th>
                      <th>Participant</th>
                      <th>UTR / Transaction</th>
                      <th>Amount</th>
                      <th>Proof</th>
                      <th>Status / Remarks</th>
                      <th>Decision</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data.items || []).map(p => (
                      <tr key={p._id}>
                        <td>
                          {p.registrationId?.registrationId}
                          <small>{p.registrationId?.teamName}</small>
                        </td>

                        <td>
                          {p.userId?.name}
                          <small>{p.userId?.email}</small>
                        </td>

                        <td>
                          {p.transactionId}
                          <small>{date(p.createdAt)}</small>
                        </td>

                        <td>{money(p.amount)}</td>

                        <td>
                          <button className="link-button" onClick={() => viewProof(p._id)}>
                            View proof
                          </button>

                          {p.status === 'approved' && (
                            <button className="link-button" onClick={() => receipt(p._id)}>
                              Receipt PDF
                            </button>
                          )}
                        </td>

                        <td>
                          <span className={`pill ${p.status}`}>
                            {p.status}
                          </span>
                          {p.remarks && <small>{p.remarks}</small>}
                        </td>

                        <td>
                          {p.status === 'pending' ? (
                            <>
                              <button className="yes" onClick={() => review(p._id, 'approved')}>
                                <Check size={14} /> Approve
                              </button>

                              <button className="no" onClick={() => review(p._id, 'rejected')}>
                                <X size={14} /> Reject
                              </button>
                            </>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {page === 'participants' && (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Account</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data.items || []).map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{date(u.createdAt)}</td>
                        <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {page === 'logs' && (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Administrator</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Details</th>
                      <th>IP</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data.items || []).map(l => (
                      <tr key={l._id}>
                        <td>{date(l.createdAt)}</td>
                        <td>{l.adminEmail}</td>
                        <td>{l.action}</td>
                        <td>
                          {l.entityType}
                          <small>{l.entityId}</small>
                        </td>
                        <td>{l.details}</td>
                        <td>{l.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>

            <p className="hint">
              {data.total ?? data.items?.length ?? 0} records.
              Search and filters are applied when you load the results.
            </p>
          </>
        )}

        {/* CONTACT ENQUIRIES */}

        {page === 'enquiries' && (
          <>
            {selectedEnquiry ? (
              <section className="panel enquiry-detail">

                <button
                  className="back-button"
                  onClick={() => setSelectedEnquiry(null)}
                >
                  <ArrowLeft size={16} />
                  Back to enquiries
                </button>

                <div className="enquiry-detail-heading">
                  <div>
                    <span className={`pill ${selectedEnquiry.status}`}>
                      {selectedEnquiry.status}
                    </span>

                    <h2>{selectedEnquiry.subject}</h2>
                    <p>{date(selectedEnquiry.createdAt)}</p>
                  </div>
                </div>

                <div className="enquiry-sender">
                  <div className="enquiry-avatar">
                    {selectedEnquiry.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{selectedEnquiry.name}</strong>
                    <a href={`mailto:${selectedEnquiry.email}`}>
                      {selectedEnquiry.email}
                    </a>
                  </div>
                </div>

                <div className="enquiry-message">
                  <h3>Message</h3>
                  <p>{selectedEnquiry.message}</p>
                </div>

                <div className="enquiry-actions">
                  {selectedEnquiry.status === 'unread' ? (
                    <button
                      className="yes"
                      onClick={() => markEnquiry(selectedEnquiry._id, 'read')}
                    >
                      <Check size={15} />
                      Mark as read
                    </button>
                  ) : (
                    <button
                      className="export"
                      onClick={() => markEnquiry(selectedEnquiry._id, 'unread')}
                    >
                      <Mail size={15} />
                      Mark as unread
                    </button>
                  )}

                  <a
                    className="export"
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(`Re: ${selectedEnquiry.subject}`)}`}
                  >
                    <Mail size={15} />
                    Reply by email
                  </a>

                  <button
                    className="no"
                    onClick={() => deleteEnquiry(selectedEnquiry._id)}
                  >
                    <Trash2 size={15} />
                    Delete enquiry
                  </button>
                </div>

              </section>
            ) : (
              <>
                <div className="enquiry-summary">
                  <div>
                    <span>Total enquiries</span>
                    <strong>{data.total ?? 0}</strong>
                  </div>

                  <div>
                    <span>Unread enquiries</span>
                    <strong>{data.unread ?? unreadCount}</strong>
                  </div>
                </div>

                <div className="filters">
                  <div className="search">
                    <Search size={17} />

                    <input
                      placeholder="Search name, email, subject or message…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="all">All enquiries</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                <div className="table-wrap">
                  <table className="enquiry-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Received</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(data.items || []).map(item => (
                        <tr
                          key={item._id}
                          className={item.status === 'unread' ? 'unread-row' : ''}
                        >
                          <td>
                            <span className={`pill ${item.status}`}>
                              {item.status}
                            </span>
                          </td>

                          <td>
                            <strong>{item.name}</strong>
                            <small>{item.email}</small>
                          </td>

                          <td>
                            <strong>{item.subject}</strong>
                            <small className="message-preview">
                              {item.message}
                            </small>
                          </td>

                          <td>{date(item.createdAt)}</td>

                          <td>
                            <button
                              className="view-button"
                              onClick={() => {
                                setSelectedEnquiry(item);

                                if (item.status === 'unread') {
                                  markEnquiry(item._id, 'read');
                                }
                              }}
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              className="no"
                              onClick={() => deleteEnquiry(item._id)}
                              title="Delete enquiry"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {(data.items || []).length === 0 && (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            <MessageSquare size={30} />
                            <strong>No enquiries found</strong>
                            <span>
                              Contact form submissions will appear here.
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="hint">
                  {data.total ?? 0} enquiries found.
                </p>
              </>
            )}
          </>
        )}

        {/* TIER MANAGEMENT */}

        {page === 'tiers' && (
          <div className="tier-list">
            {tiers.map(t => (
              <article key={t._id}>
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  <small>
                    {t.isActive
                      ? 'Available for new registrations'
                      : 'Currently hidden from participants'}
                  </small>
                </div>

                <label>
                  Price per participant (₹)

                  <input
                    type="number"
                    min="0"
                    value={t.price}
                    onChange={e =>
                      setTiers(old =>
                        old.map(x =>
                          x._id === t._id
                            ? { ...x, price: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </label>

                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={t.isActive}
                    onChange={e =>
                      setTiers(old =>
                        old.map(x =>
                          x._id === t._id
                            ? { ...x, isActive: e.target.checked }
                            : x
                        )
                      )
                    }
                  />
                  Active
                </label>

                <button onClick={() => saveTier(t)}>
                  Save changes
                </button>
              </article>
            ))}
          </div>
        )}

        <p className="footer-note">
          RAIC Hackathon Admin · Registration is automatic;
          administrators verify payments and manage enquiries.
        </p>

      </main>
    </div>
  );
}
