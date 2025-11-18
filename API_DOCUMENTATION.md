# API Documentation - AI Recruiter Backend

**Base URL:** `http://localhost:4000/v1`

**Authentication:** All endpoints (except auth endpoints) require Bearer token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## **Table of Contents**

1. [Authentication](#authentication)
2. [Job Applications](#job-applications)
3. [Documents](#documents)
4. [Dashboard](#dashboard)
5. [Progress Tracker](#progress-tracker)
6. [AI Assistant](#ai-assistant)
7. [User Profile](#user-profile)

---

## **Authentication**

### **1. Register User**
```
POST /v1/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id_string",
      "name": "John Doe",
      "role": "candidate"
    }
  }
}
```

---

### **2. Login**
```
POST /v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id_string",
      "name": "John Doe",
      "role": "candidate"
    }
  }
}
```

---

### **3. Get Current User**
```
GET /v1/auth/user
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "691c1b93d55d2b4f62afdc6c",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  }
}
```

---

## **Job Applications**

### **1. Get All Job Applications**
```
GET /v1/job-applications
```

**Query Parameters:**
- `status` (optional): `'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'all'` (default: all)
- `search` (optional): Search in jobTitle and companyName
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): `'date' | 'company' | 'status'` (default: 'date')
- `sortOrder` (optional): `'asc' | 'desc'` (default: 'desc')

**Example:**
```
GET /v1/job-applications?status=Interview&search=developer&page=1&limit=10&sortBy=date&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_id_1",
        "jobTitle": "Senior Frontend Developer",
        "companyName": "Tech Corp",
        "applicationDate": "2024-01-15",
        "status": "Interview",
        "notes": "Second round interview scheduled",
        "companyLogo": "tech-corp-logo.png",
        "location": "San Francisco, CA",
        "salary": "$120k - $150k",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### **2. Get Single Job Application**
```
GET /v1/job-applications/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "app_id_1",
    "jobTitle": "Senior Frontend Developer",
    "companyName": "Tech Corp",
    "applicationDate": "2024-01-15",
    "status": "Interview",
    "notes": "Second round interview scheduled",
    "companyLogo": "tech-corp-logo.png",
    "location": "San Francisco, CA",
    "salary": "$120k - $150k",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### **3. Create Job Application**
```
POST /v1/job-applications
```

**Request Body:**
```json
{
  "jobTitle": "Senior Frontend Developer",
  "companyName": "Tech Corp",
  "applicationDate": "2024-01-15",
  "status": "Applied",
  "notes": "Applied through LinkedIn",
  "location": "San Francisco, CA",
  "salary": "$120k - $150k",
  "companyLogo": "tech-corp-logo.png"
}
```

**Note:** `status` defaults to `"Applied"` if not provided. `jobTitle`, `companyName`, and `applicationDate` are required.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_app_id",
    "jobTitle": "Senior Frontend Developer",
    "companyName": "Tech Corp",
    "applicationDate": "2024-01-15",
    "status": "Applied",
    "notes": "Applied through LinkedIn",
    "location": "San Francisco, CA",
    "salary": "$120k - $150k",
    "companyLogo": "tech-corp-logo.png",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### **4. Update Job Application**
```
PUT /v1/job-applications/:id
```

**Request Body:** (All fields optional)
```json
{
  "jobTitle": "Senior Frontend Developer",
  "companyName": "Tech Corp",
  "applicationDate": "2024-01-15",
  "status": "Interview",
  "notes": "Updated notes",
  "location": "San Francisco, CA",
  "salary": "$120k - $150k",
  "companyLogo": "tech-corp-logo.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "app_id_1",
    "jobTitle": "Senior Frontend Developer",
    "companyName": "Tech Corp",
    "applicationDate": "2024-01-15",
    "status": "Interview",
    "notes": "Updated notes",
    "location": "San Francisco, CA",
    "salary": "$120k - $150k",
    "companyLogo": "tech-corp-logo.png",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

---

### **5. Delete Job Application**
```
DELETE /v1/job-applications/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Job application deleted successfully"
  }
}
```

---

### **6. Bulk Delete Job Applications**
```
DELETE /v1/job-applications/bulk
```

**Request Body:**
```json
{
  "ids": ["app_id_1", "app_id_2", "app_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "3 job application(s) deleted successfully",
    "deletedCount": 3
  }
}
```

---

## **Documents**

### **1. Get All Documents**
```
GET /v1/documents
```

**Query Parameters:**
- `type` (optional): `'cv' | 'cover-letter' | 'certificate' | 'all'` (default: 'all')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /v1/documents?type=cv&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_id_1",
        "name": "John Doe - Software Developer Resume",
        "type": "cv",
        "fileName": "john_doe_resume.pdf",
        "uploadDate": "2024-01-15T10:00:00.000Z",
        "size": 2621440,
        "url": "https://res.cloudinary.com/.../doc_id_1.pdf",
        "mimeType": "application/pdf"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### **2. Get Single Document**
```
GET /v1/documents/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id_1",
    "name": "John Doe - Software Developer Resume",
    "type": "cv",
    "fileName": "john_doe_resume.pdf",
    "uploadDate": "2024-01-15T10:00:00.000Z",
    "size": 2621440,
    "url": "https://res.cloudinary.com/.../doc_id_1.pdf",
    "mimeType": "application/pdf"
  }
}
```

---

### **3. Upload Document**
```
POST /v1/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): File to upload (PDF, DOC, DOCX, PNG, JPEG)
- `type` (required): `'cv' | 'cover-letter' | 'certificate'`
- `name` (optional): Display name for the document

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_doc_id",
    "name": "John Doe - Software Developer Resume",
    "type": "cv",
    "fileName": "john_doe_resume.pdf",
    "uploadDate": "2024-01-15T10:00:00.000Z",
    "size": 2621440,
    "url": "https://res.cloudinary.com/.../new_doc_id.pdf",
    "mimeType": "application/pdf"
  }
}
```

---

### **4. Update Document Metadata**
```
PUT /v1/documents/:id
```

**Request Body:**
```json
{
  "name": "Updated Resume Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id_1",
    "name": "Updated Resume Name",
    "type": "cv",
    "fileName": "john_doe_resume.pdf",
    "uploadDate": "2024-01-15T10:00:00.000Z",
    "size": 2621440,
    "url": "https://res.cloudinary.com/.../doc_id_1.pdf",
    "mimeType": "application/pdf"
  }
}
```

---

### **5. Delete Document**
```
DELETE /v1/documents/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully"
  }
}
```

---

### **6. Get Document Status Summary**
```
GET /v1/documents/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 5,
    "cvCount": 2,
    "coverLetterCount": 2,
    "certificateCount": 1,
    "totalSize": 10485760
  }
}
```

---

### **7. Download Document**
```
GET /v1/documents/:id/download
```

**Response:** File stream with appropriate Content-Type header (redirects to Cloudinary URL or serves local file)

---

## **Dashboard**

### **1. Get Dashboard Stats**
```
GET /v1/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "interviewsScheduled": 3,
    "offersReceived": 1
  }
}
```

---

## **Progress Tracker**

### **1. Get Progress KPIs**
```
GET /v1/progress/kpis
```

**Query Parameters:**
- `dateRange` (optional): `'7' | '30' | '90' | 'all'` (default: '30')
- `status` (optional): `'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'all'` (default: 'all')

