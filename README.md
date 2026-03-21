# ShiftTrack - Attendance Management System

ShiftTrack (formerly *GeoShift*) is a modern, responsive, and fully-featured Software as a Service (SaaS) application designed for managing employee attendance. It ensures high accountability by utilizing **Geolocation verification** and **Photo capture** for check-ins and check-outs, tightly integrated with admin-defined work schedules and locations.

Built with bleeding-edge web technologies, it offers a seamless dark/light mode toggle, an intuitive user interface, and robust data reporting capabilities.

## Features

### Administrator Panel
- **Comprehensive Dashboard:** View daily attendance metrics, late arrivals, missing check-outs, and quick actions.
- **Employee Management:** Full CRUD capabilities for managing the workforce (ID, Name, Department, Role).
- **Shift Management:** Define start/end times, and late/early-leave thresholds.
- **Location Management:** Define physical work locations with exact coordinates (Latitude/Longitude) and allowed radius boundaries in meters.
- **Schedule Management:** Assign specific shifts and locations to employees for specific dates.
- **Attendance Monitoring:** Live view of all employee attendances including check-in/out times, geo-distance validation, photo proofs, and status labels (On Time, Late, Early Leave, Absent, Rejected).
- **Reporting & Export:** Generate precise monthly attendance reports filtered by employee and export them directly to **PDF**.

### Employee Panel
- **Personal Dashboard:** View today's schedule, current status, and quick access to check in/out.
- **Geo-Verified Check-In:** Requires employees to be within the defined radius of their assigned work location. Includes camera integration to capture photo proof.
- **Geo-Verified Check-Out:** Requires location validation before finishing the shift.
- **Attendance History:** Review past attendance records, work hours, and status.
- **Profile:** View user details and switch themes.

### General
- **Modern UI/UX:** Clean, minimalistic, and highly responsive interface using standard Tailwind CSS utilities for a premium look.
- **Dark/Light Themes:** Fully integrated theme toggling using `next-themes` that persists user preference.

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider + bcryptjs)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Date Utility:** [date-fns](https://date-fns.org/)

---

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** database running locally or via a cloud provider (e.g. Supabase, Vercel Postgres, Neon)

### 1. Clone & Install
```bash
# Clone the repository (if applicable)
git clone https://github.com/yourusername/shifttrack.git
cd shifttrack

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/shifttrack?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-string-here"
```

### 3. Setup Database
Run the following commands to initialize the database schema and populate it with initial seed data:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed the database (creates admin, locations, shifts, and sample employees)
npm run seed
# Note: If 'npm run seed' isn't available, run: npx tsx prisma/seed.ts
```

### 4. Start the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Credentials (from Seed)

To log in and explore the application initially, use the following generated accounts:

**Admin Account:**
- **Email:** `admin@company.com`
- **Password:** `admin123`

**Employee Account:**
- **Email:** `john@company.com`
- **Password:** `password123`
*(Other demo employee emails might exist such as jane@company.com, depending on your seed data).*

---

## Project Structure

```text
├── prisma/                 # Database schema and seed script
├── public/                 # Static assets and /uploads folder for photos
├── src/
│   ├── app/                # Next.js 14 App Router routes
│   │   ├── (auth)/         # Login page
│   │   ├── admin/          # Admin panel pages (Employees, Shifts, Reports, etc.)
│   │   ├── api/            # REST API endpoints
│   │   └── employee/       # Employee panel pages
│   ├── components/         # Reusable UI components (Modals, Sidebars, ThemeToggle, Logo)
│   ├── lib/                # Utility functions, Prisma client, NextAuth config
│   └── types/              # TypeScript type definitions
├── .env                    # Environment variables
├── tailwind.config.ts      # Tailwind CSS configuration
└── next.config.mjs         # Next.js configuration
```

## Security Notes
- Uploaded attendee photos are currently saved to local storage inside `/public/uploads`. In a production environment, this should be refactored to use object storage like **AWS S3** or **Cloudinary**.
- Geolocation security relies on the browser's HTML5 Geolocation API.

---


