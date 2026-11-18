import { WorkflowPanel } from './redesign/WorkflowPanel';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { V79AppearanceControls, useV79Appearance } from './components/V79Appearance';
import { V93WebsiteOperationsOverview } from './components/V93WebsiteOperationsOverview';
import './redesign/admin.css';

const CrmManager = lazy(() => import('./components/crm/CrmManager').then((m) => ({ default: m.CrmManager })));
const BlogManager = lazy(() => import('./components/blog/BlogManager').then((m) => ({ default: m.BlogManager })));
const CourseBuilderPanel = lazy(() => import('./components/CourseBuilder/CourseBuilderPanel'));
const OperationsPanel = lazy(() => import('./components/OperationsPanel').then((m) => ({ default: m.OperationsPanel })));

const sections = {
  overview: 'Overview',
  enquiries: 'Enquiries & CRM',
  content: 'Website Content',
  courses: 'Course Builder',
  operations: 'Operations Queue',
  newsletter: 'Newsletter',
  workflow: 'Workflow Health',
  settings: 'Website Settings',
  ownership: 'App ownership'
} as const;

type Section = keyof typeof sections;

const apps = [
  ['V79 Hub', 'Identity, teams and subscriptions', 'https://hub.v79sl.com'],
  ['Tiquet', 'Client jobs, tickets and invoices', 'https://tiquet.v79sl.com'],
  ['V79 Marketing', 'Campaigns and social publishing', 'https://marketing.v79sl.com'],
  ['Academy', 'Courses and learning', 'https://academy.v79sl.com'],
  ['V79 POS', 'Sales and inventory', 'https://pos.v79sl.com'],
  ['FFPRO', 'Projects and financial planning', 'https://ffpro.v79sl.com']
] as const;

function sectionFromHash(): Section {
  const key = location.hash.slice(1);
  return key in sections ? (key as Section) : 'overview';
}

async function readApi(url: string) {
  const r = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000)
  });
  if (!r.ok) {
    throw Error(
      r.status === 401
        ? 'Your session has expired. Please sign in again.'
        : `Could not load this information (HTTP ${r.status}).`
    );
  }
  return r.json();
}

function Newsletter() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    readApi('/api/admin/newsletter/subscribers')
      .then((data) => {
        if (!Array.isArray(data)) throw Error('Unexpected subscriber response.');
        setRows(data);
      })
      .catch((e) => {
        setRows(null);
        setError(e.message);
      });
  };

  useEffect(load, []);

  const exportCsv = () => {
    if (!rows) return;
    const cell = (v: unknown) =>
      '"' +
      String(v ?? '')
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const keys = ['firstName', 'email', 'status', 'consent', 'createdAt'];
    const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => cell(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'v79-newsletter-subscribers.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Audience &amp; consent</p>
          <h1 className="heading">Newsletter</h1>
          <p className="lead">Saved subscribers and their recorded consent.</p>
        </div>
        <div className="buttons">
          <button className="btn" onClick={load}>
            Refresh
          </button>
          <button className="btn btn-primary" disabled={!rows?.length} onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {!rows && !error && <p role="status">Loading subscribers…</p>}
      {rows && (
        <div className="card newsletter-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Consent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id ?? i}>
                  <td>{row.firstName || '—'}</td>
                  <td>{row.email}</td>
                  <td>{row.status || '—'}</td>
                  <td>{row.consent === true ? 'Recorded' : 'Not recorded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p>No newsletter subscribers yet.</p>}
        </div>
      )}
    </>
  );
}

function Settings() {
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    readApi('/api/config').then(setConfig).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Website configuration</p>
          <h1 className="heading">Settings &amp; information</h1>
          <p className="lead">Account access and subscriptions are managed in V79 Hub.</p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="grid grid-2">
        <div className="card">
          <h2>Appearance</h2>
          <p>Auto switches to light at 06:00 and dark at 18:00, Saint Lucia time. Choose Light or Dark above for a persistent override.</p>
        </div>
        <div className="card">
          <h2>Enquiry protection</h2>
          <p>
            {config
              ? config.captchaEnabled
                ? config.recaptchaSiteKey
                  ? 'Verification configured'
                  : 'Verification enabled, site key missing'
                : 'Verification disabled by server configuration'
              : 'Loading…'}
          </p>
          <p>Server configuration changes require an authorised release.</p>
        </div>
        <div className="card">
          <h2>Website information</h2>
          <p>
            <a href="/faq">Frequently asked questions ↗</a>
          </p>
          <p>
            <a href="/privacy">Privacy notice ↗</a>
          </p>
          <p>
            <a href="/terms">Terms ↗</a>
          </p>
        </div>
        <div className="card">
          <h2>Articles &amp; guides</h2>
          <p>Edit and publish articles under Website Content.</p>
          <a href="#content" className="card-link">
            Manage content ↗
          </a>
        </div>
      </div>
    </>
  );
}

