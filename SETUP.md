# ArenaHub — Ажиллуулах заавар

## 1. Database (PostgreSQL)
```bash
# Docker ашиглах (хамгийн хялбар)
docker-compose up db -d

# Эсвэл local PostgreSQL суулгаад:
# createdb arenahub
```

## 2. App суулгах
```bash
npm install
npm run db:push    # tables үүсгэх
npm run db:seed    # test data
npm run dev        # → http://localhost:3000
```

## 3. AI Agent (FREE — API key хэрэггүй!)

### Ollama суулгах (Windows)
1. https://ollama.com/download → татаж суулгана
2. CMD/PowerShell-д:
```bash
ollama pull llama3.2     # ~2GB model татна
ollama serve             # AI сервер эхлүүлнэ (port 11434)
```
3. `.env` файл — тохиргоо хийхгүйгээр ажиллана!

### Бусад model сонгох (.env дотор)
```env
OLLAMA_MODEL="llama3.2"      # default, хурдан
OLLAMA_MODEL="llama3.1"      # том, сайн
OLLAMA_MODEL="mistral"       # хурдан, сайн монгол
OLLAMA_MODEL="qwen2.5"       # хурдан, хямд RAM
```

---

## API Endpoints

| Method | Path | Auth | Тайлбар |
|--------|------|------|---------|
| POST | /api/auth?action=register | ❌ | Бүртгүүлэх |
| POST | /api/auth?action=login | ❌ | Нэвтрэх |
| GET | /api/auth | ✅ | Өөрийн мэдээлэл |
| GET | /api/courses | ❌ | Хичээлийн жагсаалт |
| POST | /api/courses/:id?action=enroll | ✅ | Бүртгүүлэх |
| GET | /api/lessons?courseId= | ✅ | Хичээлүүд |
| POST | /api/lessons/:id | ✅ | Хичээл дуусгах |
| GET | /api/tasks?lessonId= | ✅ | Task жагсаалт |
| POST | /api/tasks/:id | ✅ | Хариулт submit |
| POST | /api/execute | ✅ | Код ажиллуулах |
| POST | /api/ai | ✅ | AI Agent chat |
| GET | /api/leaderboard | ❌ | Шилдэг тоглогчид |
| GET | /api/users | ADMIN | Хэрэглэгч жагсаалт |

## Test accounts
| Email | Password | Role |
|-------|----------|------|
| admin@arenahub.mn | admin123 | ADMIN |
| pixel_ninja@arenahub.mn | student123 | STUDENT |
