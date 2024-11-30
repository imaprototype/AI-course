import { OpenAI } from "openai";

import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. You protect our company from wasting money. You will give answers in JSON format. You will never answer anything in Latin, instead, you will use Spanish.",
      },
      {
        role: "user",
        content: "Write 140 characters of dummy data like lorem ipsum.",
      },
    ],
    n: 2, // Number of responses
    max_tokens: 100, // Max num of tokens used in total
    // frequency_penalty: 1.5,
    // seed: 5555
  });

  console.log(completion.choices);
}

main();

function encodePrompt() {
  const prompt = "How are you today?";
  const encoder = encoding_for_model("gpt-4o-mini");
  const words = encoder.encode(prompt);
  console.log(words);
}
// encodePrompt();
