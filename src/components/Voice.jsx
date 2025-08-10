import React, { useState, useEffect } from "react";

const Voice = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState(""); // Store spoken text to prevent re-speaking

  useEffect(() => {
    // Only speak if new text is passed and the text is different from the previously spoken one
    if (text && !isSpeaking && text !== spokenText) {
      const utterance = new SpeechSynthesisUtterance(text); // Create the speech utterance with the text
      utterance.lang = 'en-US'; // Set the language (you can change it)
      utterance.rate = 1; // Set rate (optional)
      utterance.pitch = 1; // Set pitch (optional)

      utterance.onstart = () => {
        setIsSpeaking(true); // Update state when speaking starts
      };

      utterance.onend = () => {
        setIsSpeaking(false); // Update state when speaking ends
        setSpokenText(text); // Update spoken text after finishing
      };

      window.speechSynthesis.speak(utterance); // Speak the text
    }
  }, [text, isSpeaking, spokenText]); // Dependencies updated to avoid unnecessary re-speaking

  return (
    <div>
      {isSpeaking ? "Speaking..." : ""}
    </div>
  );
};

export default Voice;
