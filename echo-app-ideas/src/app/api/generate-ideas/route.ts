import { generateObject } from 'ai';
import { anthropic, isSignedIn } from '@/echo';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const AppIdeaSchema = z.object({
  id: z.string().describe('Unique ID in format: echo-idea-1, echo-idea-2, etc.'),
  title: z.string().describe('Engaging title (2-6 words)'),
  description: z.string().describe('Compelling description (2-3 sentences)'),
  targetAudience: z.string().describe('Very specific target audience'),
  features: z.array(z.string()).min(3).max(6).describe('3-6 key features showcasing AI-powered functionality'),
  aiCapabilities: z.string().describe('AI capabilities like image generation, chat, voice synthesis, data analysis'),
});

const IdeasResponseSchema = z.object({
  ideas: z.array(AppIdeaSchema),
});

export async function POST(req: Request) {
  try {
    // Check if user is signed in
    const signedIn = await isSignedIn();
    if (!signedIn) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'User must be signed in to generate ideas',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { model, customPrompt }: { model: string; customPrompt?: string } = await req.json();

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

Echo is Merit System's revolutionary platform that provides seamless AI integration:

**LLM Integration:**
- Seamless integration with multiple Large Language Models (OpenAI, Anthropic, etc.)
- Access to cutting-edge AI capabilities including text generation, image creation, voice synthesis, and data analysis
- Real-time AI model switching and optimization

**Core Features:**
- **Echo SDK**: Easy-to-use SDKs for React, Next.js, and other frameworks
- **Authentication**: User account management with Echo integration
- **Model Selection**: Access to multiple AI providers through a unified interface
- **Developer Tools**: APIs, webhooks, and analytics for usage monitoring

## Your Task

Generate exactly 10 diverse, innovative app ideas that leverage Echo's AI capabilities. Each idea should:

1. **Heavily utilize AI models** for core functionality (text, image, voice, data analysis)
2. **Solve real-world problems** with clear value propositions
3. **Be practical and feasible** to build with modern AI
4. **Showcase creative AI applications** that weren't possible before

**IMPORTANT: Do not worry about billing, monetization, or costs. Echo's "billing in a box" handles all of that automatically. Focus purely on innovative AI-powered features and creative applications.**

Make each idea distinct and appealing, covering different industries and use cases with exciting AI capabilities.`,
      prompt: customPrompt 
        ? `Generate 10 completely unique and diverse Echo app ideas that ALL align with the following requirements:

${customPrompt}

IMPORTANT: ALL 10 ideas MUST be relevant to the above requirements. Make them diverse but keep them focused on the user's needs. Vary the specific implementation, features, and target sub-audiences while staying within the scope of the requirements.

For example, if the user wants "healthcare apps", generate 10 different healthcare-focused ideas (mental health, telemedicine, patient records, fitness tracking, medication management, etc.).

For each idea, provide:
- A unique ID (use format: echo-idea-1, echo-idea-2, etc. just incrementing numbers)
- An engaging title (2-6 words)
- A compelling description (2-3 sentences explaining the core concept)
- Target audience (be very specific)
- Exactly 5 key features that showcase creative AI-powered functionality
- AI capabilities section highlighting specific AI features like image generation, chat, voice synthesis, data analysis, etc.

Think outside the box! Include unexpected combinations, niche markets, and innovative AI applications.`
        : `Generate 10 completely unique and diverse Echo app ideas. Be highly creative and avoid repetitive patterns. Each idea must be from a different industry/sector and solve different problems.

IMPORTANT: Make these ideas wildly different from each other. Vary:
- Industries (healthcare, education, entertainment, finance, retail, gaming, agriculture, sports, art, science, etc.)
- Target audiences (ages, professions, demographics)
- Problem types (efficiency, creativity, analysis, communication, automation, etc.)
- AI use cases (content generation, data analysis, personalization, prediction, translation, etc.)

For each idea, provide:
- A unique ID (use format: echo-idea-1, echo-idea-2, etc. just incrementing numbers)
- An engaging title (2-6 words)
- A compelling description (2-3 sentences explaining the core concept)
- Target audience (be very specific)
- Exactly 5 key features that showcase creative AI-powered functionality
- AI capabilities section highlighting specific AI features like image generation, chat, voice synthesis, data analysis, etc.

Think outside the box! Include unexpected combinations, niche markets, and innovative AI applications. No two ideas should feel similar.`,
      schema: IdeasResponseSchema,
    });

    return Response.json({ ideas: result.object.ideas });
  } catch (error) {
    console.error('Generate ideas API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { errorMessage, errorStack });
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to generate ideas',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}