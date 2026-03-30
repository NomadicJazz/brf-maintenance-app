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
import { useToast } from '../ui/ToastContext'

const PRIORITIES: IssuePriority[] = ['low', 'medium', 'high']
const STATUSES: IssueStatus[] = ['new', 'in_progress', 'resolved', 'closed']

export default function IssueDetailPage() {
  const navigate = useNavigate()
  const { issueId } = useParams()
  const { user, isAdmin } = useAuth()
  const { pushToast } = useToast()

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
  const issueData = issueQuery.data as IssuePayload | undefined
  const canManageIssue = useMemo(() => {
    if (!issueData || !user) return false
    return isAdmin || issueData.user_id === user.id
  }, [issueData, isAdmin, user])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<IssuePriority>('low')
  const [status, setStatus] = useState<IssueStatus>('new')
  const [assignee, setAssignee] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const i = issueData
    if (!i) return
    setTitle(i.title ?? '')
    setDescription(i.description ?? '')
    setLocation(i.location ?? '')
    setPriority((i.priority as IssuePriority) ?? 'low')
    setStatus((i.status as IssueStatus) ?? 'new')
    setAssignee(i.assignee ?? '')
  }, [issueData])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (isSaving) return
    if (!issueIdNum) return
    setError(null)
    setSuccess(null)
    setIsSaving(true)

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
      pushToast('Issue updated.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete() {
    if (!issueIdNum) return
    if (isDeleting) return
    if (!window.confirm('Delete this issue permanently?')) return
    setError(null)
    setSuccess(null)
    setIsDeleting(true)

    try {
      await deleteIssueApi(issueIdNum)
      pushToast('Issue deleted.', 'success')
      navigate('/issues')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="appShell">
      <div className="container">
        <div className="row border-b-2 border-base-300 pb-3" style={{ marginBottom: 14 }}>
          <div className="brand">Issue</div>
          <div className="navActions">
            <Link className="btn btn-neutral border-2 border-base-300" to="/issues">
              Back
            </Link>
            {canManageIssue ? (
              <button className="btn btn-neutral border-2 border-error text-error" onClick={onDelete} type="button">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            ) : null}
          </div>
        </div>

        {issueQuery.isLoading ? <div className="loadingHint">Loading issue…</div> : null}

        {issueQuery.isError ? (
          <div className="error">
            {issueQuery.error instanceof Error
              ? issueQuery.error.message
              : 'Failed to load issue.'}
          </div>
        ) : null}

        {issueQuery.data ? (
          <div className="grid2">
            <div className="card card-bordered border-2 border-base-300">
              <div className="brand" style={{ fontSize: 16, marginBottom: 10 }}>
                Edit Issue
              </div>

              <form onSubmit={onSave}>
                <fieldset
                  disabled={!canManageIssue || isSaving || isDeleting}
                  style={{ border: 'none', margin: 0, padding: 0 }}
                >
                <div className="field">
                  <div className="label text-base-content">Title</div>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="field">
                  <div className="label text-base-content">Description</div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="field">
                  <div className="label text-base-content">Location</div>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="field">
                  <div className="label text-base-content">Priority</div>
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
                      <div className="label text-base-content">Status</div>
                      <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <div className="label text-base-content">Assignee</div>
                      <input value={assignee} onChange={(e) => setAssignee(e.target.value)} />
                    </div>
                  </>
                ) : null}

                {error ? <div className="error">{error}</div> : null}
                {success ? <div className="success">{success}</div> : null}

                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-primary border-2 border-primary" type="submit" disabled={!canManageIssue || isSaving}>
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
                </fieldset>
              </form>
              {!canManageIssue ? (
                <div className="error" style={{ marginTop: 10 }}>
                  You do not have permission to edit this issue.
                </div>
              ) : null}
            </div>

            <div className="card card-bordered border-2 border-base-300">
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

