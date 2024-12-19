import OpenAI from "openai";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
	OPEN_AI_KEY: string;
	AI: Ai;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	'/*',
	cors({
		origin: '*', // Allow request from nextjs
		allowHeaders: [
			'X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'
		], // Add Content-Type to the allowed headers to fix CORS
		allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true
	})
);

app.post('/translateDocument', async (c) => {
	const { documentData, targetLang } = await c.req.json();

	//* Generate summary of the doc
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	//* Translate to different language
	const response = c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'english',
    target_lang: targetLang
	});

	return new Response(JSON.stringify(response));
});

export default app;
