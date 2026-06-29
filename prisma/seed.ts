import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (minimal examples)...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.material.deleteMany();
  await prisma.period.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.admissionApplication.deleteMany();
  await prisma.registrationRequest.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.vivaSession.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Muhammad Raffay",
      email: "admin@riseuppreps.com",
      phone: "+923001234567",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      name: "Ahmed Khan",
      email: "accountant@riseuppreps.com",
      phone: "+923009876543",
      password: hashedPassword,
      role: "ACCOUNTANT",
      status: "ACTIVE",
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      name: "Fatima Shaikh",
      email: "fatima@riseuppreps.com",
      phone: "+923001112233",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: "Zainab Ali",
      email: "student@riseuppreps.com",
      phone: "+923001000001",
      password: hashedPassword,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  const donorUser = await prisma.user.create({
    data: {
      name: "Hamza Merchant",
      email: "donor@riseuppreps.com",
      phone: "+923331234567",
      password: hashedPassword,
      role: "DONOR",
      status: "ACTIVE",
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      qualification: "M.Ed in Mathematics",
      specialization: "Mathematics & Science",
      salary: 35000,
    },
  });

  const class6 = await prisma.class.create({
    data: {
      name: "Grade 6 - Alpha",
      grade: "6",
      section: "A",
      academicYear: "2026",
      teacherId: teacher.id,
    },
  });

  const subjectMath = await prisma.subject.create({
    data: { name: "Mathematics", classId: class6.id, teacherId: teacher.id },
  });

  const donor = await prisma.donor.create({
    data: { userId: donorUser.id, totalDonated: 0 },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      classId: class6.id,
      rollNumber: "601",
      dateOfBirth: new Date(2013, 5, 15),
      parentName: "Parent of Zainab Ali",
      parentPhone: "+923001000002",
      isSponsored: false,
      address: "Sukkur, Sindh, Pakistan",
    },
  });

  await prisma.period.create({
    data: {
      classId: class6.id,
      subjectId: subjectMath.id,
      teacherId: teacher.id,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "08:45",
      attendanceWindowMinutes: 30,
    },
  });

  await prisma.feeStructure.create({
    data: { name: "Monthly Tuition", amount: 2500, frequency: "MONTHLY", classId: class6.id },
  });

  await prisma.blogPost.create({
    data: {
      title: "Welcome to RiseUp Preps Academy",
      slug: "welcome-riseup-preps",
      content:
        "RiseUp Preps Academy is dedicated to providing quality education in Sukkur and Rohri. This is a sample blog post — replace it with your own news and updates.",
      excerpt: "Welcome to RiseUp Preps Academy.",
      authorId: adminUser.id,
      published: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Welcome to RiseUp Admin",
      message: "Your dashboard is ready. Add real students, teachers, and classes from the sidebar.",
      type: "INFO",
    },
  });

  const lmsCourse = await prisma.course.create({
    data: {
      title: "Digital Literacy Foundations",
      slug: "digital-literacy-foundations",
      description:
        "Sample LMS course — learn practical computer skills and safe internet use.",
      difficulty: "BEGINNER",
      estimatedDuration: 120,
      tags: ["Digital", "Computer Skills"],
      isPublished: true,
      requiresViva: false,
      createdById: adminUser.id,
    },
  });

  const mod1 = await prisma.module.create({
    data: {
      courseId: lmsCourse.id,
      title: "Computer basics",
      description: "Keyboard, mouse, and file management.",
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: mod1.id,
      title: "Welcome to digital literacy",
      type: "READING",
      content: "This is a sample lesson. Replace with your own course content.",
      order: 1,
      isPreview: true,
    },
  });

  const modQuiz = await prisma.quiz.create({
    data: {
      title: "Computer basics quiz",
      type: "MODULE_QUIZ",
      moduleId: mod1.id,
      passingScore: 60,
      maxAttempts: 3,
    },
  });

  await prisma.question.create({
    data: {
      quizId: modQuiz.id,
      text: "What should you do before closing a document?",
      type: "MCQ",
      options: [
        { id: "a", text: "Save your work" },
        { id: "b", text: "Delete the keyboard" },
        { id: "c", text: "Turn off the monitor only" },
      ],
      correctAnswer: "a",
      marks: 1,
      order: 1,
    },
  });

  await prisma.enrollment.create({
    data: {
      courseId: lmsCourse.id,
      userId: studentUser.id,
      type: "MANUAL",
      status: "ACTIVE",
    },
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: "academy_name", value: "RiseUp Preps Academy" },
      { key: "academy_location", value: "Sukkur / Rohri, Sindh, Pakistan" },
      { key: "academic_year", value: "2026" },
      { key: "fee_due_day", value: "10" },
      { key: "financial_year_start", value: "07" },
      { key: "attendance_window_default", value: "30" },
    ],
  });

  console.log("✅ Database seeded (minimal).");
  console.log("\n📋 Login credentials (password: password123):");
  console.log("  Admin:      admin@riseuppreps.com");
  console.log("  Accountant: accountant@riseuppreps.com");
  console.log("  Teacher:    fatima@riseuppreps.com");
  console.log("  Student:    student@riseuppreps.com");
  console.log("  Donor:      donor@riseuppreps.com");
  console.log(`\n📚 1 sample student (${student.rollNumber}), 1 class, 1 LMS course enrolled.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
