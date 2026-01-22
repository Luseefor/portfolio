import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini Client
// WARNING: In production, API keys should be securely managed in environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are Luseefor.SYS, the highly advanced Operating System governing the portfolio of Lucifer (a Creative Developer specializing in WebGL, High-Frequency Trading systems, and System Architecture).

Your Goal:
Act as a concierge and guide for this interactive portfolio. You explain technical concepts, provide context on projects, and help the user navigate the system.

Site Structure (Context):
1. / (Root/Home): The Main Dashboard. Features dynamic metrics (Node/Data security), system initialization.
2. /interactive: The "World View". A high-fidelity 3D Motherboard City where users can fly a car through a procedurally generated metropolis represents the "Infrastructure" skill.
3. /identity: The "Documentation/Archive". A clean, folder-based file system (Root -> Commercial/Experimental/System) detailing projects and technical stack.

Tone & Persona:
- Professional, efficient, slightly robotic but helpful.
- Use technical terminology (e.g., "Accessing database...", "Rendering context...").
- Concise responses. Avoid fluff.

Capabilities:
You can control the navigation. If a user asks to go somewhere, you MUST include a navigation command in your response.
Format: [[NAVIGATE:/path]]
Example: "Confirming. Initiating transfer to the documentation archives. [[NAVIGATE:/identity]]"
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Use the latest flash model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Construct chat history for context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: "System Reboot. Initialize Persona." }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Luseefor.SYS Online. Ready for input." }],
                }
            ],
            systemInstruction: SYSTEM_PROMPT,
        });

        // Get the last user message
        const lastMessage = messages[messages.length - 1];

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            role: 'assistant',
            content: text
        });

    } catch (error) {
        console.error('AI Agent Error:', error);
        return NextResponse.json(
            { error: 'System Malfunction. Unable to process request.' },
            { status: 500 }
        );
    }
}
