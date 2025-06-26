# 📚 Booka

**Booka** is a digital textbook ordering and delivery platform designed for Nigerian universities. It streamlines the process of searching, purchasing, and receiving textbooks, while providing administrative tools for schools and logistics tracking for delivery agents.

---

## 🧩 Folder Structure

```

booka/
├── backend/           # Node.js + Express + TypeScript API
├── frontend/          # Next.js + TypeScript frontend app
├── .github/           # GitHub workflows
├── README.md
├── CONTRIBUTING.md

````

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (with Prisma or Knex)
- JWT Authentication
- Paystack Integration

### Frontend
- Next.js + TypeScript
- Tailwind CSS or equivalent
- REST API consumption

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/booka.git
cd booka
````

---

## 🧪 Running the Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

> Make sure to update your `.env` file with DB credentials, JWT secrets, Paystack keys, etc.

---

## 🧪 Running the Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> The frontend is expected to communicate with the backend at `http://localhost:3000/api` or whatever base URL you configure.

---

## 🔄 Contribution Workflow

We use a simple GitHub flow optimized for small teams:

1. **Fork** the repository.
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Push** to your branch and submit a **pull request to `dev`**.
4. All PRs must pass linting and build checks.

---

## 📋 Pull Request Template

```markdown
## Description
What does this PR do?

## Related Issue
Fixes #<issue_number>

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Chore
- [ ] Refactor

## Checklist
- [ ] Code compiles and passes tests
- [ ] Linter passes
- [ ] Feature works as expected

## Screenshots (if applicable)
```

---

## 👥 Roles

* **Super Admin**: Manages all universities
* **School Admin**: Manages bookstores, staff, agents
* **Bookstore Staff**: Manages orders and inventory
* **Agent**: Updates order delivery status
* **Student**: Places and tracks orders

---

## 👨‍💻 Maintainers

* Chimdyke Kamsi (Tech Lead)

---
