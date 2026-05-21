import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Bell,
  ChevronDown,
  ArrowLeft,
  BookOpen,
  Users,
  FileText,
  LayoutDashboard,
  Settings,
  Upload,
  Clock,
  Sliders,
  Brain,
  Trash2,
  Download,
  RefreshCw,
  Share2,
  Database,
  Cpu,
  Layers,
  Wifi,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Play,
  Send,
  Eye,
  Check,
  Edit,
  Activity,
  Menu,
  X,
  FileSpreadsheet,
  Info,
  SlidersHorizontal,
  FileUp,
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { initialDrafts, sampleActivityFeed, samplePhysicsPaper } from "./mockData";
import { AssignmentDraft, AssessmentPaper, DevOpsStats, Question } from "./types";

export default function App() {
  // Navigation & Screen Control
  // "home" | "create" | "generating" | "paper" | "devops" | "toolkit" | "library"
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Storage states
  const [drafts, setDrafts] = useState<AssignmentDraft[]>(() => {
    const local = localStorage.getItem("veda_ai_drafts");
    return local ? JSON.parse(local) : initialDrafts;
  });
  const [activeDraftId, setActiveDraftId] = useState<string | null>("draft-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Multi-step Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  
  // Section 2 - File uploads state
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string; type: string; content?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Section 3 - Question configuration counts
  const [mcqCount, setMcqCount] = useState(4);
  const [tfCount, setTfCount] = useState(2);
  const [shortCount, setShortCount] = useState(3);
  const [longCount, setLongCount] = useState(1);
  const [caseStudyCount, setCaseStudyCount] = useState(1);

  // Section 4 - AI Tuning Parameters
  const [creativity, setCreativity] = useState(0.4);
  const [bloomTaxonomy, setBloomTaxonomy] = useState<string>("Understanding");
  const [language, setLanguage] = useState("English");
  const [examDuration, setExamDuration] = useState("60 minutes");
  const [customPrompt, setCustomPrompt] = useState("");

  // Live generation screen state
  const [generationStage, setGenerationStage] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeGeneratingDraft, setActiveGeneratingDraft] = useState<AssignmentDraft | null>(null);

  // DevOps Metrics System API polling
  const [devopsMetrics, setDevopsMetrics] = useState<DevOpsStats | null>(null);
  const [isPollingMetrics, setIsPollingMetrics] = useState(false);

  // AI Assistant Chat Sidebar
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your VedaAI Assessment assistant. Ask me to change questions, make them harder/easier, balance the Marks distribution, or generate an answer sheet key.",
      time: "Just now"
    }
  ]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "info" | "error" }>>([]);

  // Active viewing/editing assessment
  const [editingPaper, setEditingPaper] = useState<AssessmentPaper | null>(null);
  const [isAnswerKeyTab, setIsAnswerKeyTab] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  // Print layout mode toggle
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);

  // Persistent synchronizations
  useEffect(() => {
    localStorage.setItem("veda_ai_drafts", JSON.stringify(drafts));
  }, [drafts]);

  // Fetch DevOps metrics live if in DevOps view
  useEffect(() => {
    let timer: any;
    if (currentTab === "devops") {
      setIsPollingMetrics(true);
      const fetchMetrics = async () => {
        try {
          const res = await fetch("/api/admin/metrics");
          if (res.ok) {
            const data = await res.json();
            setDevopsMetrics(data);
          }
        } catch (e) {
          console.error("Failed to fetch DevOps metrics:", e);
        }
      };
      fetchMetrics();
      timer = setInterval(fetchMetrics, 3000);
    } else {
      setIsPollingMetrics(false);
    }
    return () => clearInterval(timer);
  }, [currentTab]);

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          addToast(`Uploaded ${file.name} successfully.`, "success");
          return 100;
        }
        return p + 20;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadFile({
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        content: e.target?.result as string || "Sample extracted paragraph contents about electrolysis principles, anode oxidation, cathode reaction balances, water molecules, and electric charging."
      });
    };
    reader.readAsText(file.slice(0, 10000)); // slice for text parsing demonstration
  };

  const removeUploadFile = () => {
    setUploadFile(null);
    setUploadProgress(0);
    addToast("Reference material removed.", "info");
  };

  // Start Creation Flow
  const launchCreationWizard = () => {
    setCurrentStep(1);
    setNewTitle("");
    setNewSubject("Science / Physics");
    setNewGrade("Grade 8");
    setNewDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
    setNewInstructions("Include concepts covered in classroom textbook chapter 4.");
    setUploadFile(null);
    setMcqCount(4);
    setTfCount(2);
    setShortCount(3);
    setLongCount(1);
    setCaseStudyCount(1);
    setCreativity(0.4);
    setBloomTaxonomy("Understanding");
    setLanguage("English");
    setExamDuration("60 minutes");
    setCustomPrompt("");
    setCurrentTab("create");
    setMobileMenuOpen(false);
  };

  // Generate assessment paper using server action with beautiful loading animation simulation
  const triggerAIGeneration = async () => {
    // Scaffold intermediate draft
    const newDraftId = "draft-" + Date.now();
    const config = {
      MCQ: mcqCount,
      TF: tfCount,
      Short: shortCount,
      Long: longCount,
      CaseStudy: caseStudyCount
    };

    const aiParams = {
      creativity,
      bloomTaxonomy: bloomTaxonomy as any,
      language,
      duration: examDuration,
      customPrompt
    };

    const newDraft: AssignmentDraft = {
      id: newDraftId,
      title: newTitle || "Assessment on " + (newSubject || "General Study"),
      subject: newSubject,
      grade: newGrade,
      dueDate: newDueDate,
      instructions: newInstructions,
      uploadedFile: uploadFile,
      questionConfig: config,
      aiSettings: aiParams,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Generating"
    };

    // Save draft immediately to list
    setDrafts((prev) => [newDraft, ...prev]);
    setActiveGeneratingDraft(newDraft);
    setCurrentTab("generating");
    setGenerationStage(0);

    // Dynamic terminal stages
    const logs = [
      `[01/06] UTC - Connection established with VedaAI Cluster v2.1`,
      `[02/06] UTC - Structuring cognitive prompt configuration for ${newGrade}...`,
      `[03/06] UTC - Scanning uploaded material: ${uploadFile ? uploadFile.name : "None provided"}`,
      `[04/06] UTC - Initiating Deep Reasoning model (gemini-3.5-flash)...`,
      `[05/06] UTC - Assembling MCQ, Analytical, and Section constraints...`,
      `[06/06] UTC - Perfecting layout criteria & compiling Answer Key solution matrix...`
    ];

    setTerminalLogs([logs[0]]);

    // Iterative update loop for stages
    const stageIntervals = [
      { t: 800, log: logs[1], stage: 1 },
      { t: 1800, log: logs[2], stage: 2 },
      { t: 2800, log: logs[3], stage: 3 },
      { t: 4200, log: logs[4], stage: 4 },
      { t: 5500, log: logs[5], stage: 5 }
    ];

    stageIntervals.forEach((item) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, item.log]);
        setGenerationStage(item.stage);
      }, item.t);
    });

    try {
      // Trigger actual back-end query
      const response = await fetch("/api/generate_paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDraft.title,
          subject: newDraft.subject,
          grade: newDraft.grade,
          instructions: newDraft.instructions,
          questionConfig: config,
          aiSettings: aiParams,
          uploadMaterialName: uploadFile?.name,
          uploadMaterialText: uploadFile?.content
        })
      });

      const data = await response.json();
      
      // Allow the visual transition to take at least 6.5 seconds for peak interactive payoff
      setTimeout(() => {
        if (data.success && data.paper) {
          setDrafts((prev) =>
            prev.map((d) =>
              d.id === newDraftId
                ? { ...d, status: "Generated", paper: data.paper }
                : d
            )
          );
          setEditingPaper(data.paper);
          setActiveDraftId(newDraftId);
          addToast("Assessment paper generated via Server-side Gemini intelligence!", "success");
        } else {
          // Provide local high quality template fallback If any failure happens
          const fallbackPaper = {
            ...samplePhysicsPaper,
            examTitle: newDraft.title,
            subject: newDraft.subject,
            classGrade: newDraft.grade,
          };
          setDrafts((prev) =>
            prev.map((d) =>
              d.id === newDraftId
                ? { ...d, status: "Generated", paper: fallbackPaper }
                : d
            )
          );
          setEditingPaper(fallbackPaper);
          setActiveDraftId(newDraftId);
          addToast("Gemini offline fallback generated successfully.", "info");
        }
        setCurrentTab("paper");
      }, 6500);

    } catch (e) {
      console.error("Failure in Gemini request", e);
      setTimeout(() => {
        const fallbackPaper = {
          ...samplePhysicsPaper,
          examTitle: newDraft.title,
          subject: newDraft.subject,
          classGrade: newDraft.grade,
        };
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === newDraftId
              ? { ...d, status: "Generated", paper: fallbackPaper }
              : d
          )
        );
        setEditingPaper(fallbackPaper);
        setActiveDraftId(newDraftId);
        addToast("Fallback paper activated due to connection issues.", "success");
        setCurrentTab("paper");
      }, 6200);
    }
  };

  const handleSelectDraft = (dId: string) => {
    setActiveDraftId(dId);
    const item = drafts.find((d) => d.id === dId);
    if (item && item.status === "Generated" && item.paper) {
      setEditingPaper(item.paper);
      setCurrentTab("paper");
    } else if (item && item.status === "Draft") {
      // populate draft parameters to allow resuming edit
      setNewTitle(item.title);
      setNewSubject(item.subject);
      setNewGrade(item.grade);
      setNewDueDate(item.dueDate);
      setNewInstructions(item.instructions);
      setUploadFile(item.uploadedFile);
      setMcqCount(item.questionConfig.MCQ);
      setTfCount(item.questionConfig.TF);
      setShortCount(item.questionConfig.Short);
      setLongCount(item.questionConfig.Long);
      setCaseStudyCount(item.questionConfig.CaseStudy);
      setCreativity(item.aiSettings.creativity);
      setBloomTaxonomy(item.aiSettings.bloomTaxonomy);
      setLanguage(item.aiSettings.language);
      setExamDuration(item.aiSettings.duration);
      setCustomPrompt(item.aiSettings.customPrompt || "");
      
      setCurrentStep(1);
      setCurrentTab("create");
    }
    setMobileMenuOpen(false);
  };

  // Delete draft helper
  const handleDeleteDraft = (e: React.MouseEvent, dId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assessment?")) {
      setDrafts((prev) => prev.filter((d) => d.id !== dId));
      if (activeDraftId === dId) {
        setActiveDraftId(null);
        setEditingPaper(null);
      }
      addToast("Assessment deleted.", "info");
    }
  };

  // AI assistant prompt message handler (Real feeling smart suggestions)
  const handleSendAiChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = { sender: "user" as const, text: aiChatInput, time: "Just now" };
    setAiChatMessages((prev) => [...prev, userMsg]);
    const promptText = aiChatInput;
    setAiChatInput("");
    setIsAiAnswering(true);

    try {
      // Construct prompt including existing paper
      const prompt = `
        You are a curriculum helper. The teacher has active paper: "${editingPaper?.examTitle || "General Studies"}".
        They request refinement: "${promptText}".
        Suggest exact revisions for the paper. Keep feedback pedagogical and answer directly.
      `;

      // Mock chat intelligence output tailored specifically to input
      setTimeout(() => {
        let aiResponse = "Sure! I can help you align this better. I have modified the difficulty parameters. Would you like me to replace Question 2 with a simpler diagnostic item?";
        if (/hard|difficult|challenge/i.test(promptText)) {
          aiResponse = "I have reviewed your request. To increase difficulty alignment to Depth of Knowledge (DoK) levels 3 & 4, we could replace Question 4 with: 'Explain the molecular mechanism of membrane potential depolarization during salt flux.' Should I apply this update?";
        } else if (/answer|key|explain/i.test(promptText)) {
          aiResponse = "I have analyzed the solution matrix. You can toggle the 'Answer Key & Rubrics' view at the top of the paper to view standard explanations. Let me know if you would like me to expand the grading criteria for Section B.";
        } else if (/science|biology|physics/i.test(promptText)) {
          aiResponse = "Understood. Adjusting question patterns to focus heavily on practical laboratory application for electricity and salt concentration electrolysis.";
        }

        setAiChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse, time: "Just now" }]);
        setIsAiAnswering(false);
      }, 1500);

    } catch (err) {
      setIsAiAnswering(false);
    }
  };

  // Inline updates for direct manual editing of the assessment paper
  const handleUpdateQuestionText = (sectionIndex: number, questionIndex: number, val: string) => {
    if (!editingPaper) return;
    const copied = JSON.parse(JSON.stringify(editingPaper)) as AssessmentPaper;
    copied.sections[sectionIndex].questions[questionIndex].text = val;
    setEditingPaper(copied);
    
    // update drafts save
    if (activeDraftId) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === activeDraftId ? { ...d, paper: copied } : d))
      );
    }
  };

  const handleUpdateSchoolName = (name: string) => {
    if (!editingPaper) return;
    const copied = { ...editingPaper, schoolName: name };
    setEditingPaper(copied);
    if (activeDraftId) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === activeDraftId ? { ...d, paper: copied } : d))
      );
    }
  };

  const handleUpdateExamTitle = (title: string) => {
    if (!editingPaper) return;
    const copied = { ...editingPaper, examTitle: title };
    setEditingPaper(copied);
    if (activeDraftId) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === activeDraftId ? { ...d, paper: copied } : d))
      );
    }
  };

  // Print execution
  const executePrint = () => {
    window.print();
  };

  // Export as text/doc simple simulation
  const exportDocMock = () => {
    if (!editingPaper) return;
    let textOut = `${editingPaper.schoolName}\n${editingPaper.examTitle}\nSubject: ${editingPaper.subject} | Grade: ${editingPaper.classGrade}\n\n`;
    textOut += `INSTRUCTIONS:\n`;
    editingPaper.instructions.forEach((ins) => {
      textOut += `- ${ins}\n`;
    });
    textOut += `\n`;

    editingPaper.sections.forEach((sec) => {
      textOut += `\n=== ${sec.sectionName} ===\n${sec.instruction}\n\n`;
      sec.questions.forEach((q) => {
        textOut += `${q.questionNo}. [${q.difficulty} - ${q.marks} Marks] ${q.text}\n`;
        if (q.options) {
          q.options.forEach((opt, oIdx) => {
            textOut += `   ${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
        textOut += `\n`;
      });
    });

    const blob = new Blob([textOut], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${editingPaper.examTitle.toLowerCase().replace(/\s+/g, "_")}_assessment.txt`;
    link.click();
    addToast("Exported paper plain-text markup successfully!", "success");
  };

  // Calculated totals
  const totalQuestionsSum = mcqCount + tfCount + shortCount + longCount + caseStudyCount;
  const estimatedMarksSum = (mcqCount * 1) + (tfCount * 1) + (shortCount * 3) + (longCount * 5) + (caseStudyCount * 6);

  // Filter drafts list
  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "All" || d.subject.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div id="veda-root" className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      
      {/* Toast Notifier System */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-md border text-sm flex items-center gap-2 max-w-sm transition-all duration-300 animate-slide-in ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : t.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {t.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {t.type === "error" && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col md:flex-row min-h-screen">
        
        {/* ========================================================= */}
        {/* NOTION / LINEAR INSPIRED STICKY SIDEBAR (NO-PRINT)        */}
        {/* ========================================================= */}
        <aside id="sidebar" className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 no-print">
          
          {/* Header & Logo */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="text-white w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-bold font-sans tracking-tight bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  VedaAI
                </span>
                <span className="block text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase font-semibold">
                  Assessment Lab
                </span>
              </div>
            </div>
            {/* Hamburger helper toggles for mobile view */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Creation Call to Action Button */}
          <div className="px-4 py-4">
            <button
              onClick={launchCreationWizard}
              className="w-full py-2.5 px-4 bg-linear-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Navigation Links Grid (Desktop always visible, Mobile dependent on menu state) */}
          <div className={`${mobileMenuOpen ? "block" : "hidden"} md:block flex-1 px-3 space-y-1 overflow-y-auto`}>
            
            <span className="px-3 py-1.5 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Main Board
            </span>

            <button
              onClick={() => {
                setCurrentTab("home");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentTab === "home"
                  ? "bg-slate-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Home Dashboard</span>
              </div>
            </button>

            {/* Assignments List Toggles */}
            <div className="pt-2">
              <span className="px-3 py-1.5 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                Recent Assessments
              </span>
              
              <div className="mt-1 space-y-0.5 max-h-[180px] overflow-y-auto pr-1">
                {drafts.length === 0 ? (
                  <p className="text-xs text-slate-400 px-3 py-2 italic">No assessments yet</p>
                ) : (
                  drafts.slice(0, 5).map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDraft(d.id)}
                      className={`group w-full flex items-center justify-between text-left px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${
                        activeDraftId === d.id && (currentTab === "paper" || currentTab === "create")
                          ? "bg-indigo-50/60 text-indigo-800 font-semibold border-l-2 border-indigo-600 pl-2.5"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${d.status === "Generating" ? "animate-spin text-indigo-500" : "text-slate-400"}`} />
                        <span className="truncate">{d.title}</span>
                      </div>
                      <span className="hidden group-hover:block ml-1 opacity-60 hover:opacity-100 text-red-500 hover:scale-110 p-0.5" onClick={(e) => handleDeleteDraft(e, d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                      {d.status === "Generating" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <span className="px-3 py-2 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono pt-3">
              Tools & Diagnostics
            </span>

            <button
              onClick={() => {
                setCurrentTab("toolkit");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentTab === "toolkit"
                  ? "bg-slate-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4" />
                <span>AI Teacher's Toolkit</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">New</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("devops");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentTab === "devops"
                  ? "bg-slate-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Backend Live Monitor</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-mono">Live</span>
              </div>
            </button>
          </div>

          {/* Sidebar Footer School Profile Card */}
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shrink-0 shadow-xs">
                DPS
              </div>
              <div className="truncate flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">Delhi Public School</h4>
                <p className="text-[10px] text-slate-400 truncate">Bokaro Steel City</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase tracking-wider font-semibold font-mono">Lic: PRO_SaaS</span>
              <Settings className="w-4 h-4 hover:text-slate-600 cursor-pointer" onClick={() => addToast("Profile configuration lock applied by institution.", "info")} />
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN CONTAINER STREAM                                     */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          
          {/* Top Elegant Navbar */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 no-print">
            
            {/* Left Nav Actions */}
            <div className="flex items-center gap-4">
              {currentTab !== "home" && (
                <button
                  onClick={() => setCurrentTab("home")}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">VedaAI System v2.1</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-700 capitalize">
                  {currentTab === "home" ? "Overview Dashboard" : currentTab}
                </span>
              </div>
            </div>

            {/* Right Nav Controls / Status Info */}
            <div className="flex items-center gap-4">
              
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1 border border-slate-200 text-[11px] text-slate-500 font-mono">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected</span>
              </div>

              {/* Notification icon */}
              <button
                onClick={() => addToast("System alerts checking: 0 pending, everything calibrated.", "info")}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
              </button>

              {/* Profile dropdown mock */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs text-center shadow-xs">
                  JD
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-semibold text-slate-700 block">John Doe</span>
                  <span className="text-[10.5px] text-slate-400 block -mt-0.5">Assoc. Professor</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
              </div>

            </div>
          </header>

          <div className="flex-1 p-6 md:p-8">
            
            {/* ========================================================= */}
            {/* 1. LANDING DASHBOARD VIEW                                 */}
            {/* ========================================================= */}
            {currentTab === "home" && (
              <div className="space-y-6">
                
                {/* Visual Header / Welcome Section */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-950/15">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-48 h-48 text-indigo-100" />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-indigo-300 font-mono px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Empowered with server-side Gemini Intelligence</span>
                    </div>
                    <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight">
                      Draft Structured, Professional Exams in Minutes.
                    </h1>
                    <p className="mt-2 text-sm text-slate-300 leading-relaxed font-sans">
                      Provide Syllabus Guidelines, reference texts, customize question counts and difficulty tiers. VedaAI perfectly generates ready-to-print papers integrated with solution sheets.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={launchCreationWizard}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-100 hover:text-slate-900 focus:outline bg-white text-slate-900 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.01] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-700" />
                        <span>Create Your First Assignment</span>
                      </button>
                      <button
                        onClick={() => {
                          const physics = drafts.find((d) => d.id === "draft-1");
                          if (physics) {
                            handleSelectDraft("draft-1");
                          } else {
                            addToast("Physics demo draft was cleared. Start a new build instead!", "error");
                          }
                        }}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
                      >
                        Explore Demo Paper
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="h-10.5 w-10.5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Total Assignments</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">{drafts.length}</h3>
                      <span className="text-[10px] text-emerald-600 font-medium tracking-tight">Saved Drafts & Papers</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="h-10.5 w-10.5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">AI Generated Papers</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        {drafts.filter((d) => d.status === "Generated").length}
                      </h3>
                      <span className="text-[10px] text-indigo-600 font-mono tracking-tight">Active solutions ready</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="h-10.5 w-10.5 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Queue Status</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">Idle</h3>
                      <span className="text-[10px] text-orange-500 font-medium tracking-tight">Workers operational</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="h-10.5 w-10.5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Avg Difficulty</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">Moderate</h3>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight">Balanced Distribution</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Splitting Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Recent Papers */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Headers & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search assignments by title or subject name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        {["All", "Science", "Mathematics", "English"].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSubjectFilter(sub)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                              subjectFilter === sub
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Table / Grid list */}
                    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                      <div className="px-5 py-3 border-b border-secondary-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-800">All Saved Exam Templates</h2>
                        <span className="text-xs text-slate-400 font-mono">Total filtered: {filteredDrafts.length}</span>
                      </div>

                      {filteredDrafts.length === 0 ? (
                        <div className="text-center py-12 px-5">
                          <FileText className="w-12 h-12 text-slate-200 mx-auto stroke-1" />
                          <p className="text-slate-500 mt-3 text-sm">No matched assignments found.</p>
                          <p className="text-slate-400 text-xs mt-1">Try resetting filter metrics or launch a new wizard generate.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {filteredDrafts.map((d) => (
                            <div
                              key={d.id}
                              onClick={() => handleSelectDraft(d.id)}
                              className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 max-w-md">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                  d.subject.includes("Math")
                                    ? "bg-blue-50 text-blue-600"
                                    : d.subject.includes("English")
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-indigo-50 text-indigo-600"
                                }`}>
                                  {d.subject} • {d.grade}
                                </span>
                                <h3 className="text-sm font-bold text-slate-800 leading-tight">{d.title}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                  <span>Due: {d.dueDate}</span>
                                  <span>•</span>
                                  <span>Created on {d.createdAt}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                  d.status === "Generated"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                  {d.status}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectDraft(d.id);
                                    }}
                                    className="p-1 px-3 bg-slate-50 border border-slate-200 hover:bg-white rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
                                  >
                                    View Options
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteDraft(e, d.id)}
                                    className="p-1 border border-transparent hover:border-red-100 rounded-lg text-red-500 hover:bg-red-50/50 cursor-pointer"
                                    title="Delete Paper"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Mini Widgets */}
                  <div className="space-y-6">
                    
                    {/* Activity Feed */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">
                        Activity Stream
                      </h3>
                      <div className="space-y-4">
                        {sampleActivityFeed.map((act) => (
                          <div key={act.id} className="flex gap-3 text-xs leading-normal">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-slate-600">
                                <strong className="text-slate-800 font-semibold">{act.user}</strong>{" "}
                                {act.type === "create" ? "designed new exam template" : "exported document formatting"}{" "}
                                <span className="font-semibold text-slate-700">"{act.title}"</span>.
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{act.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Educational Tips Card */}
                    <div className="bg-linear-to-br from-indigo-50/50 to-purple-50 rounded-xl p-5 border border-indigo-100/60 font-sans text-xs">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                        <Brain className="w-4 h-4" />
                        <span>Teacher AI Assistant Hack</span>
                      </div>
                      <p className="text-indigo-950/80 leading-relaxed mb-3">
                        Utilize PDF / txt upload features inside Section 2 of our layout. This automatically constrains the Gemini model API pipeline to base its reasoning criteria and MCQ key answers strictly around your uploaded school syllabus constraints.
                      </p>
                      <button
                        onClick={launchCreationWizard}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Form Wizard</span>
                        <span>→</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* 2. ASSIGNMENT CREATION PAGE                               */}
            {/* ========================================================= */}
            {currentTab === "create" && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Wizard Header Bar */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center justify-between shadow-xs">
                  <div>
                    <h1 className="text-base font-bold text-slate-800">Generate New Assessment Paper</h1>
                    <p className="text-xs text-slate-400">Step {currentStep} of 4: Configure pedagogical variables</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          currentStep === step
                            ? "w-8 bg-indigo-600"
                            : currentStep > step
                              ? "w-2.5 bg-indigo-200"
                              : "w-2.5 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: Assignment Details */}
                {currentStep === 1 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-5 animate-slide-in">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                        <SlidersHorizontal className="text-indigo-600 w-4 h-4" />
                        <span>Section 1 — Assignment Basic Details</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Specify core attributes to adjust cognitive guidelines</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Assignment / Exam Title *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Unit Quiz: Principles of Electrolysis & Currents"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject / Department *</label>
                          <select
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                          >
                            <option value="Science / Physics">Science / Physics</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="English Literature">English Literature</option>
                            <option value="Social Studies">Social Studies</option>
                            <option value="Computer Applications">Computer Applications</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Class / Target Grade *</label>
                          <select
                            value={newGrade}
                            onChange={(e) => setNewGrade(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                          >
                            <option value="Grade 5">Grade 5th</option>
                            <option value="Grade 8">Grade 8th</option>
                            <option value="Grade 10">Grade 10th</option>
                            <option value="Grade 11">Grade 11th</option>
                            <option value="Advanced Research">Advanced Science Research</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Due Date *</label>
                          <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Exam Duration Setting</label>
                          <input
                            type="text"
                            value={examDuration}
                            onChange={(e) => setExamDuration(e.target.value)}
                            placeholder="e.g. 45 minutes"
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Additional Guidelines & Instructions (optional)</label>
                        <textarea
                          rows={3}
                          value={newInstructions}
                          onChange={(e) => setNewInstructions(e.target.value)}
                          placeholder="e.g. Include concepts covered in laboratory electrolysis worksheets, specifically reactions at anode or cathode."
                          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => {
                          if (!newTitle.trim()) {
                            addToast("Please provide an assignment title immediately.", "error");
                            return;
                          }
                          setCurrentStep(2);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 border text-white font-medium text-xs rounded-xl transition"
                      >
                        Continue to uploads
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Upload Reference Material */}
                {currentStep === 2 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-5 animate-slide-in">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                        <FileUp className="text-indigo-600 w-4 h-4" />
                        <span>Section 2 — Syllabus & Guidelines Context Upload</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Accept custom PDF/DOCX/TXT files to bind Gemini reasoning metrics</p>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                      />

                      <div className="max-w-md mx-auto space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                          <Upload className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Choose physical files or drag & drop here</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">PDF, TXT or DOC up to 10MB verified</p>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-xs"
                        >
                          Browse Material Folders
                        </button>
                      </div>
                    </div>

                    {/* Progress tracking animation */}
                    {isUploading && (
                      <div className="p-3 bg-indigo-50/50 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                          <span>Scanning document structures...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-indigo-100 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* File preview cards */}
                    {uploadFile && (
                      <div className="p-4 bg-slate-50 border border-slate-100/90 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-sm">
                              {uploadFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Parsed Context ({uploadFile.size})
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={removeUploadFile}
                          className="p-1 hover:bg-slate-200 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 cursor-pointer"
                      >
                        Previous Step
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition cursor-pointer"
                      >
                        Continue to Questions config
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Question Tiers & Count Matrix */}
                {currentStep === 3 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-5 animate-slide-in">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                        <SlidersHorizontal className="text-indigo-600 w-4 h-4" />
                        <span>Section 3 — Smart Question Template Matrix</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Adjust exact type ratios (Total Estimated Marks: <strong className="text-indigo-600 font-mono text-sm">{estimatedMarksSum}</strong>)</p>
                    </div>

                    {/* Count items grid */}
                    <div className="space-y-4">
                      
                      {/* MCQ */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-mono">Multiple Choice Questions (MCQ)</h4>
                          <p className="text-[10px] text-slate-400">Recommended for quick diagnostics (Weight: 1 Mark each)</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setMcqCount((c) => Math.max(0, c - 1))}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-800 font-mono w-6 text-center">{mcqCount}</span>
                          <button
                            type="button"
                            onClick={() => setMcqCount((c) => c + 1)}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* True or False */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-mono">True / False Items</h4>
                          <p className="text-[10px] text-slate-400">Verifying concept definitions (Weight: 1 Mark each)</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setTfCount((c) => Math.max(0, c - 1))}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-800 font-mono w-6 text-center">{tfCount}</span>
                          <button
                            type="button"
                            onClick={() => setTfCount((c) => c + 1)}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Short answers */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-mono">Short Format Questions</h4>
                          <p className="text-[10px] text-slate-400">3-4 line explanation with optional diagram (Weight: 3 Marks each)</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setShortCount((c) => Math.max(0, c - 1))}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-800 font-mono w-6 text-center">{shortCount}</span>
                          <button
                            type="button"
                            onClick={() => setShortCount((c) => c + 1)}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Long answers */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-mono">Analytical Long Format</h4>
                          <p className="text-[10px] text-slate-400">CBSE/Common Core compliant essay criteria (Weight: 5 Marks each)</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setLongCount((c) => Math.max(0, c - 1))}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-800 font-mono w-6 text-center">{longCount}</span>
                          <button
                            type="button"
                            onClick={() => setLongCount((c) => c + 1)}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Case Study */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-mono">Case-Study & Passage Questions</h4>
                          <p className="text-[10px] text-slate-400">Context comprehension + sub-prompts (Weight: 6 Marks each)</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setCaseStudyCount((c) => Math.max(0, c - 1))}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-800 font-mono w-6 text-center">{caseStudyCount}</span>
                          <button
                            type="button"
                            onClick={() => setCaseStudyCount((c) => c + 1)}
                            className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 cursor-pointer"
                      >
                        Previous Step
                      </button>
                      <button
                        onClick={() => {
                          if (totalQuestionsSum === 0) {
                            addToast("Please choose at least 1 question to compile.", "error");
                            return;
                          }
                          setCurrentStep(4);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition cursor-pointer"
                      >
                        Continue to AI Tuning
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: AI Settings Tune */}
                {currentStep === 4 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-5 animate-slide-in">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                        <SlidersHorizontal className="text-indigo-600 w-4 h-4" />
                        <span>Section 4 — AI Tuning & Cognitive Rigors</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Calibrate Gemini Model parameters directly for professional pedagogy matching</p>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Creativity Level Temperature slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-bold text-slate-700">AI Creativity Level (Temperature)</label>
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {creativity} (Balanced)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.15"
                          value={creativity}
                          onChange={(e) => setCreativity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>Low (Deterministic Exam Questions)</span>
                          <span>High (Creative Synthesis Cases)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bloom Taxonomy */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Bloom's Taxonomy priority</label>
                          <select
                            value={bloomTaxonomy}
                            onChange={(e) => setBloomTaxonomy(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg text-slate-700"
                          >
                            <option value="Any">Balanced Cognitive Spectrum (Mixed)</option>
                            <option value="Remembering">L1 - Remembering Core Vocab</option>
                            <option value="Understanding">L2 - Defining & Comprehending</option>
                            <option value="Applying">L3 - Formulas & Calculations</option>
                            <option value="Analyzing">L4 - Systems Decomposition</option>
                            <option value="Evaluating">L5 - Critiquing & Diagnosing flaws</option>
                          </select>
                        </div>

                        {/* Language Selection */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Language Target</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg text-slate-700"
                          >
                            <option value="English">English (Universal Standard)</option>
                            <option value="Spanish">Spanish (Español)</option>
                            <option value="Hindi">Hindi (Official Standard)</option>
                            <option value="French">French (Français)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Custom Teacher Prompt Context (optional)</label>
                        <textarea
                          rows={3}
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="e.g. Include questions that examine why direct current is used for electrolytic silver layering, but alternating current triggers flaky metal fusion."
                          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none rounded-lg"
                        />
                        <span className="block text-[10.5px] text-slate-400 mt-1">This context strictly prioritizes custom thematic parameters during AI reasoning.</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 cursor-pointer"
                      >
                        Previous Step
                      </button>
                      <button
                        onClick={triggerAIGeneration}
                        className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-semibold text-xs rounded-xl shadow-lg transform active:scale-95 transition-all text-center flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Generate with Gemini AI</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================= */}
            {/* 3. AI GENERATION SCREEN                                   */}
            {/* ========================================================= */}
            {currentTab === "generating" && activeGeneratingDraft && (
              <div className="max-w-2xl mx-auto py-12 space-y-8 text-center animate-pulse">
                
                {/* Visual Glow Loader */}
                <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/15 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-indigo-600/10 rounded-full animate-pulse" />
                  <div className="h-20 w-20 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-45">
                    <Sparkles className="text-white w-10 h-10 transform -rotate-45" />
                  </div>
                </div>

                {/* Header text */}
                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-slate-800">Compiling Evaluation Parameters...</h1>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    VedaAI is building a custom structured paper and solution key for <strong className="font-semibold text-slate-700">{activeGeneratingDraft.title}</strong>
                  </p>
                </div>

                {/* Simulated stages grid */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3.5 text-left shadow-sm">
                  {[
                    "Parsing Uploaded Syllabus Texts",
                    "Structuring Custom Constraints",
                    "Executing Server-Side Gemini models",
                    "Formatting Final Print Margins & Solution Key"
                  ].map((stageText, index) => {
                    const isActive = generationStage === index;
                    const isCompleted = generationStage > index;
                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${isCompleted ? "text-slate-400" : isActive ? "text-indigo-800 font-bold" : "text-slate-350"}`}>
                          {index + 1}. {stageText}
                        </span>
                        <span>
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-emerald-600 font-extrabold" />
                          ) : isActive ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Professional Terminal Logs panel */}
                <div className="bg-slate-900 rounded-xl p-4 text-left max-w-lg mx-auto border border-slate-800 font-mono text-[10.5px] text-indigo-200/90 shadow-md">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 text-slate-500 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>COGNITIVE LOG TELEMETRY FOR WORKER 1C</span>
                  </div>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {terminalLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed">
                        <span className="text-indigo-500">&gt;</span> {log}
                      </div>
                    ))}
                    <div className="h-1 animate-pulse bg-indigo-400/20 w-24 rounded mt-2" />
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* 4. GENERATED QUESTION PAPER PAGE                          */}
            {/* ========================================================= */}
            {currentTab === "paper" && editingPaper && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative">
                
                {/* Main Exam Paper Card Area */}
                <div className="xl:col-span-3 space-y-6">
                  
                  {/* Tabs header selector */}
                  <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200/80 no-print">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAnswerKeyTab(false)}
                        className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                          !isAnswerKeyTab
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        Question Paper
                      </button>
                      <button
                        onClick={() => setIsAnswerKeyTab(true)}
                        className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                          isAnswerKeyTab
                            ? "bg-slate-950 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        Solutions & Model Answer Key
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-mono">Exam Status: Verified</span>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Actual Printable Document Paper */}
                  <div id="printable-exam-sheet" className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-md relative min-h-[842px] content-start">
                    
                    {/* Visual watermark simulation inside paper */}
                    <div className="absolute inset-0 bg-transparent opacity-5 pointer-events-none flex items-center justify-center font-serif text-[120px] font-extrabold select-none uppercase tracking-widest text-slate-300">
                      DPS
                    </div>

                    {/* School Profile Information Header Container */}
                    <div className="text-center space-y-3.5 border-b-2 border-double border-slate-300 pb-6 relative z-10">
                      
                      {/* Direct Inline Editable Title Headers */}
                      <input
                        type="text"
                        value={editingPaper.schoolName}
                        onChange={(e) => handleUpdateSchoolName(e.target.value)}
                        className="text-center uppercase font-serif text-lg md:text-xl font-bold text-slate-900 tracking-wide w-full focus:bg-slate-50/50 hover:bg-slate-50/50 rounded p-1 transition-all border-none focus:outline-none"
                        placeholder="School Name"
                      />

                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-mono tracking-widest text-[#6366f1] uppercase font-bold bg-[#6366f1]/10 px-2 py-0.5 rounded-sm">
                          Examination Board
                        </span>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editingPaper.examTitle}
                          onChange={(e) => handleUpdateExamTitle(e.target.value)}
                          className="text-center font-serif text-sm md:text-base font-bold text-slate-800 w-full focus:bg-slate-50/50 hover:bg-slate-50/50 rounded.p-1 transition-all border-none focus:outline-none"
                          placeholder="Exam Title"
                        />
                        <p className="text-xs text-slate-500 font-mono">
                          Subject: <strong className="text-slate-800 font-semibold">{editingPaper.subject}</strong> | Grade: <strong className="text-slate-800 font-semibold">{editingPaper.classGrade}</strong>
                        </p>
                      </div>

                      {/* Marks & Timing Metrics */}
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto bg-slate-50/60 rounded-xl p-3 border border-slate-100 font-mono text-[11px] text-slate-600">
                        <div className="text-left font-bold pl-4">
                          Time Allowed: <span className="text-slate-800">{editingPaper.duration}</span>
                        </div>
                        <div className="text-right font-bold pr-4">
                          Maximum Marks: <span className="text-slate-800">{editingPaper.totalMarks || 20}</span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Identity Information Board Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 py-5 text-[11px] font-mono text-slate-600 italic">
                      <div className="flex gap-2">
                        <span>Candidate Name:</span>
                        <div className="flex-1 border-b border-slate-300 border-dotted" />
                      </div>
                      <div className="flex gap-2">
                        <span>Roll Number:</span>
                        <div className="flex-1 border-b border-slate-300 border-dotted" />
                      </div>
                      <div className="flex gap-2">
                        <span>Section / Room:</span>
                        <div className="flex-1 border-b border-slate-300 border-dotted" />
                      </div>
                    </div>

                    {/* Instructions Banner */}
                    <div className="py-4 border-b border-slate-200">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">
                        Core Examination Instructions:
                      </p>
                      <ul className="list-decimal text-slate-600 text-xs pl-5 space-y-1 leading-normal">
                        {editingPaper.instructions.map((ins, idx) => (
                          <li key={idx}>{ins}</li>
                        ))}
                      </ul>
                    </div>

                    {/* PRIMARY QUESTION PAPER TAB */}
                    {!isAnswerKeyTab && (
                      <div className="mt-8 space-y-8 pb-12">
                        
                        {editingPaper.sections.map((section, secIdx) => (
                          <div key={secIdx} className="space-y-4">
                            
                            {/* Section Title banner */}
                            <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                              <div>
                                <h3 className="text-xs font-bold font-mono text-slate-900 tracking-wide">
                                  {section.sectionName}
                                </h3>
                                <p className="text-[11px] text-slate-500 italic mt-0.5">{section.instruction}</p>
                              </div>
                              <span className="text-[11px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded self-start">
                                {section.questions.length} Items
                              </span>
                            </div>

                            {/* Section Questions Stack */}
                            <div className="space-y-5">
                              {section.questions.map((q, qIdx) => (
                                <div key={q.id} className="group relative p-4 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-150 transition-all">
                                  
                                  {/* Right side floating badges no-print */}
                                  <div className="absolute right-4 top-4 flex items-center gap-1.5 no-print">
                                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold tracking-tight ${
                                      q.difficulty === "Challenging"
                                        ? "bg-red-50 text-red-600"
                                        : q.difficulty === "Moderate"
                                          ? "bg-amber-50 text-amber-600"
                                          : "bg-emerald-50 text-emerald-600"
                                    }`}>
                                      {q.difficulty}
                                    </span>
                                    <span className="bg-slate-100 text-slate-600 text-[9.5px] px-2 py-0.5 rounded font-bold font-mono">
                                      {q.marks} Mark{q.marks > 1 ? "s" : ""}
                                    </span>
                                  </div>

                                  {/* Question content */}
                                  <div className="flex gap-3">
                                    <span className="text-xs font-bold font-mono text-slate-500 mt-0.5">
                                      Q{q.questionNo}.
                                    </span>
                                    <div className="flex-1 space-y-3">
                                      
                                      {/* Inline editable text */}
                                      <textarea
                                        rows={2}
                                        value={q.text}
                                        onChange={(e) => handleUpdateQuestionText(secIdx, qIdx, e.target.value)}
                                        className="w-full text-xs font-sans font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:bg-slate-50 hover:bg-slate-50/30 rounded p-1 transition-all leading-relaxed focus:ring-1 focus:ring-indigo-100"
                                      />

                                      {/* Choices block for MCQ or T/F */}
                                      {q.options && q.options.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-1">
                                          {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-600">
                                              <span className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                                                {String.fromCharCode(65 + oIdx)}
                                              </span>
                                              <span>{opt}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    </div>
                                  </div>

                                  {/* Print only marks indicator */}
                                  <div className="hidden print:block text-right text-[10.5px] font-mono text-slate-500 font-bold">
                                    [{q.marks} Marks]
                                  </div>

                                </div>
                              ))}
                            </div>

                          </div>
                        ))}

                        {/* End paper signature watermark */}
                        <div className="pt-12 text-center border-t border-slate-200">
                          <span className="text-xs font-mono text-slate-400 font-semibold tracking-widest uppercase">
                            *** End of Question Paper ***
                          </span>
                        </div>

                      </div>
                    )}

                    {/* SOLUTIONS & ANSWER MODEL KEY TAP */}
                    {isAnswerKeyTab && (
                      <div className="mt-8 space-y-6 pb-12 animate-slide-in">
                        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 mb-4 text-xs text-indigo-950 font-sans">
                          <strong className="font-bold flex items-center gap-1 text-indigo-800 mb-1">
                            <Info className="w-4 h-4 text-indigo-600" />
                            Model Solutions Guide
                          </strong>
                          This contains answer vectors, scoring guidelines, and structural grading criteria parsed from standard educational boards curricula.
                        </div>

                        <div className="divide-y divide-slate-100">
                          {editingPaper.answerKey.map((keyItem, index) => (
                            <div key={index} className="py-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 font-mono">
                                  Question {keyItem.questionNo} ({keyItem.sectionName})
                                </span>
                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-bold text-[10px] font-mono">
                                  Exact Verified Answer
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-mono whitespace-pre-line">
                                {keyItem.answer}
                              </p>
                              {keyItem.explanation && (
                                <p className="text-[11px] text-slate-500 leading-normal pl-3 border-l-2 border-slate-200">
                                  <strong>Grading Criteria:</strong> {keyItem.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* ========================================================= */}
                {/* STICKY GLASS ACTION TOOLBAR (Right Side)                  */}
                {/* ========================================================= */}
                <div className="xl:col-span-1 space-y-6 no-print">
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm sticky top-24">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Assessment Actions
                    </h3>

                    <div className="space-y-2">
                      <button
                        onClick={executePrint}
                        className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export PDF / Print</span>
                      </button>

                      <button
                        onClick={exportDocMock}
                        className="w-full py-2 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Download Plain Text Markup</span>
                      </button>

                      <button
                        onClick={() => {
                          const originalUrl = window.location.href;
                          navigator.clipboard.writeText(originalUrl);
                          addToast("Assessment link copied successfully. Anyone with link can view formatting.", "success");
                        }}
                        className="w-full py-2 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Assingment URL</span>
                      </button>

                      <button
                        onClick={() => {
                          addToast("Initiating live cognitive regeneration loop...", "info");
                          triggerAIGeneration();
                        }}
                        className="w-full py-2 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Regenerate with Gemini API</span>
                      </button>
                    </div>

                    {/* AI Assistant Chat Sidebar Toggle Trigger */}
                    <div className="pt-4 border-t border-slate-150">
                      <button
                        onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                        className="w-full py-2.5 px-4 bg-linear-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-medium text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>{aiSidebarOpen ? "Collapse AI Tutor" : "Refine with AI Tutor"}</span>
                      </button>
                    </div>

                    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 leading-relaxed text-[11px] text-slate-500 font-sans">
                      <strong className="text-slate-700 font-semibold flex items-center gap-1 mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Fine-tuning Instructions
                      </strong>
                      Directly hover and click on any text title, school banner, or question on the left exam sheet to edit sections instantly prior to exporting.
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* 6. DEV/ADMIN MONITOR SCREEN (Bonus Screen)                */}
            {/* ========================================================= */}
            {currentTab === "devops" && (
              <div className="space-y-6 max-w-5xl mx-auto animate-slide-in">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 font-mono tracking-widest uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                      COGNITIVE QUEUE METRICS MONITOR
                    </span>
                    <h1 className="text-lg font-bold font-mono text-slate-50 mt-1">VedaAI Admin Cluster Console</h1>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time status tracking for BullMQ, MongoDB, and Redis</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400">WebSocket Connected</span>
                  </div>
                </div>

                {/* Simulated live indicators grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* BullMQ state */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="text-indigo-400 w-4 h-4" />
                        <span>BullMQ Queues Metrics</span>
                      </h4>
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-mono px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 font-mono text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Active Jobs</span>
                        <span className="text-indigo-400 font-bold block text-sm mt-0.5">
                          {devopsMetrics?.queue.active ?? 0}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Waiting queue</span>
                        <span className="text-slate-300 font-bold block text-sm mt-0.5">
                          {devopsMetrics?.queue.waiting ?? 2}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Completed</span>
                        <span className="text-emerald-400 font-bold block text-sm mt-0.5">
                          {devopsMetrics?.queue.completed ?? 48}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Failed</span>
                        <span className="text-red-400 font-bold block text-sm mt-0.5">
                          {devopsMetrics?.queue.failed ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Redis Memory state */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="text-blue-400 w-4 h-4" />
                        <span>Redis Cache Core</span>
                      </h4>
                      <span className="text-[10px] bg-blue-500/15 text-blue-300 font-mono px-1.5 py-0.5 rounded">
                        Healthy
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Memory Usage</span>
                        <span className="text-slate-300">
                          {devopsMetrics ? (devopsMetrics.redis.memoryUsageBytes / (1024 * 1024)).toFixed(2) : "14.85"} MB
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Hit Rate Ratio</span>
                        <span className="text-blue-400 font-bold">
                          {devopsMetrics?.redis.hitRatePercent ?? 94.2}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Total Key Records</span>
                        <span className="text-slate-300">{devopsMetrics?.redis.keysCount ?? 245} Keys</span>
                      </div>
                    </div>
                  </div>

                  {/* MongoDB Storage stats */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="text-emerald-400 w-4 h-4" />
                        <span>MongoDB Documents</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                        Sync
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Database Size</span>
                        <span className="text-slate-300">401.5 MB</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Active Connections</span>
                        <span className="text-slate-300">{devopsMetrics?.mongodb.activeConnections ?? 6} Client</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500">Avg Read Query latency</span>
                        <span className="text-emerald-400 font-bold">{devopsMetrics?.mongodb.avgQueryMs ?? 12} ms</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Workers Activity Feed details */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                    Operational Core Workers Stack
                  </h3>

                  <div className="divide-y divide-slate-800 font-mono text-xs">
                    {devopsMetrics?.workers.map((worker) => (
                      <div key={worker.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-300 font-bold">{worker.name}</span>
                          <p className="text-[10.5px] text-slate-500">ID: {worker.id} • Lifetime jobs output: {worker.jobsProcessed}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Busy duration: {(worker.busyTimeMs / 1000).toFixed(1)}s</span>
                          <span className={`px-2.5 py-1 rounded text-[10.5px] font-bold ${
                            worker.status === "processing"
                              ? "bg-indigo-500/15 text-indigo-400 animate-pulse"
                              : "bg-slate-950 text-slate-400 border border-slate-800"
                          }`}>
                            {worker.status === "processing" ? "Compiling Paper..." : "Sleep (Idle)"}
                          </span>
                        </div>
                      </div>
                    )) ?? (
                      <div className="py-6 text-slate-500 text-center">Loading live cluster workers telemetry...</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-orange-950/20 border border-orange-900/40 rounded-xl leading-relaxed text-xs text-orange-200 font-sans">
                  <strong>Cluster Calibration Notice:</strong> The stats displayed reflect direct API polling to the Node.js master thread backend server. Every assessment paper requested initiates worker processing queues and pushes solution keys to the live cluster store.
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* 7. AI TEACHER'S TOOLKIT SCREEN                             */}
            {/* ========================================================= */}
            {currentTab === "toolkit" && (
              <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
                
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      Adaptive Learning
                    </span>
                    <h1 className="text-xl font-extrabold text-slate-800">AI Teacher's Assistant Toolkit</h1>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                      Generate flashcards, rubrics instructions, grading templates, or curriculum roadmaps from existing assessments instantaneously.
                    </p>
                  </div>
                  <button
                    onClick={launchCreationWizard}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow transition shrink-0 cursor-pointer"
                  >
                    Generate Paper Now
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-xs">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Curriculum Syllabus Generator</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Input a subject topic (e.g. quantum tunneling) and VedaAI compiles sub-tier core checkpoints, textbook citations, and grade thresholds inside minutes.
                      </p>
                    </div>
                    <button
                      onClick={() => addToast("Curriculum generation locked to Premium Sandbox Account.", "info")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Bootstrap Curriculum</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-xs">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Scoring Rubrics Architect</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Generate comprehensive criteria matrices mapped to Bloom Taxonomy criteria for long essays and thesis evaluation, ensuring robust scoring.
                      </p>
                    </div>
                    <button
                      onClick={() => addToast("Custom rubric architect loading...", "info")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Launch Builder</span>
                      <span>→</span>
                    </button>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Sticky responsive footer for premium look */}
          <footer className="bg-white border-t border-slate-200/80 p-4 px-6 text-center text-[11px] text-slate-400 font-mono no-print mt-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
            <span>© 2026 VedaAI Systems • All examination templates secure.</span>
            <div className="flex gap-4">
              <a href="#" onClick={(e) => { e.preventDefault(); addToast("Privacy parameters calibrated.", "success"); }} className="hover:text-slate-600">Privacy Scope</a>
              <a href="#" onClick={(e) => { e.preventDefault(); addToast("License: Educational Pro v2.1 Activated.", "info"); }} className="hover:text-slate-600">Institutional Terms</a>
            </div>
          </footer>

        </main>

        {/* ========================================================= */}
        {/* INTERACTIVE AI ASSISTANT SIDEBAR CHAT (NO-PRINT)          */}
        {/* ========================================================= */}
        {aiSidebarOpen && (
          <aside className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 relative z-30 animate-slide-in no-print">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 font-mono">VedaAI Paper Tutor</span>
              </div>
              <button
                onClick={() => setAiSidebarOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages box list */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[480px]">
              {aiChatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col space-y-1 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-[11.5px] leading-normal ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-indigo-50/60 text-indigo-950 rounded-bl-none border border-indigo-100"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono">{msg.time}</span>
                </div>
              ))}
              {isAiAnswering && (
                <div className="flex gap-2 items-center text-xs text-slate-400 font-mono italic">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce delay-75" />
                  <span>Tutor is formulating advice...</span>
                </div>
              )}
            </div>

            {/* Quick action triggers */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono block mb-1">Pedagogical suggestions:</span>
              <button
                onClick={() => {
                  setAiChatInput("Increase difficulty of Section B to challenging level.");
                }}
                className="w-full text-left p-1.5 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-medium rounded border border-slate-200 truncate"
              >
                ⚡ "Increase Section B difficulty tier..."
              </button>
              <button
                onClick={() => {
                  setAiChatInput("Verify Answer Key constraints & criteria.");
                }}
                className="w-full text-left p-1.5 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-medium rounded border border-slate-200 truncate"
              >
                ⚡ "Verify Solution key solutions..."
              </button>
            </div>

            {/* Chat prompt input form */}
            <form onSubmit={handleSendAiChatMessage} className="p-3 border-t border-slate-150 bg-white">
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Type revision prompt..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-xl"
                />
                <button
                  type="submit"
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </aside>
        )}

      </div>

    </div>
  );
}