**Example:**
```
GET /v1/progress/kpis?dateRange=30&status=all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "totalApplicationsChange": 12,
    "interviewsScheduled": 8,
    "interviewsScheduledChange": 5,
    "offersReceived": 3,
    "offersReceivedChange": 2,
    "rejections": 14,
    "rejectionsChange": -8
  }
}
```

**Note:** `*Change` fields represent percentage change from previous period.

---

### **2. Get Progress Charts Data**
```
GET /v1/progress/charts
```

**Query Parameters:**
- `dateRange` (optional): `'7' | '30' | '90' | 'all'` (default: '30')
- `status` (optional): `'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'all'` (default: 'all')

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationsOverTime": [
      {
        "date": "2024-01-01",
        "count": 2
      },
      {
        "date": "2024-01-02",
        "count": 5
      }
    ],
    "statusDistribution": {
      "Applied": 10,
      "Interview": 8,
      "Offer": 3,
      "Rejected": 4
    },
    "timeline": [
      {
        "date": "2024-01-15",
        "event": "Applied",
        "applicationId": "app_id_1",
        "jobTitle": "Senior Frontend Developer",
        "companyName": "Tech Corp"
      }
    ]
  }
}
```

---

### **3. Get Progress Activity**
```
GET /v1/progress/activity
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_id_1",
        "type": "status_change",
        "applicationId": "app_id_1",
        "jobTitle": "Senior Frontend Developer",
        "companyName": "Tech Corp",
        "description": "Status changed from Applied to Interview",
        "timestamp": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Activity Types:**
