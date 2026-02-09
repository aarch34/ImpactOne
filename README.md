# ImpactOne - Smart Resource Management System

![ImpactOne Banner](https://via.placeholder.com/1200x400?text=ImpactOne+Resource+Management)

**ImpactOne** is a modern, AI-powered web application designed to streamline resource booking, venue management, and event planning within an organization. It features intelligent venue recommendations powered by **Google Genkit & Gemini**, robust authentication via **Clerk**, and a comprehensive dashboard for tracking bookings and history.

## 🚀 Key Features

- **🛡️ Secure Authentication**: User management and role-based access control powered by **Clerk**.
- **🤖 AI Venue Recommender**: Smart venue suggestions based on attendee count and facility requirements using **Google Genkit**.
- **📅 Booking Management**: Interactive calendar for scheduling venues, resources, and equipment.
- **📊 Admin Dashboard**: Centralized control for managing approvals, users, and system settings.
- **📜 History & Logs**: Detailed tracking of all booking activities and status updates.
- **📄 Reports**: Generate PDF reports and certificates (using `jspdf` & `html2canvas`).
- **📱 Responsive Design**: Fully responsive UI built with **Tailwind CSS** and **Radix UI**.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide React
- **Database**: Supabase / Firestore
- **Authentication**: Clerk
- **AI / LLM**: Google Genkit (Gemini 2.5 Flash)
- **State Management**: React Hook Form, Zod

## 📦 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/impactone.git
   cd impactone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following keys:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Google AI (Genkit)
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   > **Note**: The application runs on **port 9002** by default.
   
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🤖 AI Features (Genkit)

The project uses **Google Genkit** for AI capabilities. To start the Genkit developer UI:

```bash
npm run genkit:dev
```
This allows you to test and debug AI flows like the `recommendVenueFlow`.

## 🚀 Deployment

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the **Environment Variables** (from step 3) in the Vercel project settings.
4. Click **Deploy**.

Alternatively, you can build and start the production server locally:

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
