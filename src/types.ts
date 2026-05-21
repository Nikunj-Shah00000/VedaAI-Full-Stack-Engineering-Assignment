/**
 * VedaAI - Core TypeScript Interfaces
 */

export interface Question {
  id: string;
  questionNo: number;
  text: string;
  type: "MCQ" | "Short" | "Long" | "TF" | "CaseStudy";
  options?: string[]; // For MCQ or True/False
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
}

export interface Section {
  sectionName: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerItem {
  questionNo: number;
  sectionName: string;
  answer: string;
  explanation?: string;
}

export interface AssessmentPaper {
  schoolName: string;
  examTitle: string;
  subject: string;
  duration: string;
  classGrade: string;
  instructions: string[];
  sections: Section[];
  answerKey: AnswerItem[];
  totalMarks: number;
}

export interface QuestionConfig {
  MCQ: number;
  Short: number;
  Long: number;
  TF: number;
  CaseStudy: number;
}

export interface AISettings {
  creativity: number; // 0.1 to 1.0 (temperature)
  bloomTaxonomy: "Remembering" | "Understanding" | "Applying" | "Analyzing" | "Evaluating" | "Creating" | "Any";
  language: string;
  duration: string;
  customPrompt: string;
}

export interface UploadedFile {
  name: string;
  size: string;
  type: string;
  content?: string;
}

export interface AssignmentDraft {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  instructions: string;
  uploadedFile: UploadedFile | null;
  questionConfig: QuestionConfig;
  aiSettings: AISettings;
  createdAt: string;
  status: "Draft" | "Generated" | "Generating";
  paper?: AssessmentPaper;
}

export interface DevOpsStats {
  queue: {
    active: number;
    waiting: number;
    completed: number;
    failed: number;
  };
  redis: {
    status: string;
    memoryUsageBytes: number;
    cpuUsagePercent: number;
    keysCount: number;
    hitRatePercent: number;
  };
  mongodb: {
    status: string;
    dbSizeBytes: number;
    documentsCount: number;
    activeConnections: number;
    avgQueryMs: number;
  };
  workers: Array<{
    id: string;
    name: string;
    status: string;
    busyTimeMs: number;
    jobsProcessed: number;
  }>;
  websockets: {
    activeConnections: number;
  };
}
