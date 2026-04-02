export const SAMPLE_JOBS = [
  {
    id: BigInt(1),
    title: "Security Guard",
    company: "Tata Motors",
    location: "Mumbai, Maharashtra",
    salary: "₹15,000/month",
    category: "Security",
    description:
      "Tata Motors ke liye experienced security guard chahiye. Day/Night shifts available. Uniform aur khana provided. 10th pass eligible. 2+ saal experience preferred.",
    employerId: null as any,
  },
  {
    id: BigInt(2),
    title: "Delivery Executive",
    company: "Zomato",
    location: "Delhi, NCR",
    salary: "₹18,000/month",
    category: "Delivery",
    description:
      "Zomato ke liye delivery partner chahiye. Apni bike zaroori hai. Flexible timing, weekly payment. Incentives extra milenge. Joining bonus ₹2,000.",
    employerId: null as any,
  },
  {
    id: BigInt(3),
    title: "Head Cook",
    company: "Hotel Taj",
    location: "Pune, Maharashtra",
    salary: "₹20,000/month",
    category: "Cook",
    description:
      "5-star hotel mein experienced cook chahiye. Multi-cuisine experience preferred. ITI certificate holders ko preference milegi. Free accommodation available.",
    employerId: null as any,
  },
  {
    id: BigInt(4),
    title: "Driver (Cab)",
    company: "Ola",
    location: "Bangalore, Karnataka",
    salary: "₹25,000/month",
    category: "Driver",
    description:
      "Ola platform pe driving karo, zyada kamao. Valid driving license zaroori. Car bhi de sakte hain agar nahi hai. Weekly earnings guarantee.",
    employerId: null as any,
  },
  {
    id: BigInt(5),
    title: "Electrician",
    company: "L&T Construction",
    location: "Hyderabad, Telangana",
    salary: "₹22,000/month",
    category: "Electrician",
    description:
      "Industrial electrician vacancy hai L&T mein. ITI/Diploma in Electrical required. Safety training provide ki jaayegi. PF, ESI benefits included.",
    employerId: null as any,
  },
  {
    id: BigInt(6),
    title: "Plumber",
    company: "Godrej Properties",
    location: "Noida, UP",
    salary: "₹16,000/month",
    category: "Plumber",
    description:
      "Residential complex mein experienced plumber chahiye. Tools provided. Local candidates preferred. Overtime pay extra milega.",
    employerId: null as any,
  },
];

export const SAMPLE_COURSES = [
  {
    id: BigInt(1),
    title: "Security Training Basics",
    description:
      "2 din mein certified security guard ban jao. Entry-level se shuru karein, professional training paayein.",
    duration: "2 Din",
    badge: "Free Certificate",
    emoji: "🛡️",
  },
  {
    id: BigInt(2),
    title: "Safe Driving Tips",
    description:
      "Traffic rules seekho, accidents se bachao. Cab/delivery drivers ke liye zaruri course.",
    duration: "1 Din",
    badge: "Govt. Recognized",
    emoji: "🚗",
  },
  {
    id: BigInt(3),
    title: "Food Hygiene Certificate",
    description:
      "Hotel aur restaurant jobs ke liye zaroori hai FSSAI certificate. Online course.",
    duration: "3 Din",
    badge: "FSSAI Approved",
    emoji: "🍽️",
  },
  {
    id: BigInt(4),
    title: "Basic Electrical Wiring",
    description:
      "Ghar aur office ki wiring seekho. ITI students ke liye best course to boost career.",
    duration: "5 Din",
    badge: "Industry Ready",
    emoji: "⚡",
  },
  {
    id: BigInt(5),
    title: "English Speaking Basics",
    description:
      "Thodi English seekho, badi naukri pao. Corporate jobs ke liye communication skills.",
    duration: "7 Din",
    badge: "Trending",
    emoji: "💬",
  },
];

