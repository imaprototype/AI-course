import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.7,
});

const question = "What's the main topic of the document?";

async function main() {
    // Create the loader
    const loader = new PDFLoader("test.pdf", {
        splitPages: false,
    });
    const docs = await loader.load();

    // create a splitter
    const splitter = new RecursiveCharacterTextSplitter({
        separators: [`\n`]
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Store data
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

    await vectorStore.addDocuments(splitDocs);

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

    console.log(response.content);
}
main();
