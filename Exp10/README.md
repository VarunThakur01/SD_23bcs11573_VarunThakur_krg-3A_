# Trello Clone
A fully functional, responsive, and beautifully designed Trello Clone built with **React (Vite)** and **Vanilla CSS**. This app focuses on a highly polished UI matching Trello's modern Dark Mode aesthetics, smooth drag-and-drop operations, and seamless robust persistence.

## Features

### Board & Lists Management
- **Customizable Board Backgrounds**: Click the `Bg:` color picker in the header to change the board's default color (perfectly saved to local storage).
- **Drag & Drop Lists**: Create, delete, and fluidly reorder lists horizontally. 
- **Responsive Layout**: Adapts gracefully to mobile screens. Lists stack vertically on mobile (<600px width) automatically changing the drag-and-drop direction.

### Cards Management
- **Drag & Drop Cards**: Smoothly drag cards between lists and reorder them within a list. Includes Trello-style drag physics (3-degree rotation and drop-shadows on drag).
- **Card Covers**: Upload image files locally to use as Card Covers. They display beautifully on the board and as a banner in the details modal.
- **Quick Archive**: A dedicated `Archive` icon directly on cards allows for one-click deletion/archiving from the main board.

### Rich Card Details (Modal)
Click any card to open the Details Modal.
- **Labels**: Add and remove multiple colored tags to your cards.
- **Due Dates**: Set and track due dates with a native calendar popup.
- **Members**: Assign mock team members (Alice, Bob, Charlie) to cards. Assigned members will display their avatars dynamically on the card.
- **Checklists**: Add unlimited to-do items to a card's checklist. Check them off to see a strike-through completion effect.
- **Comments & Activity**: Write comments and save them. They are logged with a timestamp and user avatar in chronological order.

### Global Features
- **Instant Search**: Type in the top navigation bar to instantly filter cards across all your lists by title.
- **Data Persistence**: Backed entirely by `zustand`'s persistence middleware. Every action, cover upload, and label change is instantly written to your browser's `localStorage`.

---

## Technical Stack
- **Frontend Framework**: React 18 (via Vite for lightning-fast HMR and building).
- **Styling**: Vanilla CSS. A custom design system based entirely on CSS Variables matching Trello's 2024 UI scaling (272px lists, specific Apple/Blink typography stack, precise border radiuses, and custom webkit scrollbars).
- **State Management**: Zustand (including `persist` middleware).
- **Drag & Drop Engine**: `@hello-pangea/dnd` (A modern, maintained fork of `react-beautiful-dnd`).
- **Icons**: Lucide React.
- **Date Utilities**: `date-fns` for rendering comment timestamps and due dates.
- **Data Identification**: `uuid` for stable unique IDs across all entities.

---

## Assumptions Made
1. **No Backend Required**: The requirements focused heavily on a frontend implementation (SPA) of the Trello UI. As such, the application is intentionally built to execute entirely in the browser using `localStorage`. An Express.js backend folder was initialized locally but is dormant, assuming data synchronization isn't required for this phase.
2. **Single Board Context**: Trello supports multiple boards via routing. To keep the focus strictly on the Drag & Drop Board mechanics, this app acts as a single, fully-featured "Super Board".
3. **File Attachments Simulation**: Card cover implementations accept real image files and convert them to Base64 strings using `FileReader` to store them safely into `localStorage` without a server.
4. **Mocked Authentication**: Members and User comments assume a mocked current user to demonstrate the UI (e.g. Activity logging has a mock "U" generic user avatar).

---

## Local Setup Instructions

### Prerequisites
- Node.js (v16.0 or higher recommended).

### Running the App
1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm run dev
   ```
4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`.

### Sample / Seeded Data
The database (Zustand store) is initialized with comprehensive **Sample Data**. It includes:
- A predefined board background.
- "To Do", "In Progress", and "Done" lists.
- A variety of cards demonstrating labels, assigned members, checklists, uploaded covers, due dates, and comments.

**Note**: If you have previously used the app while it was partially built, your browser's `localStorage` might contain the old empty data. 
To see the full Sample Database:
1. Click the **"Reset Board"** button located in the top-right header of the app.
2. This will wipe your `localStorage` cache and load up the beautiful Seeded Sample Data!
