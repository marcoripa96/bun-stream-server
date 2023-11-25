import { readdir, readFile } from "node:fs/promises";
import { getRandomElement } from "./utils";
import { WordTokenizer } from "natural";
import path from "path";
import Stream from "@elysiajs/stream";

type StreamFileProps = {
    type: "code" | "markdown" | "txt";
    tokensDelay?: number;
    format?: "json" | "text";
};

export function tokenize(text: string) {
    const tokenizer = new WordTokenizer();
    return tokenizer.tokenize(text);
}

export function formatToken(token: string, format: "json" | "text") {
    return format === "json" ? JSON.stringify({ token }) : token;
}

export async function* streamFile({
    type,
    tokensDelay = 200,
    format = "json",
}: StreamFileProps) {
    const filesPath = path.join(import.meta.dir, "/stream-files", type);
    // read files in the type directory
    const fileNames = await readdir(filesPath);
    // grab a file based on type

    // Bun.file().text() seems to not work atm, it crashes the application possible issue https://github.com/oven-sh/bun/issues/5960
    // const fileContent = Bun.file(path.join(filesPath, getRandomElement(fileNames) || '')).text();
    // for now use node apis
    const fileContent = await readFile(
        path.join(filesPath, getRandomElement(fileNames) || ""),
        { encoding: "utf-8" }
    );

    // tokenize it
    const tokens = tokenize(fileContent) || [];

    for (const token of tokens) {
        await Bun.sleep(tokensDelay);
        yield formatToken(token, format);
    }
}

export function sseStreamResponse(props: StreamFileProps) {
    return new Stream(streamFile(props));
}

export function streamResponse(props: StreamFileProps) {
    return new Response(
        new ReadableStream({
            async pull(controller) {
                for await (const token of streamFile(props)) {
                    controller.enqueue(token);
                }

                controller.close();
            },
        })
    );
}
