import { PrismaClient, Role, AttendanceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Clean up existing data manually
  await prisma.attendance.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.workLocation.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.user.deleteMany()

  // 2. Initial Data: Shifts
  const shiftMorning = await prisma.shift.create({
    data: {
      name: 'Morning Shift',
      startTime: '08:00',
      endTime: '17:00',
      lateThreshold: 15,
      earlyLeaveThreshold: 15,
    },
  })

  const shiftEvening = await prisma.shift.create({
    data: {
      name: 'Evening Shift',
      startTime: '16:00',
      endTime: '00:00',
      lateThreshold: 20,
      earlyLeaveThreshold: 20,
    },
  })

  // 3. Initial Data: Work Locations (Using Monas area for testing, replace as needed)
  const hqLocation = await prisma.workLocation.create({
    data: {
      name: 'Jakarta HQ',
      address: 'Jl. Medan Merdeka Sel., Jakarta Pusat',
      latitude: -6.1818, // Monas lat
      longitude: 106.8223, // Monas lng
      radiusMeters: 500, // 500 meters allowed radius
    },
  })

  const branchLocation = await prisma.workLocation.create({
    data: {
      name: 'Bandung Branch',
      address: 'Jl. Asia Afrika, Bandung',
      latitude: -6.9213,
      longitude: 107.6106,
      radiusMeters: 300,
    },
  })

  // 4. Initial Users
  // Seed defaults (override via env if needed)
  const adminPlainPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const employeePlainPassword = process.env.SEED_EMPLOYEE_PASSWORD || 'password123'

  const adminPasswordHash = await bcrypt.hash(adminPlainPassword, 10)
  const employeePasswordHash = await bcrypt.hash(employeePlainPassword, 10)

  const admin = await prisma.user.create({
    data: {
      employeeId: 'ADM-001',
      name: 'Super Admin',
      email: 'admin@company.com',
      password: adminPasswordHash,
      role: Role.ADMIN,
      department: 'Management',
    },
  })

  const employee1 = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      name: 'John Doe',
      email: 'john@company.com',
      password: employeePasswordHash,
      role: Role.EMPLOYEE,
      department: 'IT',
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      employeeId: 'EMP-002',
      name: 'Jane Smith',
      email: 'jane@company.com',
      password: employeePasswordHash,
      role: Role.EMPLOYEE,
      department: 'HR',
    },
  })

  // 5. Initial Schedules (Current week)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const sc1 = await prisma.schedule.create({
    data: {
      userId: employee1.id,
      shiftId: shiftMorning.id,
      locationId: hqLocation.id,
      date: today,
    },
  })

  const sc2 = await prisma.schedule.create({
    data: {
      userId: employee1.id,
      shiftId: shiftMorning.id,
      locationId: hqLocation.id,
      date: yesterday,
    },
  })

  const sc3 = await prisma.schedule.create({
    data: {
      userId: employee2.id,
      shiftId: shiftEvening.id,
      locationId: branchLocation.id,
      date: today,
    },
  })

  // 6. Provide some past attendance records
  await prisma.attendance.create({
    data: {
      userId: employee1.id,
      scheduleId: sc2.id,
      checkInTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000 + 5 * 60 * 1000), // 08:05
      checkOutTime: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000 + 10 * 60 * 1000), // 17:10
      checkInLat: hqLocation.latitude,
      checkInLng: hqLocation.longitude,
      checkOutLat: hqLocation.latitude,
      checkOutLng: hqLocation.longitude,
      checkInDistance: 10.5,
      checkOutDistance: 12.2,
      status: AttendanceStatus.on_time,
    },
  })

  console.log('Database seeded successfully!')
  console.log({
    admin: admin.email,
    employee1: employee1.email,
    employee2: employee2.email,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
