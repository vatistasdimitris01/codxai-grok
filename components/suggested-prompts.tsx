"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { memo, useState, useEffect } from "react";
import { useLocation } from "@/lib/hooks/use-location";
import { LocationTutorial } from "./location-tutorial";
import { MapPin, Globe } from "lucide-react";
import { MdChevronRight, MdChevronLeft } from "react-icons/md";

interface SuggestedPromptsProps {
  sendMessage: (input: string) => void;
}

// Initial suggestions while loading
const loadingSuggestions = [
  {
    text: "Generating suggestions...",
    action: "",
  },
  {
    text: "Please wait...",
    action: "",
  },
  {
    text: "Almost ready...",
    action: "",
  },
  {
    text: "Loading...",
    action: "",
  }
];

// Keep track of recently used suggestions to avoid repetition
let recentSuggestions = new Set<string>();

// Common languages by country
const countryLanguages: Record<string, { code: string, name: string }> = {
  "Greece": { code: "el", name: "Greek" },
  "Spain": { code: "es", name: "Spanish" },
  "France": { code: "fr", name: "French" },
  "Germany": { code: "de", name: "German" },
  "Italy": { code: "it", name: "Italian" },
  "Japan": { code: "ja", name: "Japanese" },
  "China": { code: "zh", name: "Chinese" },
  "Russia": { code: "ru", name: "Russian" },
  "Korea": { code: "ko", name: "Korean" },
  "Brazil": { code: "pt", name: "Portuguese" },
  "Netherlands": { code: "nl", name: "Dutch" },
  "Sweden": { code: "sv", name: "Swedish" },
  "Turkey": { code: "tr", name: "Turkish" },
  "Poland": { code: "pl", name: "Polish" },
  "Indonesia": { code: "id", name: "Indonesian" },
  "India": { code: "hi", name: "Hindi" },
  "Thailand": { code: "th", name: "Thai" },
  "Vietnam": { code: "vi", name: "Vietnamese" },
  "Saudi Arabia": { code: "ar", name: "Arabic" },
};

