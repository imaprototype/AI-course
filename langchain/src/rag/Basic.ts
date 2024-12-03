import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.8,
    maxTokens: 700,
    verbose: true,
});

// We will need to save this in a vector
const myData = [
    "My name is Juan",
    "My name is Javi",
    "My name is Bob",
    "I like pizza",
    "I like gazpacho",
    "I like pineapple",
];

const question = "What's my favourite food?";

async function main() {
    console.log("Main triggered");
}
main();
