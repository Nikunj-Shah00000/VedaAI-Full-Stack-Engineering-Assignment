import { AssignmentDraft, AssessmentPaper } from "./types";

// Setup dynamic dates for realistic dashboard feed
const offsetDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const samplePhysicsPaper: AssessmentPaper = {
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  examTitle: "Unit Quiz: Principles of Electrolysis & Currents",
  subject: "Science / Physics",
  duration: "45 minutes",
  classGrade: "Grade 8",
  instructions: [
    "All questions are compulsory unless stated otherwise.",
    "Draw neat and proportional diagrams where necessary.",
    "The use of simple scientific calculators is permitted.",
    "Write your responses clearly on the provided sheets."
  ],
  totalMarks: 20,
  sections: [
    {
      sectionName: "Section A (Objective & True/False)",
      instruction: "Choose the single correct option or identify the veracity of the claim. Each question carries 1 mark.",
      questions: [
        {
          id: "p-q1",
          questionNo: 1,
          text: "Which electrolyte is commonly used for the commercial electroplating of copper onto steel keys?",
          type: "MCQ",
          options: [
            "Aqueous Copper Sulfate (CuSO4)",
            "Molten Sodium Chloride (NaCl)",
            "Dilute Hydrochloric Acid (HCl)",
            "Aqueous Sodium Hydroxide (NaOH)"
          ],
          difficulty: "Easy",
          marks: 1
        },
        {
          id: "p-q2",
          questionNo: 2,
          text: "What is the primary charge carrier inside an aqueous electrolyte fluid during electrical discharges?",
          type: "MCQ",
          options: [
            "Free electrons",
            "Positively and negatively charged ions",
            "Neutrons",
            "Positrons"
          ],
          difficulty: "Moderate",
          marks: 1
        },
        {
          id: "p-q3",
          questionNo: 3,
          text: "During the electrolysis of acidified water, pure oxygen gas is liberated specifically at the negatively charged cathode.",
          type: "TF",
          options: ["True", "False"],
          difficulty: "Moderate",
          marks: 1
        }
      ]
    },
    {
      sectionName: "Section B (Short Explanations)",
      instruction: "State brief technical terms and show structural diagrams if applicable. Each question carries 3 marks.",
      questions: [
        {
          id: "p-q4",
          questionNo: 4,
          text: "Define electroplating and outline two reasons why it is applied on metal artifacts in industrial manufacturing.",
          type: "Short",
          difficulty: "Easy",
          marks: 3
        },
        {
          id: "p-q5",
          questionNo: 5,
          text: "Why does pure water conduct electricity poorly, whereas the addition of a trace amount of sulfuric acid increases conductivity exponentially?",
          type: "Short",
          difficulty: "Moderate",
          marks: 3
        }
      ]
    },
    {
      sectionName: "Section C (Analytical Essay & Case Study)",
      instruction: "Provide detailed solutions and analytical breakdowns. Questions carry specified marks.",
      questions: [
        {
          id: "p-q6",
          questionNo: 6,
          text: "Detail the industrial preparation of sodium hydroxide, chlorine, and hydrogen via brine electrolysis (the Chlor-Alkali process). Write the complete chemical equations of the electrode reactions.",
          type: "Long",
          difficulty: "Challenging",
          marks: 5
        },
        {
          id: "p-q7",
          questionNo: 7,
          text: "Case Study on Electroplating:\n'A technician is commissioned to plate silver onto copper forks using standard laboratory currents. After starting the process, they notice that the silver coating is flaky, uneven, and peeling. Analyze how the source current magnitude and salt purification determine final plating adherence.'",
          type: "CaseStudy",
          difficulty: "Challenging",
          marks: 6
        }
      ]
    }
  ],
  answerKey: [
    {
      questionNo: 1,
      sectionName: "Section A (Objective & True/False)",
      answer: "Aqueous Copper Sulfate (CuSO4)",
      explanation: "Aqueous copper sulfate releases free Cu2+ ions which readily migrate to the cathode to form a smooth metallic layer."
    },
    {
      questionNo: 2,
      sectionName: "Section A (Objective & True/False)",
      answer: "Positively and negatively charged ions",
      explanation: "Electrolytes convey currents via free-roaming anions and cations, unlike metallic wires which rely on free electrons."
    },
    {
      questionNo: 3,
      sectionName: "Section A (Objective & True/False)",
      answer: "False",
      explanation: "Oxygen gas carries negative charges in the form of anions which migrate to the positive anode, while hydrogen is liberated at the negative cathode."
    },
    {
      questionNo: 4,
      sectionName: "Section B (Short Explanations)",
      answer: "Electroplating is the process of depositing a thin protective layer of a desirable metal onto another substance using electrical currents. Key reasons include: 1. Preventing corrosion or oxidation (e.g., chromium on iron). 2. Adding ornamental aesthetic value (e.g., gold/silver on jewelry).",
      explanation: "Full marks require naming core electrolytic parameters and citing two distinct benefits."
    },
    {
      questionNo: 5,
      sectionName: "Section B (Short Explanations)",
      answer: "Pure water lacks sufficient free-roaming charged particles (ions) to propagate a loop current because water molecules are covalently bonded. Adding dilute sulfuric acid triggers ion dissociation (H+ and SO4 2-), creating high-speed current carriers.",
      explanation: "Key terms to look for are 'dissociation of ions' and 'charge-carriers'."
    },
    {
      questionNo: 6,
      sectionName: "Section C (Analytical Essay & Case Study)",
      answer: "Anode (oxidation of chloride): 2Cl⁻ -> Cl₂ (g) + 2e⁻ \nCathode (reduction of water): 2H₂O + 2e⁻ -> H₂ (g) + 2OH⁻\nSodium ions aggregate with hydroxide in solution to form commercial NaOH. The three outputs are crucial for manufacturing bleach, soaps, and hydrochloric acid.",
      explanation: "Equations must balance with electrons correctly placed relative to reduction/oxidation criteria."
    },
    {
      questionNo: 7,
      sectionName: "Section C (Analytical Essay & Case Study)",
      answer: "Flaky plating suggests that the deposition current density was excessively high (causing chaotic silver precipitation) or that the fork substrate was not properly cleaned of grease or dirt, preventing atomic fusion.",
      explanation: "Look for mentions of current density adjustment and surface cleanliness."
    }
  ]
};

