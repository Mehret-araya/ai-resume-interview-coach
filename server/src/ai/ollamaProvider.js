
const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.2:3b";

const ollamaProvider = {
  async generateText(prompt) {
    const response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0,
            num_predict: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error(
        "Ollama returned an empty response"
      );
    }

    return data.response;
  },

  async generateJSON(prompt) {
    const response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0,
            num_predict: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error(
        "Ollama returned an empty response"
      );
    }

    return data.response;
  },
};

export default ollamaProvider;
