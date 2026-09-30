import ollamaProvider from "./ollamaProvider.js";

const aiProvider = {
  async generateText(prompt) {
    return ollamaProvider.generateText(prompt);
  },
};

export default aiProvider;