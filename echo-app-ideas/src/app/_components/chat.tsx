'use client';

import { useChat } from '@ai-sdk/react';
import { CopyIcon, MessageSquare, Check, Trash2 } from 'lucide-react';
import { Fragment, useState, useEffect, useRef } from 'react';
import { Action, Actions } from '@/components/ai-elements/actions';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import FavoritedIdeas from '@/app/_components/favorited-ideas';

const models = [
  {
    name: 'GPT 4o',
    value: 'gpt-4o',
    provider: 'openai',
  },
  {
    name: 'Claude Haiku',
    value: 'claude-3-haiku-20240307',
    provider: 'anthropic',
  },
  {
    name: 'Claude Sonnet',
    value: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
  },
];

const suggestions = [
  'I need a new idea for a Merit System\'s Echo App..',
  'Turn this idea into a prompt I can give to cursor/claude',
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { messages, sendMessage, status } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for saved prompt from sessionStorage
  useEffect(() => {
    const savedPrompt = sessionStorage.getItem('chat-prompt');
    if (savedPrompt) {
      setInput(savedPrompt);
      sessionStorage.removeItem('chat-prompt');
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIdeaClick = (idea: any) => {
    const prompt = `Help me flesh this idea out and create a plan of action:

**${idea.title}**

${idea.description}

**Target Audience:** ${idea.targetAudience}

**Key Features:**
${idea.features.map((feature: string) => `• ${feature}`).join('\n')}

**AI Capabilities:** ${idea.aiCapabilities}`;

    setInput(prompt);
  };

  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      // Clear the copied state after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        }
      );
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
        },
      }
    );
  };

  const handleClearInput = () => {
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <Conversation className="relative h-full w-full">
          <ConversationContent className="h-full overflow-y-auto">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12 text-amber-500" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {messages.map(message => (
                  <div key={message.id}>
                    {message.role === 'assistant' &&
                      message.parts.filter(part => part.type === 'source-url')
                        .length > 0 && (
                        <Sources>
                          <SourcesTrigger
                            count={
                              message.parts.filter(
                                part => part.type === 'source-url'
                              ).length
                            }
                          />
                          {message.parts
                            .filter(part => part.type === 'source-url')
                            .map((part, i) => (
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            ))}
                        </Sources>
                      )}
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Fragment key={`${message.id}-${i}`}>
                              <Message from={message.role}>
                                <MessageContent>
                                  <Response key={`${message.id}-${i}`}>
                                    {part.text}
                                  </Response>
                                </MessageContent>
                              </Message>
                              {message.role === 'assistant' && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() =>
                                      handleCopyMessage(`${message.id}-${i}`, part.text)
                                    }
                                    label={copiedMessageId === `${message.id}-${i}` ? "Copied!" : "Copy"}
                                  >
                                    {copiedMessageId === `${message.id}-${i}` ? (
                                      <Check className="size-3 text-green-600" />
                                    ) : (
                                      <CopyIcon className="size-3" />
                                    )}
                                  </Action>
                                </Actions>
                              )}
                            </Fragment>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={
                                status === 'streaming' &&
                                i === message.parts.length - 1 &&
                                message.id === messages.at(-1)?.id
                              }
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                ))}
                {status === 'submitted' && <Loader />}
                {/* Scroll target for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Fixed Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <Suggestions className="mb-4">
            {suggestions.map(suggestion => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
          
          <PromptInput onSubmit={handleSubmit} className="w-full">
            <PromptInputTextarea
              onChange={e => setInput(e.target.value)}
              value={input}
              placeholder="Ask about Echo app ideas... (Press Enter or Cmd+Enter to send)"
              className="min-h-[60px] max-h-[200px] resize-none"
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputModelSelect
                  onValueChange={value => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputModelSelectTrigger className="bg-amber-50 border-amber-200 text-amber-700">
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map(model => (
                      <PromptInputModelSelectItem
                        key={model.value}
                        value={model.value}
                      >
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <div className="flex items-center gap-1">
                {input && (
                  <PromptInputButton
                    onClick={handleClearInput}
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="size-4" />
                  </PromptInputButton>
                )}
                <PromptInputSubmit 
                  disabled={!input} 
                  status={status}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                />
              </div>
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default ChatBotDemo;
