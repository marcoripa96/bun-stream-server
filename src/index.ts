import { Elysia, t } from "elysia";
import { sseStreamResponse, streamResponse } from "./streamFile";
import { isStringBoolean } from "./utils";
import { swagger } from "@elysiajs/swagger";

new Elysia()
    .use(swagger())
    .get(
        "/stream",
        ({
            query: {
                type = "txt",
                tokensDelay = 200,
                format = "json",
                sse = false,
            },
        }) =>
            sse
                ? sseStreamResponse({ type, tokensDelay, format })
                : streamResponse({ type, tokensDelay, format }),
        {
            query: t.Object({
                type: t.Optional(
                    t.Enum(
                        {
                            code: "code",
                            markdown: "markdown",
                            txt: "txt",
                        },
                        {
                            default: "txt",
                            description:
                                "The type of the content of the file. It can either be code (as markdown), markdown (text) or txt.",
                        }
                    )
                ),
                tokensDelay: t.Optional(
                    t.Numeric({
                        default: 200,
                        description:
                            "The delay in milliseconds between each token.",
                    })
                ),
                format: t.Optional(
                    t.Enum(
                        {
                            json: "json",
                            text: "text",
                        },
                        {
                            default: "json",
                            description:
                                "The format of the response of each token.",
                        }
                    )
                ),
                sse: t.Optional(t.Boolean({ default: false })),
            }),
            transform({ query }) {
                query.sse = isStringBoolean("" + query.sse);
            },
        }
    )
    .get("/test", async () => {
        const es = new EventSource("http://localhost:3002/stream");
        es.addEventListener("message", (event) => {
            if (event) {
                console.log(event);
            }
        });
        // const response = await fetch("http://localhost:3002/stream");
        // const reader = response.body.getReader();
        // const decoder = new TextDecoder();
        // while (true) {
        //     const { done, value } = await reader.read();
        //     if (done) {
        //         // Do something with last chunk of data then exit reader
        //         return;
        //     }
        //     console.log(decoder.decode(value));
        //     // Otherwise do something here to process current chunk
        // }
    })
    .listen(3002);
