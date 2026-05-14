# ArenaHub — Бүх функцуудын жагсаалт

## 1. AUTH SERVICE (`lib/services/auth.service.ts`)
| Функц | Тайлбар |
|---|---|
| `registerUser()` | Шинэ хэрэглэгч бүртгэх, accessToken + refreshToken буцаана |
| `loginUser()` | Нэвтрэх, IP логдоно |
| `logoutUser()` | Гарах, refreshToken устгана |
| `refreshToken()` | Access token шинэчлэх |

## AUTH LIB (`lib/auth.ts`)
| Функц | Тайлбар |
|---|---|
| `hashPassword()` | bcrypt hash |
| `comparePassword()` | Нууц үг шалгах |
| `generateAccessToken()` | 15min JWT |
| `generateRefreshToken()` | 7d JWT |
| `verifyAccessToken()` | Token баталгаажуулах |
| `verifyRefreshToken()` | Refresh token баталгаажуулах |
| `decodeToken()` | Token задлах |
| `storeRefreshToken()` | DB-д хадгалах |
| `removeRefreshToken()` | Устгах |
| `revokeAllSessions()` | Бүх session цуцлах |
| `requireAuth()` | Request-аас user авах |
| `requireAdmin()` | Admin шалгах |
| `requireRole()` | Role шалгах |

## 2. USER SERVICE (`lib/services/user.service.ts`)
| Функц | Тайлбар |
|---|---|
| `createUser()` | Шинэ user үүсгэх |
| `getUserById()` | ID-гаар хайх |
| `getUserByEmail()` | Email-аар хайх |
| `getAllUsers()` | Жагсаалт (search, page, limit) |
| `updateUser()` | Шинэчлэх |
| `deleteUser()` | Устгах |
| `updateUserRole()` | Role өөрчлөх |
| `getUserRole()` | Role авах |
| `updateProfile()` | Профайл шинэчлэх |
| `uploadAvatar()` | Avatar URL хадгалах |
| `banUser()` | Блоклох |
| `unbanUser()` | Блок арилгах |

## 3. TASK SERVICE (`lib/services/task.service.ts`)
| Функц | Тайлбар |
|---|---|
| `createTask()` | Task үүсгэх |
| `getAllTasks()` | Жагсаалт |
| `getTaskById()` | ID-гаар авах |
| `updateTask()` | Шинэчлэх |
| `deleteTask()` | Устгах |
| `assignTaskToUser()` | Хэрэглэгчид хуваарилах |
| `removeTaskFromUser()` | Хуваарилалт арилгах |
| `getUserTasks()` | Хэрэглэгчийн task-ууд |
| `getTaskParticipants()` | Task-ийн оролцогчид |
| `startTask()` | Task эхлүүлэх |
| `completeTask()` | Дуусгах + XP |
| `failTask()` | Амжилтгүй тэмдэглэх |
| `resetTask()` | Reset хийх |
| `searchTasks()` | Хайх |
| `filterTasks()` | Шүүх |
| `sortResults()` | Эрэмбэлэх |
| `paginateResults()` | Хуудаслах |

## 4. GAME SERVICE (`lib/services/game.service.ts`)
| Функц | Тайлбар |
|---|---|
| `getUserProgress()` | Явцыг авах |
| `createProgress()` | Шинэ явц үүсгэх |
| `updateProgress()` | Шинэчлэх |
| `resetProgress()` | Reset |
| `addXP()` | XP нэмэх + level check |
| `removeXP()` | XP хасах |
| `calculateLevel()` | XP → level тооцоолох |
| `levelUp()` | Level ахих notification |
| `getLevel()` | Одоогийн level |
| `createAchievement()` | Амжилт үүсгэх |
| `unlockAchievement()` | Амжилт нээх |
| `getUserAchievements()` | Хэрэглэгчийн амжилтууд |
| `checkAchievementUnlock()` | Нөхцөл шалгаж нээх |

## 5. REWARD SERVICE (`lib/services/reward.service.ts`)
| Функц | Тайлбар |
|---|---|
| `createReward()` | Шагнал үүсгэх |
| `getRewards()` | Бүх шагнал |
| `getRewardById()` | ID-гаар |
| `assignRewardToUser()` | Хэрэглэгчид оноох |
| `claimReward()` | Шагнал авах |
| `getUserRewards()` | Хэрэглэгчийн шагналууд |
| `removeReward()` | Устгах |

## 6. AI SERVICE (`lib/services/ai.service.ts`)
| Функц | Тайлбар |
|---|---|
| `processUserPrompt()` | Prompt боловсруулах (intent→action→execute) |
| `generateResponse()` | AI хариу үүсгэх |
| `analyzeUserIntent()` | Intent тодорхойлох |
| `decideAction()` | Ямар action хийхийг шийдэх |
| `executeAction()` | Action гүйцэтгэх |
| `recommendTask()` | Тохирох task санал болгох |
| `autoAssignTask()` | Task автоматаар хуваарилах |
| `autoCompleteTask()` | Task автоматаар дуусгах |
| `generateHint()` | Hint үүсгэх |
| `suggestNextAction()` | Дараагийн алхам санал болгох |
| `autoFillForm()` | Маягт автоматаар бөглөх |
| `callExternalAPI()` | Гадаад API дуудах |
| `callInternalService()` | Дотоод service дуудах |
| `validateActionPermission()` | Эрх шалгах |

