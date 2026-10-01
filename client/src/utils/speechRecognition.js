export const getSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error(
      "Speech recognition is not supported in this browser."
    );
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  return recognition;
};