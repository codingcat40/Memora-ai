require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// deepseek r1
module.exports.callDeepSeek = async (prompt, role) => {
  const stream = await client.chat.completions.create({
    model: "tngtech/deepseek-r1t2-chimera:free",
    messages: [
      { 
        role: ['user', 'system', 'assistant'].includes(role) ? role : 'system', 
        content: prompt
    }
    ],
    stream: true,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      fullText += content;
    }
  }

  return fullText;
};


// meta llma
module.exports.callLLama = async (prompt, role) => {

const stream = await client.chat.completions.create({
    model: "meta-llama/llama-3.2-3b-instruct:free",
    messages: [
        {
            role: ['system', 'user', 'assistant'].includes(role) ? role : 'user',
            content: prompt,
        }
    ],
    stream: true
})

let fullText = "";
for await (const chunk of stream){
    const content = chunk.choices[0]?.delta?.content;
    if(content){
        fullText += content
    }
}
    return fullText;
}


// gpt-4
module.exports.callOpenAI = async (prompt, role = "user") => {

  const safeRole = ["system", "user", "assistant"].includes(role)
    ? role
    : "user";

  const stream = await client.chat.completions.create({
    model: "openai/gpt-oss-120b:free",
    messages: [
      {
        role: safeRole,
        content: prompt,
      },
    ],
    stream: true,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      fullText += content;
    }
  }

  return fullText;
};