export const ABROAD_JOBS = [
  {
    id: 1,
    title: "Security Guard",
    company: "G4S Security",
    country: "Dubai, UAE",
    flag: "🇦🇪",
    salary: "AED 1,500/month",
    inrSalary: "~₹34,000/month",
    salaryINR: "AED 1,500/month (~₹34,000)",
    processingFee: "₹4,500 processing fee",
    visa: "Employment Visa",
    requirements: "Basic English, 10th Pass",
    category: "Security",
  },
  {
    id: 2,
    title: "Construction Helper",
    company: "Qatar Build Co.",
    country: "Doha, Qatar",
    flag: "🇶🇦",
    salary: "QAR 1,200/month",
    inrSalary: "~₹27,000/month",
    salaryINR: "QAR 1,200/month (~₹27,000)",
    processingFee: "₹6,000 processing fee",
    visa: "Work Permit",
    requirements: "Physical fitness, 8th Pass",
    category: "Construction",
  },
  {
    id: 3,
    title: "Cleaner / Housekeeper",
    company: "CleanPro Svc",
    country: "Singapore",
    flag: "🇸🇬",
    salary: "SGD 800/month",
    inrSalary: "~₹49,000/month",
    salaryINR: "SGD 800/month (~₹49,000)",
    processingFee: "₹5,000 processing fee",
    visa: "S Pass",
    requirements: "Experience preferred, 10th Pass",
    category: "Cleaner",
  },
  {
    id: 4,
    title: "Driver (Truck)",
    company: "Saudi Transport",
    country: "Riyadh, Saudi Arabia",
    flag: "🇸🇦",
    salary: "SAR 1,800/month",
    inrSalary: "~₹40,000/month",
    salaryINR: "SAR 1,800/month (~₹40,000)",
    processingFee: "₹7,000 processing fee",
    visa: "Iqama",
    requirements: "Valid Indian DL, 2+ years exp",
    category: "Driver",
  },
  {
    id: 5,
    title: "Hotel Steward",
    company: "Marriott Hotels",
    country: "Kuala Lumpur, Malaysia",
    flag: "🇲🇾",
    salary: "MYR 1,500/month",
    inrSalary: "~₹28,000/month",
    salaryINR: "MYR 1,500/month (~₹28,000)",
    processingFee: "₹5,500 processing fee",
    visa: "Employment Pass",
    requirements: "Hotel experience, Basic English",
    category: "Hotel",
  },
];

export const JOB_CATEGORIES = [
  { label: "Driver", emoji: "🚗", color: "bg-blue-100 text-blue-700" },
  { label: "Security", emoji: "🛡️", color: "bg-purple-100 text-purple-700" },
  { label: "Delivery", emoji: "📦", color: "bg-orange-100 text-orange-700" },
  { label: "Cook", emoji: "👨‍🍳", color: "bg-yellow-100 text-yellow-700" },
  { label: "Helper", emoji: "🤝", color: "bg-green-100 text-green-700" },
  { label: "Electrician", emoji: "⚡", color: "bg-indigo-100 text-indigo-700" },
  { label: "Plumber", emoji: "🔧", color: "bg-teal-100 text-teal-700" },
  { label: "Cleaner", emoji: "🧹", color: "bg-pink-100 text-pink-700" },
];

export const HUNAR_PROGRAM = {
  id: "hunar-bbn-1",
  title: "Hunar ki Udaan Program",
  partner: "Barbeque Nation",
  description:
    "Barbeque Nation ke saath hospitality skills seekho. Is program mein aapko professional kitchen management, customer service, food handling, aur hotel operations ki training milegi. Real-world experience aur certification ke saath apna career shuru karo.",
  duration: "4–8 weeks",
  eligibility: "8th pass ya usse zyada, 18–35 years, basic Hindi/English",
  certification: "Barbeque Nation Certified Hospitality Professional",
  seats: 50,
  badge: "Featured",
  emoji: "🍖",
};
