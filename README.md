# Frontend Setup & User Guide

React + TypeScript + Vite frontend for Assignment

## Table of Contents
1. Setup Instructions
2. Environment Variables
3. Running the Application
4. Project Structure
5. User Flow & Process
6. Page Routes
7. Features



## Setup Instructions

### Requirement
- Node.js  and npm
- Backend server running on `http://localhost:8000`

### 1. Install Node Dependencies

cd frontend
npm install

### 2. Set Up Environment Variables
cp .env.example .env

## Environment Variables
## URL
VITE_GRAPHQL_URL=http://localhost:8000/graphql
# GraphQL WebSocket endpoint (for subscriptions)
VITE_WS_GRAPHQL_URL=ws://localhost:8000/graphql
# WebSocket API endpoint
VITE_WS_URL=ws://localhost:8000/api/ws
# Backend API base URL
VITE_API_URL=http://localhost:8000

## Running the Application

npm run dev

## User Flow & Process
This section describes the complete user journey through the application.

### 1. **Authentication**
#### 1.1 Registration
- **Route**: `/register`

#### 1.2 Login
- **Route**: `/login ` 
### 2. **Dashboard Access**

- **Route**: `/` (protected route)
- 
### 3. **Store Management**
#### 3.1 View All Stores
- **Route**: `/stores`
- **Displays**: Grid/list of all available stores
- **Actions**:
  - View store details
  - Enter store (only 2 stores available)
  - See active user count

#### 3.2 Enter Store (Interactive 3D Experience)
- **Route**: `/store/{storeId}`
- **Requirements**: Must be authenticated
- **Features**:
  - Real-time 3D model visualization
  - Active user count tracking
  - Drag and drop 3D models to reposition
  - View installed widget (if any)
  - Browse and install widgets
- **Store IDs Available**: 2 stores (see specific IDs in database)
- **User Capacity**: Maximum 2 concurrent users per store
- **Widget Section**: 
  - Shows currently installed widget (if exists)
  - Click "Browse Widgets" to install new widget

### 4. **Widget Management**
#### 4.1 Create Widget
- **Route**: `/widgets` (with store selector)
- **Requirements**: Must be authenticated
- **Actions**:
  1. Select or search a store from dropdown (if no store ID in URL)
  2. Click "Create Widget" button
  3. Fill widget form:
     - Domain: Website domain (e.g., "google.com")
     - Video URL: YouTube/video URL
     - Banner Text: Optional description text
  4. Click "Create" to save widget
- **Outcome**: Widget created and added to list

#### 4.2 Install Widget on Store
- **Route**: `/widgets/{storeId}` (pre-selected store)
- **Entry Point**: 
  - From store page → "Browse Widgets" button
  - Direct URL: `/widgets/{storeId}`
- **Features**:
  - Store ID pre-selected from URL
  - Shows back button to return to store
  - Grid of all available widgets
  - Each widget card shows:
    - Domain
    - Preview thumbnail
    - "Install" button
- **Installation Process**:
  1. Click "Install" button on desired widget
  2. Confirm installation
  3. Success message appears
  4. Auto-redirect to `/store/{storeId}` to see widget embedded
- **Alternative Entry**: 
  - Direct access to `/widgets` (without store ID)
  - Shows store selector dropdown
  - Select store → see available widgets

### 5. **Analytics & Tracking**

#### 5.1 View Widget Analytics
- **Route**: `/widgets` (Analytics Dashboard)
- **Features**:
  - Select store from dropdown at top
  - View analytics cards for selected store:
    - **Page View**: Count of store page visits
    - **Videos Loaded**: Count of video plays
    - **Links Clicked**: Count of domain link clicks
  - Real-time updates as events occur
- **Widget Management Panel**:
  - Shows all widgets from all stores
  - Edit/Delete buttons for each widget
  - When editing: Can change store association

#### 5.2 Event Tracking
Events are automatically tracked when:
- **Page View** (`page_view`): Widget loaded on store page
- **Video Loaded** (`video_loaded`): User clicks to play embedded video
- **Link Clicked** (`link_clicked`): User clicks on the domain link
