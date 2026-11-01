// Approved copy shared by the interactive FAQ and the no-JavaScript fallback.
export interface BusinessFAQ {
  id: string; topic: string; question: string; answer: string;
  help: string; example: string; cta: string; interest: string;
}
export const BUSINESS_FAQS: BusinessFAQ[] = [
  {
    "id": "q1",
    "topic": "start",
    "question": "Where should a small business start with AI?",
    "answer": "Start with a task you understand well: drafting routine replies, organising meeting notes or preparing a first version of a report. Choose something you can check easily, with a clear idea of what a good result looks like.",
    "help": "We review your workflow, identify a suitable starting point and discuss a small pilot. That may involve training, a better process or a simple integration. AI is one option; the business need comes first.",
    "example": "A practical first step: bring one recurring task and explain where it slows you down.",
    "cta": "Help me find a starting point",
    "interest": "Choosing a first AI task"
  },
  {
    "id": "q2",
    "topic": "start",
    "question": "What will it cost, and how do we know it's worth it?",
    "answer": "Cost depends on the task, the tools, the work needed to connect them and the support your team needs. The full cost can include subscriptions, setup, training and ongoing maintenance. A low subscription price does not tell the whole story.",
    "help": "We discuss the scope and provide a quotation for the agreed work. For a pilot, we can agree what to measure—such as time spent, corrections needed and quality—so you can decide whether the result justifies the cost.",
    "example": "Results vary. We do not promise a fixed saving or a guaranteed return before understanding your business.",
    "cta": "Discuss the scope and cost",
    "interest": "Costs and a scoped quotation"
  },
  {
    "id": "q3",
    "topic": "people",
    "question": "Can we use AI without exposing business or customer information?",
    "answer": "There are ways to reduce exposure, but no tool should be treated as automatically safe. What matters includes the information you enter, who can access it, the provider's settings and terms, and how outputs are handled. Start demonstrations with fictional or appropriately redacted information.",
    "help": "We can review the proposed workflow, help select suitable tools and controls, and train staff on what should stay out of a prompt. We also identify where your organisation needs specialist privacy, legal or security advice before proceeding.",
    "example": "For sensitive records, the first step is discussing the requirements—not uploading the records into an AI tool.",
    "cta": "Discuss a more careful approach",
    "interest": "Responsible AI and information handling"
  },
  {
    "id": "q4",
    "topic": "people",
    "question": "How can our staff learn to use AI properly?",
    "answer": "Give people practical exercises connected to their work. They need to learn how to give clear instructions, decide what information to share, check an answer and recognise when a person should take over. Confidence should come from practice and review.",
    "help": "Our practical AI training covers the basics, useful tools, prompting, responsible use and everyday business applications. We discuss your team's experience and priorities to agree a suitable training scope.",
    "example": "An exercise could turn a fictional customer enquiry into a draft reply, then ask the team to check its facts and tone.",
    "cta": "Discuss training for my team",
    "interest": "Practical AI training for our team"
  },
  {
    "id": "q5",
    "topic": "work",
    "question": "Can AI work with the systems and spreadsheets we already use?",
    "answer": "Sometimes. It depends on the system's integration options, access permissions, data quality and the task you want to perform. Some workflows can use an approved export; others need a supported connection or a change in process. Not every system needs to be replaced.",
    "help": "We assess your current setup and identify feasible options, costs and limitations before proposing an integration. Where a connection is suitable, we can scope the implementation and test it with controlled examples.",
    "example": "A spreadsheet-based weekly report may be a better first project than replacing an entire business system.",
    "cta": "Review our existing setup",
    "interest": "Connecting our existing tools"
  },
  {
    "id": "q6",
    "topic": "work",
    "question": "Can we make our paper documents and scattered files easier to find?",
    "answer": "Yes—a well-planned digitisation process can make records easier to organise and retrieve. That usually starts with scanning, text recognition, consistent naming, indexing and access permissions. AI-assisted search may be useful later, once the underlying records and controls are suitable.",
    "help": "We discuss your records, retrieval needs and current systems, then scope a digitisation and document-management workflow. Scanned text needs quality checks; access, retention and specialist obligations must be addressed for the type of records involved.",
    "example": "The goal: find an authorised record by a useful reference, instead of searching through folders manually.",
    "cta": "Discuss our document workflow",
    "interest": "Document digitisation and retrieval"
  },
  {
    "id": "q7",
    "topic": "work",
    "question": "Can AI help us attract customers and handle enquiries?",
    "answer": "AI can help prepare content, organise common questions and draft replies. It still needs accurate information, a clear offer and human review. Turning interest into business also depends on a useful website, a straightforward way to enquire and reliable follow-up.",
    "help": "We can scope a clearer website and enquiry journey, improve the process behind follow-up, and explore suitable AI-assisted tasks. Any proposed automation needs defined limits and a way for people to step in.",
    "example": "Start with clear answers to common customer questions and one reliable route to contact your business. No tool can guarantee sales.",
    "cta": "Improve our enquiry journey",
    "interest": "Website and customer enquiry workflows"
  },
  {
    "id": "q8",
    "topic": "work",
    "question": "Which repetitive admin tasks should we simplify first?",
    "answer": "Look for work that happens often, follows reasonably clear rules and creates avoidable re-entry or delays. Examples include transferring enquiry details, preparing routine updates and compiling reports. Some tasks are better solved with a form, a template or ordinary automation than with AI.",
    "help": "We map the process, identify the repeated steps and recommend a practical improvement. Depending on the need, that could involve workflow design, inventory processes, a custom application or a connection between existing tools.",
    "example": "A useful question: “Where are we entering the same information more than once?”",
    "cta": "Review a repetitive task",
    "interest": "Simplifying repetitive admin"
  },
  {
    "id": "q9",
    "topic": "people",
    "question": "How do we check AI answers and keep people in control?",
    "answer": "Treat AI output as a draft. Check important statements against trusted source material, review calculations and decide who must approve the result. A confident answer can still contain an error. Higher-impact decisions need stronger review and appropriate expertise.",
    "help": "We help teams build practical checking habits and define where human approval belongs in a workflow. Training can include spotting mistakes, improving instructions and recognising tasks that should remain with a qualified person.",
    "example": "For a customer reply, check names, dates, prices and commitments before anyone sends it.",
    "cta": "Build a review step into our work",
    "interest": "AI output checks and human approval"
  },
  {
    "id": "q10",
    "topic": "start",
    "question": "Who helps us keep everything working after setup?",
    "answer": "Agree ongoing ownership before rollout: who supports users, manages access, updates tools and checks the process still works. Support arrangements should make clear what is included, the hours of service and how issues are reported.",
    "help": "We discuss managed technology support, troubleshooting and follow-on training based on your needs. If the underlying setup needs attention, we can also scope ICT installation or structured cabling. Service hours, response commitments and any third-party costs are agreed in the proposal.",
    "example": "You should know who to contact and what happens next when an issue arises.",
    "cta": "Discuss ongoing support",
    "interest": "Ongoing ICT and managed support"
  }
];
