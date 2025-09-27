import { generateObject } from 'ai';
import { anthropic } from '@/echo';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const AppIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  features: z.array(z.string()),
  businessModel: z.string(),
});

const IdeasResponseSchema = z.object({
  ideas: z.array(AppIdeaSchema),
});

export async function POST(req: Request) {
  try {
    const { model }: { model: string } = await req.json();

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await generateObject({
      model: anthropic(model),
      system: `You are an AI assistant specializing in generating innovative application ideas for Merit System's Echo infrastructure.

## About Merit System's Echo Infrastructure

Echo is Merit System's revolutionary "billing in a box" platform that provides:

**LLM Integration & Billing:**
- Seamless integration with multiple Large Language Models (OpenAI, Anthropic, etc.)
- Automatic usage tracking and billing for AI model consumption
- Real-time cost monitoring and budget management
- Pay-per-use pricing model for LLM calls
- Built-in rate limiting and quota management

**Core Features:**
- **Echo SDK**: Easy-to-use SDKs for React, Next.js, and other frameworks
- **Authentication**: User account management with Echo billing integration
- **Balance Management**: Top-up system, usage tracking, and billing transparency
- **Model Selection**: Access to multiple AI providers through a unified interface
- **Developer Tools**: APIs, webhooks, and analytics for usage monitoring

## Your Task

Generate exactly 10 diverse, innovative app ideas that leverage Echo's unique strengths. Each idea should:

1. **Heavily utilize AI models** for core functionality
2. **Benefit from Echo's transparent billing** model
3. **Solve real-world problems** with clear value propositions
4. **Be practical and feasible** to build
5. **Have clear monetization potential** through Echo's usage-based pricing

Focus on applications where Echo's "billing in a box" model creates unique opportunities - where traditional apps might struggle with AI costs, but Echo makes it viable.

Make each idea distinct and appealing, covering different industries and use cases.`,
      prompt: `Generate 10 completely unique and diverse Echo app ideas. Be highly creative and avoid repetitive patterns. Each idea must be from a different industry/sector and solve different problems.

IMPORTANT: Make these ideas wildly different from each other. Vary:
- Industries (healthcare, education, entertainment, finance, retail, gaming, agriculture, sports, art, science, etc.)
- Target audiences (ages, professions, demographics)
- Problem types (efficiency, creativity, analysis, communication, automation, etc.)
- AI use cases (content generation, data analysis, personalization, prediction, translation, etc.)

For each idea, provide:
- A unique ID (use format: echo-idea-${Math.random().toString(36).substr(2, 9)})
- An engaging title (2-6 words)
- A compelling description (2-3 sentences explaining the core concept)
- Target audience (be very specific)
- 4-6 key features that leverage Echo's capabilities in unique ways
- Business model that works with Echo's usage-based pricing

Think outside the box! Include unexpected combinations, niche markets, and innovative AI applications. No two ideas should feel similar.`,
      schema: IdeasResponseSchema,
    });

    return Response.json({ ideas: result.object.ideas });
  } catch (error) {
    console.error('Generate ideas API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to generate ideas',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}