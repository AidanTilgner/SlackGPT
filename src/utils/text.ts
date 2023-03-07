const thinkingTexts = ["Thinking...", "Let me think...", "Hmm..."];

export const getRandomThinkingText = () => {
  return thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
};
