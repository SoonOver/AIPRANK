require('dotenv').config();
const gemini = require('./provider/gemini');

async function test() {
  try {
    console.log('Testing Gemini with key:', process.env.GEMINI_API_KEY.slice(0, 5) + '...');
    const resp = await gemini.call('Halo, siapa ini?');
    console.log('Response:', resp);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
