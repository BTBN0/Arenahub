function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('arenahub_token')
}

// Deduplicate simultaneous identical GET requests — share the same in-flight promise
const inflight = new Map<string, Promise<unknown>>()

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token   = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  if (method === 'GET') {
    const key = `${path}|${token ?? ''}`
    const existing = inflight.get(key)
    if (existing) return existing as Promise<T>
    const p = fetch(path, { method, headers })
      .then(async res => {
        inflight.delete(key)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { const e = new Error((data as {error?:string}).error || 'Серверийн алдаа') as Error & {status:number}; e.status = res.status; throw e }
        return data as T
      })
      .catch(e => { inflight.delete(key); throw e })
    inflight.set(key, p)
    return p
  }

  const res  = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = new Error((data as {error?:string}).error || 'Серверийн алдаа') as Error & {status:number}
    e.status = res.status; throw e
  }
  return data as T
}

const g = <T>(path: string)               => request<T>('GET',    path)
const p = <T>(path: string, b: unknown)   => request<T>('POST',   path, b)
const pu= <T>(path: string, b: unknown)   => request<T>('PUT',    path, b)
const pa= <T>(path: string, b: unknown)   => request<T>('PATCH',  path, b)
const d = <T>(path: string)               => request<T>('DELETE', path)

export const authApi = {
  me:       ()                                     => g<{user:User}>('/api/auth'),
  login:    (email:string,password:string)         => p<{user:User;token:string}>('/api/auth?action=login',{email,password}),
  register: (username:string,email:string,pw:string)=> p<{user:User;token:string}>('/api/auth?action=register',{username,email,password:pw}),
}
export const coursesApi = {
  list:   (q='')         => g<{courses:Course[];pagination:Pagination}>(`/api/courses${q}`),
  get:    (id:string)    => g<{course:Course}>(`/api/courses/${id}`),
  enroll: (id:string)    => p<{message:string}>(`/api/courses/${id}?action=enroll`,{}),
  create: (data:unknown) => p<{course:Course}>('/api/courses',data),
  update: (id:string,data:unknown) => pu<{course:Course}>(`/api/courses/${id}`,data),
  delete: (id:string)    => d<{message:string}>(`/api/courses/${id}`),
}
export const lessonsApi = {
  byCourse: (cid:string) => g<{lessons:Lesson[]}>(`/api/lessons?courseId=${cid}`),
  get:      (id:string)  => g<{lesson:Lesson}>(`/api/lessons/${id}`),
  complete: (id:string)  => p<{xpEarned:number}>(`/api/lessons/${id}`,{}),
}
export const tasksApi = {
  byLesson:   (lid:string)                => g<{tasks:Task[]}>(`/api/tasks?lessonId=${lid}`),
  submitQuiz: (id:string,selected:number) => p<{isCorrect:boolean;correctAnswer:number;xpEarned:number}>(`/api/tasks/${id}?action=submit`,{selected}),
  submitCode: (id:string,code:string,allPass=false) => p<{isCorrect:boolean;xpEarned:number}>(`/api/tasks/${id}?action=submit`,{code,allPass}),
}
export const leaderboardApi = {
  get: (limit=20) => g<{leaderboard:LeaderboardEntry[];myRank:LeaderboardEntry|null}>(`/api/leaderboard?limit=${limit}`),
}
export const usersApi = {
  list:   (q='')         => g<{users:UserAdmin[];pagination:Pagination}>(`/api/users${q}`),
  get:    (id:string)    => g<{user:UserAdmin}>(`/api/users/${id}`),
  update: (id:string,b:unknown) => pa<{user:UserAdmin}>(`/api/users/${id}`,b),
  delete: (id:string)    => d<{message:string}>(`/api/users/${id}`),
}