export default function AdminApp() {
  const { mode, setMode } = useV79Appearance();
  const [section, setSection] = useState<Section>(sectionFromHash);
  const [menu, setMenu] = useState(false);
  const [session, setSession] = useState<'checking' | 'signed-in' | 'must-change-password' | 'signed-out'>('checking');
  const [error, setError] = useState('');
  const [ssoConfig, setSsoConfig] = useState<{ enabled: boolean; enforced: boolean }>({ enabled: false, enforced: false });

  // Password auth form state
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  // Forced password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const unauthorized = () => {
    setSession('signed-out');
    setError('Your session has expired. Please sign in again.');
  };

  const check = async (enforcedOverride?: boolean) => {
    setSession('checking');
    setError('');
    try {
      const r = await fetch('/api/admin/verify-session', {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: AbortSignal.timeout(15000)
      });
      if (r.status === 401) {
        setSession('signed-out');
        return;
      }
      if (!r.ok) throw Error('Sign-in could not be checked. Please try again.');
      const body = await r.json();
      if (body.valid !== true) {
        setSession('signed-out');
        return;
      }
      if (body.mustChangePassword) {
        if (enforcedOverride ?? ssoConfig.enforced) {
          throw Error('Please complete your account setup through V79 Hub.');
        }
        setSession('must-change-password');
        return;
      }
      setSession('signed-in');
    } catch (e) {
      setSession('signed-out');
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    let active = true;
    readApi('/api/admin/hub-sso/config')
      .then((c) => {
        if (!active) return;
        const cfg = { enabled: c.enabled === true, enforced: c.enforced === true };
        setSsoConfig(cfg);
        void check(cfg.enforced);
      })
      .catch(() => {
        if (!active) return;
        setError('Hub sign-in configuration could not load.');
        void check();
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handle = () => {
      setSection(sectionFromHash());
      setMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);

  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        document.getElementById('control-menu')?.focus();
      }
    };
    if (menu) window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menu]);

  useEffect(() => {
    document.title = 'V79 Digital | ' + sections[section] + ' — Website Control Room';
  }, [section]);

  useEffect(() => {
    if (session !== 'signed-in') return;
    let last = Date.now();
    const heartbeat = (event: Event) => {
      if (!event.isTrusted || document.hidden || Date.now() - last < 240000) return;
      last = Date.now();
      fetch('/api/admin/verify-session', { credentials: 'same-origin', cache: 'no-store' })
        .then((r) => {
          if (r.status === 401) unauthorized();
        })
        .catch(() => {});
    };
    window.addEventListener('pointerdown', heartbeat);
    window.addEventListener('keydown', heartbeat);
    return () => {
      window.removeEventListener('pointerdown', heartbeat);
      window.removeEventListener('keydown', heartbeat);
    };
  }, [session]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }
    setAuthBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw Error(body.error || 'Incorrect administrator password.');
      }
      setCurrentPassword(password);
      setPassword('');
      if (body.mustChangePassword) {
        setSession('must-change-password');
      } else {
        setSession('signed-in');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setAuthBusy(true);
    try {
      const r = await fetch('/api/admin/change-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw Error(body.error || 'Could not update password.');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSession('signed-in');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    try {
      const r = await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
      if (!r.ok) throw Error();
      setSession('signed-out');
      setError('');
    } catch {
      setError('Sign-out could not complete. Please retry.');
    }
  }

  if (session === 'must-change-password') {
    return (
      <div className="control-room">
        <header className="topbar">
          <a href="/">V79 Digital ↗</a>
          <V79AppearanceControls mode={mode} onChange={setMode} />
        </header>
        <main className="card auth-card">
          <p className="eyebrow">Account Security</p>
          <h1>Update Administrator Password</h1>
          <p>Set a strong new password (at least 12 characters) before opening the Website Control Room.</p>
          <form onSubmit={handleChangePassword} className="auth-form">
            <div className="inputrow">
              <label htmlFor="admin-current-pw">Current password</label>
              <input
                id="admin-current-pw"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="inputrow">
              <label htmlFor="admin-new-pw">New password (12+ characters)</label>
              <input
                id="admin-new-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="inputrow">
              <label htmlFor="admin-confirm-pw">Confirm new password</label>
              <input
                id="admin-confirm-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p role="alert" className="status-error">{error}</p>}
            <div className="buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={authBusy}>
                {authBusy ? 'Updating…' : 'Update password & continue'}
              </button>
              <button type="button" className="btn" onClick={logout}>
                Sign out
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  if (session !== 'signed-in') {
    return (
      <div className="control-room">
        <header className="topbar">
          <a href="/">V79 Digital ↗</a>
          <V79AppearanceControls mode={mode} onChange={setMode} />
        </header>
        <main className="card auth-card">
          <p className="eyebrow">Website operations</p>
          <h1>Website Control Room</h1>
          <p>
            {ssoConfig.enforced
              ? 'Sign in through V79 Hub to manage enquiries, articles, courses, and newsletter records.'
              : 'Sign in with your administrator password or V79 Hub to manage enquiries, articles, courses, and newsletter records.'}
          </p>

          {session === 'checking' ? (
            <p role="status">Checking secure sign-in…</p>
          ) : (
            <div className="space-y-4">
              {!ssoConfig.enforced && (
                <form onSubmit={handlePasswordLogin} className="auth-form">
                  <div className="inputrow">
                    <label htmlFor="admin-login-pw">Administrator password</label>
                    <input
                      id="admin-login-pw"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                    />
                  </div>
                  <div className="buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn btn-primary" disabled={authBusy}>
                      {authBusy ? 'Signing in…' : 'Sign in'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        void check();
                        readApi('/api/admin/hub-sso/config')
                          .then((c) => setSsoConfig({ enabled: c.enabled === true, enforced: c.enforced === true }))
                          .catch((e) => setError(e.message));
                      }}
                    >
                      Check session
                    </button>
                  </div>
                </form>
              )}

              {ssoConfig.enabled ? (
                <div className="pt-2">
                  <a className="btn btn-primary" href="/api/admin/hub-sso/start">
                    Sign in with V79 Hub ↗
                  </a>
                </div>
              ) : ssoConfig.enforced ? (
                <p>Hub sign-in is required but not available. Check the server configuration or try again.</p>
              ) : null}
            </div>
          )}

          {error && (
            <p role="alert" className="status-error" style={{ marginTop: '14px' }}>
              {error}
            </p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="control-room shell">
      <a href="#control-content" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className={'menu-backdrop ' + (menu ? 'open' : '')} onClick={() => setMenu(false)} aria-hidden="true" />
      <aside id="control-sidebar" className={'sidebar ' + (menu ? 'open' : '')} aria-label="Website operations">
        <a className="sidebar-brand brand" href="#overview">
          <img src="/v79-digital-original.png" alt="V79 Digital" width="48" height="48" />
          <div>
            <strong>V79 Digital</strong>
            <small>Website Admin</small>
          </div>
        </a>
        <div className="navlabel">Website operations</div>
        <nav className="nav-group" aria-label="Admin navigation">
          {Object.entries(sections).map(([key, label]) => (
            <a
              key={key}
              href={'#' + key}
              className={'navlink ' + (section === key ? 'active' : '')}
              aria-current={section === key ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <strong>One connected business</strong>
          <p className="small">Manage your website here. Open Hub for your team and connected applications.</p>
          <a href="https://hub.v79sl.com">Open V79 Hub ↗</a>
          <button className="btn btn-small" onClick={logout} style={{ marginTop: '12px' }}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              id="control-menu"
              className="btn btn-small menu-toggle"
              aria-label="Toggle navigation"
              aria-controls="control-sidebar"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              ☰
            </button>
            <span>Website Control Room</span>
            <em>/</em>
            <span>{sections[section]}</span>
          </div>
          <div className="top-actions">
            <V79AppearanceControls mode={mode} onChange={setMode} />
            <a className="btn btn-small" href="/" target="_blank" rel="noopener noreferrer">
              View website ↗
            </a>
          </div>
        </header>
        <main id="control-content" className="page-wrap">
          {error && <p role="alert">{error}</p>}
          <Suspense fallback={<p role="status">Loading {sections[section]}…</p>}>
            {section === 'overview' && <V93WebsiteOperationsOverview />}
            {section === 'enquiries' && <CrmManager adminToken={null} onUnauthorized={unauthorized} />}
            {section === 'content' && (
              <>
                <div className="page-head">
                  <div>
                    <p className="eyebrow">Publishing</p>
                    <h1 className="heading">Website content</h1>
                    <p className="lead">Create, edit and publish your articles.</p>
                  </div>
                </div>
                <BlogManager adminToken={null} onUnauthorized={unauthorized} />
              </>
            )}
            {section === 'courses' && <CourseBuilderPanel onExit={() => { location.hash = '#overview'; }} />}
            {section === 'operations' && <OperationsPanel />}
            {section === 'newsletter' && <Newsletter />}
            {section === 'workflow' && <WorkflowPanel />}
            {section === 'settings' && <Settings />}
            {section === 'ownership' && (
              <>
                <div className="page-head">
                  <div>
                    <p className="eyebrow">Connected ecosystem</p>
                    <h1 className="heading">The right tool for each job.</h1>
                    <p className="lead">The website owns enquiries, publishing and newsletter records.</p>
                  </div>
                </div>
                <div className="grid grid-3">
                  {apps.map(([name, description, href]) => (
                    <a className="card motion-card" href={href} key={href} target="_blank" rel="noopener noreferrer">
                      <h2>{name} ↗</h2>
                      <p>{description}</p>
                    </a>
                  ))}
                </div>
              </>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
