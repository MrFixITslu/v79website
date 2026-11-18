/**
 * Public marketing copy shared between the React pages and server SEO fallback.
 * Capabilities are illustrative scope options, not guarantees or fixed SLAs.
 * Client names, ratings, prices and product availability must never be fabricated.
 */
export interface ServicePage {
  slug: string;
  path: string;
  title: string;
  label: string;
  eyebrow: string;
  summary: string;
  introduction: string;
  includes: string[];
  audiences: string[];
  steps: { title: string; detail: string }[];
  faqs: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
}

export interface ProductScreenshot {
  src: string;
  title: string;
  caption: string;
  sourceNote: string;
}

export interface ProductPage {
  slug: string;
  path: string;
  title: string;
  domain: string;
  iconPath: string;
  faviconPath: string;
  summary: string;
  problem: string;
  capabilities: string[];
  steps: { title: string; detail: string }[];
  audiences: string[];
  faqs: { question: string; answer: string }[];
  screenshots: ProductScreenshot[];
  metaTitle: string;
  metaDescription: string;
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "managed-it-support",
    path: "/services/managed-it-support",
    title: "Managed IT Support",
    label: "Keep everyday technology working",
    eyebrow: "Everyday business continuity",
    summary: "Practical support for the computers, systems and people your business relies on.",
    introduction: "When something stops working, people need clear answers and a reliable next step. We help organisations organise IT support, look after essential equipment and plan improvements before small problems grow.",
    includes: ["Helpdesk and troubleshooting under an agreed support plan", "Workstation, device and account support", "Routine maintenance and monitoring where contracted", "Issue records, follow-up and clear escalation", "Advice on updates, replacements and technology priorities"],
    audiences: ["Small businesses without a dedicated IT team", "Offices needing a dependable point of contact", "Growing teams looking for more consistent support"],
    steps: [
      { title: "Tell us what is happening", detail: "We listen to your priorities, current difficulties and how your business operates." },
      { title: "Agree what support covers", detail: "We document systems, service hours, responsibilities and response arrangements before work begins." },
      { title: "Set up and support", detail: "We put the agreed support approach in place and provide a clear way to request help." },
      { title: "Review and improve", detail: "Recurring issues and useful improvements become part of a practical action plan." }
    ],
    faqs: [
      { question: "Do you offer on-site and remote support?", answer: "Support methods depend on your location and the agreed plan. We discuss remote and on-site arrangements during consultation." },
      { question: "Is round-the-clock support included?", answer: "Coverage and response times are agreed in writing for each service plan. We do not assume every plan includes 24-hour assistance." }
    ],
    metaTitle: "Managed IT Support for Saint Lucia Businesses | V79 Digital",
    metaDescription: "Get practical managed IT support, troubleshooting and maintenance for your business. Clear scopes, realistic response arrangements and local understanding."
  },
  {
    slug: "cybersecurity",
    path: "/services/cybersecurity",
    title: "Cybersecurity",
    label: "Reduce avoidable digital risks",
    eyebrow: "Safer everyday operations",
    summary: "Understand your most important security risks and strengthen protection without unnecessary complexity.",
    introduction: "Security starts with knowing what matters to your organisation. We help assess practical exposure, prioritise safeguards and establish workable habits for teams.",
    includes: ["Security reviews and prioritised improvement plans", "Account protection and multi-factor authentication guidance", "Endpoint and email protection planning", "Backup and recovery readiness reviews", "Staff security awareness and practical training"],
    audiences: ["Businesses working with customer information", "Teams using Microsoft 365 and shared devices", "Organisations wanting a clearer security improvement plan"],
    steps: [
      { title: "Understand the environment", detail: "Identify the systems, people and information that need protection." },
      { title: "Review likely risks", detail: "Agree the assessment scope and identify important gaps without disruptive testing." },
      { title: "Prioritise protections", detail: "Recommend measures appropriate to your size, exposure and budget." },
      { title: "Support better habits", detail: "Help teams maintain useful checks, updates and security awareness." }
    ],
    faqs: [
      { question: "Does a security review include penetration testing?", answer: "Penetration testing is a separate, explicitly authorised scope. Routine consultations do not include intrusive tests." },
      { question: "Can you guarantee that we will not be hacked?", answer: "No provider can guarantee that. We focus on sensible risk reduction, preparation and response planning." }
    ],
    metaTitle: "Practical Cybersecurity for Caribbean SMEs | V79 Digital",
    metaDescription: "Cybersecurity reviews, account protection, endpoint and email safeguards, backup readiness and practical security awareness for Caribbean businesses."
  },
  {
    slug: "cloud-backup",
    path: "/services/cloud-backup",
    title: "Cloud & Backup",
    label: "Protect files and support flexible work",
    eyebrow: "Resilience without guesswork",
    summary: "Make important information easier to access, protect and recover when something goes wrong.",
    introduction: "Cloud tools and backups are most useful when they fit your actual work. We help businesses plan Microsoft 365, file access, migration and recovery options with attention to connectivity and island operating conditions.",
    includes: ["Microsoft 365 and cloud-readiness discussions", "Mailbox and file migration planning", "Backup design and retention options", "Recovery priorities and restore-test planning", "Access permissions, user training and handover"],
    audiences: ["Offices moving from local files to shared cloud tools", "Businesses reviewing their backup arrangements", "Teams preparing for outages, device loss or storms"],
    steps: [
      { title: "Identify what matters", detail: "Agree which information and systems are critical to day-to-day work." },
      { title: "Choose an approach", detail: "Consider cloud services, costs, connectivity, recovery needs and security." },
      { title: "Migrate or configure", detail: "Implement the agreed changes with an appropriate continuity and rollback plan." },
      { title: "Practise recovery", detail: "Explain ownership, checks and restore testing under the agreed service scope." }
    ],
    faqs: [
      { question: "Does Microsoft 365 replace the need for backup?", answer: "Cloud availability and a suitable independent backup strategy solve different problems. We review retention and recovery requirements before recommending a plan." },
      { question: "Can you guarantee a recovery time?", answer: "Recovery objectives require assessment, suitable infrastructure and a specific agreement. We do not publish blanket recovery promises." }
    ],
    metaTitle: "Microsoft 365, Cloud & Backup Services | V79 Digital",
    metaDescription: "Plan Microsoft 365, cloud migration, secure file access, reliable backups and recovery for your Saint Lucia or Caribbean organisation."
  },
  {
    slug: "networks-voip",
    path: "/services/networks-voip",
    title: "Networks & VoIP",
    label: "Make business connectivity dependable",
    eyebrow: "Connections you can work with",
    summary: "Build and improve office networks, Wi-Fi and communications around the people who use them.",
    introduction: "Unreliable Wi-Fi, poor cabling or complicated phone systems slow down a business. We help review the layout, usage and requirements before recommending practical network changes.",
    includes: ["Local network and Wi-Fi surveys", "Structured cabling planning and installation", "Router, switch and firewall configuration within agreed scope", "Business connectivity and resilience advice", "VoIP readiness and phone-system options"],
    audiences: ["Offices with patchy Wi-Fi or regular connection problems", "Businesses expanding to more rooms or locations", "Teams considering a modern telephone system"],
    steps: [
      { title: "Describe the problem", detail: "Review coverage, devices, users and communication priorities." },
      { title: "Survey and design", detail: "Develop an appropriately sized cabling, Wi-Fi or network plan." },
      { title: "Install and configure", detail: "Coordinate the approved implementation and minimise avoidable disruption." },
      { title: "Document and hand over", detail: "Provide agreed configuration information and recommendations for ongoing support." }
    ],
    faqs: [
      { question: "Can a new router fix our Wi-Fi?", answer: "Sometimes. Coverage, interference, cabling and internet service limitations can also matter, so we investigate before recommending equipment." },
      { question: "Do you supply phone services?", answer: "We can discuss business VoIP options and identify the equipment, connectivity and provider arrangements required; supply terms depend on the proposal." }
    ],
    metaTitle: "Business Networks, Wi-Fi, Cabling & VoIP | V79 Digital",
    metaDescription: "Practical office network design, Wi-Fi, structured cabling, connectivity and VoIP planning for Saint Lucia businesses."
  },
  {
    slug: "ai-automation",
    path: "/services/ai-automation",
    title: "AI & Automation",
    label: "Reduce repetitive work thoughtfully",
    eyebrow: "More time for valuable work",
    summary: "Find practical, responsible ways for your team to use AI and automate repeatable processes.",
    introduction: "AI should make work easier, not add risk or complexity. We begin with a specific business problem, choose appropriate tools and help people use them responsibly.",
    includes: ["Practical AI readiness and workflow discussions", "Staff AI literacy and prompting workshops", "Simple automations and process improvements", "Privacy, human review and safe-use guidance", "Pilot design and success-measurement plans"],
    audiences: ["Owners spending time on repetitive administration", "Teams exploring AI but unsure where to begin", "Organisations needing safe, practical staff training"],
    steps: [
      { title: "Choose a useful task", detail: "Identify one repeatable problem with a measurable improvement." },
      { title: "Check data and risks", detail: "Decide what can be automated, what should stay human and how to protect information." },
      { title: "Try a small pilot", detail: "Test a limited workflow before committing to a larger solution." },
      { title: "Train and refine", detail: "Help staff use the solution, review outputs and measure whether it helps." }
    ],
    faqs: [
      { question: "Do we need to purchase AI software immediately?", answer: "Not necessarily. Start by defining the business problem and considering existing tools before new subscriptions." },
      { question: "Will AI make decisions without a person?", answer: "We recommend appropriate human review and approval for material business decisions, especially where private or sensitive information is involved." }
    ],
    metaTitle: "AI Training, Workflow Automation & Advisory | V79 Digital",
    metaDescription: "Practical AI training, safe-use guidance and tailored automation for Caribbean SMEs. Start with a useful workflow, not unnecessary complexity."
  },
  {
    slug: "business-software",
    path: "/services/business-software",
    title: "Business Software & Development",
    label: "Turn manual workflows into useful tools",
    eyebrow: "Software that fits your business",
    summary: "Improve everyday processes with practical business applications, websites and tailored digital tools.",
    introduction: "Not every business needs custom software. We help identify the right approach, from improving an existing system to adopting a V79 application or building a carefully scoped solution.",
    includes: ["Workflow and requirements discovery", "Website and application development scoping", "Database and reporting solutions", "Software adoption and user training", "Integration planning where systems permit it"],
    audiences: ["Businesses relying on spreadsheets and disconnected tools", "Teams wanting simpler customer or work tracking", "Organisations exploring an application or website"],
    steps: [
      { title: "Map the current work", detail: "Understand the real steps people follow and where time is lost." },
      { title: "Compare options", detail: "Assess existing software, V79 products and custom development." },
      { title: "Agree a small first release", detail: "Set the requirements, boundaries, acceptance checks and support arrangements." },
      { title: "Launch and learn", detail: "Implement after approval, train users and use feedback to guide improvements." }
    ],
    faqs: [
      { question: "Do we need a custom application?", answer: "Not always. We first check whether an existing product or a smaller workflow change solves the problem." },
      { question: "Can we try a V79 product?", answer: "You can explore the product pages and ask about current access or demonstration options. Features and availability depend on the individual application." }
    ],
    metaTitle: "Business Software, Websites & SaaS Development | V79 Digital",
    metaDescription: "Discuss business software, website development, workflow improvements and practical applications with V79 Digital."
  }
];

