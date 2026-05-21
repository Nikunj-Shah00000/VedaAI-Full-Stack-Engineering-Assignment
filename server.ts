import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;

// Initialize Gemini SDK lazily for stability as requested in guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Mock Database / Queues for DevOps Live Monitor (Bonus Screen)
// -------------------------------------------------------------
const devOpsStats = {
  queue: {
    active: 0,
    waiting: 2,
    completed: 48,
    failed: 1,
  },
  redis: {
    status: "healthy",
    memoryUsageBytes: 15600890, // 14.8 MB
    cpuUsagePercent: 0.8,
    keysCount: 245,
    hitRatePercent: 94.2,
  },
  mongodb: {
    status: "connected",
    dbSizeBytes: 421098870, // 401.5 MB
    documentsCount: 1420,
    activeConnections: 6,
    avgQueryMs: 12,
  },
  workers: [
    { id: "worker-1", name: "Paper Generator Worker Core-1", status: "idle", busyTimeMs: 142080, jobsProcessed: 32 },
    { id: "worker-2", name: "PDF Compiler Express-Worker", status: "idle", busyTimeMs: 89040, jobsProcessed: 17 },
  ],
  websockets: {
    activeConnections: 3,
    messagesCount: 12240,
  }
};

// API Endpoint to get Stats (Polled by DevOps Admin panel)
app.get("/api/admin/metrics", (req, res) => {
  // Add slight random fluctuations to simulate a real-time monitor
  const activeJobs = Math.random() > 0.8 ? 1 : 0;
  const waitingJobs = Math.max(0, devOpsStats.queue.waiting + (Math.random() > 0.85 ? 1 : (Math.random() > 0.85 ? -1 : 0)));
  const completedJobs = devOpsStats.queue.completed + (activeJobs > 0 && Math.random() > 0.9 ? 1 : 0);
  
  const hitRate = Math.min(100, Math.max(80, devOpsStats.redis.hitRatePercent + (Math.random() - 0.5) * 0.4));
  const activeConns = Math.max(1, devOpsStats.websockets.activeConnections + (Math.random() > 0.9 ? 1 : (Math.random() > 0.9 ? -1 : 0)));
  
  res.json({
    queue: {
      ...devOpsStats.queue,
      active: activeJobs,
      waiting: waitingJobs,
      completed: completedJobs,
    },
    redis: {
      ...devOpsStats.redis,
      hitRatePercent: parseFloat(hitRate.toFixed(1)),
      memoryUsageBytes: devOpsStats.redis.memoryUsageBytes + Math.floor((Math.random() - 0.5) * 500),
    },
    mongodb: {
      ...devOpsStats.mongodb,
      avgQueryMs: Math.max(5, devOpsStats.mongodb.avgQueryMs + Math.floor((Math.random() - 0.5) * 4)),
    },
    workers: devOpsStats.workers.map((w, index) => {
      const isBusy = activeJobs > 0 && index === 0;
      return {
        ...w,
        status: isBusy ? "processing" : "idle",
        jobsProcessed: w.jobsProcessed + (isBusy && Math.random() > 0.95 ? 1 : 0)
      };
    }),
    websockets: {
      ...devOpsStats.websockets,
      activeConnections: activeConns,
    }
  });
});

