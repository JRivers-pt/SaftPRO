---
description: How to Deploy the SAFT Analyser to Vercel
---

# Deployment Guide for SAFT Analyser (Next.js)

Since this application is built with **Next.js**, the easiest and most performant way to deploy it is using **Vercel** (the creators of Next.js).

## Prerequisites

1.  A [GitHub](https://github.com/) account.
2.  A [Vercel](https://vercel.com/) account (Free tier is sufficient).
3.  Git installed on your machine.

## Steps

### 1. Push Code to GitHub

First, you need to push your local project to a new GitHub repository.

1.  Create a new repository on GitHub (e.g., `saft-analyser-pro`).
2.  Open your terminal in the project folder and run:

    ```bash
    git init
    git add .
    git commit -m "Initial commit for production"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/saft-analyser-pro.git
    git push -u origin main
    ```

### 2. Deploy on Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the GitHub repository you just created.
4.  **Framework Preset**: Select `Next.js`.
5.  **Root Directory**: `./` (Default).
6.  **Build Command**: `next build` (Default).
7.  **Environment Variables**: None needed for this version (it's client-side only).
8.  Click **"Deploy"**.

### 3. Verify Deployment

Wait about 1-2 minutes. Vercel will give you a live URL (e.g., `saft-analyser-pro.vercel.app`).

---

## Client Implementation Strategy

### A. Subdomain vs. Embedded

1.  **Subdomain (Recommended)**: Set up `app.your-accounting-firm.com` pointing to the Vercel app. This looks professional and isolated.
2.  **Iframe**: You *could* embed it in an existing portal, but it's less secure and harder to manage responsive design.

### B. Custom Domain Setup

1.  In Vercel Project Settings -> **Domains**.
2.  Add your client's domain (e.g., `analyser.accountant-client.com`).
3.  Add the CNAME record in their DNS provider as instructed by Vercel.

### C. Future Enhancements for "Real" SaaS

To make this a true commercial SaaS (charging money), you would need to add:

1.  **Authentication**: Integrate **Clerk** or **NextAuth** so users have to log in.
2.  **Database**: (Optional) If you want to *save* history permanently, connect a **PostgreSQL** (Neon or Supabase). Currently, it resets on refresh (Privacy First).
3.  **Payments**: Integrate **Stripe** to charge for access.

This current version is a **"Privacy-First Tool"**, which is a great selling point: "We don't store your data, we just analyse it in your browser."
