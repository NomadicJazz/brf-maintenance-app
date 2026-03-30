import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { createIssueApi, getAdminIssuesApi, getMyIssuesApi } from '../api/issuesApi'
import type { CreateIssueRequest, IssuePayload, IssuePriority } from '../api/issuesApi'
import TopBar from '../components/TopBar'
import { useToast } from '../ui/ToastContext'

const PRIORITIES: IssuePriority[] = ['low', 'medium', 'high']

export default function IssuesPage() {
  const { user, isAdmin } = useAuth()
  const { pushToast } = useToast()

  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [status, setStatus] = useState<string>('') // admin-only filter

  const [createForm, setCreateForm] = useState<CreateIssueRequest>({
    title: '',
    description: '',
    location: '',
    priority: 'low',
    photo_url: '',
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const query = useQuery({
    queryKey: ['issues', user?.role ?? 'unknown', page, limit, isAdmin ? status : ''],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')
      if (isAdmin) {
        return getAdminIssuesApi({ page, limit, status: status || undefined })
      }
      return getMyIssuesApi({ page, limit })
    },
  })

  const issues = query.data?.issues ?? []
  const totalPages = query.data?.pages ?? 1

  const listTitle = useMemo(() => {
    if (!user) return 'Issues'
    return isAdmin ? 'All Issues (Admin)' : 'My Issues'
  }, [isAdmin, user])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (isCreating) return
    setCreateError(null)

    const req: CreateIssueRequest = {
      title: createForm.title.trim(),
      description: createForm.description?.trim() || undefined,
      location: createForm.location?.trim() || undefined,
      priority: createForm.priority,
      photo_url: createForm.photo_url?.trim() || undefined,
    }

    if (!req.title) {
      setCreateError('Title is required')
      return
    }
    setIsCreating(true)

    try {
      await createIssueApi(req)
      setCreateForm({
        title: '',
        description: '',
        location: '',
        priority: 'low',
        photo_url: '',
      })
      setPage(1)
      await query.refetch()
      pushToast('Issue created.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create issue'
      setCreateError(message)
      pushToast(message, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="appShell">
      <div className="container">
        <TopBar />

        <div className="row border-b-2 border-base-300 pb-3" style={{ marginBottom: 14, marginTop: 10 }}>
          <div>
            <div className="brand" style={{ fontSize: 18 }}>
              {listTitle}
            </div>
            {isAdmin ? (
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                Filter by status (optional)
              </div>
            ) : null}
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="new">new</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>
                <button className="btn btn-neutral border-2 border-base-300" onClick={() => setPage(1)} type="button">
                Apply
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid2" style={{ marginBottom: 16 }}>
          <div className="card card-bordered border-2 border-base-300">
            <div className="brand" style={{ fontSize: 16, marginBottom: 10 }}>
              Create Issue
            </div>

            <form onSubmit={onCreate}>
              <fieldset
                disabled={isCreating}
                style={{ border: 'none', margin: 0, padding: 0 }}
              >
              <div className="field">
                <div className="label text-base-content">Title</div>
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <div className="label text-base-content">Description (optional)</div>
                <textarea
                  value={createForm.description ?? ''}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="field">
                <div className="label text-base-content">Location (optional)</div>
                <input
                  value={createForm.location ?? ''}
                  onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>

              <div className="field">
                <div className="label text-base-content">Priority</div>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value as IssuePriority }))}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label text-base-content">Photo URL (optional)</div>
                <input
                  value={createForm.photo_url ?? ''}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      photo_url: e.target.value,
                    }))
                  }
                />
              </div>

              {createError ? <div className="error">{createError}</div> : null}

              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary border-2 border-primary" type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
              </div>
              </fieldset>
            </form>
          </div>

          <div className="card card-bordered border-2 border-base-300">
            <div className="brand" style={{ fontSize: 16, marginBottom: 10 }}>
              Issue List
            </div>

            {query.isLoading ? <div className="loadingHint">Loading issues…</div> : null}
            {query.isError ? (
              <div className="error">{query.error instanceof Error ? query.error.message : 'Failed to load issues'}</div>
            ) : null}

            {query.isSuccess ? (
              <>
                {issues.length === 0 ? (
                  <div className="emptyHint">No issues found yet.</div>
                ) : null}

                {issues.map((i: IssuePayload) => (
                  <div
                    key={i.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <Link to={`/issues/${i.id}`} style={{ color: 'var(--text-h)', textDecoration: 'none', fontWeight: 600 }}>
                        {i.title}
                      </Link>
                      <div style={{ fontSize: 13, opacity: 0.85 }}>
                        {i.priority} · {i.status}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                      {i.location ? `Location: ${i.location}` : 'No location'}
                    </div>
                  </div>
                ))}

                <div className="row" style={{ marginTop: 14 }}>
                  <button
                    className="btn btn-neutral border-2 border-base-300"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    type="button"
                  >
                    Prev
                  </button>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Page {page} of {totalPages}
                  </div>
                  <button
                    className="btn btn-neutral border-2 border-base-300"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

