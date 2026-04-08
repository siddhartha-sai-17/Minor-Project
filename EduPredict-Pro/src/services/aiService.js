/**
 * AI Service for EduPredict
 * Handles communication with Anthropic Claude API (placeholder)
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "PLACEHOLDER_KEY";
const API_URL = "https://api.anthropic.com/v1/messages";

export const getEduBotResponse = async (studentData, conversationHistory) => {
  try {
    // In a real environment, this would call the Anthropic API.
    // For now, we simulate the behavior as requested.
    
    // const response = await fetch(API_URL, {
    //   method: "POST",
    //   headers: { 
    //     "Content-Type": "application/json",
    //     "x-api-key": ANTHROPIC_API_KEY,
    //     "anthropic-version": "2023-06-01"
    //   },
    //   body: JSON.stringify({
    //     model: "claude-3-5-sonnet-20240620",
    //     max_tokens: 1000,
    //     system: `You are EduBot, a personalized study assistant. 
    //              Student profile: ${JSON.stringify(studentData)}.
    //              Be concise, encouraging, and specific to their data.`,
    //     messages: conversationHistory
    //   })
    // });
    // const data = await response.json();
    // return data.content.map(b => b.text || "").join("\n");

    // Simulation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lastUserMessage = conversationHistory[conversationHistory.length - 1]?.content.toLowerCase() || "";
    
    if (lastUserMessage.includes("risk")) {
      return "Based on your data, your risk factor is influenced by low engagement in practical sessions. I recommend increasing your 'Study Time' by 2 hours this week and focusing on 'Prep Exams'.";
    } else if (lastUserMessage.includes("plan")) {
      return "Here is your 7-day plan: \n- Days 1-3: Review weak modules.\n- Days 4-5: Take 2 practice quizzes.\n- Day 6: Group study for peer feedback.\n- Day 7: Final review.";
    } else if (lastUserMessage.includes("improve")) {
      return "To improve your score, focus on 'Extracurricular Activities' to balance stress, and aim for a 90% attendance rate in the upcoming weeks.";
    }
    
    return "Hello! I'm EduBot. I've analyzed your performance metrics. How can I help you achieve your academic goals today?";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm having trouble connecting right now, but keep up the great work! Try again in a moment.";
  }
};
