// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.8,
    maxTokens: 700,
    verbose: true,
});

async function fromTemplate() {
    const prompt = ChatPromptTemplate.fromTemplate(
        "Write a short description of the following product: {product_name}"
    );
    // const wholePrompt = await prompt.format({
    //     product_name: "bicycle",
    // });
    // console.log(wholePrompt);

    // Creating a chain and connecting the model with the prompt
    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        product_name: "bicycle",
    });
    console.log(response.content);
}

// fromTemplate();

async function fromMessages() {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Write a short description of the following product provided by the user"],
        ["human", "{product_name}"],
    ]);
    // const wholePrompt = await prompt.format({
    //     product_name: "bicycle",
    // });
    // console.log(wholePrompt);

    // Creating a chain and connecting the model with the prompt
    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        product_name: "bicycle",
    });
    console.log(response.content);
}

fromMessages();