- `application_created`
- `application_updated`
- `status_change`

---

## **AI Assistant**

### **1. Send Message to AI**
```
POST /v1/ai-assistant/chat
```

**Request Body:**
```json
{
  "message": "Can you review my CV?",
  "conversationId": "conv_id_1"
}
```

**Note:** `conversationId` is optional. If not provided, a new conversation will be created.

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_id_1",
    "response": "I'd be happy to review your CV! Please upload it or share the key sections...",
    "conversationId": "conv_id_1",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### **2. Get Conversation History**
```
GET /v1/ai-assistant/conversations
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_id_1",
        "title": "CV Review Discussion",
        "lastMessage": "I'd be happy to review your CV!",
        "lastMessageTime": "2024-01-15T10:00:00.000Z",
        "messageCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

### **3. Get Messages in Conversation**
```
GET /v1/ai-assistant/conversations/:conversationId/messages
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_id_1",
        "type": "user",
        "content": "Can you review my CV?",
        "timestamp": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "msg_id_2",
        "type": "ai",
        "content": "I'd be happy to review your CV!",
        "timestamp": "2024-01-15T10:00:01.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### **4. Delete Conversation**
```
DELETE /v1/ai-assistant/conversations/:conversationId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation deleted successfully"
  }
}
```

---

## **User Profile**

### **1. Get User Profile**
```
GET /v1/users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "candidate",
      "status": "active"
    },
    "profile": {
      "education": "BS Computer Science",
      "skills": ["JavaScript", "React", "Node.js"],
      "bio": "Experienced developer...",
      "cvUrl": "https://..."
    }
  }
}
```

---

### **2. Update User Profile**
```
PATCH /v1/users/me
```

**Request Body:**
```json
{
  "education": "BS Computer Science",
  "skills": ["JavaScript", "React", "Node.js"],
  "bio": "Experienced developer..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "education": "BS Computer Science",
    "skills": ["JavaScript", "React", "Node.js"],
    "bio": "Experienced developer...",
    "cvUrl": "https://..."
  }
}
```

---

## **Error Responses**

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "fieldName": ["Error message for this field"]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## **Important Notes**

1. **Authentication:** All endpoints (except `/v1/auth/*`) require Bearer token authentication
2. **User Context:** All data is automatically filtered by the authenticated user
3. **File Uploads:** Maximum file size is 10MB. Supported formats: PDF, DOC, DOCX, PNG, JPEG
4. **Pagination:** Default page size is 10, but can be customized with `limit` parameter
5. **Date Formats:** All dates are returned in ISO 8601 format (e.g., `2024-01-15T10:00:00.000Z`)
6. **Field Names:** The API supports both old field names (`title`, `company`) and new ones (`jobTitle`, `companyName`) for backward compatibility

---

**Last Updated:** Complete implementation ready for frontend integration

