// Client-safe permission constants — no server imports

export type Permission =
  | 'admin.create'        | 'admin.delete'       | 'admin.permission'
  | 'system.settings'     | 'system.maintenance' | 'system.database'
  | 'analytics.revenue'   | 'analytics.users'    | 'analytics.ai'
  | 'analytics.xp'        | 'analytics.retention'
  | 'payment.manage'      | 'payment.refund'     | 'payment.subscription'
  | 'payment.discount'
  | 'ai.prompt'           | 'ai.tokens'          | 'ai.analytics'
  | 'ai.abuse'
  | 'content.course'      | 'content.lesson'     | 'content.task'
  | 'content.achievement' | 'content.reward'
  | 'contest.manage'      | 'contest.launch'     | 'contest.prize'
  | 'leaderboard.view'    | 'leaderboard.reset'
  | 'user.ban'            | 'user.warn'          | 'user.report'
  | 'user.xp'             | 'user.tokens'
  | 'notification.send'

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    'admin.create','admin.delete','admin.permission',
    'system.settings','system.maintenance','system.database',
    'analytics.revenue','analytics.users','analytics.ai','analytics.xp','analytics.retention',
    'payment.manage','payment.refund','payment.subscription','payment.discount',
    'ai.prompt','ai.tokens','ai.analytics','ai.abuse',
    'content.course','content.lesson','content.task','content.achievement','content.reward',
    'contest.manage','contest.launch','contest.prize',
    'leaderboard.view','leaderboard.reset',
    'user.ban','user.warn','user.report','user.xp','user.tokens',
    'notification.send',
  ],
  MODERATOR: [
    'user.ban','user.warn','user.report',
    'notification.send',
    'contest.manage',
    'leaderboard.view',
    'analytics.users',
  ],
  CONTENT_MANAGER: [
    'content.course','content.lesson','content.task',
    'content.achievement','content.reward',
    'analytics.users',
  ],
  AI_MANAGER: [
    'ai.prompt','ai.tokens','ai.analytics','ai.abuse',
    'analytics.ai',
  ],
  PAYMENT_MANAGER: [
    'payment.manage','payment.refund','payment.subscription','payment.discount',
    'analytics.revenue',
  ],
  CONTEST_ADMIN: [
    'contest.manage','contest.launch','contest.prize',
    'notification.send',
    'leaderboard.view',
    'analytics.users',
  ],
  ANALYTICS_ADMIN: [
    'analytics.revenue','analytics.users','analytics.ai',
    'analytics.xp','analytics.retention',
    'leaderboard.view',
  ],
  INSTRUCTOR: [
    'content.course','content.lesson','content.task',
  ],
  STUDENT: [],
}

export const STAFF_ROLES = [
  'ADMIN','MODERATOR','CONTENT_MANAGER','AI_MANAGER',
  'PAYMENT_MANAGER','CONTEST_ADMIN','ANALYTICS_ADMIN','INSTRUCTOR',
]

export function hasPermission(role: string, perm: Permission): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes(perm)
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:           'ADMIN',
  MODERATOR:       'MODERATOR',
  CONTENT_MANAGER: 'CONTENT MGR',
  AI_MANAGER:      'AI MANAGER',
  PAYMENT_MANAGER: 'PAYMENT MGR',
  CONTEST_ADMIN:   'CONTEST ADM',
  ANALYTICS_ADMIN: 'ANALYTICS',
  INSTRUCTOR:      'INSTRUCTOR',
  STUDENT:         'STUDENT',
}

export const ROLE_COLORS: Record<string, string> = {
  ADMIN:           'var(--cyan)',
  MODERATOR:       'var(--red)',
  CONTENT_MANAGER: 'var(--green)',
  AI_MANAGER:      'var(--purple)',
  PAYMENT_MANAGER: 'var(--yellow)',
  CONTEST_ADMIN:   '#ff6b35',
  ANALYTICS_ADMIN: '#00bcd4',
  INSTRUCTOR:      'var(--purple)',
  STUDENT:         'var(--dim2)',
}

export type NavItem = { href: string; icon: string; label: string; col: string; perm?: Permission }

export const ALL_NAV: NavItem[] = [
  { href: '/admin',               icon: '▣', label: 'DASHBOARD',     col: 'var(--cyan)'   },
  { href: '/admin/users',         icon: '◉', label: 'USERS',         col: 'var(--cyan)',   perm: 'user.ban'        },
  { href: '/admin/courses',       icon: '◫', label: 'COURSES',       col: 'var(--green)',  perm: 'content.course'  },
  { href: '/admin/lessons',       icon: '◧', label: 'LESSONS',       col: 'var(--green)',  perm: 'content.lesson'  },
  { href: '/admin/tasks',         icon: '◨', label: 'TASKS',         col: 'var(--green)',  perm: 'content.task'    },
  { href: '/admin/ai',            icon: '◈', label: 'AI SYSTEM',     col: 'var(--purple)', perm: 'ai.prompt'       },
  { href: '/admin/leaderboard',   icon: '◆', label: 'LEADERBOARD',   col: 'var(--yellow)', perm: 'leaderboard.view'},
  { href: '/admin/achievements',  icon: '◎', label: 'ACHIEVEMENTS',  col: 'var(--yellow)', perm: 'content.achievement'},
  { href: '/admin/rewards',       icon: '◇', label: 'REWARDS',       col: 'var(--yellow)', perm: 'content.reward'  },
  { href: '/admin/notifications', icon: '◉', label: 'NOTIFICATIONS', col: 'var(--red)',    perm: 'notification.send'},
  { href: '/admin/contest',       icon: '◈', label: 'CONTEST',       col: 'var(--red)',    perm: 'contest.manage'  },
  { href: '/admin/payments',      icon: '◐', label: 'PAYMENTS',      col: 'var(--purple)', perm: 'payment.manage'  },
  { href: '/admin/reports',       icon: '◑', label: 'REPORTS',       col: 'var(--purple)', perm: 'analytics.revenue'},
  { href: '/admin/settings',      icon: '◉', label: 'SETTINGS',      col: 'var(--dim2)',   perm: 'system.settings' },
]