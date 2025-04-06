"use client";

import { motion } from "motion/react";
import { Button } from "./ui/button";
import { memo } from "react";

interface SuggestedPromptsProps {
  sendMessage: (input: string) => void;
  enableWebSearch: () => void;
}

const SuggestedPrompts = memo(({ sendMessage, enableWebSearch }: SuggestedPromptsProps) => {
  const prompts = [
    {
      text: "What's the latest news about AI?",
      requiresWeb: true
    },
    {
      text: "Find me the best restaurants in my area",
      requiresWeb: true
    },
    {
      text: "What are the current trends in technology?",
      requiresWeb: true
    },
    {
      text: "Tell me about local events happening this weekend",
      requiresWeb: true
    }
  ];

  const handleClick = (prompt: { text: string; requiresWeb: boolean }) => {
    if (prompt.requiresWeb) {
      enableWebSearch();
    }
    sendMessage(prompt.text);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {prompts.map((prompt, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            className="w-full h-auto py-2 text-left justify-start"
            onClick={() => handleClick(prompt)}
          >
            {prompt.text}
          </Button>
        </motion.div>
      ))}
    </div>
  );
});

SuggestedPrompts.displayName = "SuggestedPrompts";

interface ProjectOverviewProps {
  sendMessage: (input: string) => void;
  enableWebSearch: () => void;
}

export function ProjectOverview({ sendMessage, enableWebSearch }: ProjectOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold tracking-tight text-center"
        >
          Welcome to CodXai
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground text-center"
        >
          Your intelligent AI assistant powered by vd
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm text-muted-foreground text-center"
        >
          Created by{" "}
          <a
            href="https://www.instagram.com/vatistasdimitris"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @vatistasdimitris
          </a>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-center">Try asking about:</h2>
        <SuggestedPrompts sendMessage={sendMessage} enableWebSearch={enableWebSearch} />
      </motion.div>
    </div>
  );
}
