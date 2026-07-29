import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, FileImage, FileText } from "lucide-react";

interface PrintableQRProps {
  url: string;
  partnerOne: string;
  partnerTwo: string;
  themeConfig?: any;
}

export function PrintableQR({ url, partnerOne, partnerTwo, themeConfig }: PrintableQRProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const primaryColor = themeConfig?.primaryColor || "#D4AF37";
  const secondaryColor = themeConfig?.secondaryColor || "#18181B";

  const handleExportPNG = async () => {
    if (!qrRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(qrRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${partnerOne}-${partnerTwo}-Masa-Karti.png`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async (format: "a5" | "a6") => {
    if (!qrRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(qrRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: format, // a5: 148x210, a6: 105x148
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${partnerOne}-${partnerTwo}-${format.toUpperCase()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <FileImage className="w-4 h-4" />
          PNG Olarak İndir
        </button>
        <button
          onClick={() => handleExportPDF("a5")}
          disabled={isExporting}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <FileText className="w-4 h-4" />
          A5 PDF (Masa Kartı)
        </button>
        <button
          onClick={() => handleExportPDF("a6")}
          disabled={isExporting}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <FileText className="w-4 h-4" />
          A6 PDF (Mini Kart)
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        {/* Printable Area */}
        <div 
          ref={qrRef}
          className="relative mx-auto flex flex-col items-center justify-center p-12 text-center"
          style={{
            width: "595px", // Approx A5 aspect ratio width for preview
            height: "842px", // Approx A5 aspect ratio height for preview
            backgroundColor: secondaryColor,
            color: primaryColor,
            fontFamily: themeConfig?.font ? `"${themeConfig.font}", sans-serif` : "serif"
          }}
        >
          <div className="absolute inset-4 border-2 opacity-50" style={{ borderColor: primaryColor }} />
          <div className="absolute inset-5 border border-dashed opacity-30" style={{ borderColor: primaryColor }} />
          
          <div className="z-10 flex flex-col items-center gap-8">
            <h1 className="text-4xl md:text-5xl font-light tracking-widest uppercase mt-12">
              Bize Katılın
            </h1>
            
            <p className="text-sm uppercase tracking-[0.3em] opacity-80 mt-4 mb-8">
              Fotoğraf Yüklemek İçin Okutun
            </p>
            
            <div className="bg-white p-4 rounded-xl shadow-2xl">
              <QRCodeSVG 
                value={url} 
                size={220}
                level="H"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="mt-12">
              <h2 className="text-5xl font-light">
                {partnerOne} <span className="opacity-50">&</span> {partnerTwo}
              </h2>
            </div>
            
            <p className="absolute bottom-16 text-xs tracking-widest opacity-60">
              #MemoryWedding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