// Shared types
export interface User { id:string;username:string;email:string;role:string;xp:number;level:number;coins:number;avatarUrl?:string;bio?:string;country?:string;subscription?:{plan:'FREE'|'PRO'|'VIP';endDate:string|null};_count?:{enrollments:number;lessonProgress:number;taskSubmissions:number} }
export interface Course { id:string;title:string;description?:string;category:string;difficulty:string;xpReward:number;orderIndex:number;isActive:boolean;_count?:{lessons:number;enrollments:number};lessons?:Lesson[] }
export interface Lesson { id:string;courseId:string;title:string;content?:string;xpReward:number;orderIndex:number;completed?:boolean;taskCount?:number;tasks?:Task[] }
export interface Task { id:string;lessonId:string;title:string;titleEn?:string;description:string;descriptionEn?:string;taskType:string;options?:string[];optionsEn?:string[];xpReward:number;submitted?:Submission|null;starterCode?:string;testCases?:{input:unknown;expected:unknown;label?:string}[] }
export interface Submission { id:string;status:string;selected?:number;xpEarned:number }
export interface LeaderboardEntry { rank:number;id?:string;username?:string;xp?:number;level?:number }
export interface UserAdmin { id:string;username:string;email:string;role:string;xp:number;level:number;createdAt:string;_count?:{enrollments:number;taskSubmissions:number} }
export interface Pagination { page:number;limit:number;total:number;pages:number }

// Extended Task type with code fields
export interface CodeTask extends Task {
  starterCode?: string
  testCases?: { input: unknown; expected: unknown; label?: string }[]
}

export const notificationsApi = {
  list:      (unread=false) => g<{notifications:Notification[]}>(`/api/notifications${unread?'?unread=true':''}`),
  markRead:  (id:string)    => pa<{notification:Notification}>(`/api/notifications/${id}`,{}),
  markAll:   ()             => pa<{message:string}>('/api/notifications',{}),
}
export const rewardsApi = {
  list:    ()          => g<{rewards:Reward[]}>('/api/rewards'),
  mine:    ()          => g<{rewards:UserReward[]}>('/api/rewards?mine=true'),
  claim:   (id:string) => p<{userReward:UserReward}>(`/api/rewards/${id}`,{}),
}
export const achievementsApi = {
  mine: () => g<{achievements:UserAchievement[]}>('/api/achievements'),
}
export const adminApi = {
  stats:    ()                      => g<{stats:AdminStats}>('/api/admin/stats'),
  logs:     ()                      => g<{logs:ActivityLog[]}>('/api/admin/stats?type=logs'),
  usage:    ()                      => g<{stats:UsageStats}>('/api/admin/stats?type=usage'),
  users:    (q='')                  => g<{users:UserAdmin[];total:number;pages:number}>(`/api/users${q}`),
  banUser:  (id:string)             => pa<{user:UserAdmin}>(`/api/users/${id}?action=ban`,{}),
  unban:    (id:string)             => pa<{user:UserAdmin}>(`/api/users/${id}?action=unban`,{}),
  setRole:  (id:string,role:string) => pa<{user:UserAdmin}>(`/api/users/${id}?action=role`,{role}),
  delUser:  (id:string)             => d<{message:string}>(`/api/users/${id}`),
  createAch:(data:unknown)          => p<{achievement:Achievement}>('/api/achievements',data),
}
export const profileApi = {
  me:     ()            => g<{user:User}>('/api/auth'),
  update: (b:unknown)   => pa<{user:User}>(`/api/users/me`,b),
}

export interface Notification { id:string;title:string;message:string;type:string;isRead:boolean;createdAt:string }
export interface Reward { id:string;title:string;description:string;icon:string;type:string;value:number }
export interface UserReward { id:string;rewardId:string;claimedAt:string|null;assignedAt:string;reward:Reward }
export interface Achievement { id:string;title:string;description:string;icon:string;xpReward:number;condition:string }
export interface UserAchievement { id:string;achievementId:string;unlockedAt:string;achievement:Achievement }
export interface AdminStats { users:number;tasks:number;courses:number;topPlayers:{id:string;username:string;xp:number;level:number}[];recentActivity:ActivityLog[] }
export interface UsageStats { totalUsers:number;totalTasks:number;totalSubmissions:number;passedCount:number;avgPassRate:number }
export interface ActivityLog { id:string;action:string;createdAt:string;user?:{username:string;role:string};meta?:unknown }