export const PRODUCT_PAGES: ProductPage[] = [
  {
    slug: "hub",
    path: "/software/hub",
    title: "V79 Hub",
    domain: "hub.v79sl.com",
    iconPath: "/design-assets/apps/hub-icon.png",
    faviconPath: "/design-assets/apps/hub-icon.png",
    summary: "A central place to reach the V79 applications available to your business.",
    problem: "Switching between disconnected systems makes even simple work harder. Hub is designed to make your enabled V79 business tools easier to find and access.",
    capabilities: ["Central entry point for V79 business applications", "Business workspace and account access", "Application access based on enabled services", "A place to explore connected business workflows"],
    steps: [
      { title: "Open your workspace", detail: "Sign in through V79 Hub using the access provided for your organisation." },
      { title: "Choose an enabled app", detail: "See and open the business applications available under your workspace." },
      { title: "Work in the right tool", detail: "Manage the relevant task in its dedicated application." },
      { title: "Get help when needed", detail: "Use the available support route or contact V79 Digital about access." }
    ],
    audiences: ["Businesses evaluating connected V79 tools", "Teams using more than one V79 application", "Existing customers looking for their Hub sign-in"],
    faqs: [
      { question: "Does Hub include every V79 app automatically?", answer: "No. Available products and access depend on the services enabled for your organisation." },
      { question: "Can I sign in now?", answer: "Existing authorised users can open Hub. If your organisation does not have access, contact V79 Digital to discuss the current options." }
    ],
    screenshots: [
      { src: "/design-assets/screenshots/hub/screen-1.png", title: "Hub Sign-In & Workspace Security", caption: "Authorised users sign in once with email, password and multi-factor authentication.", sourceNote: "Live app screen" },
    ],
    metaTitle: "V79 Hub | Connected Business Applications",
    metaDescription: "Explore V79 Hub, the central workspace connecting V79 business applications for authorised users."
  },
  {
    slug: "tiquet",
    path: "/software/tiquet",
    title: "Tiquet",
    domain: "tiquet.v79sl.com",
    iconPath: "/design-assets/apps/tiquet-icon.png",
    faviconPath: "/design-assets/apps/tiquet-icon.png",
    summary: "A clearer way to organise support requests and make sure each one has a next step.",
    problem: "When requests are scattered across calls, chats and messages, it is easy to lose track of what needs attention. Tiquet helps organise requests into a more visible workflow.",
    capabilities: ["Record and organise service requests", "View ticket status and work history", "Assign and follow up on requests within the supported workflow", "Keep related updates together", "Support a more consistent service delivery process"],
    steps: [
      { title: "Receive a request", detail: "Capture what the customer or team needs help with." },
      { title: "Make it visible", detail: "Create or review the ticket and its relevant information." },
      { title: "Work and update", detail: "Track progress and record the next action." },
      { title: "Close the loop", detail: "Complete the request and retain the history for follow-up." }
    ],
    audiences: ["Service teams managing multiple requests", "SMEs needing clearer follow-up", "Organisations exploring structured helpdesk processes"],
    faqs: [
      { question: "Is Tiquet a customer portal?", answer: "The available features and customer access depend on the current application release. Ask us for a demonstration of the supported workflow." },
      { question: "How do we try Tiquet?", answer: "Contact V79 Digital about the current demonstration or access arrangements. We do not promise an unrestricted self-service trial here." }
    ],
    screenshots: [
    ],
    metaTitle: "Tiquet | Service Request & Ticket Tracking",
    metaDescription: "Discover Tiquet: simple service request and ticket tracking to help businesses follow up, organise work and keep requests moving."
  },
  {
    slug: "pos",
    path: "/software/pos",
    title: "V79 POS",
    domain: "pos.v79sl.com",
    iconPath: "/design-assets/apps/pos-icon.png",
    faviconPath: "/design-assets/apps/pos-favicon.png",
    summary: "A clearer view of sales, register checkout, stock movements and purchasing.",
    problem: "Disconnected spreadsheets and counter tools hide low stock, margin gaps and supplier delays. V79 POS connects checkout activity, catalogue pricing and location stock in one workflow.",
    capabilities: ["Fast counter register and sale totals", "Product catalogue, SKUs and variant pricing", "Location stock balances and low-stock visibility", "Supplier records and purchase order receiving", "Customer purchase history and margin reporting"],
    steps: [
      { title: "Set up your catalogue", detail: "Create product records, categories, variants and selling locations." },
      { title: "Run the register", detail: "Complete counter sales and track register activity clearly." },
      { title: "Watch stock levels", detail: "Review on-hand and available inventory quantities across locations." },
      { title: "Replenish from suppliers", detail: "Create purchase orders and receive stock directly into inventory." }
    ],
    audiences: ["Retail shops and counter-service businesses", "Distributors managing multi-location inventory", "Stores replacing manual sales and stock sheets"],
    faqs: [
      { question: "Can we preview the interface before subscribing?", answer: "Yes. Five real screens from the live V79 POS demo workspace are shown below." },
      { question: "Does it support multiple locations?", answer: "Inventory location balances and stock health views help separate stock by store or warehouse." }
    ],
    screenshots: [
      { src: "/design-assets/screenshots/pos/screen-1.png", title: "POS Sales & Margin Overview", caption: "Monitor net revenue, completed sales, average ticket size and gross margin.", sourceNote: "Live demo screen" },
      { src: "/design-assets/screenshots/pos/screen-2.png", title: "Register & Checkout Counter", caption: "Add catalogue products, adjust quantities and complete customer sales.", sourceNote: "Live demo screen" },
      { src: "/design-assets/screenshots/pos/screen-3.png", title: "Product Catalogue & Variant Pricing", caption: "Manage SKUs, categories, pricing and current sellable stock levels.", sourceNote: "Live demo screen" },
      { src: "/design-assets/screenshots/pos/screen-4.png", title: "Location Inventory Balances", caption: "Inspect on-hand quantities, available stock and health alerts per location.", sourceNote: "Live demo screen" },
      { src: "/design-assets/screenshots/pos/screen-5.png", title: "Suppliers & Purchase Orders", caption: "Create replenishment purchase orders and track incoming supplier deliveries.", sourceNote: "Live demo screen" }
    ],
    metaTitle: "V79 POS | Retail Sales, Stock & Purchasing",
    metaDescription: "Explore V79 POS: register checkout, product catalogue, stock balances and supplier purchasing in one connected workspace."
  },
  {
    slug: "ffpro",
    path: "/software/ffpro",
    title: "FFPRO",
    domain: "ffpro.v79sl.com",
    iconPath: "/design-assets/apps/ffpro-icon.png",
    faviconPath: "/design-assets/apps/ffpro-icon.png",
    summary: "Bring budgets, transactions, reserve goals and cashflow forecasts into one clear workspace.",
    problem: "When spending, invoices and upcoming bills live across scattered files, owners make cash decisions in the dark. FFPRO makes budgets, ledgers and forecasts easier to inspect.",
    capabilities: ["Monthly cashflow inflows vs outflows overview", "Income and expense transaction ledger", "Category budget allocations and variance tracking", "Dedicated reserve and savings goal planning", "Recurring commitments and 90-day scenario views"],
    steps: [
      { title: "Record activity", detail: "Capture inflows, expenses and recurring obligations cleanly." },
      { title: "Assign category budgets", detail: "Set clear monthly targets across core operating categories." },
      { title: "Track reserves", detail: "Monitor contributions toward equipment, tax and emergency goals." },
      { title: "Review forecast", detail: "Preview upcoming commitments and runway scenarios ahead of spending." }
    ],
    audiences: ["Small and growing Caribbean businesses", "Teams managing tight working-capital budgets", "Owners separating operational and reserve cashflow"],
    faqs: [
      { question: "Is FFPRO accounting software for tax filing?", answer: "FFPRO focuses on practical budgeting, cashflow visibility, reserve goals and forecasting rather than replacing licensed tax audit filings." },
      { question: "Can multiple categories be tracked?", answer: "Yes, operating categories can be budgeted and monitored against monthly variance." }
    ],
    screenshots: [
    ],
    metaTitle: "FFPRO | Business Financial Planning & Cashflow",
    metaDescription: "Explore FFPRO: budgets, transaction ledgers, savings goals and cashflow forecasting in one clear finance workspace."
  },
  {
    slug: "marketing",
    path: "/software/marketing",
    title: "V79 Marketing",
    domain: "marketing.v79sl.com",
    iconPath: "/design-assets/apps/marketing-icon.png",
    faviconPath: "/design-assets/apps/marketing-icon.png",
    summary: "Plan campaigns, brand messaging, content calendars and authorised channels consistently.",
    problem: "Ad-hoc posting and scattered assets make consistent marketing hard to sustain. V79 Marketing organises campaigns, approvals, channel tokens and follow-up enquiries.",
    capabilities: ["Brand profile and approved messaging guidelines", "Campaign planner with owners and deliverable deadlines", "Publishing calendar and draft approval workflow", "Official OAuth channel connection management", "Verified lead follow-up without simulated analytics"],
    steps: [
      { title: "Set brand context", detail: "Keep voice, positioning notes and core offers available." },
      { title: "Plan campaigns", detail: "Organise campaigns, owners, deliverables and target dates." },
      { title: "Schedule posts", detail: "Prepare drafts and coordinate calendar publishing windows." },
      { title: "Review real enquiries", detail: "Track incoming enquiries and connected channel status transparently." }
    ],
    audiences: ["Businesses building regular outreach habits", "Teams needing structured draft approvals", "Organisations managing multi-channel calendars"],
    faqs: [
      { question: "Does V79 Marketing use connected OAuth accounts?", answer: "Supported channel providers connect through official OAuth authorisation flows so token permissions stay transparent." },
      { question: "Are simulated analytics shown?", answer: "No. Connected reporting relies strictly on actual verified data returned by authorised channels." }
    ],
    screenshots: [
    ],
    metaTitle: "V79 Marketing | Campaigns, Content & Channels",
    metaDescription: "Explore V79 Marketing: campaign planning, publishing calendars, brand guidelines and authorised channel management."
  },
  {
    slug: "academy",
    path: "/software/academy",
    title: "V79 Academy",
    domain: "academy.v79sl.com",
    iconPath: "/design-assets/apps/academy-icon.png",
    faviconPath: "/design-assets/apps/academy-icon.png",
    summary: "Practical digital, AI and technology courses structured around clear modules and hands-on practice.",
    problem: "Passive video playlists rarely translate into workplace confidence. V79 Academy organises structured courses around Understand, Practise, Check and Apply steps.",
    capabilities: ["Structured curriculum modules and interactive lessons", "Searchable catalogue by track and difficulty", "Practical exercises tailored for workplace workflows", "Readiness checks and learner progress tracking", "Individual and team enrolment pathways"],
    steps: [
      { title: "Choose a track", detail: "Pick an AI, cybersecurity or workplace technology course." },
      { title: "Work step by step", detail: "Complete readings, guided prompts and practical tasks." },
      { title: "Check readiness", detail: "Verify understanding with structured module checks." },
      { title: "Apply at work", detail: "Carry repeatable habits and templates into daily operations." }
    ],
    audiences: ["Teams building safe AI and digital habits", "Professionals upgrading practical technology fluency", "Organisations training staff across departments"],
    faqs: [
      { question: "Can we preview live Academy screens?", answer: "Yes. Five captures directly from the live V79 Academy platform are shown below." },
      { question: "Do learners need separate accounts?", answer: "Learners sign in through the Academy portal or V79 Hub depending on how organisational access is provisioned." }
    ],
    screenshots: [
      { src: "/design-assets/screenshots/academy/screen-1.png", title: "Academy Home & 4-Step Method", caption: "Follow the Understand, Practise, Check and Apply learning path.", sourceNote: "Live app screen" },
      { src: "/design-assets/screenshots/academy/screen-2.png", title: "Interactive Course Catalogue", caption: "Browse, search and filter courses by learning path and focus.", sourceNote: "Live app screen" },
      { src: "/design-assets/screenshots/academy/screen-3.png", title: "Course Overview & Lesson Scope", caption: "Inspect practical course outcomes and requirements before enrolling.", sourceNote: "Live app screen" },
      { src: "/design-assets/screenshots/academy/screen-4.png", title: "Structured Module Outline", caption: "Move cleanly through numbered lessons, exercises and readiness checks.", sourceNote: "Live app screen" },
      { src: "/design-assets/screenshots/academy/screen-5.png", title: "Learner Account Registration", caption: "Sign in or register a learner profile to save progress across modules.", sourceNote: "Live app screen" }
    ],
    metaTitle: "V79 Academy | Practical Digital & AI Learning",
    metaDescription: "Explore V79 Academy: structured AI, cybersecurity and workplace technology training built for real Caribbean teams."
  }
];

export function getServicePage(path: string): ServicePage | undefined {
  return SERVICE_PAGES.find(page => page.path === path);
}

export function getProductPage(path: string): ProductPage | undefined {
  return PRODUCT_PAGES.find(page => page.path === path);
}