// -------------------------------------------------------------
// Real AI Paper Generator Endpoint
// -------------------------------------------------------------
app.post("/api/generate_paper", async (req, res) => {
  const {
    title,
    subject,
    grade,
    instructions,
    questionConfig,
    aiSettings,
    uploadMaterialName,
    uploadMaterialText
  } = req.body;

  // Simple validation
  const assessmentTitle = title || "Terminal Examination";
  const assessmentSubject = subject || "General Studies";
  const assessmentGrade = grade || "10th Grade";
  const extraInstructions = instructions || "";
  
  const countMCQ = questionConfig?.MCQ || 0;
  const countShort = questionConfig?.Short || 0;
  const countLong = questionConfig?.Long || 0;
  const countTF = questionConfig?.TF || 0;
  const countCaseStudy = questionConfig?.CaseStudy || 0;

  const school = "Delhi Public School, Sector-4, Bokaro";

  // Check if API key is provided
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (!hasApiKey) {
    console.warn("GEMINI_API_KEY is missing. Providing premium simulated fallback response.");
    // Wait standard mock latency to simulate a premium pipeline
    await new Promise((r) => setTimeout(r, 2000));
    return res.json({
      success: true,
      simulated: true,
      paper: generateSimulatedPaper({
        school,
        title: assessmentTitle,
        subject: assessmentSubject,
        grade: assessmentGrade,
        questionConfig,
        extraInstructions
      })
    });
  }

  try {
    const ai = getGeminiClient();

    // Dynamically calculate approximate marks or weights if none set
    const totalQuestions = countMCQ + countShort + countLong + countTF + countCaseStudy;
    
    // Prepare prompt
    const prompt = `
      You are an expert curriculum designer and senior school principal. Write a highly professional, formatted examination paper matching standard educational guidelines (CBSE/ICSE/Common Core) in English.
      
      Details for the Exam:
      - School Name: ${school}
      - Exam Title: ${assessmentTitle}
      - Subject: ${assessmentSubject}
      - Class/Grade: ${assessmentGrade}
      - Extra instructions: ${extraInstructions}
      - Target Exam Duration: ${aiSettings?.duration || "90 minutes"}
      
      Questions requested of each type:
      * Multiple Choice Questions (MCQ): ${countMCQ} questions.
      * Short Answer Questions: ${countShort} questions.
      * Long Answer Questions: ${countLong} questions.
      * True or False Questions: ${countTF} questions.
      * Case Study Questions: ${countCaseStudy} questions.

      Bloom's Taxonomy priority: ${aiSettings?.bloomTaxonomy || "Any"}
      Difficulty balance priority: ${aiSettings?.difficultyDistribution || "Equally Balanced (33% Easy, 34% Moderate, 33% Challenging)"}
      
      ${uploadMaterialName ? `Use this reference material uploaded by the teacher as context for the questions if relevant: "${uploadMaterialName}". Content summary provided: "${uploadMaterialText || 'No plain text extracted, use the file topic: ' + uploadMaterialName}"` : ''}

      You MUST respond with a JSON object exactly adhering to the schemas specified below. Do not include markdown codeblocks outside the JSON itself or prefix/suffix. The structure must be a complete JSON object.

      === Schema of Expected JSON JSON object ===
      {
        "schoolName": "${school}",
        "examTitle": "${assessmentTitle}",
        "subject": "${assessmentSubject}",
        "duration": "${aiSettings?.duration || '90 minutes'}",
        "classGrade": "${assessmentGrade}",
        "instructions": [
          "Attempt all sections.",
          "Write neatly and explain all terms clearly.",
          "Draw diagrams where applicable."
        ],
        "sections": [
          {
            "sectionName": "Section A",
            "instruction": "Multiple Choice Questions or Short Items.",
            "questions": [
              {
                "id": "q-1",
                "questionNo": 1,
                "text": "What is ...?",
                "type": "MCQ",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "difficulty": "Easy",
                "marks": 1
              }
            ]
          }
        ],
        "answerKey": [
          {
            "questionNo": 1,
            "sectionName": "Section A",
            "answer": "Option A",
            "explanation": "Because..."
          }
        ]
      }

      Generate appropriate questions with matching difficulty. Ensure that MCQs have 4 distinct structured choices. Make case studies provide a small reading passage (1 paragraph) and and follow-up sub-questions inside the question text or a distinct case description. Keep questions highly educational, specific to Grade/Class ${assessmentGrade}, and scientifically accurate.
    `;

    // Make request using the modern Gemini SDK wrapper
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: aiSettings?.creativity !== undefined ? Number(aiSettings.creativity) : 0.4,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response returned from Gemini.");
    }

    const parsedPaper = JSON.parse(text);
    return res.json({
      success: true,
      simulated: false,
      paper: parsedPaper
    });

  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unknown error generating questions via Gemini",
      fallback: generateSimulatedPaper({
        school,
        title: assessmentTitle,
        subject: assessmentSubject,
        grade: assessmentGrade,
        questionConfig,
        extraInstructions
      })
    });
  }
});

