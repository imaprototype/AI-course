import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.7,
});

console.log(model);

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
    // Store data
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

    await vectorStore.addDocuments(
        myData.map(
            (content) =>
                new Document({
                    pageContent: content,
                })
        )
    );

    // Create data retriever
    const retriever = vectorStore.asRetriever({
        k: 2,
    });

    const results = await retriever.invoke(question);
    const resultDocs = results.map((result) => result.pageContent);

    // build template
    const template = ChatPromptTemplate.fromMessages([
        ["system", "Anser the user question based on the following context: {context}"],
        ["human", "{input}"],
    ]);

    // create the chain
    const chain = template.pipe(model);
    const response = await chain.invoke({
        input: question,
        context: resultDocs,
    });
}
main();
