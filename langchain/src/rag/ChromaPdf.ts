import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Chroma } from "@langchain/community/vectorstores/chroma";

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
        separators: [`\n`],
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Store data
    const vectorStore = await Chroma.fromDocuments(splitDocs, new OpenAIEmbeddings(), {
        collectionName: "books",
        url: "http://localhost:8000",
    });

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
