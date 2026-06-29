# RiseUp LMS — Phase 2 Plan

**Status:** Complete  
**Date:** June 2026

## Scope

| Feature | Resolution |
|---------|------------|
| VIVA_EXAMINER role | Use existing **TEACHER** role as examiner |
| Certificates | `Certificate` model + student view + public `/verify/[code]` |
| PDF | Print-optimized certificate page (browser print / save as PDF) |
| Vercel Blob | Optional upload when `BLOB_READ_WRITE_TOKEN` is set; URL fallback |
| Drag-and-drop | `@dnd-kit` for lesson reorder in course builder |
| Final exam | Course-level quiz + eligibility gate before viva |
| Viva | Schedule (admin), conduct (teacher), view (student) |
| Dashboard KPIs | LMS stats on admin dashboard; continue learning on student dashboard |
| Payment enrollment | `requiresPayment` + `pricePKR` on course; admin/manual PAYMENT enroll |

## Eligibility flow

1. Complete all lessons in a module → module quiz unlocks  
2. Complete all modules + module quizzes → final exam unlocks  
3. Pass final exam → eligible for viva (if `requiresViva`)  
4. Pass viva → certificate issued automatically  

## Routes

### Admin
- `/portal/admin/courses/[courseId]/quiz/[quizId]` — quiz question editor
- `/portal/admin/viva` — schedule and manage viva sessions

### Teacher
- `/portal/teacher/viva` — upcoming sessions + mark results

### Student
- `/portal/student/viva` — scheduled viva + results
- `/portal/student/courses/[slug]/certificate` — view / print certificate

### Public
- `/verify/[code]` — certificate verification
