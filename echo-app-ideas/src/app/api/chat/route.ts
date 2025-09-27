import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai, anthropic } from '@/echo';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
    }: {
      messages: UIMessage[];
      model: string;
    } = await req.json();

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

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine provider based on model
    const isAnthropicModel = model.startsWith('claude-');
    const modelProvider = isAnthropicModel ? anthropic(model) : openai(model);

    const result = streamText({
      model: modelProvider,
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

## Your Role

When users ask for Echo app ideas, provide creative, practical applications that leverage Echo's unique strengths:

1. **LLM-Powered Applications**: Ideas that heavily utilize AI models for core functionality
2. **Billing Integration**: Apps where users pay for AI usage through Echo's transparent billing
3. **Real-world Value**: Practical solutions that solve genuine problems
4. **Monetization**: Clear value propositions where users understand what they're paying for

Focus on applications where Echo's "billing in a box" model creates unique opportunities - where traditional apps might struggle with AI costs, but Echo makes it viable through transparent, usage-based pricing.

Generate 3-5 detailed app ideas with:
- App concept and target audience
- How it leverages Echo's LLM integration
- How Echo's billing model enables the business case
- Key features and user experience
- Potential revenue/pricing strategy`,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
