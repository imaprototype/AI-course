// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
    CommaSeparatedListOutputParser,
    StringOutputParser,
    StructuredOutputParser,
} from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
    modelName: process.env.MODEL_VERSION!,
    temperature: 0.8,
    maxTokens: 700,
    verbose: true,
});

async function stringParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        "Write a short description of the following product: {product_name}"
    );

    const parser = new StringOutputParser();

    const chain = prompt.pipe(model).pipe(parser);

    const response = await chain.invoke({
        product_name: "bicycle",
    });

    console.log(response);
}

// stringParser();

async function commaSeparatedParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        "Provide 5 keywords for the following topic, separated by commas: {input_word}"
    );

    const parser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(parser);

    const response = await chain.invoke({
        input_word: "headless cms development",
    });

    console.log(response);
}

// commaSeparatedParser();

async function structuredParser() {
    const templatePrompt = ChatPromptTemplate.fromTemplate(
        `Analyse the following phrase.
        Formatting instructions: {format_instructions}
        Phrase: {phrase}
        `
    );

    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "name of the person, if given",
        likes: "hobbies, what the person likes",
    });

    const chain = templatePrompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
        format_instructions: outputParser.getFormatInstructions(),
        phrase: `Lorena Romero es SEO Manager de Puma Europa. Actualmente dirige el SEO del dominio eu.puma.com, que consta de 27 países en 7 idiomas diferentes. Además, es profesora en el máster de marketing digital y el máster SEO/SEM en IEM Digital Business School. Cuenta con 7 años de experiencia en SEO, habiendo trabajado tanto en consultoría/agencia como in-house. Actualmente está especializada en SEO para ecommerce.`,
    });

    console.log(response);
}

structuredParser();
