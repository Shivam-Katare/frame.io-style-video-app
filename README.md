# frame.io-style-video-app
A timestamped video app with collaborative commenting features. Built with Next.js and powered by Velt to enable Frame.io-style commenting.

Tech Stack

* Framework: Next.js 15 with TypeScript
* Styling: Tailwind CSS with custom glassmorphism effects
* Comments: Velt SDK for real-time collaboration
* State Management: React's built-in useState
* Type Safety: TypeScript for a better development experience
Getting Started

Prerequisites

* Node.js 18.x or later
* npm or yarn
* A Velt account (sign up at velt.dev)
Installation

1. Clone the repository:
git clone https://github.com/dalu46/frame.io-style-video-app

cd frame.io-style-video-app

2. Install dependencies:
npm install

3. Set up your environment variables in .env.local:
NEXT_PUBLIC_VELT_API_KEY=your_velt_api_key

4. Start the development server:
npm run dev

5. Visit http://localhost:3000 to see your application
Project Structure

── src
│   ├── app
|   |     ├── components
│   │         ├── AuthComponent.tsx
│   │         ├── VeltDocument.tsx
│   │         ├── VideoComponent.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
└── tsconfig.json

Velt Integration

The project uses Velt to enable real-time commenting on inventory items. To get started with Velt:
1. Create an account at velt.dev
2. Get your API key from the dashboard
3. Add your API key to the .env.local file
4. The commenting system will be automatically enabled
Commenting Features

* Click the comment tool button in the bottom-right corner
* Add the comments by drawing or clicking on the video
* View and reply to comments in real-time
* Comments persist across sessions
* Click on the comment sidebar to see all comments with timestamps
* Click on any comment to be taken back to the exact time in the video
Built with ❤️ using Next.js and Velt