export const sampleMathPaper: AssessmentPaper = {
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  examTitle: "Algebra & Calculus Evaluation Paper",
  subject: "Advanced Mathematics",
  duration: "90 minutes",
  classGrade: "Grade 11",
  instructions: [
    "All questions are compulsory. Show detailed intermediate steps for analytical credit.",
    "Non-programmable calculators are allowed.",
    "Write in pen; drawings can be in pencil."
  ],
  totalMarks: 20,
  sections: [
    {
      sectionName: "Section I",
      instruction: "MCQ selection. 1 mark each.",
      questions: [
        {
          id: "m-q1",
          questionNo: 1,
          text: "Evaluate the limit of f(x) = (x^2 - 4) / (x - 2) as x approaches 2.",
          type: "MCQ",
          options: ["2", "4", "0", "Undefined"],
          difficulty: "Easy",
          marks: 1
        },
        {
          id: "m-q2",
          questionNo: 2,
          text: "What is the derivative of f(x) = e^(3x^2) with respect to x?",
          type: "MCQ",
          options: ["e^(3x^2)", "6x * e^(3x^2)", "3x * e^(3x^2)", "6 * e^(3x^2)"],
          difficulty: "Moderate",
          marks: 1
        }
      ]
    },
    {
      sectionName: "Section II",
      instruction: "Short Answer Calculus.",
      questions: [
        {
          id: "m-q3",
          questionNo: 3,
          text: "Calculate the indefinite integral of: ∫ (3x^2 - 4x + 5) dx.",
          type: "Short",
          difficulty: "Easy",
          marks: 3
        }
      ]
    }
  ],
  answerKey: [
    {
      questionNo: 1,
      sectionName: "Section I",
      answer: "4",
      explanation: "Factoring yields (x-2)(x+2)/(x-2) = x+2. Plugging in x=2 gives 2+2 = 4."
    },
    {
      questionNo: 2,
      sectionName: "Section I",
      answer: "6x * e^(3x^2)",
      explanation: "Applying the chain rule gives e^(3x^2) * d/dx(3x^2) = 6x * e^(3x^2)."
    },
    {
      questionNo: 3,
      sectionName: "Section II",
      answer: "x^3 - 2x^2 + 5x + C",
      explanation: "Core power rule integration. Don't omit the constant of integration C."
    }
  ]
};

