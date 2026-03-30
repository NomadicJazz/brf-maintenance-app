import { http, extractApiError } from './http'

export type IssuePriority = 'low' | 'medium' | 'high'
export type IssueStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export type IssuePayload = {
  id: number
  title: string
  description?: string | null
  location?: string | null
  user_id: number
  priority: IssuePriority | string
  photo_url?: string | null
  assignee?: string | null
  status: IssueStatus | string
  created_at?: string | null
  updated_at?: string | null
}

export type PaginatedIssuesResponse = {
  issues: IssuePayload[]
  total: number
  pages: number
  current_page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export type CreateIssueRequest = {
  title: string
  description?: string
  location?: string
  priority?: IssuePriority
  photo_url?: string
}

export type UpdateIssueRequest = Partial<{
  title: string
  description: string
  location: string
  priority: IssuePriority
  status: IssueStatus
  assignee: string
}>

export async function createIssueApi(req: CreateIssueRequest): Promise<IssuePayload> {
  try {
    const res = await http.post<IssuePayload>('/api/issues/', req)
    return res.data
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

export async function getMyIssuesApi(args: {
  page?: number
  limit?: number
}): Promise<PaginatedIssuesResponse> {
  const res = await http.get<PaginatedIssuesResponse>('/api/issues/my', {
    params: { page: args.page ?? 1, limit: args.limit ?? 20 },
  })
  return res.data
}

export async function getAdminIssuesApi(args: {
  page?: number
  limit?: number
  status?: string
}): Promise<PaginatedIssuesResponse> {
  const res = await http.get<PaginatedIssuesResponse>('/api/issues/', {
    params: {
      page: args.page ?? 1,
      limit: args.limit ?? 20,
      ...(args.status ? { status: args.status } : {}),
    },
  })
  return res.data
}

export async function getIssueApi(issueId: number): Promise<IssuePayload> {
  try {
    const res = await http.get<IssuePayload>(`/api/issues/${issueId}`)
    return res.data
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

export async function updateIssueApi(
  issueId: number,
  req: UpdateIssueRequest,
): Promise<IssuePayload> {
  try {
    const res = await http.put<IssuePayload>(`/api/issues/${issueId}`, req)
    return res.data
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

export async function deleteIssueApi(issueId: number): Promise<void> {
  try {
    await http.delete(`/api/issues/${issueId}`)
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

