export const speakText = (text) => {
  if (!("speechSynthesis" in window)) {
    throw new Error(
      "Text-to-speech is not supported in this browser."
    );
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};