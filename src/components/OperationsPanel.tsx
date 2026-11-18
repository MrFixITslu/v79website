import React, { useEffect, useState } from 'react';

export function OperationsPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [directory, setDirectory] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [a, b, c] = await Promise.all([
      fetch('/api/admin/enrollments', { credentials: 'same-origin', cache: 'no-store' }),
      fetch('/api/admin/leads', { credentials: 'same-origin', cache: 'no-store' }),
      fetch('/api/admin/discussions', { credentials: 'same-origin', cache: 'no-store' })
    ]);
    if (!a.ok || !b.ok || !c.ok) {
      throw new Error('Could not load enrollment and delivery status.');
    }
    setRequests(await a.json());
    setDiscussions(await c.json());
    setLeads((await b.json()).filter((l: any) => l.tiquetSyncStatus === 'failed' || l.tiquetSyncStatus === 'pending'));
  }

  useEffect(() => {
    refresh().catch((e) => setError((e as Error).message));
  }, []);

  async function action(url: string, body?: unknown, successMessage?: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const r = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {})
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Action failed.');
      await refresh();
      if (successMessage) setNotice(successMessage);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const unansweredDiscussions = discussions.filter((q) => !q.replies?.length);

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <p className="eyebrow">Operations Queue</p>
          <h1 className="heading">Enrollments, Discussions &amp; Directory</h1>
          <p className="lead">Review paid course enrollment requests, answer student questions, and update your verified prospect directory.</p>
        </div>
        <div className="buttons">
          <button type="button" className="btn" disabled={busy} onClick={() => refresh().catch((e) => setError((e as Error).message))}>
            Refresh status
          </button>
        </div>
      </div>

      {error && <p role="alert" className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs">{error}</p>}
      {notice && <p role="status" className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">{notice}</p>}

      <div className="grid grid-2">
        <section className="card space-y-3">
          <h2>Paid course enrollment requests</h2>
          {requests.length ? (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={`${r.studentId}-${r.courseId}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border/40 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-medium text-app-text">
                    {r.name} ({r.email}) — <strong>{r.course}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    disabled={busy}
                    onClick={() => action('/api/admin/enrollments', { studentId: r.studentId, courseId: r.courseId }, `Approved enrollment for ${r.name}.`)}
                  >
                    Approve after payment verification
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No requests awaiting approval.</p>
          )}
        </section>

        <section className="card space-y-3">
          <h2>Legacy website enquiries</h2>
          {leads.length ? (
            <div className="space-y-2">
              {leads.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border/40 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs font-medium text-app-text">#{l.id} {l.company} — {l.tiquetSyncStatus || 'not queued'}</span>
                  <a href="#enquiries" className="card-link" style={{ marginTop: 0 }}>Manage in CRM ↗</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No failed or pending deliveries.</p>
          )}
        </section>
      </div>

      <section className="card space-y-3">
        <h2>Course questions awaiting a reply ({unansweredDiscussions.length})</h2>
        {unansweredDiscussions.length ? (
          <div className="space-y-4">
            {unansweredDiscussions.map((q) => (
              <div key={q.id} className="space-y-2 border-b border-app-border/40 pb-4 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-app-text">{q.courseName} — {q.author}: {q.text}</p>
                <textarea
                  aria-label={'Reply to ' + q.author}
                  rows={2}
                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs"
                  value={replies[q.id] || ''}
                  onChange={(e) => setReplies((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Write an instructor reply..."
                />
                <button
                  type="button"
                  className="btn btn-small btn-primary"
                  disabled={busy || !replies[q.id]?.trim()}
                  onClick={() => action(`/api/admin/discussions/${q.courseId}/${q.id}/reply`, { text: replies[q.id] }, `Posted instructor reply to ${q.author}.`).then(() => setReplies((p) => ({ ...p, [q.id]: '' })))}
                >
                  Post instructor reply
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">All student course questions have been answered.</p>
        )}
      </section>

      <section className="card space-y-3">
        <details>
          <summary className="cursor-pointer font-bold text-sm text-app-text">Import verified business directory (JSON)</summary>
          <div className="space-y-3 pt-3">
            <p>
              Paste a JSON array of businesses you have verified. Each record needs <code>businessName</code>; optional fields include <code>location</code>, <code>category</code>, <code>phone</code>, <code>email</code>, <code>website</code> and <code>description</code> (up to 500 records).
            </p>
            <textarea
              aria-label="Business directory JSON"
              rows={4}
              className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-3 text-xs font-mono"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              placeholder={'[{"businessName":"Your verified business","location":"Gros Islet"}]'}
            />
            <button
              type="button"
              className="btn btn-primary btn-small"
              disabled={busy || !directory.trim()}
              onClick={() => {
                try {
                  const entries = JSON.parse(directory);
                  void action('/api/admin/crm/directory', { entries }, 'Business directory imported successfully.');
                } catch {
                  setError('Enter valid JSON before importing.');
                }
              }}
            >
              Import directory
            </button>
          </div>
        </details>
      </section>
    </div>
  );
}
