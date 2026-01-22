export const PORTFOLIO_CONTENT = {
    // Basic Identity
    hero: {
        title: "LUCIFER",
        subtitle: "Full Stack Engineer & Creative Developer",
        tagline: "Building digital experiences at the intersection of design and technology.",
        status: "Available for freelance",
    },

    // About Section
    about: {
        title: "01 // ABOUT",
        description: "I am a passionate developer with a knack for creating immersive web applications. My work focuses on performance, accessibility, and visual excellence. I believe in code as a form of art.",
        stats: [
            { label: "Years Exp", value: "5+" },
            { label: "Projects", value: "50+" },
            { label: "Clients", value: "20+" },
        ]
    },

    // Experience
    experience: {
        title: "02 // EXPERIENCE",
        items: [
            {
                role: "Senior Developer",
                company: "Tech Corp",
                period: "2023 - Present",
                description: "Leading the frontend team, architecting scalable React applications, and mentoring junior developers."
            },
            {
                role: "Frontend Engineer",
                company: "Creative Agency",
                period: "2021 - 2023",
                description: "Built award-winning websites for high-profile clients using Next.js, WebGL, and Framer Motion."
            }
        ]
    },

    // Projects (Your Folder Structure Logic)
    projects: {
        title: "03 // WORKS",
        categories: [
            {
                name: "Commercial",
                items: [
                    { title: "E-Commerce Platform", desc: "A high-performance shopify headless storefront.", stack: ["Next.js", "Shopify", "Tailwind"] },
                    { title: "SaaS Dashboard", desc: "Real-time analytics platform for finance.", stack: ["React", "D3.js", "Firebase"] }
                ]
            },
            {
                name: "Experimental",
                items: [
                    { title: "3D Portfolio", desc: "Interactive Three.js experience.", stack: ["R3F", "WebGL"] },
                    { title: "Generative Art", desc: "Algorithmic art generation tool.", stack: ["Canvas API", "Typescript"] }
                ]
            }
        ]
    },

    // Tech Stack
    stack: {
        title: "04 // STACK",
        technologies: [
            "React / Next.js",
            "TypeScript",
            "Node.js",
            "Three.js / WebGL",
            "Tailwind CSS",
            "PostgreSQL",
            "GraphQL",
            "AWS / Vercel"
        ]
    },

    // Contact
    contact: {
        title: "05 // CONTACT",
        email: "lucifer@example.com",
        github: "github.com/lucifer",
        twitter: "@lucifer_dev",
        cta: "Let's build something impossible."
    }
};