export const initialDrafts: AssignmentDraft[] = [
  {
    id: "draft-1",
    title: "Unit Quiz: Principles of Electrolysis & Currents",
    subject: "Science / Physics",
    grade: "Grade 8",
    dueDate: offsetDate(3),
    instructions: "Attempt Section A immediately. Section B requires clean diagrams.",
    uploadedFile: { name: "electrolysis_lab_syllabus.pdf", size: "1.4 MB", type: "pdf" },
    questionConfig: { MCQ: 3, Short: 2, Long: 1, TF: 1, CaseStudy: 1 },
    aiSettings: {
      creativity: 0.35,
      bloomTaxonomy: "Understanding",
      language: "English",
      duration: "45 minutes",
      customPrompt: "Focus heavily on chemistry/physics connections."
    },
    createdAt: offsetDate(-1),
    status: "Generated",
    paper: samplePhysicsPaper
  },
  {
    id: "draft-2",
    title: "Mid-Term Advanced Calculus & Functions Exam",
    subject: "Advanced Mathematics",
    grade: "Grade 11",
    dueDate: offsetDate(7),
    instructions: "No textbooks permitted.",
    uploadedFile: null,
    questionConfig: { MCQ: 2, Short: 1, Long: 1, TF: 0, CaseStudy: 0 },
    aiSettings: {
      creativity: 0.2,
      bloomTaxonomy: "Applying",
      language: "English",
      duration: "90 minutes",
      customPrompt: "Include algebraic factoring questions."
    },
    createdAt: offsetDate(-4),
    status: "Generated",
    paper: sampleMathPaper
  },
  {
    id: "draft-3",
    title: "English Literary Analysis - Hamlet Act II",
    subject: "English Literature",
    grade: "Grade 10",
    dueDate: offsetDate(5),
    instructions: "Select core dialogues representing character degradation.",
    uploadedFile: { name: "hamlet_act_two_dialogues.txt", size: "45 KB", type: "txt" },
    questionConfig: { MCQ: 4, Short: 3, Long: 1, TF: 2, CaseStudy: 0 },
    aiSettings: {
      creativity: 0.5,
      bloomTaxonomy: "Analyzing",
      language: "English",
      duration: "60 minutes",
      customPrompt: "Include focus questions around Soliloquy themes."
    },
    createdAt: offsetDate(-6),
    status: "Draft"
  }
];

export const sampleActivityFeed = [
  { id: "act-1", type: "create", user: "John Doe", title: "Unit Quiz: Principles of Electrolysis", time: "2 hours ago" },
  { id: "act-2", type: "export", user: "John Doe", title: "Hamlet Volume Act Evaluation", format: "PDF", time: "1 day ago" },
  { id: "act-3", type: "create", user: "John Doe", title: "Algebra Basics Assessment", time: "3 days ago" },
  { id: "act-4", type: "edit", user: "John Doe", title: "Chemical Balancing Exam", time: "4 days ago" }
];
