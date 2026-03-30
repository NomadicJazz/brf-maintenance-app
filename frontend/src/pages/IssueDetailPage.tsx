import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import {
  deleteIssueApi,
  getIssueApi,
  updateIssueApi,
  type IssuePayload,
  type IssuePriority,
  type IssueStatus,
} from '../api/issuesApi'

const PRIORITIES: IssuePriority[] = ['low', 'medium', 'high']
const STATUSES: IssueStatus[] = ['new', 'in_progress', 'resolved', 'closed']

export default function IssueDetailPage() {
  const navigate = useNavigate()
  const { issueId } = useParams()
  const { user, isAdmin } = useAuth()

  const issueIdNum = useMemo(() => {
    const n = Number(issueId)
    return Number.isFinite(n) ? n : null
  }, [issueId])

  const issueQuery = useQuery({
    queryKey: ['issue', issueIdNum],
    enabled: issueIdNum !== null,
    queryFn: async () => {
      if (issueIdNum === null) throw new Error('Invalid issue id')
      return getIssueApi(issueIdNum)
    },
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<IssuePriority>('low')
  const [status, setStatus] = useState<IssueStatus>('new')
  const [assignee, setAssignee] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const i = issueQuery.data as IssuePayload | undefined
    if (!i) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(i.title ?? '')
    setDescription(i.description ?? '')
    setLocation(i.location ?? '')
    setPriority((i.priority as IssuePriority) ?? 'low')
    setStatus((i.status as IssueStatus) ?? 'new')
    setAssignee(i.assignee ?? '')
  }, [issueQuery.data])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!issueIdNum) return

    const req = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      priority,
      ...(isAdmin
        ? {
            status,
            assignee: assignee.trim() || undefined,
          }
        : {}),
    }

    try {
      await updateIssueApi(issueIdNum, req)
      setSuccess('Issue updated.')
      await issueQuery.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete() {
    if (!issueIdNum) return
    setError(null)
    setSuccess(null)

    try {
      await deleteIssueApi(issueIdNum)
      navigate('/issues')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="appShell">
      <div className="container">
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="brand">Issue</div>
          <div className="navActions">
            <Link className="btn" to="/issues">
              Back
            </Link>
            {user ? (
              <button className="btn btnDanger" onClick={onDelete} type="button">
                Delete
              </button>
            ) : null}
          </div>
        </div>

        {issueQuery.isLoading ? <div>Loading…</div> : null}

        {issueQuery.isError ? (
          <div className="error">
            {issueQuery.error instanceof Error
              ? issueQuery.error.message
              : 'Failed to load issue.'}
          </div>
        ) : null}

        {issueQuery.data ? (
          <div className="grid2">
            <div className="card">
              <div className="brand" style={{ fontSize: 16, marginBottom: 10 }}>
                Edit Issue
              </div>

              <form onSubmit={onSave}>
                <div className="field">
                  <div className="label">Title</div>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="field">
                  <div className="label">Description</div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="field">
                  <div className="label">Location</div>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="field">
                  <div className="label">Priority</div>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {isAdmin ? (
                  <>
                    <div className="field">
                      <div className="label">Status</div>
                      <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <div className="label">Assignee</div>
                      <input value={assignee} onChange={(e) => setAssignee(e.target.value)} />
                    </div>
                  </>
                ) : null}

                {error ? <div className="error">{error}</div> : null}
                {success ? <div className="success">{success}</div> : null}

                <div style={{ marginTop: 14 }}>
                  <button className="btn btnPrimary" type="submit">
                    Save changes
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <div className="brand" style={{ fontSize: 16, marginBottom: 10 }}>
                Details
              </div>

              <div style={{ opacity: 0.9, fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Priority:</strong> {priority}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Status:</strong> {status}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Location:</strong> {location || '—'}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Description:</strong>
                  <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
                    {description || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

