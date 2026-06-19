import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Zap, 
  Shield, 
  Sparkles, 
  AlertCircle, 
  FileCheck,
  RotateCcw,
  Sliders,
  Mail,
  User,
  Building,
  CheckCircle2,
  Download
} from "lucide-react";

// Types & Interfaces
interface AccordionItem {
  question: string;
  answer: string;
}

interface LeadFormData {
  companyName: string;
  contactName: string;
  email: string;
  agreed: boolean;
}

export default function App() {
  // --- States ---
  // Before & After Interactive Slider (0 = Full Before, 100 = Full After)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const beforeAfterContainerRef = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  // FAQ Accordion Active Index
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  // Lead Form State
  const [formData, setFormData] = useState<LeadFormData>({
    companyName: "",
    contactName: "",
    email: "",
    agreed: false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // FAQ Data List
  const faqList: AccordionItem[] = [
    {
      question: "서비스 도입까지 기간이 얼마나 걸리나요?",
      answer: "기존 인프라의 규모에 따라 상이하지만, 평균적으로 영업일 기준 3~5일 이내에 완벽하게 세팅 및 즉시 활성화가 가능하도록 전담 매니저가 신속하게 지원해 드립니다."
    },
    {
      question: "기존에 사용하던 데이터와 호환이 되나요?",
      answer: "네, Excel, CSV뿐만 아니라 기존에 기업에서 사용하시던 주요 클라우드 서비스 및 데이터베이스 솔루션과의 유연한 임포트/익스포트 인터페이스를 제공하여 유실 없는 안전한 이전을 약속드립니다."
    },
    {
      question: "초기 구축 비용 외에 추가 비용이 발생하나요?",
      answer: "제시 계약해 드리는 기본 라이선스 비용 외에 어떠한 숨겨진 추가 비용도 청구되지 않습니다. 신규 인프라가 대칭 확장되거나 추가 커스텀 라이선스가 요구되는 특수한 경우에만 고객사와 투명하게 선협의 후 집행합니다."
    },
    {
      question: "소규모 스타트업이나 개인 비즈니스도 사용이 가능한가요?",
      answer: "물론입니다. 본 솔루션은 비즈니스의 성장 속도에 부응하는 고도로 탄력적인 구독 요금제를 설계하고 있어, 1인 창업가부터 수백 명 규모의 중소벤처 및 중견 기업까지 규모에 최적화된 형태로 유연하게 시작하실 수 있습니다."
    },
    {
      question: "도입 후 유지보수 및 기술 지원 서비스는 어떻게 제공되나요?",
      answer: "도입 완료 즉시 모든 파트너 기업 고객사에 최고 전문성 수준의 전담 엔지니어가 매칭됩니다. 24/7 연중무휴 긴급 모니터링 시스템을 구축하여 장애를 방지하고 신속한 실시간 응대를 책임지고 있습니다."
    }
  ];

  // Handle Before & After Mouse/Touch Move
  const handleMove = (clientX: number) => {
    if (!beforeAfterContainerRef.current) return;
    const rect = beforeAfterContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSliding && e.buttons !== 1) return; // Only move when clicking
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  // Click smooth scroll to Lead Capture Form
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("lead-capture-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Lead Form Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = "회사 이름을 입력해 주세요.";
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = "담당자 이름을 입력해 주세요.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "이메일 주소를 입력해 주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!formData.agreed) {
      newErrors.agreed = "개인정보 수집 및 이용 동의가 필요합니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
      setIsDownloading(true);

      // Google Apps Script Web App URL Integration
      // Please deploy your Google Apps Script as a Web App (with 'Anyone' access) and paste its URL here:
      const appsScriptUrl = "https://script.google.com/macros/s/AKfycbwmdqdFz0S5Q_9UP1lLvrsk_KyARV_mx_9oOvC8UtzDQMDAUdVagjAyqKqfzfEtMn0X/exec";

      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              companyName: formData.companyName,
              contactName: formData.contactName,
              email: formData.email,
            }),
          });
        } catch (error) {
          console.error("Error sending lead to Google Sheets:", error);
        }
      }

      // Simulate beautiful brochure PDF download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        if (progress >= 100) {
          setDownloadProgress(100);
          clearInterval(interval);
          
          // Trigger the high-impact celebration animation when brochure is ready!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });

          // Automatically open the PDF file in a new window/tab upon successful completion
          try {
            window.open("https://drive.google.com/file/d/1E4iAT0nojs1IBnpo8ebGLywdnx73FUQV/view?usp=drive_link", "_blank");
          } catch (e) {
            console.error("Popup window block prevented opening PDF:", e);
          }
          
          setTimeout(() => {
            setIsDownloading(false);
          }, 800);
        } else {
          setDownloadProgress(progress);
        }
      }, 50);
    }
  };

  // Reset form helper
  const handleReset = () => {
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      agreed: false
    });
    setErrors({});
    setIsSubmitted(false);
    setDownloadProgress(0);
  };

  return (
    <div id="app-root" className="min-h-screen bg-white text-[#1D1D1F] overflow-x-hidden selection:bg-[#FF3B30]/10 selection:text-[#FF3B30]">
      
      {/* Absolute Minimal Premium Gutter (Apple style slim header) */}
      <header id="app-header" className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2 font-semibold tracking-tight text-lg hover:opacity-80 transition-opacity">
            <span className="w-5 h-5 rounded-full bg-[#FF3B30] flex items-center justify-center text-[10px] text-white font-bold">i</span>
            <span>서울IR</span>
          </a>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#86868B]">
            <a href="#services-section" className="hover:text-[#1D1D1F] transition-colors">제품 및 서비스</a>
            <a href="#features-section" className="hover:text-[#1D1D1F] transition-colors">핵심 경쟁력</a>
            <a href="#transformation-section" className="hover:text-[#1D1D1F] transition-colors">도입 전후 비교</a>
            <a href="#faq-section" className="hover:text-[#1D1D1F] transition-colors">자주 묻는 질문</a>
          </nav>
          <a 
            href="#lead-capture-section" 
            onClick={scrollToContact}
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FF3B30] text-white hover:bg-[#E0352B] active:scale-95 transition-all shadow-sm"
          >
            소개서 신청
          </a>
        </div>
      </header>

      {/* ① Hero Section */}
      <section id="hero-section" className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        {/* Subtle background decoration representing placeholders for client video/images */}
        <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-[50vw] h-[50vw] rounded-full filter blur-[120px] bg-gradient-to-tr from-[#FF3B30] to-orange-500 animate-pulse duration-[8000ms]"></div>
        </div>

        {/* Dynamic Placeholder indicator badge */}
        <div className="absolute bottom-6 left-6 z-10 hidden lg:flex items-center space-x-2 text-xs font-mono text-[#86868B] p-3 rounded-xl border border-black/5 bg-white/50 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></div>
          <span>[히어로_배경_파일명.mp4 또는 jpg] 대기 중</span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mt-12 mb-8">
          {/* Accent Line */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] text-[#FF3B30] text-[13px] font-semibold tracking-tight mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Next-Gen Business Standard</span>
          </div>

          {/* Big Bold Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#1D1D1F] leading-[1.1] mb-8">
            혁신은 여기서 <br />
            <span className="text-[#FF3B30] bg-gradient-to-r from-[#FF3B30] to-red-500 bg-clip-text text-transparent">시작됩니다</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#86868B] font-normal leading-relaxed max-w-2xl mx-auto mb-14 px-4" style={{ borderColor: "#6666a5", backgroundColor: "#ffffff" }}>
            우리는 단순한 비즈니스를 넘어, 당신의 상상을 현실로 만드는 가장 세련된 솔루션을 제공합니다. 압도적인 기술력과 간결한 가치를 지금 경험하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a 
              href="#lead-capture-section" 
              onClick={scrollToContact}
              className="group relative inline-flex items-center justify-center px-8 py-4 w-full sm:w-auto rounded-full text-base font-semibold bg-[#FF3B30] text-white overflow-hidden transition-all duration-300 hover:bg-[#E0352B] hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg shadow-red-500/10"
            >
              <span>상세 회사소개서 보기</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a 
              href="#services-section"
              className="inline-flex items-center justify-center px-8 py-4 w-full sm:w-auto rounded-full text-base font-semibold bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] transition-all active:scale-[0.98]"
            >
              서비스 더 알아보기
            </a>
          </div>
        </div>

        {/* Minimal Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-50 animate-bounce">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#86868B]">Scroll</span>
          <ChevronDown className="w-4 h-4 text-[#86868B]" />
        </div>
      </section>


      {/* ② Products & Services Section */}
      <section id="services-section" className="py-24 sm:py-32 bg-[#F5F5F7] border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="max-w-3xl mb-16 sm:mb-24">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF3B30] mb-3">Products & Services</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              비즈니스의 성장을 견인할<br className="hidden sm:inline" /> 맞춤형 핵심 솔루션 라인업
            </h2>
          </div>

          {/* Standard Apple 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group bg-white rounded-[24px] border border-black/5 overflow-hidden flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:shadow-black/5 hover:translate-y-[-4px] apple-shadow">
              {/* Image Zone Placeholder */}
              <div className="relative aspect-[4/3] bg-[#E8E8ED] overflow-hidden flex flex-col justify-between p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent"></div>
                {/* Visual Label showing customizable asset source */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-[#1D1D1F] text-white text-[10px] font-mono tracking-tight uppercase">[서비스1_이미지.jpg]</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#86868B]">Sync Engine</span>
                </div>
                {/* Abstract Visual representation */}
                <div className="relative z-10 flex flex-col justify-end h-full pt-12 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center border border-black/5 transition-transform group-hover:scale-110 duration-500">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-400 p-3 flex items-center justify-center text-white">
                      <Zap className="w-8 h-8 text-white fill-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Cloud Infrastructure</p>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-4">Enterprise Cloud Sync</h3>
                <p className="text-sm font-normal text-[#86868B] leading-relaxed">
                  모든 기기에서 실시간으로 데이터 전송 및 동기화되는 안전하고 강력한 고지능형 전사적 비즈니스 클라우드 인프라입니다.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-[24px] border border-black/5 overflow-hidden flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:shadow-black/5 hover:translate-y-[-4px] apple-shadow">
              {/* Image Zone Placeholder */}
              <div className="relative aspect-[4/3] bg-[#E8E8ED] overflow-hidden flex flex-col justify-between p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent"></div>
                {/* Visual Label showing customizable asset source */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-[#1D1D1F] text-white text-[10px] font-mono tracking-tight uppercase">[서비스2_이미지.jpg]</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#86868B]">AI Agent</span>
                </div>
                {/* Abstract Visual representation */}
                <div className="relative z-10 flex flex-col justify-end h-full pt-12 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center border border-black/5 transition-transform group-hover:scale-110 duration-500">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#FF3B30] to-red-400 p-3 flex items-center justify-center text-white">
                      <Sparkles className="w-8 h-8 text-white fill-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Workflow Automation</p>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-4">AI Workflow Automation</h3>
                <p className="text-sm font-normal text-[#86868B] leading-relaxed">
                  불필요한 고비용 반복 업무 프로세스를 제거하고, 우리 직원들이 오직 중요한 고객 가치 창출에만 극도로 밀입할 수 있도록 돕습니다.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-[24px] border border-black/5 overflow-hidden flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:shadow-black/5 hover:translate-y-[-4px] apple-shadow">
              {/* Image Zone Placeholder */}
              <div className="relative aspect-[4/3] bg-[#E8E8ED] overflow-hidden flex flex-col justify-between p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent"></div>
                {/* Visual Label showing customizable asset source */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-[#1D1D1F] text-white text-[10px] font-mono tracking-tight uppercase">[서비스3_이미지.jpg]</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#86868B]">Analytics Dashboard</span>
                </div>
                {/* Abstract Visual representation */}
                <div className="relative z-10 flex flex-col justify-end h-full pt-12 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center border border-black/5 transition-transform group-hover:scale-110 duration-500">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-3 flex items-center justify-center text-white">
                      <Shield className="w-8 h-8 text-white fill-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Metrics Solution</p>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-4">Advanced Data Analytics</h3>
                <p className="text-sm font-normal text-[#86868B] leading-relaxed">
                  흩어져 있는 방대한 비즈니스 핵심 지표를 정교하게 시각화하여, 언제나 최상의 타이밍에 명확하고 빠른 데이터 의사결정을 지원합니다.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ③ Key Features Section */}
      <section id="features-section" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="max-w-3xl mb-20 text-left">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF3B30] mb-3">Key Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              비교불가한 압도적 가치,<br className="hidden sm:inline" /> 오직 최고만을 타협하지 않고 탑재했습니다
            </h2>
          </div>

          {/* 3 Horizontal Strengths layout with prominent indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-8 lg:divide-x lg:divide-black/5">
            
            {/* Strength 1 */}
            <div className="flex flex-col space-y-6 lg:px-8 first:pl-0 last:pr-0">
              <div className="text-5xl font-extrabold text-[#FF3B30] font-mono tracking-tight flex items-center justify-between">
                <span>01</span>
                <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#FF3B30]">
                  <Zap className="w-5 h-5 fill-[#FF3B30]/20" />
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">압도적인 전송 속도</h3>
              <p className="text-base text-[#86868B] font-normal leading-relaxed">
                차세대 캐시 분산 구조 기술을 채택하여, 기존 비즈니스 엔진 서비스 대비 <strong className="text-[#1D1D1F] font-semibold text-base">최대 250% 더 고속 전송 속도</strong>와 지연 시간 0에 가까운 실시간 스트리밍 처리 인프라를 보증합니다.
              </p>
            </div>

            {/* Strength 2 */}
            <div className="flex flex-col space-y-6 lg:px-8">
              <div className="text-5xl font-extrabold text-[#FF3B30] font-mono tracking-tight flex items-center justify-between">
                <span>02</span>
                <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#FF3B30]">
                  <Shield className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">금융권 수준의 보안성</h3>
              <p className="text-base text-[#86868B] font-normal leading-relaxed">
                모든 엔드투엔드 연결에 첨단 군사 금융 등급의 다중 대칭 암호화 기술을 완벽하게 적용했습니다. 무중단 실시간 분산 서버 백업 아키텍처 지원으로 귀중한 기업 데이터 유실 걱정이 근원적으로 사라집니다.
              </p>
            </div>

            {/* Strength 3 */}
            <div className="flex flex-col space-y-6 lg:px-8">
              <div className="text-5xl font-extrabold text-[#FF3B30] font-mono tracking-tight flex items-center justify-between">
                <span>03</span>
                <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#FF3B30]">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">극도의 직관적이고 세련된 UI</h3>
              <p className="text-base text-[#86868B] font-normal leading-relaxed">
                어떠한 불필요한 부연설명이나 가이드 문서도 요구하지 않습니다. 애플 감성의 우아하고 인체공학적인 인터페이스 설계를 그대로 계승하여, 한 번의 터치로 모든 복잡한 작업을 능숙하게 끝마칠 수 있게 돕습니다.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ④ Before & After Section (The Transformation with Premium Interactive Slider UI) */}
      <section id="transformation-section" className="py-24 sm:py-32 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="max-w-3xl mb-16 text-left">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF3B30] mb-3">The Transformation</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              시스템 도입 전과 후,<br className="hidden sm:inline" /> 단 한 번의 도입으로 달라지는 업무의 생산성
            </h2>
            <p className="text-base text-[#86868B] mt-4">
              아래의 슬라이더 인터랙션을 밀어서 도입 후의 드라마틱하게 변화하는 결과를 즉각적으로 체험해 보세요.
            </p>
          </div>

          {/* Interactive Slider Container */}
          <div className="relative max-w-5xl mx-auto">
            
            {/* Visual Guide Label */}
            <div className="flex justify-between items-center text-xs text-[#86868B] font-semibold uppercase tracking-wider mb-4 px-2">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> <span>도입 전 (Before)</span></span>
              <button 
                onClick={() => setSliderPosition(sliderPosition < 50 ? 80 : 20)}
                className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-white rounded-full border border-black/5 hover:text-[#1D1D1F] hover:bg-white text-[11px] transition-colors active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>스위칭 재생</span>
              </button>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span> <span>도입 후 (After)</span></span>
            </div>

            {/* Slider Platform */}
            <div 
              ref={beforeAfterContainerRef}
              className="relative aspect-video sm:aspect-[2.3/1] bg-[#1D1D1F] rounded-3xl overflow-hidden select-none shadow-2xl border border-black/10 cursor-ew-resize"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsSliding(true)}
              onMouseUp={() => setIsSliding(false)}
              onMouseLeave={() => setIsSliding(false)}
            >
              
              {/* --- BEFORE SIDE (Left-most base layer, grayscale & muted dark) --- */}
              <div className="absolute inset-0 bg-[#2D2D30] text-slate-400 flex flex-col justify-center px-6 sm:px-16 md:px-24">
                <div className="w-fit px-3 py-1 bg-black/30 rounded-full text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-4 border border-white/5">
                  BEFORE (기존 시스템)
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-200">
                    인력을 무마하는 한계
                  </h3>
                  <p className="text-xs sm:text-sm md:text-lg max-w-md font-normal leading-relaxed text-slate-400">
                    수동 가동 입력의 본성적인 한계와 비체계적인 소통, 빈번히 터지는 전산 오류로 인해 하루 무의미하게 버려지는 <strong className="text-slate-100 font-semibold">평균 4.2시간의 막대한 경영 리소스</strong> 낭비.
                  </p>
                  
                  {/* Bad Stats Panel */}
                  <div className="grid grid-cols-2 gap-4 pt-4 max-w-sm">
                    <div className="border-l border-slate-600 pl-4">
                      <div className="text-xs text-slate-400">업무 자동화 가동율</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-300 font-mono">15% 미만</div>
                    </div>
                    <div className="border-l border-slate-600 pl-4">
                      <div className="text-xs text-slate-400">오류 수정 리드타임</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-300 font-mono">평균 3.6시간</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- AFTER SIDE (Right-most clipped overlay layer, vibrant crimson red key highlight) --- */}
              <div 
                className="absolute inset-y-0 right-0 left-0 bg-gradient-to-tr from-[#141416] to-[#251010] text-[#FF3B30] flex flex-col justify-center px-6 sm:px-16 md:px-24 overflow-hidden border-l-2 border-[#FF3B30]"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                {/* Content offset reset to behave absolute to panel regardless of dynamic clipPath */}
                <div className="w-full h-full flex flex-col justify-center relative">
                  <div className="absolute right-0 top-0 left-0 bottom-0 pointer-events-none opacity-20 bg-[radial-gradient(#FF3B30_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  <div className="relative z-10">
                    <div className="w-fit px-3 py-1 bg-[#FF3B30]/10 rounded-full text-[11px] text-[#FF3B30] font-bold uppercase tracking-wider mb-4 border border-[#FF3B30]/20">
                      AFTER (서울IR 도입 후)
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                        폭발하는 비즈니스 레벨업
                      </h3>
                      <p className="text-xs sm:text-sm md:text-lg max-w-md font-normal leading-relaxed text-slate-300">
                        기반의 완벽한 자동화 프로세스로 일일 가동력을 <strong className="text-white font-bold">320% 증가</strong>시켰으며, 공정 결함 오류율 0% 수렴 및 연간 고용 리소스 비용 85% 대칭 절감 구조를 즉시 완성합니다.
                      </p>

                      {/* Positive Great Stats Panel */}
                      <div className="grid grid-cols-2 gap-4 pt-4 max-w-sm">
                        <div className="border-l border-[#FF3B30] pl-4">
                          <div className="text-xs text-slate-400">업무 극대화 효율성</div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white font-mono flex items-center">
                            <span>+320%</span>
                            <span className="text-[10px] ml-1 px-1 bg-[#FF3B30] text-white rounded">UP</span>
                          </div>
                        </div>
                        <div className="border-l border-[#FF3B30] pl-4">
                          <div className="text-xs text-slate-400">오류 및 결함 발생율</div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white font-mono">0.00%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Slider Handle Knob line UI */}
              <div 
                className="absolute inset-y-0 -ml-[1px] pointer-events-none flex flex-col items-center justify-between z-30"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-[2px] h-full bg-[#FF3B30] shadow-md"></div>
                <div className="absolute top-1/2 -translate-y-1/2 -ml-[18px] w-9 h-9 rounded-full bg-white text-[#FF3B30] flex items-center justify-center shadow-2xl border-2 border-[#FF3B30]">
                  <Sliders className="w-4 h-4 cursor-pointer" />
                </div>
              </div>

            </div>

            {/* Slider Controls Hint */}
            <p className="text-center text-xs text-[#86868B] mt-5">
              💡 슬라이더의 중앙 핸들을 터치/마우스 클릭한 상태로 좌우로 부드럽게 움직여 보세요
            </p>
          </div>

        </div>
      </section>


      {/* ⑤ FAQ (자주 묻는 질문) Section */}
      <section id="faq-section" className="py-24 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF3B30] mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              가장 많이 질문하시는 사항들을<br className="hidden sm:inline" /> 깔끔히 정리해 드립니다
            </h2>
          </div>

          {/* Apple Support Accordion Wrapper */}
          <div className="space-y-4">
            {faqList.map((item, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div 
                  key={index} 
                  id={`faq-${index}`}
                  className="border-b border-black/5 py-4 last:border-none transition-all duration-300"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left py-4 text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#1D1D1F] hover:text-[#FF3B30] focus:outline-none transition-colors group cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F7] group-hover:bg-[#FF3B30]/5 text-[#1D1D1F] group-hover:text-[#FF3B30] transition-all transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Dropdown panel */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-52 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-sm sm:text-base text-[#86868B] font-normal leading-relaxed pb-6 pr-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ⑥ Lead Capture & Footer Section */}
      <section id="lead-capture-section" className="py-24 sm:py-32 bg-[#F5F5F7] border-t border-black/5 relative overflow-hidden">
        
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(ellipse_at_center,black_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-14 h-14 rounded-3xl bg-[#FF3B30] text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-red-500/20">
              <FileCheck className="w-8 h-8" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF3B30] mb-3">Lead Capture</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
              회사 소개서 즉시 다운로드 신청
            </h2>
            <p className="text-sm sm:text-base text-[#86868B] mt-3 max-w-md mx-auto">
              간단한 기본 정보를 작성하여 인증해주시면, 파트너 특화 마스터 회사소개서를 즉시 발송 및 다운로드해 드립니다.
            </p>
          </div>

          {/* Dynamic state content switch */}
          {!isSubmitted ? (
            /* Lead Capture Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-black/5 shadow-xl p-8 sm:p-12 space-y-8 apple-shadow">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] mb-2.5">
                    1. 회사 이름 <span className="text-[#FF3B30] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </span>
                    <input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="예시: (주)서울IR"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#F5F5F7] focus:bg-white text-sm text-[#1D1D1F] placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/10 ${errors.companyName ? "border-red-500 ring-4 ring-red-500/5 bg-red-50/10" : "border-black/5 focus:border-[#FF3B30]"}`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-xs text-[#FF3B30] font-medium mt-1.5 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.companyName}
                    </p>
                  )}
                </div>

                {/* Manager Name */}
                <div>
                  <label htmlFor="contactName" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] mb-2.5">
                    2. 담당자 이름 <span className="text-[#FF3B30] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="contactName"
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="예시: 홍길동"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#F5F5F7] focus:bg-white text-sm text-[#1D1D1F] placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/10 ${errors.contactName ? "border-red-500 ring-4 ring-red-500/5 bg-red-50/10" : "border-black/5 focus:border-[#FF3B30]"}`}
                    />
                  </div>
                  {errors.contactName && (
                    <p className="text-xs text-[#FF3B30] font-medium mt-1.5 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.contactName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] mb-2.5">
                  3. 메일 주소 <span className="text-[#FF3B30] font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="예시: info@company.com"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#F5F5F7] focus:bg-white text-sm text-[#1D1D1F] placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/10 ${errors.email ? "border-red-500 ring-4 ring-red-500/5 bg-red-50/10" : "border-black/5 focus:border-[#FF3B30]"}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#FF3B30] font-medium mt-1.5 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start select-none cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all duration-300 mt-0.5 mr-3 ${formData.agreed ? "bg-[#FF3B30] border-[#FF3B30] text-white shadow-sm" : "border-slate-300 bg-[#F5F5F7] group-hover:border-[#FF3B30]"} ${errors.agreed ? "ring-2 ring-red-500/20 border-red-500" : ""}`}>
                    {formData.agreed && <Check className="w-4 h-4 stroke-[3px]" />}
                  </div>
                  <span className="text-xs text-[#86868B] leading-relaxed">
                    개인정보 수집 및 이용 동의 (필수): 고성능 파트너 정보 전달, 상담 안내 피드 발송 등 비즈니스 소통 지원 목적으로 유입 정보를 임시 데이터베이스에 보관 및 안전하게 활용합니다.
                  </span>
                </label>
                {errors.agreed && (
                  <p className="text-xs text-[#FF3B30] font-medium mt-1.5 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.agreed}
                  </p>
                )}
              </div>

              {/* Red Premium Action button */}
              <div className="pt-4">
                <button
                  type="submit"
                  id="lead-submit-button"
                  className="w-full flex items-center justify-center px-8 py-4 bg-[#FF3B30] hover:bg-[#E0352B] active:scale-[0.99] text-white rounded-xl font-bold tracking-tight transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer"
                >
                  <span>상세 회사소개서 보기</span>
                  <ArrowRight className="w-5 h-5 ml-2.5" />
                </button>
              </div>

            </form>
          ) : (
            /* Successful Download Animation Card */
            <div className="bg-white rounded-3xl border border-black/5 shadow-2xl p-10 sm:p-14 text-center space-y-8 animate-[fadeIn_0.5s_ease-out] apple-shadow">
              
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-2 shadow-inner">
                {isDownloading ? (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
                      <circle cx="24" cy="24" r="20" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * downloadProgress) / 100} className="transition-all duration-100" />
                    </svg>
                    <span className="absolute text-[10px] font-mono font-bold text-emerald-600">{downloadProgress}%</span>
                  </div>
                ) : (
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">
                  {isDownloading ? "회사소개서 빌드 및 암호화 전송 중..." : "신청이 안전하게 접수되었습니다!"}
                </h3>
                <p className="text-sm text-[#86868B] max-w-md mx-auto">
                  {isDownloading 
                    ? `입력하신 파트너사 정보(${formData.companyName})에 맞춤화한 최신 회사소개서 PDF 자료를 추출하여 생성하는 중입니다.` 
                    : `신청하신 정보로 서울IR 마스터 브리프 팩 발송 과정이 끝났습니다. 또한 아래 버튼을 눌러 로컬 기기에 즉시 저장할 수 있습니다.`
                  }
                </p>
              </div>

              {/* Download Ready action block */}
              {!isDownloading ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-sm mx-auto pt-4">
                  <a
                    href="https://drive.google.com/file/d/1E4iAT0nojs1IBnpo8ebGLywdnx73FUQV/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span>PDF 즉시 다운로드</span>
                  </a>
                  <button
                    onClick={handleReset}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-95 text-[#1D1D1F] rounded-xl font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span>양식 초기화</span>
                  </button>
                </div>
              ) : null}

              {/* Sent summary summary metadata info badge */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] text-left text-xs font-mono text-[#86868B] space-y-1 max-w-md mx-auto">
                <div>• 기업명: {formData.companyName}</div>
                <div>• 성함: {formData.contactName}</div>
                <div>• 주소: {formData.email}</div>
                <div className="text-emerald-600 font-semibold">• 동의 여부: YES (보안 적용됨)</div>
              </div>

            </div>
          )}

        </div>

        {/* ⑥ Footer Block */}
        <footer id="app-footer" className="relative z-10 max-w-6xl mx-auto px-6 mt-20 pt-12 border-t border-black/5 text-center sm:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[#86868B] text-xs leading-relaxed font-sans font-normal">
            <div>
              <div className="font-semibold text-[#1D1D1F] text-sm mb-2 flex items-center justify-center sm:justify-start space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#FF3B30] flex items-center justify-center text-[8px] text-white font-bold">i</span>
                <span>(주)서울IR</span>
              </div>
              <p className="max-w-xl">
                회사명: (주)서울IR | 대표: 김혁신 | 주소: 서울특별시 강남구 테헤란로 123 | 사업자등록번호: 120-12-34567<br />
                통신판매업신고: 제 2026-서울강남-1049호 | 개인정보관리책임자: 김혁신 (privacy@innovation.co.kr)
              </p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <div>Copyright © 2026 All Rights Reserved.</div>
              <div className="text-[10px] text-slate-400">Design Inspired by Apple Minimalism. Strictly adhering to layout specifications.</div>
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
}
