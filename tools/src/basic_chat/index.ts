import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
/** @ts-ignore */
const encoder = encoding_for_model(process.env.MODEL_VERSION);
const MAX_TOKENS = 700;

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that gives information about flights. You will answer only in Spanish language.",
  },
];

process.stdin.addListener("data", async function (input: string) {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });

  await createChateCompletion();
});

async function createChateCompletion() {
  const response = await openai.chat.completions.create({
    model: process.env.MODEL_VERSION ?? "error",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeAI",
          description: "Get the current time",
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Returns the status of an order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order to get the status of",
              },
            },
            required: ["orderId"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  // Boolean
  const willInvokeFunction = response.choices[0].finish_reason == "tool_calls";

  if (willInvokeFunction) {
    const toolCall = response.choices[0].message.tool_calls![0];
    const responseMessage = response.choices[0].message;
    context.push(responseMessage);

    const toolName = toolCall.function.name;

    if (toolName == "getTimeAI") {
      const toolResponse = getTimeAI();
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }

    if (toolName == "getOrderStatus") {
      const rawArgument = toolCall.function.arguments;
      const parsedArgs = JSON.parse(rawArgument);

      const toolResponse = getOrderStatus(parsedArgs.orderId);
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
  }

  // if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
  //   deleteOlderMessages();
  // }

  const secondResponse = await openai.chat.completions.create({
    model: process.env.MODEL_VERSION ?? "error",
    messages: context,
  });
  const secondResponseMessage = secondResponse.choices[0].message.content;
  console.log(`\nResponse: ${secondResponseMessage}`);
}

function getTimeAI() {
  console.log("Get time invoked", new Date().toTimeString());
  return new Date().toTimeString();
}

function getOrderStatus(orderId: string) {
  console.log("Get forecast invoked");
  const orderIdParsed = parseInt(orderId);
  let status: string;
  if (orderIdParsed % 2 == 0) {
    status = "PROCESSED";
  } else {
    status = "WAITING";
  }
  return status;
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
