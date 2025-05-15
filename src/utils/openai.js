import { OPENAI_API_KEY } from '@env';
console.log('KEY:', OPENAI_API_KEY); 
export async function fetchCompletion(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      Authorization:`Bearer ${OPENAI_API_KEY}`
    },
    body:JSON.stringify({
      model:'gpt-3.5-turbo',
      messages:[{role:'system',content:'親切な旅行プランナーです。'},{role:'user',content:prompt}],
      temperature:0.7,
      max_tokens:50
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message);
  return data.choices[0].message.content;
}
