import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.8,
    maxTokens: 700,
    verbose: true,
});

async function main() {
    // const response = await model.invoke("Give me 4 good books to read");
    // const response = await model.stream(["Hi there","Give me 4 good books to read"]);
    // for await (const chunk of response){
    //     console.log(chunk);
    // }

    const response = await model.batch(["Hi there"]);
    console.log(response);
}
main();