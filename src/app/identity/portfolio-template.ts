export const PORTFOLIO_CONTENT = {
    // Basic Identity
    hero: {
        greeting: "Hello, I am",
        title: "Rijan Ghimire",
        subtitle: "Computer Engineering & Mathematics",
        tagline: "Specializing in embedded systems, software engineering, and AI/ML.",
        status: "Open to Work",
    },

    // About Section
    about: {
        title: "01 // ABOUT",
        description: "I am a Computer Engineering and Mathematics double major at the University of Southern Mississippi with a perfect 4.0 GPA. My passion lies in bridging the gap between hardware and software, with extensive experience in embedded systems, full-stack development, and artificial intelligence.",
        stats: [
            { label: "GPA", value: "4.0" },
            { label: "Projects", value: "10+" },
            { label: "Focus", value: "AI + HW" },
        ]
    },

    // Experience
    experience: {
        title: "02 // EXPERIENCE",
        items: [
            {
                role: "Lead Developer",
                company: "Applied Engineering",
                period: "2024 - Present",
                description: "Developed an NFC-based school management platform and a smart library system. Engineered IoT energy monitoring solutions and secure e-voting platforms integrating hardware sensors with web dashboards."
            },
            {
                role: "Full Stack Engineer",
                company: "Liberty Jewelers",
                period: "2023 - 2024",
                description: "Architected a complete e-commerce platform using Next.js and PostgreSQL. Implemented secure payment processing, inventory management, and a custom CMS for jewelry cataloging."
            }
        ]
    },

    // Projects (Your Folder Structure Logic)
    projects: {
        title: "03 // WORKS",
        categories: [
            {
                name: "Full Stack",
                items: [
                    { title: "Liberty Jewelers", desc: "Production e-commerce platform with custom CMS.", stack: ["Next.js", "PostgreSQL", "Stripe"] },
                    { title: "PayBit", desc: "Secure Bitcoin payment application.", stack: ["Python", "FastAPI", "Blockchain"] }
                ]
            },
            {
                name: "AI & Tools",
                items: [
                    { title: "ClassNotes AI", desc: "Automated summarization for lecture recordings.", stack: ["AI/ML", "Python", "NLP"] },
                    { title: "Figuro", desc: "Generative AI tool converting speech to animated figures.", stack: ["TensorFlow", "React", "WebGL"] },
                    { title: "IdleOps", desc: "Performance automation tool for in-game tasks.", stack: ["C++", "Python", "Automation"] }
                ]
            }
        ]
    },

    // Tech Stack
    stack: {
        title: "04 // STACK",
        technologies: [
            "C / C++",
            "Python",
            "TypeScript",
            "Next.js",
            "React",
            "PyTorch",
            "Embedded Systems",
            "IoT / ESP32"
        ]
    },

    // Contact
    contact: {
        title: "05 // CONTACT",
        email: "ghimirerijan199@gmail.com",
        github: "github.com/Luseefor",
        twitter: "@Luseefor", // Assuming handle based on Github, can update if incorrect
        cta: "Let's build the future."
    }
};
