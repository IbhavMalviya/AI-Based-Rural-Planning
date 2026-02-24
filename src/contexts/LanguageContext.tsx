import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Hero
  "hero.badge": { en: "The 5 Arcs", hi: "द 5 आर्क्स" },
  "hero.title": { en: "AI Based Indian Rural Planning", hi: "AI आधारित भारतीय ग्रामीण योजना" },
  "hero.subtitle": { en: "Empowering planners with AIML-driven environmental and geological analysis. 5-year weather data, soil composition, and personalized crop recommendations for every district in India.", hi: "AIML-संचालित पर्यावरण और भूवैज्ञानिक विश्लेषण के साथ योजनाकारों को सशक्त बनाना। भारत के हर जिले के लिए 5 वर्ष का मौसम डेटा, मिट्टी की संरचना और व्यक्तिगत फसल सिफारिशें।" },
  "hero.search_placeholder": { en: "Enter Indian city or district (e.g., Mumbai, Pune, Nashik)", hi: "भारतीय शहर या जिला दर्ज करें (जैसे, मुंबई, पुणे, नासिक)" },
  "hero.analyze": { en: "Analyze", hi: "विश्लेषण" },
  "hero.analyzing": { en: "Analyzing...", hi: "विश्लेषण हो रहा है..." },

  // Stats
  "stats.avg_temp": { en: "Average Temperature", hi: "औसत तापमान" },
  "stats.annual_rainfall": { en: "Annual Rainfall", hi: "वार्षिक वर्षा" },
  "stats.soil_quality": { en: "Soil Quality", hi: "मिट्टी की गुणवत्ता" },
  "stats.ph_balance": { en: "pH Balance", hi: "pH संतुलन" },

  // Section headers
  "section.weather": { en: "Weather Patterns (5-Year Analysis)", hi: "मौसम पैटर्न (5-वर्ष विश्लेषण)" },
  "section.weather_desc": { en: "Historical climate data averaged over 2018-2023", hi: "2018-2023 के ऐतिहासिक जलवायु डेटा का औसत" },
  "section.soil": { en: "Soil Composition & Nutrients", hi: "मिट्टी की संरचना और पोषक तत्व" },
  "section.soil_desc": { en: "NPK analysis and pH levels for agriculture planning", hi: "कृषि योजना के लिए NPK विश्लेषण और pH स्तर" },
  "section.insights": { en: "Agricultural Intelligence", hi: "कृषि बुद्धिमत्ता" },
  "section.insights_desc": { en: "Expert recommendations for farmers and urban planners", hi: "किसानों और शहरी योजनाकारों के लिए विशेषज्ञ सिफारिशें" },
  "section.npk_chart": { en: "NPK Nutrient Distribution", hi: "NPK पोषक तत्व वितरण" },
  "section.npk_chart_desc": { en: "Visual comparison of soil nutrient levels (mg/kg)", hi: "मिट्टी के पोषक तत्व स्तरों की दृश्य तुलना (mg/kg)" },
  "section.crop_rec": { en: "Crop Recommendations", hi: "फसल सिफारिशें" },
  "section.crop_rec_desc": { en: "Get personalized crop suggestions based on your soil and weather conditions for", hi: "आपकी मिट्टी और मौसम की स्थिति के आधार पर व्यक्तिगत फसल सुझाव प्राप्त करें" },
  "section.calendar": { en: "Seasonal Planting Calendar", hi: "मौसमी रोपण कैलेंडर" },
  "section.calendar_desc": { en: "Optimal sowing & harvesting windows for", hi: "इष्टतम बुवाई और कटाई की अवधि" },

  // Weather card labels
  "weather.avg_temp": { en: "Avg Temperature", hi: "औसत तापमान" },
  "weather.avg_humidity": { en: "Avg Humidity", hi: "औसत नमी" },
  "weather.last_year_rainfall": { en: "Last Year Rainfall", hi: "पिछले वर्ष की वर्षा" },
  "weather.avg_annual_rainfall": { en: "Avg Annual Rainfall", hi: "औसत वार्षिक वर्षा" },

  // Soil card labels
  "soil.type": { en: "Soil Type", hi: "मिट्टी का प्रकार" },
  "soil.ph": { en: "pH Level", hi: "pH स्तर" },
  "soil.nitrogen": { en: "Nitrogen (N)", hi: "नाइट्रोजन (N)" },
  "soil.phosphorus": { en: "Phosphorus (P)", hi: "फॉस्फोरस (P)" },
  "soil.potassium": { en: "Potassium (K)", hi: "पोटेशियम (K)" },

  // Buttons
  "btn.export_csv": { en: "Export CSV", hi: "CSV निर्यात" },
  "btn.export_json": { en: "Export JSON", hi: "JSON निर्यात" },
  "btn.export_pdf": { en: "Export PDF Report", hi: "PDF रिपोर्ट निर्यात" },
  "btn.get_recommendations": { en: "Get Recommendations", hi: "सिफारिशें प्राप्त करें" },
  "btn.refresh": { en: "Refresh Analysis", hi: "विश्लेषण रीफ्रेश करें" },

  // Empty state
  "empty.title": { en: "Begin Your Agricultural Analysis", hi: "अपना कृषि विश्लेषण शुरू करें" },
  "empty.subtitle": { en: "Enter any location in India to access comprehensive environmental and geological information for Rural Planning.", hi: "ग्रामीण योजना के लिए व्यापक पर्यावरण और भूवैज्ञानिक जानकारी प्राप्त करने के लिए भारत में कोई भी स्थान दर्ज करें।" },
  "empty.weather_title": { en: "Weather Patterns", hi: "मौसम पैटर्न" },
  "empty.weather_desc": { en: "5-year temperature, humidity, and rainfall analysis for crop planning", hi: "फसल योजना के लिए 5 वर्ष का तापमान, नमी और वर्षा विश्लेषण" },
  "empty.soil_title": { en: "Soil Analysis", hi: "मिट्टी विश्लेषण" },
  "empty.soil_desc": { en: "NPK nutrients, pH levels, and soil type for optimal fertilizer planning", hi: "इष्टतम उर्वरक योजना के लिए NPK पोषक तत्व, pH स्तर और मिट्टी का प्रकार" },
  "empty.geo_title": { en: "Geographic Data", hi: "भौगोलिक डेटा" },
  "empty.geo_desc": { en: "Boundary maps and precise coordinates for land management", hi: "भूमि प्रबंधन के लिए सीमा मानचित्र और सटीक निर्देशांक" },
  "empty.ai_title": { en: "AI Crop Insights", hi: "AI फसल अंतर्दृष्टि" },
  "empty.ai_desc": { en: "Personalized recommendations with govt. schemes and market info", hi: "सरकारी योजनाओं और बाजार की जानकारी के साथ व्यक्तिगत सिफारिशें" },
  "empty.farmers": { en: "For Farmers:", hi: "किसानों के लिए:" },
  "empty.farmers_desc": { en: "Get insights on crop selection, fertilizer ratios, irrigation needs, and access schemes like PM-KISAN, PMFBY, and Soil Health Cards.", hi: "फसल चयन, उर्वरक अनुपात, सिंचाई आवश्यकताओं पर जानकारी प्राप्त करें और PM-KISAN, PMFBY, और मृदा स्वास्थ्य कार्ड जैसी योजनाओं तक पहुंचें।" },
  "empty.planners": { en: "For Planners:", hi: "योजनाकारों के लिए:" },
  "empty.planners_desc": { en: "Environmental data for sustainable development, green infrastructure, water management, and climate adaptation strategies.", hi: "सतत विकास, हरित बुनियादी ढांचे, जल प्रबंधन और जलवायु अनुकूलन रणनीतियों के लिए पर्यावरणीय डेटा।" },

  // Calendar
  "cal.crop": { en: "Crop", hi: "फसल" },
  "cal.sowing": { en: "Sowing Window", hi: "बुवाई अवधि" },
  "cal.growing": { en: "Growing Period", hi: "बढ़ने की अवधि" },
  "cal.harvest": { en: "Harvest Window", hi: "कटाई अवधि" },
  "cal.monsoon_note": { en: "Southwest monsoon typically arrives in June (Kerala) and progresses northward by mid-July. Actual sowing dates depend on local monsoon onset.", hi: "दक्षिण-पश्चिम मानसून आमतौर पर जून (केरल) में आता है और जुलाई मध्य तक उत्तर की ओर बढ़ता है। वास्तविक बुवाई की तारीखें स्थानीय मानसून की शुरुआत पर निर्भर करती हैं।" },

  // Crop recommendations
  "crop.success_rate": { en: "Success Rate", hi: "सफलता दर" },
  "crop.suitability": { en: "Suitability Score", hi: "उपयुक्तता स्कोर" },
  "crop.yield": { en: "Expected Yield", hi: "अपेक्षित उपज" },
  "crop.market_price": { en: "Market Price", hi: "बाजार मूल्य" },
  "crop.water": { en: "Water Requirements", hi: "पानी की आवश्यकता" },
  "crop.npk": { en: "NPK Fertilizer", hi: "NPK उर्वरक" },
  "crop.benefits": { en: "Key Benefits", hi: "मुख्य लाभ" },
  "crop.tips": { en: "Cultivation Tips", hi: "खेती के सुझाव" },
  "crop.pests": { en: "Pests & Diseases", hi: "कीट और रोग" },
  "crop.additional": { en: "Additional Farming Guidance", hi: "अतिरिक्त कृषि मार्गदर्शन" },
  "crop.rotation": { en: "Crop Rotation Strategy", hi: "फसल चक्र रणनीति" },
  "crop.soil_mgmt": { en: "Soil Management", hi: "मिट्टी प्रबंधन" },
  "crop.water_strategy": { en: "Water Strategy", hi: "जल रणनीति" },
  "crop.income": { en: "Income Potential", hi: "आय की संभावना" },
  "crop.gov_schemes": { en: "Government Schemes & Support", hi: "सरकारी योजनाएं और सहायता" },

  // Government Schemes section
  "section.gov_schemes": { en: "Government Scheme Finder", hi: "सरकारी योजना खोजक" },
  "section.gov_schemes_desc": { en: "Recommended central & state schemes based on your environmental data for", hi: "आपके पर्यावरणीय डेटा के आधार पर अनुशंसित केंद्रीय और राज्य योजनाएं" },
  "gov.match": { en: "Match", hi: "मिलान" },
  "gov.apply": { en: "Apply / Learn More", hi: "आवेदन / अधिक जानें" },
  "gov.why_recommended": { en: "Why Recommended for You", hi: "आपके लिए क्यों अनुशंसित" },
  "gov.benefits": { en: "Key Benefits", hi: "मुख्य लाभ" },
  "gov.eligibility": { en: "Eligibility", hi: "पात्रता" },

  // Cost & Profit Calculator
  "calc.title": { en: "Cost & Profit Calculator", hi: "लागत और लाभ कैलकुलेटर" },
  "calc.desc": { en: "Estimate farming costs, revenue and break-even for", hi: "कृषि लागत, राजस्व और ब्रेक-ईवन का अनुमान लगाएं" },
  "calc.select_crop": { en: "Select Crop", hi: "फसल चुनें" },
  "calc.land_area": { en: "Land Area", hi: "भूमि क्षेत्र" },
  "calc.custom_seed": { en: "Seed Cost/ha", hi: "बीज लागत/हे." },
  "calc.custom_fert": { en: "Fertilizer Cost/ha", hi: "उर्वरक लागत/हे." },
  "calc.optional": { en: "optional", hi: "वैकल्पिक" },
  "calc.total_cost": { en: "Total Cost", hi: "कुल लागत" },
  "calc.est_yield": { en: "Est. Yield", hi: "अनुमानित उपज" },
  "calc.yield_adjusted": { en: "Adjusted for local conditions", hi: "स्थानीय परिस्थितियों के लिए समायोजित" },
  "calc.revenue": { en: "Revenue (MSP)", hi: "राजस्व (MSP)" },
  "calc.net_profit": { en: "Net Profit", hi: "शुद्ध लाभ" },
  "calc.cost_breakdown": { en: "Cost Breakdown", hi: "लागत विभाजन" },
  "calc.break_even": { en: "Break-Even Analysis", hi: "ब्रेक-ईवन विश्लेषण" },
  "calc.be_yield": { en: "Break-even Yield", hi: "ब्रेक-ईवन उपज" },
  "calc.actual_yield": { en: "Estimated Yield", hi: "अनुमानित उपज" },
  "calc.yield_margin": { en: "Yield Safety Margin", hi: "उपज सुरक्षा मार्जिन" },
  "calc.water_note": { en: "Water Requirement", hi: "पानी की आवश्यकता" },
  "calc.env_impact": { en: "Environmental Impact on Yield", hi: "उपज पर पर्यावरणीय प्रभाव" },
  "calc.compare_title": { en: "Crop-to-Crop Comparison (per hectare at MSP)", hi: "फसल-से-फसल तुलना (प्रति हेक्टेयर MSP पर)" },
  "calc.crop": { en: "Crop", hi: "फसल" },
  "calc.cost_ha": { en: "Cost/ha", hi: "लागत/हे." },
  "calc.revenue_ha": { en: "Revenue/ha", hi: "राजस्व/हे." },
  "calc.profit_ha": { en: "Profit/ha", hi: "लाभ/हे." },
  "calc.disclaimer": { en: "* Estimates based on MSP rates 2024-25 and average yields. Actual results depend on local conditions, market prices, and farming practices.", hi: "* अनुमान MSP दरों 2024-25 और औसत उपज पर आधारित हैं। वास्तविक परिणाम स्थानीय परिस्थितियों, बाजार मूल्यों और कृषि प्रथाओं पर निर्भर करते हैं।" },

  // Misc
  "misc.5yr_analysis": { en: "5-year historical analysis", hi: "5 वर्ष का ऐतिहासिक विश्लेषण" },
  "misc.analysis_complete": { en: "Analysis Complete", hi: "विश्लेषण पूर्ण" },
  "misc.loading": { en: "Analyzing...", hi: "विश्लेषण हो रहा है..." },
  "misc.refreshing": { en: "Refreshing...", hi: "रीफ्रेश हो रहा है..." },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
