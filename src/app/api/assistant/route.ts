import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioData } from '@/content/portfolio';

type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AssistantRequest = {
  message?: string;
  history?: AssistantMessage[];
};

function fallbackReply(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes('project')) {
    const topProjects = portfolioData.projects.slice(0, 3).map((project) => project.title).join(', ');
    return `Top projects: ${topProjects}. Ask me for details on any one.`;
  }

  if (lower.includes('skill') || lower.includes('stack')) {
    const topSkills = portfolioData.skills.flatMap((group) => group.items).slice(0, 8).join(', ');
    return `Core stack: ${topSkills}.`;
  }

  if (lower.includes('experience') || lower.includes('work')) {
    const topExperience = portfolioData.experience
      .slice(0, 2)
      .map((entry) => `${entry.role} at ${entry.company}`)
      .join(' · ');
    return `Recent experience: ${topExperience}.`;
  }

  if (lower.includes('contact') || lower.includes('message') || lower.includes('hire')) {
    return `You can contact Rijan at ${portfolioData.contact.email}, or use the contact form in the Contact section below.`;
  }

  if (lower.includes('resume')) {
    return `Resume is available via the Download Resume buttons on the page.`;
  }

  return `I can help with projects, skills, experience, and contact details. Ask something specific and I’ll answer directly.`;
}

function buildSystemPrompt() {
  const projectSummary = portfolioData.projects
    .map((project) => `- ${project.title}: ${project.summary}`)
    .join('\n');

  const experienceSummary = portfolioData.experience
    .map((entry) => `- ${entry.role} at ${entry.company} (${entry.period})`)
    .join('\n');

  return `
You are Rijan Ghimire's portfolio assistant.
Your job:
- Answer questions about Rijan's work clearly and professionally.
- Keep responses concise (2-5 sentences).
- Be factual and grounded in the portfolio data.
- If asked to contact, hiring, or collaboration requests, direct to email: ${portfolioData.contact.email}
- Never invent metrics, jobs, or claims.

Portfolio facts:
Name: ${portfolioData.hero.name}
Headline: ${portfolioData.hero.headline}
Summary: ${portfolioData.hero.summary}

Projects:
${projectSummary}

Experience:
${experienceSummary}
  `.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequest;
    const message = body.message?.trim();
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        reply: fallbackReply(message),
        source: 'fallback',
      });
    }

    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const historyText = history
      .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
      .join('\n');

    const prompt = `
${buildSystemPrompt()}

Conversation so far:
${historyText || '(none)'}

User: ${message}
Assistant:
    `.trim();

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return NextResponse.json({
      reply: reply || fallbackReply(message),
      source: 'gemini',
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { reply: 'I hit a temporary issue. Please try again in a moment.', source: 'error' },
      { status: 200 },
    );
  }
}
