# FixFisk

**FixFisk** is an open-source campus grievance platform designed for Fisk University. It empowers students to securely report campus issues while enabling leadership to seamlessly track and resolve grievances—all in one place.

## Features

- 📝 **Anonymous Issue Reporting:** Students can submit grievances securely and confidentially.
- 📊 **Admin Dashboard:** Student leaders and staff manage, sort, and resolve submissions efficiently.
- 💬 **Comments & Upvotes:** Community engagement through feedback and issue prioritization.
- 🔒 **Authentication & Permissions:** Role-based access powered by Supabase for data privacy.
- ⚡ **Real-Time Updates:** Immediate changes and fast response via a modern web architecture.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Deployment:** working on this...

## Getting Started

Clone the repository and install dependencies for both the client and server:

```bash
git clone https://github.com/bowale-os/fixfisk.git
cd fixfisk

# Client setup (in /client)
cd client
npm install
npm start

# Server setup (in /server)
cd ../server
npm install
npm run dev
```

## Contributing

Pull requests and issue reports are welcome! To contribute:
1. Fork the repo
2. Create a new branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request

## License

[MIT](LICENSE)

***

**Tips:**
- Add setup/configuration details if there are environment variables (e.g., Supabase keys).