// Add more complete translations for each language
const translations: Record<string, Record<string, string>> = {
  "el": { // Greek
    "Discover hidden gems in": "Ανακαλύψτε κρυμμένους θησαυρούς στην",
    "Find unique activities in": "Βρείτε μοναδικές δραστηριότητες στην",
    "What's trending in": "Τι είναι δημοφιλές στην",
    "Best local spots in": "Καλύτερα τοπικά μέρη στην",
    "Weekend events in": "Εκδηλώσεις του Σαββατοκύριακου στην",
    "Popular hangouts in": "Δημοφιλή στέκια στην",
    "Cultural experiences in": "Πολιτιστικές εμπειρίες στην",
    "Local food specialties in": "Τοπικές γαστρονομικές σπεσιαλιτέ στην",
    "Top-rated restaurants in": "Κορυφαία εστιατόρια στην",
    "Historical sites in": "Ιστορικά αξιοθέατα στην",
    "Art galleries in": "Γκαλερί τέχνης στην",
    "Live music venues in": "Χώροι ζωντανής μουσικής στην",
    "Discover local hidden gems": "Ανακαλύψτε κρυμμένους τοπικούς θησαυρούς",
    "Find unique activities nearby": "Βρείτε μοναδικές δραστηριότητες κοντά σας",
    "What's trending in my area": "Τι είναι δημοφιλές στην περιοχή μου",
    "Best local spots around me": "Καλύτερα τοπικά σημεία γύρω μου",
    "Weekend events near me": "Εκδηλώσεις του Σαββατοκύριακου κοντά μου",
    "Popular hangouts nearby": "Δημοφιλή στέκια κοντά",
    "Cultural experiences around here": "Πολιτιστικές εμπειρίες εδώ γύρω",
    "Local food specialties": "Τοπικές γαστρονομικές σπεσιαλιτέ",
    "Top-rated places near me": "Κορυφαία μέρη κοντά μου",
    "Historical sites nearby": "Ιστορικά αξιοθέατα κοντά",
    "Art galleries in the area": "Γκαλερί τέχνης στην περιοχή",
    "Live music venues around here": "Χώροι ζωντανής μουσικής εδώ γύρω",
    "Debug my code": "Διόρθωσε τον κώδικά μου",
    "Review my code": "Αξιολόγησε τον κώδικά μου",
    "Help with programming": "Βοήθεια με τον προγραμματισμό",
    "Explain coding concepts": "Εξήγησε έννοιες προγραμματισμού",
    "Start a new project": "Ξεκίνησε ένα νέο project",
    "Learn programming": "Μάθε προγραμματισμό",
    "Software architecture tips": "Συμβουλές αρχιτεκτονικής λογισμικού",
    "Best coding practices": "Βέλτιστες πρακτικές κώδικα",
    "Optimize my code": "Βελτιστοποίησε τον κώδικά μου",
    "Design patterns help": "Βοήθεια με πρότυπα σχεδίασης",
    "API development tips": "Συμβουλές ανάπτυξης API",
    "Database design advice": "Συμβουλές σχεδιασμού βάσης δεδομένων",
    "Frontend development help": "Βοήθεια ανάπτυξης frontend",
    "Backend architecture tips": "Συμβουλές αρχιτεκτονικής backend",
    "Cloud computing guidance": "Καθοδήγηση υπολογιστικού νέφους",
    "Generate creative ideas": "Δημιούργησε δημιουργικές ιδέες",
    "Write something interesting": "Γράψε κάτι ενδιαφέρον",
    "Help with content creation": "Βοήθεια με τη δημιουργία περιεχομένου",
    "Brainstorm solutions": "Καταιγισμός ιδεών για λύσεις",
    "Design suggestions": "Προτάσεις σχεδιασμού",
    "Creative writing prompts": "Προτροπές δημιουργικής γραφής",
    "Innovative project ideas": "Καινοτόμες ιδέες για project",
    "Artistic inspiration": "Καλλιτεχνική έμπνευση",
    "Brand identity ideas": "Ιδέες ταυτότητας επωνυμίας",
    "Marketing strategies": "Στρατηγικές μάρκετινγκ",
    "Social media content": "Περιεχόμενο κοινωνικών δικτύων",
    "Visual design concepts": "Ιδέες οπτικού σχεδιασμού",
    "Story development help": "Βοήθεια ανάπτυξης ιστορίας",
    "Creative problem-solving": "Δημιουργική επίλυση προβλημάτων",
    "Explain complex topics": "Εξήγησε πολύπλοκα θέματα",
    "Learn something new": "Μάθε κάτι καινούργιο",
    "Educational resources": "Εκπαιδευτικοί πόροι",
    "Study techniques": "Τεχνικές μελέτης",
    "Knowledge expansion": "Διεύρυνση γνώσεων",
    "Quick learning tips": "Γρήγορες συμβουλές μάθησης",
    "Interesting facts": "Ενδιαφέροντα γεγονότα",
    "Deep dive into topics": "Εμβάθυνση σε θέματα",
    "Research methodologies": "Μεθοδολογίες έρευνας",
    "Memory improvement": "Βελτίωση μνήμης",
    "Learning strategies": "Στρατηγικές μάθησης",
    "Subject expertise": "Εξειδίκευση σε θέματα",
    "Academic guidance": "Ακαδημαϊκή καθοδήγηση",
    "Professional development": "Επαγγελματική ανάπτυξη"
  },
  "es": { // Spanish
    "Discover hidden gems in": "Descubre joyas escondidas en",
    "Find unique activities in": "Encuentra actividades únicas en",
    "What's trending in": "Qué es tendencia en",
    "Best local spots in": "Mejores lugares locales en",
    "Debug my code": "Depura mi código",
    "Review my code": "Revisa mi código",
    "Optimize my code": "Optimiza mi código",
    "Help with programming": "Ayuda con programación",
    "Generate creative ideas": "Genera ideas creativas",
    "Explain complex topics": "Explica temas complejos"
  },
  "fr": { // French
    "Discover hidden gems in": "Découvrez des trésors cachés à",
    "Find unique activities in": "Trouvez des activités uniques à",
    "What's trending in": "Qu'est-ce qui est tendance à",
    "Best local spots in": "Meilleurs endroits locaux à",
    "Debug my code": "Déboguer mon code",
    "Review my code": "Examiner mon code",
    "Optimize my code": "Optimiser mon code",
    "Help with programming": "Aide à la programmation",
    "Generate creative ideas": "Générer des idées créatives",
    "Explain complex topics": "Expliquer des sujets complexes"
  },
  "de": { // German
    "Discover hidden gems in": "Entdecke versteckte Schätze in",
    "Find unique activities in": "Finde einzigartige Aktivitäten in",
    "What's trending in": "Was ist angesagt in",
    "Best local spots in": "Beste lokale Orte in",
    "Debug my code": "Fehler in meinem Code beheben",
    "Review my code": "Überprüfe meinen Code",
    "Optimize my code": "Optimiere meinen Code",
    "Help with programming": "Hilfe beim Programmieren",
    "Generate creative ideas": "Kreative Ideen generieren",
    "Explain complex topics": "Komplexe Themen erklären"
  }
  // Other languages can be added as needed
};

