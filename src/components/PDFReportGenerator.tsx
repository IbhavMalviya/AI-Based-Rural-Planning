import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFReportProps {
  data: {
    location: string;
    coordinates: { lat: number; lng: number };
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
  };
}

const PDFReportGenerator = ({ data }: PDFReportProps) => {
  const { toast } = useToast();

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header bar
    doc.setFillColor(34, 120, 55); // primary green
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Agricultural Intelligence Report", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("The 5 Arcs — AI Based Indian Rural Planning Platform", pageWidth / 2, 27, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, 35, { align: "center" });

    y = 50;
    doc.setTextColor(30, 30, 30);

    // Location info
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`📍 ${data.location}`, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Coordinates: ${data.coordinates.lat.toFixed(4)}°N, ${Math.abs(data.coordinates.lng).toFixed(4)}°${data.coordinates.lng < 0 ? "W" : "E"}`, 14, y);
    y += 12;

    // Weather section
    doc.setTextColor(30, 30, 30);
    doc.setFillColor(230, 245, 235);
    doc.rect(14, y - 5, pageWidth - 28, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Weather Analysis (5-Year Average)", 16, y + 2);
    y += 12;

    autoTable(doc, {
      startY: y,
      head: [["Parameter", "Value", "Assessment"]],
      body: [
        ["Avg. Temperature", `${data.weather.avgTemperature}°C`, data.weather.avgTemperature > 30 ? "High — tropical crops suited" : data.weather.avgTemperature < 15 ? "Cool — temperate crops suited" : "Moderate — diverse crops viable"],
        ["Avg. Humidity", `${data.weather.avgHumidity}%`, data.weather.avgHumidity > 70 ? "High — watch for fungal diseases" : "Normal range"],
        ["Prev. Year Rainfall", `${data.weather.prevYearRainfall} mm`, data.weather.prevYearRainfall > 1200 ? "High rainfall zone" : data.weather.prevYearRainfall < 600 ? "Drought-prone" : "Moderate"],
        ["Avg. Annual Rainfall", `${data.weather.avgAnnualRainfall.toFixed(0)} mm`, data.weather.avgAnnualRainfall > 1000 ? "Well-watered" : "Irrigation recommended"],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 120, 55], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // Soil section
    doc.setFillColor(230, 240, 250);
    doc.rect(14, y - 5, pageWidth - 28, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Soil Composition Analysis", 16, y + 2);
    y += 12;

    const getNPKStatus = (val: number, low: number, med: number) =>
      val < low ? "Deficient — supplementation needed" : val < med ? "Moderate" : "Adequate";

    autoTable(doc, {
      startY: y,
      head: [["Parameter", "Value", "Status"]],
      body: [
        ["Soil Type", data.soil.soilType, "—"],
        ["pH Level", data.soil.ph.toFixed(1), data.soil.ph < 6 ? "Acidic — lime application recommended" : data.soil.ph > 7.5 ? "Alkaline — add organic matter" : "Optimal range (6–7.5)"],
        ["Nitrogen (N)", `${data.soil.nitrogen} mg/kg`, getNPKStatus(data.soil.nitrogen, 280, 560)],
        ["Phosphorus (P)", `${data.soil.phosphorus} mg/kg`, getNPKStatus(data.soil.phosphorus, 11, 25)],
        ["Potassium (K)", `${data.soil.potassium} mg/kg`, getNPKStatus(data.soil.potassium, 140, 280)],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // Recommendations summary
    doc.setFillColor(255, 243, 224);
    doc.rect(14, y - 5, pageWidth - 28, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Key Recommendations", 16, y + 2);
    y += 14;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const recommendations: string[] = [];

    if (data.weather.prevYearRainfall < 600) {
      recommendations.push("• Adopt drip irrigation (90% subsidy under PMKSY). Grow drought-resistant crops: bajra, jowar, groundnut.");
    } else if (data.weather.prevYearRainfall > 1200) {
      recommendations.push("• High rainfall zone — paddy, sugarcane, banana suitable. Ensure drainage. Apply for PMFBY crop insurance.");
    } else {
      recommendations.push("• Moderate rainfall — both Kharif and Rabi viable. Cotton, soybean, wheat, chickpea recommended.");
    }

    if (data.soil.ph < 6) recommendations.push("• Apply agricultural lime 200–400 kg/ha before monsoon to correct soil acidity.");
    if (data.soil.ph > 7.5) recommendations.push("• Apply gypsum 500–1000 kg/ha to reduce alkalinity. Add farmyard manure.");
    if (data.soil.nitrogen < 280) recommendations.push("• Nitrogen deficient — apply urea 100–150 kg/ha or use biofertilizers like Rhizobium.");
    if (data.soil.phosphorus < 11) recommendations.push("• Apply DAP or SSP at 50–75 kg/ha for phosphorus supplementation.");
    if (data.soil.potassium < 140) recommendations.push("• Apply Muriate of Potash (MOP) 30–60 kg/ha for potassium.");

    recommendations.push("• Get free soil testing under Soil Health Card Scheme at nearest KVK.");
    recommendations.push("• Register on PM-KISAN portal for ₹6000/year income support.");

    recommendations.forEach((rec) => {
      const lines = doc.splitTextToSize(rec, pageWidth - 32);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 3;
    });

    // Footer
    y = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200);
    doc.line(14, y - 5, pageWidth - 14, y - 5);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("The 5 Arcs — AI Based Indian Rural Planning Platform | This report is for advisory purposes only.", pageWidth / 2, y, { align: "center" });

    doc.save(`${data.location.replace(/\s+/g, "_")}_Agricultural_Report.pdf`);

    toast({
      title: "📄 PDF Report Generated",
      description: `Report saved for ${data.location}`,
    });
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="lg" className="gap-2">
      <FileText className="h-4 w-4" />
      Export PDF Report
    </Button>
  );
};

export default PDFReportGenerator;
