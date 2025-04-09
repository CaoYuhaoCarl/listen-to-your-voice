async function handler({ text, voiceId }) {
  // Use the non-streaming endpoint for better compatibility
  const VOICE_ID = voiceId || "Xb7hH8MSUJpSbSDYk0k2";
  const tts_url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  // For debugging
  console.log("Text to convert:", text);
  console.log("Voice ID:", VOICE_ID);

  // Use the provided API key directly
  const API_KEY = "sk_61ef6f6de684c0abc201db36b031d6c73dcab08c5d6f35c9";

  // For debugging - log masked API key to confirm it exists (don't log the full key)
  const maskedKey =
    API_KEY.substring(0, 4) + "..." + API_KEY.substring(API_KEY.length - 4);
  console.log("Using API key (masked):", maskedKey);

  const headers = {
    Accept: "audio/mpeg",
    "xi-api-key": API_KEY,
    "Content-Type": "application/json",
  };

  const data = {
    text: text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  };

  try {
    console.log("Making request to ElevenLabs API...");
    console.log("Request data:", JSON.stringify(data));

    const response = await fetch(tts_url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      JSON.stringify(Object.fromEntries([...response.headers]))
    );

    if (!response.ok) {
      let errorDetails;
      try {
        // Try to parse as JSON first
        errorDetails = await response.json();
        console.error(
          "ElevenLabs API error details:",
          JSON.stringify(errorDetails)
        );
      } catch (e) {
        // If not JSON, get as text
        errorDetails = await response.text();
        console.error("ElevenLabs API error text:", errorDetails);
      }

      return {
        error: `ElevenLabs API error: ${response.status} ${response.statusText}`,
        details:
          typeof errorDetails === "object"
            ? JSON.stringify(errorDetails)
            : errorDetails,
        status: response.status,
      };
    }

    // Check content type to ensure we got audio
    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (!contentType || !contentType.includes("audio")) {
      console.error("Unexpected content type:", contentType);
      let responseBody;
      try {
        responseBody = await response.text();
      } catch (e) {
        responseBody = "Could not read response body";
      }

      return {
        error: `Received non-audio response: ${contentType}`,
        details: responseBody,
        status: 500,
      };
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    console.log("Received audio buffer size:", audioBuffer.byteLength);

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("Received empty audio buffer from ElevenLabs API");
      return {
        error: "Received empty audio data from ElevenLabs API",
        status: 500,
      };
    }

    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    console.log("Converted to base64, length:", base64Audio.length);

    return {
      audioContent: base64Audio,
      contentType: contentType || "audio/mpeg",
      status: 200,
    };
  } catch (error) {
    console.error("Error calling ElevenLabs API:", error);
    return {
      error: `Error calling ElevenLabs API: ${error.message}`,
      stack: error.stack,
      status: 500,
    };
  }
}