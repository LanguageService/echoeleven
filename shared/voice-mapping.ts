export const elevenLabsVoiceMapping = {
  "Rachel": "21m00Tcm4TlvDq8ikWAM",
  "Drew": "29vD33N1CtxCmqQRPOHJ",
  "Paul": "5Q0t7uMcjvnagumLfvZi",
  "Domi": "AZnzlk1XvdvUeBnXmlld",
  "Dave": "CYw3kZ02Hs0563khs1Fj",
  "Sarah": "EXAVITQu4vr4xnSDxMaL",
  "Antoni": "ErXwobaYiN019PkySvjV",
  "Thomas": "GBv7mTt0atIp3Br8iCZE",
  "Charlie": "IKne3meq5aSn9XLyUdCD",
  "George": "JBFqnCBsd6RMkjVDRZzb",
  "Emily": "LcfcDJNUP1GQjkzn1xUU",
  "Elli": "MF3mGyEYCl7XYWbV9V6O",
  "Callum": "N2lVS1w4EtoT3dr4eOWO",
  "Harry": "SOYHLrjzK2X1ezoPC6cr",
  "Liam": "TX3LPaxmHKxFdv7VOQHJ",
  "Dorothy": "ThT5KcBeYPX3keUQqHPh",
  "Josh": "TxGEqnHWrfWFTfGW9XjX",
  "Charlotte": "XB0fDUnXU5powFXDhCwa",
  "Alice": "Xb7hH8MSUJpSbSDYk0k2",
  "Matilda": "XrExE9yKIg1WjnnlVkGX",
  "James": "ZQe5CZNOzWyzPSCn5a3c",
  "Joseph": "Zlb1dXrM653N07WRdFW3",
  "Jeremy": "bVMeCyTHy58xNoL34h3p",
  "Michael": "flq6f7yk4E4fJM5XTYuZ",
  "Ethan": "g5CIjZEefAph4nQFvHAz",
  "Chris": "iP95p4xoKVk53GoZ742B",
  "Gigi": "jBpfuIE2acCO8z3wKNLl",
  "Freya": "jsCqWAovK2LkecY7zXl4",
  "Brian": "nPczCjzI2devNBz1zQrb",
  "Grace": "oWAxZDx7w5VEj9dCyTzz",
  "Daniel": "onwK4e9ZLuTAKqWW03F9",
  "Lily": "pFZP5JQG7iQjIQuC4Bku",
  "Adam": "pNInz6obpgDQGcFmaJgB",
  "Nicole": "piTKgcLEGmPE4e6mEKli",
  "Bill": "pqHfZKP75CvOlQylNhV4",
  "Sam": "yoZ06aMxZJJ28mfd3POQ",
} as const;

export const reverseElevenLabsVoiceMapping = Object.fromEntries(
  Object.entries(elevenLabsVoiceMapping).map(([displayName, voiceId]) => [voiceId, displayName])
) as Record<string, string>;

export const getDisplayVoiceNames = (): string[] => {
  return Object.keys(elevenLabsVoiceMapping);
};

export const getElevenLabsVoiceId = (displayName: string): string => {
  return elevenLabsVoiceMapping[displayName as keyof typeof elevenLabsVoiceMapping] || elevenLabsVoiceMapping["Rachel"];
};

export const getDisplayVoiceName = (voiceId: string): string => {
  return reverseElevenLabsVoiceMapping[voiceId] || voiceId;
};

export const voiceOptions = Object.entries(elevenLabsVoiceMapping).map(([displayName, voiceId]) => ({
  value: displayName,
  label: displayName,
  voiceId
}));

export const getGeminiVoiceName = (displayName: string): string => {
  return getElevenLabsVoiceId(displayName);
};
