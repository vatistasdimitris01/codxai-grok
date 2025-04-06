import { GoogleGenerativeAI, type Part, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Define the Message interface locally
interface Message {
  role: "user" | "assistant";
  content: string;
  image?: {
    data: string;
    mimeType: string;
    preview?: string;
  };
  document?: {
    data: string;
    mimeType: string;
    name: string;
  };
  searchQueries?: string[];
  searchEntryPoint?: boolean;
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Location {
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Initialize the Google Generative AI client with API key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, useWebSearch, location } = body;
    
    // Check for API key - try multiple sources
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === "") {
      console.error("API key missing or empty");
      return NextResponse.json(
        { error: 'API key is missing or empty. Please add your Google API key to the .env.local file.' },
        { status: 500 }
      );
    }

    console.log("API key available:", apiKey ? "Yes (key length: " + apiKey.length + ")" : "No");

    // Initialize the Generative AI instance
    const genAI = new GoogleGenerativeAI(apiKey);

    // Set up safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];

    // Prepare messages for API call
    const messageHistory = messages.map((message: Message) => {
      // Prepare parts array for this message
      const parts: Part[] = [];
      
      // Add text content
      parts.push({ text: message.content });
      
      // Add image part if the message contains an image
      if (message.image && message.image.data) {
        try {
          const base64Data = message.image.data.includes('base64,') 
            ? message.image.data.split('base64,')[1] 
            : message.image.data;
            
          parts.push({
            inlineData: {
              mimeType: message.image.mimeType,
              data: base64Data
            }
          });
        } catch (imageError) {
          console.error('Error processing image:', imageError);
          // Continue without the image if it can't be processed
        }
      }
      
      // Add document part if the message contains a document
      if (message.document && message.document.data) {
        try {
          const base64Data = message.document.data.includes('base64,') 
            ? message.document.data.split('base64,')[1] 
            : message.document.data;
            
          parts.push({
            inlineData: {
              mimeType: message.document.mimeType,
              data: base64Data
            }
          });
        } catch (documentError) {
          console.error('Error processing document:', documentError);
          // Continue without the document if it can't be processed
        }
      }
      
      // Convert client message format to Gemini API format
      return {
        role: message.role === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });

    // Construct a prompt with context
    let searchContext = '';
    let searchQueries: string[] = [];
    let searchEntryPoint = false;

    // If web search is enabled and requested
    if (useWebSearch) {
      // Extract the latest user message
      const latestUserMessage = messages[messages.length - 1].content;
      
      // Prepare a context message for the AI about web search
      searchContext = `To provide the most up-to-date and accurate information, I'll use real-time web data for this query: "${latestUserMessage}".`;
      
      // Extract potential search queries from the message
      // Simple extraction - in a real app, you might use NLP to extract better queries
      searchQueries = [latestUserMessage];
      
      // Flag that this is a search entry point
      searchEntryPoint = true;
    }

    // Prepare location context if available
    let locationContext = '';
    if (location && location.city) {
      // Format the location information for the AI
      locationContext = `The user is currently located in ${location.city}`;
      
      if (location.country) {
        locationContext += `, ${location.country}`;
      }
      
      if (location.coordinates && location.coordinates.latitude && location.coordinates.longitude) {
        locationContext += ` (coordinates: ${location.coordinates.latitude}, ${location.coordinates.longitude})`;
      }
      
      locationContext += `. For questions about nearby places, this context may be helpful.`;
    } else {
      // Provide instruction for incomplete location data
      locationContext = 'The user has not provided their location. If they ask about nearby places, please ask them for their location first.';
    }

    // Create model with proper configuration
    try {
      // Prepare model with configuration
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        safetySettings,
        // Generate content using streaming
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
        },
      });

      // Start a chat session
      const chat = model.startChat({
        history: messageHistory.slice(0, -1), // All but the last message
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
        },
      });

      // Construct the prompt with proper context
      const timeNow = new Date().toLocaleString();
      const lastMsg = messageHistory[messageHistory.length - 1];

      // Build a richer context for the prompt
      let enhancedContext = '';
      
      // Add web search context if enabled
      if (searchContext) {
        enhancedContext += `${searchContext}\n\n`;
      }
      
      // Add location context if available
      enhancedContext += `${locationContext}\n\n`;
      
      // Add time context
      enhancedContext += `Current time: ${timeNow}\n\n`;
      
      // Add special instructions for file attachments
      if (lastMsg.parts.length > 1) {
        const hasImage = lastMsg.parts.some((part: Part) => 
          part.inlineData?.mimeType.startsWith('image/')
        );
        
        const hasDocument = lastMsg.parts.some((part: Part) => 
          part.inlineData?.mimeType.startsWith('application/') || 
          part.inlineData?.mimeType.startsWith('text/')
        );
        
        if (hasImage) {
          enhancedContext += "I've included an image with my request. Please analyze it and provide relevant information.\n\n";
        }
        
        if (hasDocument) {
          enhancedContext += "I've included a document with my request. Please analyze its content and provide relevant information.\n\n";
        }
      }
      
      // Add user's request
      enhancedContext += `User request: ${lastMsg.parts[0].text}`;
      
      // Create the final contextual prompt
      const contextualPrompt = enhancedContext;

      // Content filtering boundary for safety
      try {
        // Check for image or document data
        const hasFileAttachment = lastMsg.parts.length > 1;
        
        let result;
        
        if (hasFileAttachment) {
          // For file attachments, just send the properly formatted parts from lastMsg
          result = await chat.sendMessage(lastMsg.parts[0].text, lastMsg.parts.slice(1));
        } else {
          // For text-only, use the contextual prompt
          result = await chat.sendMessage(contextualPrompt);
        }
          
        const responseText = result.response.text();
        
        // Process the response to remove any instances of "undefined"
        const cleanedResponse = responseText.replace(/undefined/g, '');
        
        // Return successful response
        return NextResponse.json({
          text: cleanedResponse,
          searchQueries,
          searchEntryPoint,
        });
      } catch (contentFilterError) {
        console.error('Content filtering error:', contentFilterError);
        
        // Check for the specific "request is not iterable" error
        const errorMsg = contentFilterError instanceof Error ? contentFilterError.message : String(contentFilterError);
        
        if (errorMsg.includes('not iterable')) {
          return NextResponse.json(
            { 
              error: 'There was an error processing your request with file attachments.', 
              details: 'Message format error: Parts need to be properly formatted for the AI model.',
              technicalDetails: errorMsg 
            },
            { status: 400 }
          );
        }
        
        // Check if the error is related to file size
        if (errorMsg.includes('payload') || errorMsg.includes('size') || errorMsg.includes('too large')) {
        return NextResponse.json(
            { error: 'The file is too large for processing. Please use a smaller file (under 5MB).', 
              details: errorMsg },
            { status: 413 }
          );
        }
        
        // Check for rate limiting
        if (errorMsg.includes('rate') || errorMsg.includes('quota') || errorMsg.includes('limit')) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.', 
              details: errorMsg },
            { status: 429 }
          );
        }
        
        // Check for model overload
        if (errorMsg.includes('overloaded') || errorMsg.includes('capacity')) {
          return NextResponse.json(
            { error: 'The AI model is currently overloaded. Please try again in a few moments.', 
              details: `GoogleGenerativeAI Error: ${errorMsg}` },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          { error: 'The AI model could not process your content due to safety filters or other restrictions.', 
            details: `GoogleGenerativeAI Error: ${errorMsg}` },
          { status: 400 }
        );
      }
    } catch (modelError) {
      console.error('Model initialization error:', modelError);
      const errorDetails = modelError instanceof Error ? modelError.message : String(modelError);
      
      return NextResponse.json(
        { error: 'Failed to initialize the AI model', details: errorDetails },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General API error:', error);
    
    // Provide detailed error information
    const errorDetails = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'An error occurred processing your request', details: errorDetails },
      { status: 500 }
    );
  }
}
