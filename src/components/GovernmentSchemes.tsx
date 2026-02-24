import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, CheckCircle2, ExternalLink, IndianRupee, Droplets, Shield, Leaf, Sprout, Heart, Factory } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SchemeData {
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  benefitsEn: string[];
  benefitsHi: string[];
  eligibilityEn: string;
  eligibilityHi: string;
  link: string;
  category: "income" | "insurance" | "irrigation" | "soil" | "organic" | "health" | "infra";
  icon: React.ReactNode;
}

interface GovernmentSchemesProps {
  weather: {
    avgTemperature: number;
    avgHumidity: number;
    prevYearRainfall: number;
    avgAnnualRainfall: number;
  };
  soil: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    soilType: string;
  };
  location: string;
}

const ALL_SCHEMES: SchemeData[] = [
  {
    nameEn: "PM-KISAN",
    nameHi: "पीएम-किसान",
    descEn: "Pradhan Mantri Kisan Samman Nidhi – ₹6,000/year direct income support to all landholding farmer families in three equal installments.",
    descHi: "प्रधानमंत्री किसान सम्मान निधि – सभी भूमिधारक किसान परिवारों को तीन समान किस्तों में ₹6,000/वर्ष सीधी आय सहायता।",
    benefitsEn: ["₹6,000/year in 3 installments", "Direct bank transfer", "All landholding farmers eligible"],
    benefitsHi: ["3 किस्तों में ₹6,000/वर्ष", "सीधा बैंक हस्तांतरण", "सभी भूमिधारक किसान पात्र"],
    eligibilityEn: "All landholding farmer families with cultivable land",
    eligibilityHi: "कृषि योग्य भूमि वाले सभी भूमिधारक किसान परिवार",
    link: "https://pmkisan.gov.in",
    category: "income",
    icon: <IndianRupee className="h-5 w-5" />,
  },
  {
    nameEn: "PMFBY",
    nameHi: "पीएमएफबीवाई",
    descEn: "Pradhan Mantri Fasal Bima Yojana – Comprehensive crop insurance at very low premium (2% Kharif, 1.5% Rabi) covering natural calamities, pests, and diseases.",
    descHi: "प्रधानमंत्री फसल बीमा योजना – बहुत कम प्रीमियम (2% खरीफ, 1.5% रबी) पर प्राकृतिक आपदाओं, कीटों और रोगों को कवर करने वाला व्यापक फसल बीमा।",
    benefitsEn: ["Low premium: 2% Kharif, 1.5% Rabi", "Covers floods, drought, pests", "Claim settlement via technology"],
    benefitsHi: ["कम प्रीमियम: 2% खरीफ, 1.5% रबी", "बाढ़, सूखा, कीट कवर", "तकनीक द्वारा दावा निपटान"],
    eligibilityEn: "All farmers growing notified crops in notified areas",
    eligibilityHi: "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान",
    link: "https://pmfby.gov.in",
    category: "insurance",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    nameEn: "PMKSY",
    nameHi: "पीएमकेएसवाई",
    descEn: "Pradhan Mantri Krishi Sinchayee Yojana – 'Har Khet Ko Paani' mission providing micro-irrigation subsidies (up to 55-90%) for drip and sprinkler systems.",
    descHi: "प्रधानमंत्री कृषि सिंचाई योजना – 'हर खेत को पानी' मिशन, ड्रिप और स्प्रिंकलर प्रणालियों के लिए सूक्ष्म सिंचाई सब्सिडी (55-90% तक)।",
    benefitsEn: ["55-90% subsidy on micro-irrigation", "Drip & sprinkler systems", "Water use efficiency boost"],
    benefitsHi: ["सूक्ष्म सिंचाई पर 55-90% सब्सिडी", "ड्रिप और स्प्रिंकलर सिस्टम", "जल उपयोग दक्षता में वृद्धि"],
    eligibilityEn: "All farmers, priority to drought-prone and water-scarce areas",
    eligibilityHi: "सभी किसान, सूखा-प्रवण और जल-दुर्लभ क्षेत्रों को प्राथमिकता",
    link: "https://pmksy.gov.in",
    category: "irrigation",
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    nameEn: "Soil Health Card Scheme",
    nameHi: "मृदा स्वास्थ्य कार्ड योजना",
    descEn: "Free soil testing and personalized Soil Health Cards with crop-wise fertilizer recommendations issued every 2 years.",
    descHi: "मुफ्त मिट्टी परीक्षण और हर 2 साल में फसल-वार उर्वरक सिफारिशों के साथ व्यक्तिगत मृदा स्वास्थ्य कार्ड।",
    benefitsEn: ["Free soil testing", "Crop-wise fertilizer advice", "Issued every 2 years"],
    benefitsHi: ["मुफ्त मिट्टी परीक्षण", "फसल-वार उर्वरक सलाह", "हर 2 साल में जारी"],
    eligibilityEn: "All farmers across India",
    eligibilityHi: "भारत भर के सभी किसान",
    link: "https://soilhealth.dac.gov.in",
    category: "soil",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    nameEn: "Paramparagat Krishi Vikas Yojana",
    nameHi: "परम्परागत कृषि विकास योजना",
    descEn: "Promotes organic farming with ₹50,000/ha support over 3 years for cluster-based organic farming, certification, and marketing.",
    descHi: "क्लस्टर-आधारित जैविक खेती, प्रमाणन और विपणन के लिए 3 वर्षों में ₹50,000/हेक्टेयर सहायता के साथ जैविक खेती को बढ़ावा देता है।",
    benefitsEn: ["₹50,000/ha over 3 years", "Organic certification support", "Marketing assistance"],
    benefitsHi: ["3 वर्षों में ₹50,000/हेक्टेयर", "जैविक प्रमाणन सहायता", "विपणन सहायता"],
    eligibilityEn: "Farmers willing to adopt organic farming in clusters of 50+ acres",
    eligibilityHi: "50+ एकड़ के समूहों में जैविक खेती अपनाने को तैयार किसान",
    link: "https://pgsindia-ncof.gov.in",
    category: "organic",
    icon: <Sprout className="h-5 w-5" />,
  },
  {
    nameEn: "Kisan Credit Card (KCC)",
    nameHi: "किसान क्रेडिट कार्ड (KCC)",
    descEn: "Short-term crop loans at 4% interest (with prompt repayment benefit) for seeds, fertilizers, pesticides, and other farming needs.",
    descHi: "बीज, उर्वरक, कीटनाशक और अन्य कृषि जरूरतों के लिए 4% ब्याज पर (समय पर भुगतान लाभ के साथ) अल्पकालिक फसल ऋण।",
    benefitsEn: ["4% interest rate (with subsidy)", "Covers crop + allied activities", "Personal accident insurance"],
    benefitsHi: ["4% ब्याज दर (सब्सिडी के साथ)", "फसल + संबद्ध गतिविधियां कवर", "व्यक्तिगत दुर्घटना बीमा"],
    eligibilityEn: "All farmers, sharecroppers, tenant farmers, and SHGs",
    eligibilityHi: "सभी किसान, बटाईदार, किरायेदार किसान और SHG",
    link: "https://www.pmkisan.gov.in",
    category: "income",
    icon: <IndianRupee className="h-5 w-5" />,
  },
  {
    nameEn: "Ayushman Bharat – PMJAY",
    nameHi: "आयुष्मान भारत – पीएमजेएवाई",
    descEn: "Health insurance of ₹5 lakh/family/year for secondary and tertiary care hospitalization for rural farming families.",
    descHi: "ग्रामीण कृषि परिवारों के लिए माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए ₹5 लाख/परिवार/वर्ष का स्वास्थ्य बीमा।",
    benefitsEn: ["₹5 lakh/family/year coverage", "Cashless treatment", "1,500+ procedures covered"],
    benefitsHi: ["₹5 लाख/परिवार/वर्ष कवरेज", "कैशलेस उपचार", "1,500+ प्रक्रियाएं कवर"],
    eligibilityEn: "Deprivation-based criteria from SECC data; rural families engaged in farming",
    eligibilityHi: "SECC डेटा से वंचन-आधारित मानदंड; खेती में लगे ग्रामीण परिवार",
    link: "https://pmjay.gov.in",
    category: "health",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    nameEn: "National Horticulture Mission (NHM)",
    nameHi: "राष्ट्रीय बागवानी मिशन (NHM)",
    descEn: "Subsidies for fruit orchards, vegetable cultivation, protected cultivation (polyhouse/shade net), and post-harvest infrastructure.",
    descHi: "फल बागान, सब्जी की खेती, संरक्षित खेती (पॉलीहाउस/शेड नेट), और फसल कटाई के बाद के बुनियादी ढांचे के लिए सब्सिडी।",
    benefitsEn: ["50% subsidy on polyhouse/shade nets", "Fruit orchard establishment", "Cold storage support"],
    benefitsHi: ["पॉलीहाउस/शेड नेट पर 50% सब्सिडी", "फल बागान स्थापना", "कोल्ड स्टोरेज सहायता"],
    eligibilityEn: "Farmers in horticulture or willing to diversify into high-value crops",
    eligibilityHi: "बागवानी में या उच्च-मूल्य फसलों में विविधता लाने को इच्छुक किसान",
    link: "https://nhm.nic.in",
    category: "infra",
    icon: <Factory className="h-5 w-5" />,
  },
];

