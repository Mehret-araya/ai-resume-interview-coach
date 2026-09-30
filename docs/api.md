# AI Resume + Interview Coach API

Base URL:

http://localhost:5000

---

## 1. Authentication

### Register

POST `/auth/register`

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}