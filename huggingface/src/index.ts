import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_TOKEN);

async function embed() {
    const output = await inference.featureExtraction({
        model: "microsoft/codebert-base",
        inputs: "My Cool Embeddings",
    });
    console.log("output:", output);
}

// embed();

async function translate() {
    const output = await inference.translation({
        model: "facebook/nllb-200-distilled-600M",
        inputs: "How are you?",
        // @ts-ignore
        parameters: {
            src_lang: "eng-Latn",
            tgt_lang: "spa-Latn",
        },
    });
    console.log("output:", output);
}

translate();