// Helper function to generate simulated high-quality paper if Key/Credits are missing
function generateSimulatedPaper(params: any): any {
  const { title, subject, grade, school, questionConfig, extraInstructions, aiSettings } = params;

  // Provide realistic questions matching the subject if they chose a common one
  const isScience = /science|physic|chem|biol|electric/i.test(subject);
  const isEnglish = /english|lit|read|grammar/i.test(subject);
  const isMath = /math|algebra|geometry|calculus/i.test(subject);

  // Fallback defaults
  let mcqs = [
    {
      id: "q-1",
      questionNo: 1,
      text: "Which of the following processes requires energy to move substances against a concentration gradient?",
      type: "MCQ",
      options: ["Active Transport", "Simple Diffusion", "Facilitated Diffusion", "Osmosis"],
      difficulty: "Moderate",
      marks: 1
    },
    {
      id: "q-2",
      questionNo: 2,
      text: "Identify the element with the highest electrical conductivity under standard laboratory conditions.",
      type: "MCQ",
      options: ["Copper", "Silicon", "Silver", "Gold"],
      difficulty: "Easy",
      marks: 1
    },
    {
      id: "q-3",
      questionNo: 3,
      text: "What will happen to the current flowing in a circuit if resistance is doubled while voltage is held constant?",
      type: "MCQ",
      options: ["Current is doubled", "Current is halved", "Current remains unchanged", "Current is quadrupled"],
      difficulty: "Challenging",
      marks: 1
    }
  ];

  let shorts = [
    {
      id: "q-4",
      questionNo: 4,
      text: "Define electroplating. Explain its main industrial application in the modern electronics industry.",
      type: "Short",
      difficulty: "Easy",
      marks: 3
    },
    {
      id: "q-5",
      questionNo: 5,
      text: "Explain the functional difference between an electric motor and an electric generator in terms of energy transformation.",
      type: "Short",
      difficulty: "Moderate",
      marks: 3
    }
  ];

  let longs = [
    {
      id: "q-6",
      questionNo: 6,
      text: "Detail the step-by-step electrolysis of brine (the Chlor-Alkali process). Write the complete chemical equations for reactions occurring at the cathode and anode, and discuss the primary applications of the three commercial products generated.",
      type: "Long",
      difficulty: "Challenging",
      marks: 5
    }
  ];

  let tfs = [
    {
      id: "q-7",
      questionNo: 7,
      text: "Water is oxidized at the anode in the electrolysis of water to produce hydrogen gas.",
      type: "TF",
      options: ["True", "False"],
      difficulty: "Moderate",
      marks: 1
    }
  ];

  let cases = [
    {
      id: "q-8",
      questionNo: 8,
      text: "Case Study on Renewable Electricity:\n\n'In a hybrid community local microgrid, photovoltaic solar panels generate direct current (DC) during daylight hours. To supply power for alternating current (AC) home appliances and battery banks, an inverter system performs bidirectional electrical power rectification. On a particularly hot summer afternoon, peak thermal loads increase building conditioning drafts, triggering an alert on the system controller.'\n\nBased on this system, determine:\n1. Why must the solar voltage be regulated prior to energy storing?\n2. What primary role does the inverter play during night-time grid discharges?",
      type: "CaseStudy",
      difficulty: "Challenging",
      marks: 5
    }
  ];

  if (isMath) {
    mcqs = [
      {
        id: "q-1",
        questionNo: 1,
        text: "Determine the vertex of the quadratic function defined by f(x) = 2x^2 - 8x + 5.",
        type: "MCQ",
        options: ["(2, -3)", "(-2, 29)", "(4, 5)", "(2, 5)"],
        difficulty: "Moderate",
        marks: 1
      },
      {
        id: "q-2",
        questionNo: 2,
        text: "What is the limit of (sin x) / x as x approaches 0?",
        type: "MCQ",
        options: ["0", "1", "Infinity", "Undefined"],
        difficulty: "Easy",
        marks: 1
      }
    ];
    shorts = [
      {
        id: "q-3",
        questionNo: 3,
        text: "Solve the following system of linear equations using matrix row-reduction (Gaussian Elimination):\n 3x + 2y = 12\n 5x - y = 7",
        type: "Short",
        difficulty: "Moderate",
        marks: 3
      }
    ];
    longs = [
      {
        id: "q-4",
        questionNo: 4,
        text: "State the Fundamental Theorem of Calculus. First, use it to evaluate the definite integral of f(x) = 3x^2 - 4x + 1 from x=1 to x=3. Then, geometrically interpret this result with regard to area boundaries.",
        type: "Long",
        difficulty: "Challenging",
        marks: 6
      }
    ];
  } else if (isEnglish) {
    mcqs = [
      {
        id: "q-1",
        questionNo: 1,
        text: "Identify the literary device used in the line: 'The wind whispered secrets through the ancient pines.'",
        type: "MCQ",
        options: ["Metaphor", "Personification", "Alliteration", "Simile"],
        difficulty: "Easy",
        marks: 1
      }
    ];
    shorts = [
      {
        id: "q-2",
        questionNo: 2,
        text: "Analyze the tone in Hamlet's famous soliloquy 'To be or not to be' and identify how it reflects his character development.",
        type: "Short",
        difficulty: "Challenging",
        marks: 4
      }
    ];
  }

  // Filter or augment based on actual counts selected
  const sections: any[] = [];
  const answerKeys: any[] = [];
  let currentSecId = "A";

  const numMCQ = questionConfig?.MCQ || 3;
  const numTF = questionConfig?.TF || 1;
  const numShort = questionConfig?.Short || 2;
  const numLong = questionConfig?.Long || 1;
  const numCase = questionConfig?.CaseStudy || 1;

  let globalQNum = 1;

  // Section A - Objective
  const activeMCQs = Array.from({ length: numMCQ }, (_, i) => {
    const defaultTemplate = mcqs[i % mcqs.length];
    return {
      ...defaultTemplate,
      id: `q-${globalQNum}`,
      questionNo: globalQNum++
    };
  });
  const activeTFs = Array.from({ length: numTF }, (_, i) => {
    const defaultTemplate = tfs[i % tfs.length];
    return {
      ...defaultTemplate,
      id: `q-${globalQNum}`,
      questionNo: globalQNum++
    };
  });

  const objSectionQs = [...activeMCQs, ...activeTFs];
  if (objSectionQs.length > 0) {
    sections.push({
      sectionName: "Section A (Objective Type Questions)",
      instruction: "Write the letter of the correct option on your answer key sheets. Each question carries 1 mark.",
      questions: objSectionQs
    });
    objSectionQs.forEach(q => {
      answerKeys.push({
        questionNo: q.questionNo,
        sectionName: "Section A (Objective Type Questions)",
        answer: q.type === "MCQ" ? q.options[0] : "True",
        explanation: "This response is supported by standard course curricula definitions and syllabus criteria."
      });
    });
  }

  // Section B - Short
  const activeShorts = Array.from({ length: numShort }, (_, i) => {
    const defaultTemplate = shorts[i % shorts.length];
    return {
      ...defaultTemplate,
      id: `q-${globalQNum}`,
      questionNo: globalQNum++
    };
  });

  if (activeShorts.length > 0) {
    sections.push({
      sectionName: "Section B (Short Answer Questions)",
      instruction: "Attempt all questions in 50-80 words. Support with neat diagrams where relevant.",
      questions: activeShorts
    });
    activeShorts.forEach(q => {
      answerKeys.push({
        questionNo: q.questionNo,
        sectionName: "Section B (Short Answer Questions)",
        answer: "Detailed answer evaluating key definitions and presenting sequential points with explanatory factors.",
        explanation: "Standard grading rubric: 1 mark for core definition, 1 mark for explanation, 1 mark for correct technical drawing or example."
      });
    });
  }

  // Section C - Long & Case Study
  const activeLongs = Array.from({ length: numLong }, (_, i) => {
    const defaultTemplate = longs[i % longs.length];
    return {
      ...defaultTemplate,
      id: `q-${globalQNum}`,
      questionNo: globalQNum++
    };
  });
  const activeCases = Array.from({ length: numCase }, (_, i) => {
    const defaultTemplate = cases[i % cases.length];
    return {
      ...defaultTemplate,
      id: `q-${globalQNum}`,
      questionNo: globalQNum++
    };
  });

  const subLongQs = [...activeLongs, ...activeCases];
  if (subLongQs.length > 0) {
    sections.push({
      sectionName: "Section C (Analytical & Long Format Questions)",
      instruction: "Attempt all questions. Explain thoroughly to optimize grading credentials.",
      questions: subLongQs
    });
    subLongQs.forEach(q => {
      answerKeys.push({
        questionNo: q.questionNo,
        sectionName: "Section C (Analytical & Long Format Questions)",
        answer: q.type === "CaseStudy" 
          ? "1. Regulating solar voltage prevents batteries from experiencing thermal runaway. 2. At night, discharging requires DC-to-AC inversion for residential supply compatibility."
          : "Complete multi-paragraph logical sequence detailing mechanisms, balance states, and reaction formulas.",
        explanation: "Requires precise keywords and formatted formulas for full credit."
      });
    });
  }

  // Calculate full total marks
  const totalCalculatedMarks = sections.reduce((total, s) => {
    return total + s.questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
  }, 0);

  return {
    schoolName: school,
    examTitle: title,
    subject,
    duration: aiSettings?.duration || "90 minutes",
    classGrade: grade,
    instructions: [
      "All questions are compulsory and carry specified marks.",
      "Read each prompt carefully prior to formulating answers.",
      "The use of simple scientific calculators is permitted.",
      "Keep answer presentations highly organized, clear, and clean.",
      ...(extraInstructions ? [extraInstructions] : [])
    ],
    sections,
    answerKey: answerKeys,
    totalMarks: totalCalculatedMarks
  };
}

// -------------------------------------------------------------
// Vite and Statics Integration Middleware setup
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, mount Vite middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static assets from `dist`
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VedaAI Server listening at http://localhost:${PORT}`);
    console.log(`Current operating environment: ${process.env.NODE_ENV || "development"}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server failure on boot:", err);
});
