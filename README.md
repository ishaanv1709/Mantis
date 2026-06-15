<div align="center">

<br/>

```
███╗   ███╗ █████╗ ███╗   ██╗████████╗██╗███████╗
████╗ ████║██╔══██╗████╗  ██║╚══██╔══╝██║██╔════╝
██╔████╔██║███████║██╔██╗ ██║   ██║   ██║███████╗
██║╚██╔╝██║██╔══██║██║╚██╗██║   ██║   ██║╚════██║
██║ ╚═╝ ██║██║  ██║██║ ╚████║   ██║   ██║███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚══════╝
```

### **Assistant for Your Products**
*24-Hour Hackathon*

<br/>

[![Build in 24hrs](https://img.shields.io/badge/Build%20In-24%20Hours-7B2FBE?style=for-the-badge&logoColor=white)]()
[![Status](https://img.shields.io/badge/Status-Active-00C896?style=for-the-badge)]()

<br/>

---

</div>

## Overview

Mantis is an intelligent platform where companies can list their products and users can quickly find answers to product-related questions and issues. Instead of a simple search engine, Mantis provides a diagnostic assistant that systematically helps users troubleshoot problems using official manufacturer-provided information.

## Key Features

- **Product Marketplace:** A searchable catalog of products.
- **Knowledge Repository:** Product manuals, documents, and videos accessible in one place.
- **Intelligent Diagnostic Assistant:** An AI-powered assistant that acts like an experienced technician, diagnosing issues step-by-step.
- **Personalized Dashboard:** Users can track the products they own and view maintenance schedules.
- **Community Threads:** Discuss products and get help from other owners.

## Application Flow

Here is the complete user and system flow for Mantis:

![Mantis Full Flow](Flow.png)

## Backend Architecture

The intelligence of Mantis is powered by an advanced architecture integrating MOSS for agentic reasoning:

![Backend Architecture](Backend%20Architecture.png)

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npx prisma db push
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv .venv
# Activate venv
pip install -r requirements.txt
python -m app.main
```
