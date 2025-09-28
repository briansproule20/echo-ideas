'use client';

import { useChat } from '@ai-sdk/react';
import { CopyIcon, MessageSquare, Check, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';
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
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <Conversation className="relative min-h-0 w-full flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              messages.map(message => (
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
              ))
            )}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suggestions>
          {suggestions.map(suggestion => (
            <Suggestion
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
          <PromptInputTextarea
            onChange={e => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={value => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
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
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="size-4" />
                </PromptInputButton>
              )}
              <PromptInputSubmit disabled={!input} status={status} />
            </div>
          </PromptInputToolbar>
        </PromptInput>

        <div className="mt-8">
          <FavoritedIdeas onIdeaClick={handleIdeaClick} />
        </div>
      </div>
    </div>
  );
};

export default ChatBotDemo;
