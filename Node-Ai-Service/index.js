require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

//package export for faq endpoint
const cosineSimilarity = require('cosine-similarity');
const { CohereClient } = require("cohere-ai");

//package export for extract endpoint
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const {jsonrepair} =require("jsonrepair")
const upload = multer({ dest: "uploads/" });


//initializing the Cohere AI client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

//Express application instance
const app = express();

//register middleware functions in our Express app.
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


//load faq
let faqData = [];
async function loadFaqs() {
    try {
      const res = await axios.get(`${process.env.RAILS_API_URL}`);
      const faqs = res.data;
  
      if (!faqs.length) {
        console.warn("No FAQs found in API response.");
        return;
      }
  
      const questions = faqs.map(faq => faq.question);
  
      const embeddings = await cohere.embed({
        texts: questions,
        model: 'embed-english-v3.0',
        input_type: 'search_document'
      });
      
  
      if (!embeddings.body || !embeddings.body.embeddings) {
        // console.error("Embedding response is invalid:", embeddings);
        return;
      }
  
      faqData = faqs.map((faq, i) => ({
        ...faq,
        embedding: embeddings.body.embeddings[i]
      }));
  
      console.log(`Loaded ${faqData.length} FAQs with embeddings.`);
    } catch (err) {
      console.error("Error loading FAQs:", err);
    }
}

//faq endpoint
app.post('/faq-chat', async (req, res) => {
    const userQuestion = req.body.question?.trim();

    if (!userQuestion) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        const userEmbedRes = await cohere.embed({
            texts: [userQuestion],
            model: 'embed-english-v3.0',
            input_type: 'search_query'
        });


        // Directly check for embeddings
        const userEmbedding = userEmbedRes.embeddings?.[0];  // Embedding of the user question

        if (!userEmbedding) {
            throw new Error('Embedding failed: No embeddings returned from Cohere');
        }


        // Find top 3 FAQs using cosine similarity
        const scored = faqData.map(faq => ({
            faq,
            score: cosineSimilarity(userEmbedding, faq.embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

        const topFaqsText = scored.map(item =>
            `Q: ${item.faq.question}\nA: ${item.faq.answer}`
        ).join('\n\n');

        const prompt = `You are a helpful assistant for TalentTest.Your name is Shady means who give protection from problems. Answer questions only using the FAQs below. If the answer is not found, say "I don't know. Please contact support."\n\n${topFaqsText}\n\nUser Question: ${userQuestion}\nAnswer:`;

        const chatRes = await cohere.generate({
            model: 'command-xlarge', // Try using a different model
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.5
        });


        if (chatRes && chatRes.generations && chatRes.generations[0] && chatRes.generations[0].text) {
            res.json({ answer: chatRes.generations[0].text });
        } else {
            console.error("Invalid response format:", chatRes);
            res.status(500).json({ error: "Invalid response format from Cohere API" });
        }

    } catch (error) {
        console.error("Error in /faq-chat:", error);
        res.status(500).json({ error: "Something went wrong" });
        }
});

//extract endpoint
app.post("/extract", upload.single("file"), async (req, res) => {
  const file = req.file;

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    let extractedText = "";

    if (ext === ".pdf") {
      const data = await pdfParse(fs.readFileSync(file.path));
      extractedText = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: file.path });
      extractedText = result.value;
    } else if (ext === ".csv") {
      const rows = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => {
          // Send CSV rows to Cohere or format directly
          processWithCohere(JSON.stringify(rows), res);
        });
      return;
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    // Clean up
    fs.unlinkSync(file.path);

    // await processWithCohere(extractedText, res);
    const words = extractedText.split(/\s+/);
    const truncatedText = words.slice(0, 800).join(' ');
    // console.log(truncatedText)
    await processWithCohere(truncatedText, res);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process file." });
  }
});

async function processWithCohere(text, res) {
  const prompt = `You are an AI assistant that extracts structured test questions from text. Make sure your JSON is complete and valid. Input:${text} Output format (JSON):
  {
    "title": "Test Title",
    "description": "Optional description",
    "duration": 60,
    "questions": [
      {
        "content": "Question text",
        "question_type": "MCQ or MSQ or Theoreticaly",
        "option_A": "option text",
        "option_B": "option text",
        "option_C": "option text",
        "option_D": "option text",
        "correct_option": "A or A,B",
        "marks": 1,
        "tags": "topic1,topic2"
      }
    ]
  }
  `;

  // const response = await cohere.generate({
  //   model: "command-r-plus",
  //   prompt,
  //   max_tokens: 2000,
  //   temperature: 0.5,
  // });
  const chatRes = await cohere.chat({
      model: 'command-r',
      message: prompt,
      temperature: 0.5,
      max_tokens: 2000,
  });


  // try {
  //   const repaired = jsonrepair(response.generations[0].text)
  //   const result = JSON.parse(repaired);
  //   res.json(result);
  // } catch (e) {
  //   console.error("Cohere JSON parse error:", e);
  //   res.status(500).json({ error: "Failed to parse AI output." });
  // }

  try {
    const aiRaw = chatRes.text;
    const repaired = jsonrepair(aiRaw); // Repair malformed JSON if needed
    const result = JSON.parse(repaired); // Parse into JS object
    res.json(result); // Send clean structured data
  } catch (err) {
    console.error("Failed to parse AI output:", err);
    res.status(500).json({ error: "Invalid AI output" });
  }
}

//ai answer check
app.post('/evaluate-theoretical', async (req, res) => {
  const questions = req.body.questions;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid input. Expected array of questions.' });
  }

  try {
    const results = [];

    for (const q of questions) {
      const { question_id, question, expected, given, marks: max_marks } = q;

      if (!given || given.trim() === "") {
        results.push({
          question_id,
          marks_awarded: 0,
          max_marks,
          given,
        });
        continue;
      }

      const prompt = `
You are an exam evaluator. Your job is to grade a student's answer based on the expected answer.

Question: ${question}
Expected Answer: ${expected}
Student's Answer: ${given}
Maximum Marks: ${max_marks}

Give a score between 0 and ${max_marks} based on how well the student's answer matches the expected answer. 
Only return the score as a number. Do not explain.
`;

      const response = await cohere.generate({
        model: 'command-r-plus', //
        prompt,
        max_tokens: 10,
        temperature: 0.3,
      });

      const rawScore = response.generations[0].text.trim();
      const numericScore = Math.min(Math.max(parseFloat(rawScore), 0), max_marks);

      results.push({
        question_id,
        marks_awarded: isNaN(numericScore) ? 0 : Math.round(numericScore),
        max_marks,
        given,
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Cohere AI Error:', error);
    res.status(500).json({ error: 'Failed to evaluate answers using AI.' });
  }
});

app.get('/', (req, res) => {
  res.send('FAQ AI server is running.');
});

app.listen(4000, async () => {
  console.log("FAQ AI server running on port 4000");
  await loadFaqs();
});