const categoryColors: Record<string, string> = {
  income: "bg-primary/10 text-primary border-primary/20",
  insurance: "bg-destructive/10 text-destructive border-destructive/20",
  irrigation: "bg-secondary/10 text-secondary border-secondary/20",
  soil: "bg-accent/50 text-accent-foreground border-accent/30",
  organic: "bg-primary/10 text-primary border-primary/20",
  health: "bg-destructive/10 text-destructive border-destructive/20",
  infra: "bg-secondary/10 text-secondary border-secondary/20",
};

const categoryLabels: Record<string, Record<string, string>> = {
  income: { en: "Income Support", hi: "आय सहायता" },
  insurance: { en: "Crop Insurance", hi: "फसल बीमा" },
  irrigation: { en: "Irrigation", hi: "सिंचाई" },
  soil: { en: "Soil Health", hi: "मृदा स्वास्थ्य" },
  organic: { en: "Organic Farming", hi: "जैविक खेती" },
  health: { en: "Health", hi: "स्वास्थ्य" },
  infra: { en: "Infrastructure", hi: "बुनियादी ढांचा" },
};

const GovernmentSchemes = ({ weather, soil, location }: GovernmentSchemesProps) => {
  const { lang, t } = useLanguage();

  const recommendedSchemes = useMemo(() => {
    const scored: { scheme: SchemeData; relevance: number; reason: string; reasonHi: string }[] = [];

    for (const scheme of ALL_SCHEMES) {
      let relevance = 50; // base relevance — all schemes are useful
      let reason = "Applicable to all farmers";
      let reasonHi = "सभी किसानों के लिए लागू";

      // PM-KISAN: always highly relevant
      if (scheme.nameEn === "PM-KISAN") {
        relevance = 95;
        reason = "Universal income support for all landholding farmers";
        reasonHi = "सभी भूमिधारक किसानों के लिए सार्वभौमिक आय सहायता";
      }

      // PMFBY: higher in extreme weather areas
      if (scheme.nameEn === "PMFBY") {
        relevance = 80;
        if (weather.prevYearRainfall > 1200 || weather.prevYearRainfall < 600) {
          relevance = 95;
          reason = weather.prevYearRainfall > 1200
            ? "High rainfall area — crop insurance critical for flood risk"
            : "Low rainfall area — crop insurance essential for drought protection";
          reasonHi = weather.prevYearRainfall > 1200
            ? "उच्च वर्षा क्षेत्र — बाढ़ जोखिम के लिए फसल बीमा महत्वपूर्ण"
            : "कम वर्षा क्षेत्र — सूखे से सुरक्षा के लिए फसल बीमा आवश्यक";
        } else {
          reason = "Crop insurance provides financial safety net";
          reasonHi = "फसल बीमा वित्तीय सुरक्षा जाल प्रदान करता है";
        }
      }

      // PMKSY: very high in low rainfall
      if (scheme.nameEn === "PMKSY") {
        relevance = 70;
        if (weather.avgAnnualRainfall < 750) {
          relevance = 98;
          reason = `Only ${weather.avgAnnualRainfall.toFixed(0)}mm annual rainfall — micro-irrigation subsidy critical`;
          reasonHi = `केवल ${weather.avgAnnualRainfall.toFixed(0)}mm वार्षिक वर्षा — सूक्ष्म सिंचाई सब्सिडी अत्यंत आवश्यक`;
        } else if (weather.avgAnnualRainfall < 1000) {
          relevance = 85;
          reason = "Moderate rainfall — drip irrigation can improve water efficiency";
          reasonHi = "मध्यम वर्षा — ड्रिप सिंचाई जल दक्षता में सुधार कर सकती है";
        }
      }

      // Soil Health Card: higher when nutrients are imbalanced
      if (scheme.nameEn === "Soil Health Card Scheme") {
        relevance = 75;
        if (soil.nitrogen < 280 || soil.phosphorus < 11 || soil.potassium < 140 || soil.ph < 5.5 || soil.ph > 8) {
          relevance = 92;
          reason = "Soil nutrient imbalance detected — free soil testing recommended";
          reasonHi = "मिट्टी के पोषक तत्व असंतुलन पाया गया — मुफ्त मिट्टी परीक्षण की सिफारिश";
        }
      }

      // Organic farming: good for balanced soils
      if (scheme.nameEn === "Paramparagat Krishi Vikas Yojana") {
        relevance = 60;
        if (soil.ph >= 6 && soil.ph <= 7.5 && weather.avgAnnualRainfall > 600) {
          relevance = 78;
          reason = "Good soil conditions for organic farming transition";
          reasonHi = "जैविक खेती में परिवर्तन के लिए अच्छी मिट्टी की स्थिति";
        }
      }

      // KCC: always useful
      if (scheme.nameEn === "Kisan Credit Card (KCC)") {
        relevance = 85;
        reason = "Low-interest crop loans for seeds, fertilizers, and inputs";
        reasonHi = "बीज, उर्वरक और इनपुट के लिए कम ब्याज फसल ऋण";
      }

      // NHM: higher in hot regions
      if (scheme.nameEn === "National Horticulture Mission (NHM)") {
        relevance = 60;
        if (weather.avgTemperature > 25) {
          relevance = 75;
          reason = "Warm climate ideal for horticulture — polyhouse/shade net subsidy available";
          reasonHi = "गर्म जलवायु बागवानी के लिए आदर्श — पॉलीहाउस/शेड नेट सब्सिडी उपलब्ध";
        }
      }

      // Ayushman Bharat
      if (scheme.nameEn === "Ayushman Bharat – PMJAY") {
        relevance = 65;
        reason = "Health coverage for farming families";
        reasonHi = "कृषि परिवारों के लिए स्वास्थ्य कवरेज";
      }

      scored.push({ scheme, relevance, reason, reasonHi });
    }

    return scored.sort((a, b) => b.relevance - a.relevance);
  }, [weather, soil]);

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-strong)] border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Landmark className="h-6 w-6 text-primary" />
          {t("section.gov_schemes")}
        </CardTitle>
        <CardDescription className="text-base">
          {t("section.gov_schemes_desc")} {location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedSchemes.map(({ scheme, relevance, reason, reasonHi }, index) => (
          <Card key={index} className="border border-border/50 hover:border-primary/30 transition-all hover:shadow-[var(--shadow-soft)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  {scheme.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {lang === "hi" ? scheme.nameHi : scheme.nameEn}
                      </h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className={categoryColors[scheme.category]}>
                          {categoryLabels[scheme.category]?.[lang] || scheme.category}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          {relevance}% {t("gov.match")}
                        </Badge>
                      </div>
                    </div>
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-shrink-0"
                    >
                      {t("gov.apply")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {lang === "hi" ? scheme.descHi : scheme.descEn}
                  </p>

                  <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
                    <div className="text-xs font-semibold text-primary mb-1">{t("gov.why_recommended")}</div>
                    <p className="text-sm text-foreground">{lang === "hi" ? reasonHi : reason}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-muted-foreground">{t("gov.benefits")}</div>
                    <div className="flex flex-wrap gap-2">
                      {(lang === "hi" ? scheme.benefitsHi : scheme.benefitsEn).map((benefit, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">{t("gov.eligibility")}:</span>{" "}
                    {lang === "hi" ? scheme.eligibilityHi : scheme.eligibilityEn}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default GovernmentSchemes;