// Function to translate a suggestion based on country
function translateSuggestion(text: string, country: string | undefined): string {
  // Type safety checks
  if (!country) return text;
  if (!(country in countryLanguages)) return text;
  
  const language = countryLanguages[country];
  if (!language) return text;
  
  const langCode = language.code;
  if (!translations[langCode]) return text;
  
  // Try to find a direct translation
  for (const [english, translated] of Object.entries(translations[langCode])) {
    if (text.startsWith(english)) {
      return text.replace(english, translated);
    }
  }
  
  return text;
}

function getRandomItem(array: string[], exclude: Set<string>): string {
  const availableItems = array.filter(item => !exclude.has(item));
  if (availableItems.length === 0) {
    exclude.clear(); // Reset if all items have been used
    return array[0] || "Loading suggestion..."; // Ensure we always return a string
  }
  return availableItems[Math.floor(Math.random() * availableItems.length)];
}

// Default English topics
function getDefaultTopics(city: string | undefined): string[][] {
  return [
    // Location topics
    city ? [
      `Discover hidden gems in ${city}`,
      `Find unique activities in ${city}`,
      `What's trending in ${city}`,
      `Best local spots in ${city}`,
      `Weekend events in ${city}`,
      `Popular hangouts in ${city}`,
      `Cultural experiences in ${city}`,
      `Local food specialties in ${city}`,
      `Top-rated restaurants in ${city}`,
      `Historical sites in ${city}`,
      `Art galleries in ${city}`,
      `Live music venues in ${city}`
    ] : [
      "Discover local hidden gems",
      "Find unique activities nearby", 
      "What's trending in my area",
      "Best local spots around me",
      "Weekend events near me",
      "Popular hangouts nearby",
      "Cultural experiences around here",
      "Local food specialties",
      "Top-rated places near me",
      "Historical sites nearby",
      "Art galleries in the area",
      "Live music venues around here"
    ],
    // Tech topics
    [
      "Debug my code",
      "Review my code",
      "Help with programming",
      "Explain coding concepts",
      "Start a new project",
      "Learn programming",
      "Software architecture tips",
      "Best coding practices",
      "Optimize my code",
      "Design patterns help",
      "API development tips",
      "Database design advice",
      "Frontend development help",
      "Backend architecture tips",
      "Cloud computing guidance"
    ],
    // Creative topics
    [
      "Generate creative ideas",
      "Write something interesting",
      "Help with content creation",
      "Brainstorm solutions",
      "Design suggestions",
      "Creative writing prompts",
      "Innovative project ideas",
      "Artistic inspiration",
      "Brand identity ideas",
      "Marketing strategies",
      "Social media content",
      "Visual design concepts",
      "Story development help",
      "Creative problem-solving"
    ],
    // Learning topics
    [
      "Explain complex topics",
      "Learn something new",
      "Educational resources",
      "Study techniques",
      "Knowledge expansion",
      "Quick learning tips",
      "Interesting facts",
      "Deep dive into topics",
      "Research methodologies",
      "Memory improvement",
      "Learning strategies",
      "Subject expertise",
      "Academic guidance",
      "Professional development"
    ]
  ];
}

