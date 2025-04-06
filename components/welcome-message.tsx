import { motion } from "motion/react";
import { StarIcon, Code, Instagram, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { SuggestedPrompts } from "./suggested-prompts";

interface WelcomeMessageProps {
  sendMessage: (input: string) => void;
}

export function WelcomeMessage({ sendMessage }: WelcomeMessageProps) {
  const sampleQuestions = [
    "How can I optimize my React code?",
    "Explain closures in JavaScript",
    "Suggest a project to improve my coding skills"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4 text-center py-12"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-50">
        Welcome to CodXai
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
        Your AI coding assistant and knowledge companion. Ask me anything about coding, learning, or discovering new things.
      </p>

      {/* Suggestions section */}
      <div className="w-full max-w-lg mb-10">
        <SuggestedPrompts sendMessage={sendMessage} />
      </div>

      <div className="w-full max-w-lg border-t border-gray-200 dark:border-gray-800 pt-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Created by Dimitris Vatistas
        </p>
        
        <div className="flex items-center justify-center">
          <a 
            href="https://instagram.com/vatistasdimitris" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors flex items-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            <span>@vatistasdimitris</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
} 