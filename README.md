# AURA – Advanced Universal Recreational Activities

**AURA** is an AI-powered Discord bot built to spark conversation, create community, and keep your server active and fun. From daily engagement tools to creative mini-games, AURA is your all-in-one entertainment hub for Discord.

This repository hosts the **AURA API Server**, the brain of the system. It processes all incoming events, handles business logic, manages user data, and orchestrates responses between the gateway, Azure Function relays, and external services.

## 🧠 About the API Server

The API server is the core backend service in the AURA architecture. It receives incoming Discord gateway events (relayed by the Azure Function), processes them based on custom logic (commands, games, rewards, AI interactions), and sends responses back through Azure Service Bus.

This server enables powerful features such as:

- Persistent user and server data (XP, badges, stats)
- Game session handling and matchmaking
- AI prompt generation and response control
- Modular feature deployment for individual communities

## ✨ Features

### 💬 Conversation Starters
- **Daily Question**: Auto-posts daily questions to keep chat alive.
- **This or That**: Quick polls that encourage responses and engagement.
- **Topic Roulette**: Drops in a conversation starter when things are too quiet.

### 🎯 Gamification & Engagement
- **XP & Levels**: Earn XP by chatting. Level up, unlock perks, and earn bragging rights.
- **Custom Badges**: Celebrate milestones like "Chatterbox" or "Welcomer."
- **Leaderboards**: Track activity and compete daily, weekly, or monthly.

### 🧠 Mini Games & Challenges
- **Trivia Nights**: Scheduled or spontaneous trivia with score tracking.
- **Word Games**: Hangman, speed typing, or Wordle-inspired challenges.
- **AI-Powered Games**: Story-building, drawing prompts, or character roleplay using GPT.

### 🧩 User-Curated Fun
- **Custom Commands**: Let your community create their own inside jokes and responses.
- **Hot Take Generator**: Drops controversial takes to stir up reactions.
- **Art/Photo Prompts**: Creative challenges for artists and photographers.

### 🤖 Smart Interactions
- **AI Chat Mode**: An AI character joins the conversation or narrates stories.
- **Voice Channel Games**: Join a voice channel and let the bot run a full game night.

---

## 🏗️ Architecture

```
Discord Gateway ➜ Azure Service Bus ➜ Azure Function ➜ AURA API Server ➜ Azure Service Bus ➜ Discord Gateway
```

- **AURA Gateway**: Listens to Discord events and forwards them via Azure Service Bus.
- **Azure Function**: Forwards those events to this API Server.
- **API Server**: Handles business logic, persistent state, and game systems.
- **Azure Service Bus**: Used bidirectionally to handle scale and async responses.

---

## 🛠 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/anthonykung/aura-api.git
cd aura-api
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the required fields, such as database credentials, API keys, and service bus configs.

### 3. Install dependencies

```bash
npm install
# or
yarn install
```

### 4. Build the project

```bash
npm run build
# or
yarn build
```

### 5. Start the server

```bash
npm start
# or
yarn start
```

---

## ☁️ Deployment

This service is designed to run on **Azure Container Apps** or other containerized infrastructure. Use your preferred deployment method or integrate into a CI/CD pipeline.

---

## 🧪 Testing

Coming soon! We're planning to add automated tests for core features and commands.

---

## 🤖 Copilot Usage

Some parts of this project were written with the help of **GitHub Copilot VS Code Extension**, so you may encounter code that's unconventional or quirky, but hey it works and it cuts down the development time 😉

---

## 📄 License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

## 🌐 Part of the AURA Ecosystem

- [AURA Gateway](https://github.com/anthonykung/aura-gateway)
- [AURA Relay Function](https://github.com/anthonykung/aura-functions)
- [AURA API Server (this repo)](https://github.com/anthonykung/aura-api)

---

Created with 💖 by [Anthony Kung](https://anth.dev) to make Discord more fun.