function getRandomSuggestions(city: string | undefined, country: string | undefined) {
  // Default topics based on whether we have a city or not
  const defaultTopics = city ? [
    `Discover hidden gems in ${city}`,
    `Find unique activities in ${city}`,
    `What's trending in ${city}`,
    `Best local spots in ${city}`,
    `Weekend events in ${city}`,
    `Popular hangouts in ${city}`,
    `Cultural experiences in ${city}`,
    `Local food specialties in ${city}`,
    `Top-rated restaurants in ${city}`,
    `Historical sites in ${city}`,
    `Art galleries in ${city}`,
    `Live music venues in ${city}`
  ] : [
    "Discover local hidden gems",
    "Find unique activities nearby",
    "What's trending in my area",
    "Best local spots around me",
    "Weekend events near me",
    "Popular hangouts nearby",
    "Cultural experiences around here",
    "Local food specialties",
    "Top-rated places near me",
    "Historical sites nearby",
    "Art galleries in the area",
    "Live music venues around here"
  ];

  // Combined topics
  const allTopics = [
    defaultTopics,
    [
      "Debug my code",
      "Review my code",
      "Help with programming",
      "Explain coding concepts",
      "Start a new project",
      "Learn programming",
      "Software architecture tips",
      "Best coding practices",
      "Optimize my code",
      "Design patterns help",
      "API development tips",
      "Database design advice",
      "Frontend development help",
      "Backend architecture tips",
      "Cloud computing guidance"
    ],
    [
      "Generate creative ideas",
      "Write something interesting",
      "Help with content creation",
      "Brainstorm solutions",
      "Design suggestions",
      "Creative writing prompts",
      "Innovative project ideas",
      "Artistic inspiration",
      "Brand identity ideas",
      "Marketing strategies",
      "Social media content",
      "Visual design concepts",
      "Story development help",
      "Creative problem-solving"
    ],
    [
      "Explain complex topics",
      "Learn something new",
      "Educational resources",
      "Study techniques",
      "Knowledge expansion",
      "Quick learning tips",
      "Interesting facts",
      "Deep dive into topics",
      "Research methodologies",
      "Memory improvement",
      "Learning strategies",
      "Subject expertise",
      "Academic guidance",
      "Professional development"
    ]
  ];
  
  // Check if we have language support
  const hasLanguageSupport = country && 
    country in countryLanguages && 
    countryLanguages[country].code in translations;

  // Translate function that's type-safe
  const translateTopic = (text: string): string => {
    if (!hasLanguageSupport || !country) return text;
    
    // Type assertion here since we've already checked country exists
    const safeCountry = country as string;
    const langCode = countryLanguages[safeCountry].code;
    const translations_for_language = translations[langCode];
    
    // For city-based suggestions, handle differently
    if (city && text.includes(city)) {
      // Find prefix (everything before the city name)
      const cityIndex = text.indexOf(city);
      if (cityIndex > 0) {
        const prefix = text.substring(0, cityIndex).trim();
        const suffix = text.substring(cityIndex + city.length);
        
        // Look for translation of the prefix
        if (prefix in translations_for_language) {
          return `${translations_for_language[prefix]} ${city}${suffix}`;
        }
      }
    } else {
      // Direct translation if available
      if (text in translations_for_language) {
        return translations_for_language[text];
      }
    }
    
    return text;
  };

  // Generate suggestions for each category
  const newSuggestions = allTopics.map(category => {
    const text = getRandomItem(category, recentSuggestions);
    if (text) {
      recentSuggestions.add(text);
      if (recentSuggestions.size > 20) {
        const iterator = recentSuggestions.values();
        recentSuggestions.delete(iterator.next().value);
      }
    }
    
    const safeText = text || "Loading suggestion...";
    const displayText = translateTopic(safeText);
    
    return {
      text: displayText,
      action: text ? `${safeText}. Can you help me with this?` : ""
    };
  });

  return newSuggestions;
}

function PureSuggestedPrompts({ sendMessage }: SuggestedPromptsProps) {
  const { location, isLoading, showTutorial, requestLocation, skipLocation } = useLocation();
  const [suggestions, setSuggestions] = useState(loadingSuggestions);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLanguageInfo, setShowLanguageInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSuggestions(getRandomSuggestions(location?.city, location?.country));

    const interval = setInterval(() => {
      setSuggestions(getRandomSuggestions(location?.city, location?.country));
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [location?.city, location?.country, mounted]);

  const handleRefresh = () => {
    setSuggestions(getRandomSuggestions(location?.city, location?.country));
    setRefreshKey(prev => prev + 1);
  };

  const getCurrentLanguage = () => {
    if (!location?.country) return "English";
    return countryLanguages[location.country]?.name || "English";
  };

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Try asking about:</span>
          <div className="relative">
            <MapPin 
              className={`w-4 h-4 ${location ? 'text-green-500' : 'text-gray-400'}`}
              onMouseEnter={() => setShowLanguageInfo(true)}
              onMouseLeave={() => setShowLanguageInfo(false)} 
            />
            {showLanguageInfo && location?.country && countryLanguages[location.country] && (
              <div className="absolute left-0 top-6 w-48 bg-white dark:bg-gray-800 shadow-md rounded-md p-2 text-xs z-10">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Suggestions in {getCurrentLanguage()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Refresh suggestions
        </button>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
        <motion.div
            key={`suggestion-${index}-${refreshKey}`}
            initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
            className="flex"
        >
          <Button
              variant="outline"
              onClick={() => suggestion.action && sendMessage(suggestion.action)}
              disabled={!suggestion.action}
              className="w-full h-auto min-h-[52px] px-3.5 py-2.5 text-left justify-start text-[15px] font-normal text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] rounded-lg transition-colors duration-200"
            >
              <span className="line-clamp-2 leading-snug">{suggestion.text}</span>
          </Button>
        </motion.div>
      ))}
      </div>

      {showTutorial && (
        <LocationTutorial
          onRequestLocation={requestLocation}
          onSkip={skipLocation}
        />
      )}
    </div>
  );
}

export const SuggestedPrompts = memo(PureSuggestedPrompts);
