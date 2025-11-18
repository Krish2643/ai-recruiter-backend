# API Quick Reference - All Endpoints

**Base URL:** `http://localhost:4000/v1`

**Auth Header:** `Authorization: Bearer <token>`

---

## 🔐 **Authentication** (No auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/login` | Login user |
| GET | `/v1/auth/user` | Get current user |

---

## 💼 **Job Applications** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/job-applications` | List all (with pagination, search, filter, sort) |
| GET | `/v1/job-applications/:id` | Get single application |
| POST | `/v1/job-applications` | Create new application |
| PUT | `/v1/job-applications/:id` | Update application |
| DELETE | `/v1/job-applications/:id` | Delete application |
| DELETE | `/v1/job-applications/bulk` | Bulk delete applications |

**Query Params (GET list):**
- `status`, `search`, `page`, `limit`, `sortBy`, `sortOrder`

---

## 📄 **Documents** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/documents` | List all (with pagination, type filter) |
| GET | `/v1/documents/:id` | Get single document |
| GET | `/v1/documents/status` | Get document status summary |
| GET | `/v1/documents/:id/download` | Download document |
| POST | `/v1/documents` | Upload document (multipart/form-data) |
| PUT | `/v1/documents/:id` | Update document metadata |
| DELETE | `/v1/documents/:id` | Delete document |

**Query Params (GET list):**
- `type`, `page`, `limit`

---

## 📊 **Dashboard** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/dashboard/stats` | Get dashboard statistics |

---

## 📈 **Progress Tracker** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/progress/kpis` | Get KPIs with % changes |
| GET | `/v1/progress/charts` | Get charts data |
| GET | `/v1/progress/activity` | Get recent activity feed |

**Query Params:**
- `dateRange` (7/30/90/all), `status`, `limit`

---

## 🤖 **AI Assistant** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/ai-assistant/chat` | Send message to AI |
| GET | `/v1/ai-assistant/conversations` | Get conversation history |
| GET | `/v1/ai-assistant/conversations/:id/messages` | Get messages in conversation |
| DELETE | `/v1/ai-assistant/conversations/:id` | Delete conversation |

**Query Params:**
- `page`, `limit`

---

## 👤 **User Profile** (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/users/me` | Get user profile |
| PATCH | `/v1/users/me` | Update user profile |

---

## 📝 **Response Format**

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## 🔑 **Key Features**

✅ All endpoints require authentication (except auth endpoints)
✅ Pagination support on all list endpoints
✅ Search and filtering where applicable
✅ User data automatically filtered by authenticated user
✅ File uploads supported (max 10MB)
✅ ISO 8601 date formatting
✅ Consistent error handling

---

**Full Documentation:** See `API_DOCUMENTATION.md` for detailed request/response examples

