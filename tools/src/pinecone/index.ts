import { Pinecone } from "@pinecone-database/pinecone";
import { IncomingMessage } from "http";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

async function createIndex(indexName: string) {
    await pc.createIndex({
        name: indexName,
        dimension: 1536, // Replace with your model dimensions
        metric: "cosine", // Replace with your model metric
        spec: {
            serverless: {
                cloud: "aws",
                region: "us-east-1",
            },
        },
    });
}

async function listIndexes() {
    const result = await pc.listIndexes();
    console.log(result);
}

function getIndex(indexName: string) {
    const index = pc.index(indexName);
    return index;
}

async function createNamespace(indexName: string, namespaceName: string) {
    const index = getIndex(indexName);
    const namespace = index.namespace(`${indexName}_${namespaceName}`);
    console.log(namespace);
}

function generateNumberArray(length: number) {
    return Array.from({ length }, () => Math.random());
}

async function upsertVectors(indexName: string) {
    const embedding = generateNumberArray(1536);
    const index = getIndex(indexName);
    const upsertResult = await index.upsert([
        {
            id: "id-1",
            values: embedding,
            metadata: {
                coolness: 3,
                reference: "abcd",
            },
        },
    ]);
}

async function queryVectors(indexName: string) {
    const index = getIndex(indexName);
    const result = await index.query({
        id: "id-1",
        topK: 1,
        includeMetadata: true,
    });
    console.log(result);
}

async function main() {
    const indexName = "quickstart2";
    // await createIndex(indexName);
    // listIndexes();
    // getIndex(indexName);
    // createNamespace(indexName, "test1");
    // await upsertVectors(indexName);
    await queryVectors(indexName);
}
main();