## 7. NOTIFICATION SERVICE (`lib/services/notification.service.ts`)
| Функц | Тайлбар |
|---|---|
| `sendNotification()` | In-app мэдэгдэл |
| `sendEmail()` | И-мэйл (hook) |
| `sendInAppNotification()` | In-app (sendNotification alias) |
| `getUserNotifications()` | Мэдэгдэлүүд |
| `markAsRead()` | Уншсан тэмдэглэх |
| `markAllAsRead()` | Бүгдийг уншсан |

## 8. ANALYTICS SERVICE (`lib/services/analytics.service.ts`)
| Функц | Тайлбар |
|---|---|
| `trackUserActivity()` | Үйлдэл бүртгэх |
| `logActivity()` | Лог бичих |
| `getUsageStats()` | Хэрэглээний статистик |
| `getDashboardStats()` | Dashboard мэдээлэл |
| `analyzeGameData()` | Тоглоомын мэдээлэл шинжлэх |
| `systemLogs()` | Системийн лог |

## 9. SECURITY SERVICE (`lib/services/security.service.ts`)
| Функц | Тайлбар |
|---|---|
| `validateInput()` | Zod schema-гаар шалгах |
| `sanitizeInput()` | XSS, SQL char цэвэрлэх |
| `preventSQLInjection()` | SQL injection илрүүлэх |
| `preventXSS()` | HTML escape |
| `preventCSRF()` | Origin шалгах |
| `rateLimiter()` | Хурд хязгаарлагч (in-memory) |
| `blockIP()` | IP блоклох |
| `unblockIP()` | Блок арилгах |
| `isBlocked()` | Блок шалгах |
| `getClientIP()` | Client IP авах |

## 10. ADMIN SERVICE (`lib/services/admin.service.ts`)
| Функц | Тайлбар |
|---|---|
| `getDashboardStats()` | Admin dashboard |
| `getAllUsersAdmin()` | Бүх хэрэглэгч (search+pagination) |
| `getAllTasksAdmin()` | Бүх task |
| `deleteAnyUser()` | Хэрэглэгч устгах |
| `deleteAnyTask()` | Task устгах |
| `systemLogs()` | Системийн лог |

## 11. SERVER UTILS (`lib/server.ts`)
| Функц | Тайлбар |
|---|---|
| `connectDB()` | DB холбох |
| `disconnectDB()` | DB салгах |
| `loadEnv()` | Env шалгах |
| `logger()` | Лог бичих |
| `errorHandler()` | Алдаа боловсруулах |
| `gracefulShutdown()` | Зөв зогсоох |
| `startServer()` | Сервер эхлүүлэх |

## API Endpoints

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| POST | /api/auth?action=register | ❌ | Бүртгүүлэх |
| POST | /api/auth?action=login | ❌ | Нэвтрэх |
| POST | /api/auth?action=logout | ✅ | Гарах |
| GET | /api/auth | ✅ | Өөрийн мэдээлэл |
| POST | /api/refresh | ❌ | Token шинэчлэх |
| GET | /api/courses | ❌ | Хичээлийн жагсаалт |
| POST | /api/courses | ADMIN | Шинэ хичээл |
| GET | /api/courses/:id | ❌ | Нэг хичээл |
| POST | /api/courses/:id?action=enroll | ✅ | Бүртгүүлэх |
| GET | /api/lessons?courseId= | ✅ | Хичээлүүд |
| GET | /api/lessons/:id | ✅ | Нэг хичээл |
| POST | /api/lessons/:id | ✅ | Хичээл дуусгах |
| GET | /api/tasks?lessonId= | ✅ | Task жагсаалт |
| POST | /api/tasks | ADMIN | Шинэ task |
| GET | /api/tasks/:id | ✅ | Нэг task |
| POST | /api/tasks/:id?action=submit | ✅ | Хариулт |
| POST | /api/tasks/:id?action=start | ✅ | Эхлүүлэх |
| POST | /api/tasks/:id?action=assign | ✅ | Хуваарилах |
| POST | /api/tasks/:id?action=reset | ✅ | Reset |
| POST | /api/execute | ✅ | Код ажиллуулах |
| POST | /api/ai | ✅ | AI Agent |
| GET | /api/leaderboard | ❌ | Шилдэг тоглогчид |
| GET | /api/notifications | ✅ | Мэдэгдэлүүд |
| PATCH | /api/notifications | ✅ | Бүгдийг уншсан |
| PATCH | /api/notifications/:id | ✅ | Уншсан |
| GET | /api/rewards | ✅ | Шагналууд |
| POST | /api/rewards | ADMIN | Шинэ шагнал |
| POST | /api/rewards/:id | ✅ | Шагнал авах |
| GET | /api/achievements | ✅ | Амжилтууд |
| GET | /api/users | ADMIN | Хэрэглэгчид |
| GET | /api/users/:id | ADMIN | Нэг хэрэглэгч |
| PATCH | /api/users/:id | ✅ | Profile шинэчлэх |
| PATCH | /api/users/:id?action=role | ADMIN | Role өөрчлөх |
| PATCH | /api/users/:id?action=ban | ADMIN | Ban |
| DELETE | /api/users/:id | ADMIN | Устгах |
| GET | /api/admin/stats | ADMIN | Dashboard stats |
| GET | /api/admin/stats?type=logs | ADMIN | System logs |
| GET | /api/admin/stats?type=usage | ADMIN | Usage stats |
