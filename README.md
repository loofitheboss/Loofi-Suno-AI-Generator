# Loofi Suno AI Generator

An AI-powered song generator that creates complete song packages (title, style prompt, lyrics, and creative strategy) optimized for [Suno.com](https://suno.com)'s custom creation mode. Built with React, TypeScript, and Google's Gemini AI.

## Features

- **AI Song Generation** -- Describe your song topic and get a full song pack: title, style prompt, structured lyrics, and a creative strategy note
- **Manual Settings** -- Optionally fine-tune genre, mood, voice type, tempo, and song structure (Standard, Pop, Rap, Ambient, or Custom)
- **Lyrics Editor** -- Edit generated lyrics in a full-featured editor with tag injection toolbar
- **Suno Tag System** -- Insert Suno-compatible structure tags (`[Verse]`, `[Chorus]`, `[Bridge]`, etc.), genre tags, mood tags, and more directly into your lyrics
- **AI Lyrics Extension** -- Extend your lyrics with AI-generated continuations that match the existing style
- **One-Click Copy** -- Copy title, style prompt, or lyrics individually for pasting into Suno
- **Direct Suno Launch** -- Open Suno.com's create page directly from the app

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Google Gemini AI** (`gemini-2.0-flash`) via `@google/genai`

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A **Google Gemini API key** -- get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/loofitheboss/Loofi-Suno-AI-Generator.git
   cd Loofi-Suno-AI-Generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the app** at `http://localhost:5173`

5. **Enter your Gemini API key** when prompted (stored locally in your browser's localStorage)

## Usage

1. **Describe your song** -- Enter a topic or story idea (up to 500 characters)
2. **Adjust settings** (optional) -- Expand "Manual Settings" to set genre, mood, voice, tempo, and structure
3. **Generate** -- Click "Generate Song Pack" to create your song
4. **Edit & refine** -- Modify the title, style prompt, and lyrics as needed
5. **Extend lyrics** -- Use the "Extend" button to add AI-generated continuations
6. **Copy & paste into Suno** -- Copy the style prompt and lyrics, then click "Launch Suno.com" to open Suno's custom creation mode

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory. Preview locally with:

```bash
npm run preview
```

## License

This project is licensed under the MIT License -- see the [LICENSE](LICENSE) file for details.
