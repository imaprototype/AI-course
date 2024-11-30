import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
/** @ts-ignore */
const encoder = encoding_for_model(process.env.MODEL_VERSION);
const MAX_TOKENS = 700;

async function main() {
  const completion = await openai.chat.completions.create({
    model: process.env.MODEL_VERSION ?? "error",
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
    // n: 2, // Number of responses
    // max_tokens: 100, // Max num of tokens used in total
    // frequency_penalty: 1.5,
    // seed: 5555
  });

  console.log(completion.choices);
}

// main();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful assistant. You will answer only in Spanish language.",
  },
];

async function createChateCompletion() {
  const response = await openai.chat.completions.create({
    model: process.env.MODEL_VERSION ?? "error",
    messages: context,
  });
  const responseMessage = response.choices[0].message;
  context.push(responseMessage);

  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    deleteOlderMessages();
  }

  console.log(responseMessage);
}

function deleteOlderMessages() {
  let contextLength = getContextLength();
  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];
      if (message.role != "system") {
        context.splice(i, 1);
        contextLength = getContextLength();
        console.log("New context length: " + contextLength);
        break;
      }
    }
  }
}

function getContextLength() {
  let length = 0;
  context.forEach((message) => {
    if (typeof message.content == "string") {
      length += encoder.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach((messageContent) => {
        if (messageContent.type == "text") {
          length += encoder.encode(messageContent.text).length;
        }
      });
    }
  });
  return length;
}

process.stdin.addListener("data", async function (input: string) {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });

  await createChateCompletion();
});
