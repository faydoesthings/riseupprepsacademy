import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data in dependency order
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
  await prisma.systemSetting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==================== USERS ====================
  const adminUser = await prisma.user.create({
    data: {
      name: "Mairaj Rashdi",
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

  const teacher1User = await prisma.user.create({
    data: {
      name: "Fatima Shaikh",
      email: "fatima@riseuppreps.com",
      phone: "+923001112233",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      name: "Muhammad Ali",
      email: "mali@riseuppreps.com",
      phone: "+923004445566",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacher3User = await prisma.user.create({
    data: {
      name: "Saima Parveen",
      email: "saima@riseuppreps.com",
      phone: "+923007778899",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  // Create student users
  const studentNames = [
    "Zainab Ali", "Hassan Ahmed", "Ayesha Khan", "Bilal Shaikh",
    "Mariam Soomro", "Usman Rajput", "Nadia Hussain", "Fahad Memon",
    "Sara Qureshi", "Imran Malik", "Hina Shah", "Aamir Jatoi",
    "Rabia Kalhoro", "Danish Abbasi", "Sana Bhutto", "Kamran Laghari",
    "Noor Fatima", "Asad Chandio", "Mehwish Shar", "Junaid Brohi",
    "Alina Pathan", "Farhan Solangi", "Sidra Mangi", "Waqar Abro",
    "Nimra Talpur", "Sajid Buriro", "Amna Channa", "Rizwan Dayo",
    "Huma Jagirani", "Tariq Rind",
  ];

  const studentUsers = [];
  for (let i = 0; i < studentNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@riseuppreps.com`,
        phone: `+92300${String(i + 1).padStart(7, "0")}`,
        password: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });
    studentUsers.push(user);
  }

  // Donor users
  const donor1User = await prisma.user.create({
    data: {
      name: "Hamza Merchant",
      email: "hamza@donor.com",
      phone: "+923331234567",
      password: hashedPassword,
      role: "DONOR",
      status: "ACTIVE",
    },
  });

  const donor2User = await prisma.user.create({
    data: {
      name: "Aisha Foundation",
      email: "aisha@foundation.org",
      phone: "+923339876543",
      password: hashedPassword,
      role: "DONOR",
      status: "ACTIVE",
    },
  });

  const donor3User = await prisma.user.create({
    data: {
      name: "Kareem Overseas Trust",
      email: "kareem@overseas.org",
      phone: "+923335556677",
      password: hashedPassword,
      role: "DONOR",
      status: "ACTIVE",
    },
  });

  // ==================== TEACHERS ====================
  const teacher1 = await prisma.teacher.create({
    data: { userId: teacher1User.id, qualification: "M.Ed in Mathematics", specialization: "Mathematics & Science", salary: 35000 },
  });
  const teacher2 = await prisma.teacher.create({
    data: { userId: teacher2User.id, qualification: "MA English Literature", specialization: "English & Social Studies", salary: 32000 },
  });
  const teacher3 = await prisma.teacher.create({
    data: { userId: teacher3User.id, qualification: "BSc Computer Science", specialization: "Computer Science & Urdu", salary: 30000 },
  });

  // ==================== CLASSES ====================
  const class6 = await prisma.class.create({
    data: { name: "Grade 6 - Alpha", grade: "6", section: "A", academicYear: "2026", teacherId: teacher1.id },
  });
  const class7 = await prisma.class.create({
    data: { name: "Grade 7 - Alpha", grade: "7", section: "A", academicYear: "2026", teacherId: teacher2.id },
  });
  const class8 = await prisma.class.create({
    data: { name: "Grade 8 - Alpha", grade: "8", section: "A", academicYear: "2026", teacherId: teacher3.id },
  });

  // ==================== SUBJECTS ====================
  const subjectNames = ["Mathematics", "English", "Science", "Urdu", "Social Studies", "Computer Science"];
  const teacherIds = [teacher1.id, teacher2.id, teacher1.id, teacher3.id, teacher2.id, teacher3.id];

  const subjects6 = [];
  for (let i = 0; i < subjectNames.length; i++) {
    const s = await prisma.subject.create({ data: { name: subjectNames[i], classId: class6.id, teacherId: teacherIds[i] } });
    subjects6.push(s);
  }
  const subjects7 = [];
  for (let i = 0; i < subjectNames.length; i++) {
    const s = await prisma.subject.create({ data: { name: subjectNames[i], classId: class7.id, teacherId: teacherIds[i] } });
    subjects7.push(s);
  }
  const subjects8 = [];
  for (let i = 0; i < subjectNames.length; i++) {
    const s = await prisma.subject.create({ data: { name: subjectNames[i], classId: class8.id, teacherId: teacherIds[i] } });
    subjects8.push(s);
  }

  // ==================== DONORS ====================
  const donor1 = await prisma.donor.create({ data: { userId: donor1User.id, totalDonated: 150000 } });
  const donor2 = await prisma.donor.create({ data: { userId: donor2User.id, totalDonated: 500000 } });
  const donor3 = await prisma.donor.create({ data: { userId: donor3User.id, totalDonated: 250000, preferAnonymous: true } });

  // ==================== STUDENTS ====================
  const students = [];
  const classes = [class6, class7, class8];
  for (let i = 0; i < studentUsers.length; i++) {
    const classIndex = i % 3;
    const isSponsored = i < 6;
    const sponsorId = isSponsored ? [donor1.id, donor2.id, donor3.id][i % 3] : null;
    const student = await prisma.student.create({
      data: {
        userId: studentUsers[i].id,
        classId: classes[classIndex].id,
        rollNumber: `${classes[classIndex].grade}${String(Math.floor(i / 3) + 1).padStart(2, "0")}`,
        dateOfBirth: new Date(2013 - classIndex, i % 12, (i % 28) + 1),
        parentName: `Parent of ${studentNames[i]}`,
        parentPhone: `+92301${String(i + 100).padStart(7, "0")}`,
        isSponsored,
        sponsorId,
        address: "Sukkur, Sindh, Pakistan",
      },
    });
    students.push(student);
  }

  // ==================== PERIODS ====================
  const periodTimes = [
    { start: "08:00", end: "08:45" }, { start: "08:50", end: "09:35" },
    { start: "09:40", end: "10:25" }, { start: "10:40", end: "11:25" },
    { start: "11:30", end: "12:15" }, { start: "12:20", end: "13:05" },
  ];
  for (const [cls, subs] of [[class6, subjects6], [class7, subjects7], [class8, subjects8]] as const) {
    for (const day of [1, 2, 3, 4, 5]) {
      for (let p = 0; p < periodTimes.length; p++) {
        const subj = (subs as typeof subjects6)[p % subs.length];
        await prisma.period.create({
          data: {
            classId: cls.id, subjectId: subj.id, teacherId: subj.teacherId,
            dayOfWeek: day, startTime: periodTimes[p].start, endTime: periodTimes[p].end,
            attendanceWindowMinutes: 30,
          },
        });
      }
    }
  }

  // ==================== FEE STRUCTURES ====================
  for (const cls of [class6, class7, class8]) {
    await prisma.feeStructure.create({ data: { name: "Monthly Tuition", amount: 2500, frequency: "MONTHLY", classId: cls.id } });
    await prisma.feeStructure.create({ data: { name: "Exam Fee", amount: 500, frequency: "QUARTERLY", classId: cls.id } });
    await prisma.feeStructure.create({ data: { name: "Annual Admission", amount: 2000, frequency: "ONE_TIME", classId: cls.id } });
  }

  // ==================== DONATIONS ====================
  for (const d of [
    { donorId: donor1.id, amount: 50000, type: "ONE_TIME", method: "BANK_TRANSFER", status: "CONFIRMED" },
    { donorId: donor1.id, amount: 25000, type: "MONTHLY", method: "JAZZCASH", status: "CONFIRMED", studentId: students[0].id },
    { donorId: donor1.id, amount: 75000, type: "ONE_TIME", method: "EASYPAISA", status: "CONFIRMED" },
    { donorId: donor2.id, amount: 200000, type: "ONE_TIME", method: "BANK_TRANSFER", status: "CONFIRMED" },
    { donorId: donor2.id, amount: 100000, type: "MONTHLY", method: "BANK_TRANSFER", status: "CONFIRMED", studentId: students[1].id },
    { donorId: donor3.id, amount: 100000, type: "ONE_TIME", method: "JAZZCASH", status: "CONFIRMED" },
    { donorId: donor3.id, amount: 50000, type: "MONTHLY", method: "EASYPAISA", status: "CONFIRMED", studentId: students[2].id },
  ]) {
    await prisma.donation.create({ data: d });
  }

  // ==================== EXPENSES ====================
  const expenseAmounts: Record<string, number> = { SALARIES: 97000, UTILITIES: 8000, RENT: 25000, SUPPLIES: 5000, MAINTENANCE: 3000 };
  for (let month = 1; month <= 5; month++) {
    for (const [category, amount] of Object.entries(expenseAmounts)) {
      await prisma.expense.create({
        data: { category, amount, description: `${category} for month ${month}`, date: new Date(2026, month - 1, 15), createdBy: adminUser.id },
      });
    }
  }

  // ==================== BLOG POSTS ====================
  await prisma.blogPost.createMany({
    data: [
      { title: "RiseUp Preps Academy Opens Doors to 30 New Students", slug: "riseup-opens-doors-30-students", content: "We are thrilled to announce that RiseUp Preps Academy has welcomed 30 new students this academic year. Our mission to educate Sindh continues with renewed vigor as we expand our programs to serve more communities in Sukkur and Rohri.", excerpt: "RiseUp welcomes 30 new students this academic year.", authorId: adminUser.id, published: true },
      { title: "Annual Science Fair 2026 — A Showcase of Young Talent", slug: "annual-science-fair-2026", content: "Our students showcased incredible projects at the Annual Science Fair 2026. From solar-powered water purifiers to biodegradable packaging, the creativity on display was inspiring.", excerpt: "Students showcase innovative projects at the Annual Science Fair.", authorId: adminUser.id, published: true },
      { title: "Thank You to Our Generous Donors — PKR 900,000 Raised", slug: "thank-you-donors-900k-raised", content: "We extend our heartfelt gratitude to all our donors who have collectively contributed over PKR 900,000 to support our students. Your generosity directly funds tuition, supplies, and programs that change lives.", excerpt: "Our donor community has raised over PKR 900,000.", authorId: adminUser.id, published: true },
    ],
  });

  // ==================== NOTIFICATIONS ====================
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: "Welcome to RiseUp Admin",
        message: "Your administrator dashboard is ready. Review admissions and fee collection from the sidebar.",
        type: "INFO",
      },
      {
        userId: accountantUser.id,
        title: "Finance portal ready",
        message: "Use Fee Collection, Expenses, and Reports to manage monthly academy finances.",
        type: "INFO",
      },
      {
        userId: teacher1User.id,
        title: "Attendance reminder",
        message: "Please mark attendance for today's classes before end of day.",
        type: "ATTENDANCE",
        isRead: false,
      },
      {
        userId: studentUsers[0].id,
        title: "Fee payment received",
        message: "Your tuition payment for this month has been confirmed. Thank you!",
        type: "FEE_REMINDER",
        isRead: false,
      },
      {
        userId: donor1User.id,
        title: "Thank you for your support",
        message: "Your recent donation is making a direct impact on our students.",
        type: "SUCCESS",
      },
    ],
  });

  // ==================== SYSTEM SETTINGS ====================
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

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Login credentials (password: password123):");
  console.log("  Admin:      admin@riseuppreps.com");
  console.log("  Accountant: accountant@riseuppreps.com");
  console.log("  Teacher:    fatima@riseuppreps.com");
  console.log("  Student:    student1@riseuppreps.com");
  console.log("  Donor:      hamza@donor.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
