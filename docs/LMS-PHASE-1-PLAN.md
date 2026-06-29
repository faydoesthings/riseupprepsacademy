# RiseUp LMS — Revised Phase 1 Plan

**Status:** Approved for implementation  
**Date:** June 2026

## Product decision

The LMS is a **separate self-paced learning track** alongside the existing school ops system (Class, Subject, Material, Assignment). Phase 1 does not link courses to classes or subjects. Students will see both "Study Material" (school) and "My Courses" (LMS) in the portal.

## Decisions (resolved contradictions)

| Original spec issue | Phase 1 resolution |
|---------------------|-------------------|
| `ADMIN` role | Use **`SUPER_ADMIN` only** (matches codebase) |
| `VIVA_EXAMINER` role | **Deferred to Phase 2** (viva + certificates) |
| `requirePortalRole()` in actions | Use **`requireRoleAction()` / `requireAdminAction()`** |
| `prisma migrate dev` | Use **`prisma db push`** (matches repo) |
| Public `getCourseBySlug` | **Preview lessons only** unless enrolled |
| CFA seed course | **Digital Literacy** sample aligned with RiseUp programs |
| Vercel Blob uploads | **URL inputs only** in Phase 1 |
| Drag-and-drop builder | **Up/down reorder buttons** (add dnd-kit in Phase 2) |
| Certificates, PDF, verify page | **Phase 2** |

## Phase 1 scope (ship)

### Database
- `Course`, `Module`, `Lesson`, `LessonProgress`, `Enrollment`
- `Quiz`, `Question`, `QuizAttempt`
- User relation fields on existing `User` model

### Server actions (`src/app/actions/lms/`)
- Courses: CRUD, publish, list, get by slug (access-aware), progress merge
- Modules: CRUD, reorder
- Lessons: CRUD, reorder, progress helpers
- Enrollment: enroll, unenroll, bulk, check, list with progress
- Quiz: CRUD, questions, start/submit attempt, auto-grade MCQ/T/F/multi-select

### API
- `POST /api/lms/progress` — client heartbeat for lesson player

### Admin UI
- `/portal/admin/courses` — list + search
- `/portal/admin/courses/new` — create course
- `/portal/admin/courses/[courseId]` — builder (modules, lessons, module quiz)

### Student UI
- `/portal/student/courses` — enrolled courses grid
- `/portal/student/courses/[slug]` — course overview + module accordion
- `/portal/student/courses/[slug]/lessons/[lessonId]` — lesson player
- `/portal/student/courses/[slug]/quiz/[quizId]` — quiz flow

### Portal nav
- Admin: "Courses" link
- Student: "My Courses" link

### Seed
- One published course: "Digital Literacy Foundations" with 2 modules, 3 lessons each, 1 module quiz, student enrollment

## Phase 2 (not in this build)

- Viva scheduling + `VIVA_EXAMINER` role (or teacher-only viva)
- Certificates + PDF + public `/verify/[id]`
- Vercel Blob file uploads
- @dnd-kit drag-and-drop builder
- Final exam + eligibility gates for viva
- Dashboard KPI widgets
- Payment-gated enrollment

## Eligibility rules (Phase 1 simplified)

- **Module quiz:** available when all lessons in that module are completed
- **Final exam:** deferred to Phase 2 (optional course-level quiz can be added but no viva gate)

## Auth matrix (Phase 1)

| Action | Roles |
|--------|-------|
| Course CRUD, publish, enroll others | SUPER_ADMIN |
| Module/lesson/quiz CRUD | SUPER_ADMIN, TEACHER |
| Self-enroll | STUDENT (MANUAL type only) |
| View enrolled content | STUDENT (enrolled) |
| Preview lessons | Public (isPreview only) |
