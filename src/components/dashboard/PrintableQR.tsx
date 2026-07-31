import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveTheme, type ThemeConfig } from "@/lib/theme-engine";

interface PrintableQRProps {
  url: string;
  partnerOne: string;
  partnerTwo: string;
  themeConfig?: ThemeConfig;
}

export function PrintableQR({ url, partnerOne, partnerTwo, themeConfig }: PrintableQRProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrSvgRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const theme = themeConfig ?? resolveTheme("turquoise-cove");
  const fileName = `${partnerOne}-${partnerTwo}`
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşü]+/gi, "-")
    .replace(/^-|-$/g, "");

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Kart görseli hazırlanamadı."));
      image.src = src;
    });

  const drawSpacedText = (
    context: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    y: number,
    spacing: number,
  ) => {
    const characters = Array.from(text);
    const widths = characters.map((character) => context.measureText(character).width);
    const totalWidth =
      widths.reduce((sum, width) => sum + width, 0) + spacing * (characters.length - 1);
    let x = centerX - totalWidth / 2;
    characters.forEach((character, index) => {
      context.fillText(character, x, y);
      x += widths[index] + spacing;
    });
  };

  const renderCanvas = async () => {
    const svg = qrSvgRef.current?.querySelector("svg");
    if (!svg) throw new Error("QR kodu hazırlanamadı.");
    await document.fonts?.ready;

    const [backgroundImage, qrImage] = await Promise.all([
      loadImage(theme.image),
      (async () => {
        const serialized = new XMLSerializer().serializeToString(svg);
        const blobUrl = URL.createObjectURL(new Blob([serialized], { type: "image/svg+xml" }));
        try {
          return await loadImage(blobUrl);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      })(),
    ]);

    const scale = 2;
    const width = 595;
    const height = 842;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Tarayıcı çizim alanı oluşturamadı.");
    context.scale(scale, scale);

    const imageRatio = Math.max(
      width / backgroundImage.naturalWidth,
      height / backgroundImage.naturalHeight,
    );
    const imageWidth = backgroundImage.naturalWidth * imageRatio;
    const imageHeight = backgroundImage.naturalHeight * imageRatio;
    context.drawImage(
      backgroundImage,
      (width - imageWidth) / 2,
      (height - imageHeight) / 2,
      imageWidth,
      imageHeight,
    );

    const overlayColors = theme.qr.overlay.match(/rgba?\([^)]*\)/g) ?? [
      "rgba(0,0,0,.12)",
      "rgba(0,0,0,.78)",
    ];
    const overlay = context.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, overlayColors[0]);
    overlay.addColorStop(1, overlayColors.at(-1) ?? overlayColors[0]);
    context.fillStyle = overlay;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(255,255,255,.45)";
    context.lineWidth = 1;
    context.strokeRect(20.5, 20.5, width - 41, height - 41);
    context.strokeStyle = "rgba(255,255,255,.20)";
    context.strokeRect(28.5, 28.5, width - 57, height - 57);

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = theme.qr.accent;
    context.font = `600 12px ${theme.font || "serif"}`;
    drawSpacedText(context, theme.name.toUpperCase(), width / 2, 112, 3.2);

    context.shadowColor = "rgba(0,0,0,0.5)"; context.shadowBlur = 4; context.fillStyle = "#ffffff";
    context.font = `300 48px ${theme.font || "serif"}`;
    context.fillText("Anılarımıza katılın", width / 2, 202);
    context.fillStyle = "rgba(255,255,255,.82)";
    context.font = `500 13px ${theme.font || "sans-serif"}`;
    drawSpacedText(context, "FOTOĞRAF VE VİDEOLARINIZI", width / 2, 263, 2.4);
    drawSpacedText(context, "YÜKLEMEK İÇİN OKUTUN", width / 2, 287, 2.4);

    const paperX = 167.5;
    const paperY = 326;
    const paperSize = 260;
    context.fillStyle = theme.qr.paper;
    context.beginPath();
    context.roundRect(paperX, paperY, paperSize, paperSize, 24);
    context.fill();
    context.drawImage(qrImage, paperX + 20, paperY + 20, 220, 220);

    context.shadowColor = "rgba(0,0,0,0.5)"; context.shadowBlur = 4; context.fillStyle = "#ffffff";
    context.font = `300 48px ${theme.font || "serif"}`;
    context.fillText(`${partnerOne} & ${partnerTwo}`, width / 2, 684);
    context.fillStyle = "rgba(255,255,255,.68)";
    context.font = `400 11px ${theme.font || "sans-serif"}`;
    drawSpacedText(context, "#MEMORYWEDDING", width / 2, 746, 2.2);
    return canvas;
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) throw new Error("QR kartı hazırlanamadı.");
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("PNG dosyası oluşturulamadı."))),
          "image/png",
        ),
      );
      downloadBlob(blob, `${fileName || "davet"}-masa-qr-karti.png`);
      toast.success("PNG dosyası indirildi.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "PNG indirilemedi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async (format: "a5" | "a6") => {
    setIsExporting(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) throw new Error("QR kartı hazırlanamadı.");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const width = canvas.width * ratio;
      const height = canvas.height * ratio;
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        (pageWidth - width) / 2,
        (pageHeight - height) / 2,
        width,
        height,
      );
      pdf.save(`${fileName || "davet"}-${format.toUpperCase()}.pdf`);
      toast.success(`${format.toUpperCase()} PDF indirildi.`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "PDF indirilemedi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExportPNG}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm text-foreground transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileImage className="size-4" />
          )}
          PNG olarak indir
        </button>
        {(["a5", "a6"] as const).map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => handleExportPDF(format)}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm text-foreground transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            <FileText className="size-4" /> {format.toUpperCase()} PDF
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div
          ref={qrRef}
          data-qr-theme={theme.id}
          className="relative mx-auto flex flex-col items-center justify-center overflow-hidden p-12 text-center text-foreground"
          style={{
            width: "595px",
            height: "842px",
            fontFamily: theme.font ? `"${theme.font}", sans-serif` : "serif",
          }}
        >
          <img
            src={theme.image}
            alt=""
            crossOrigin="anonymous"
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: theme.qr.imagePosition || "center" }}
          />
          <div className="absolute inset-0" style={{ background: theme.qr.overlay }} />
          <div className="absolute inset-5 border border-white/45" />
          <div className="absolute inset-7 border border-white/20" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <p
              className="text-xs font-semibold uppercase tracking-[0.34em]"
              style={{ color: theme.qr.accent }}
            >
              {theme.name}
            </p>
            <h1 className="mt-4 text-5xl font-light tracking-wide text-white drop-shadow-md">Anılarımıza katılın</h1>
            <p className="mb-4 text-sm uppercase tracking-[0.26em] text-white/90 drop-shadow-md">
              Fotoğraf ve videolarınızı yüklemek için okutun
            </p>
            <div
              ref={qrSvgRef}
              className="rounded-3xl p-5 shadow-2xl"
              style={{
                backgroundColor: theme.qr.paper,
                boxShadow: `0 24px 70px ${theme.qr.accent}55`,
              }}
            >
              <QRCodeSVG
                value={url}
                size={220}
                level="H"
                fgColor={theme.qr.ink}
                bgColor={theme.qr.paper}
              />
            </div>
            <h2 className="mt-8 text-5xl font-light text-white drop-shadow-md">
              {partnerOne} <span className="opacity-55">&</span> {partnerTwo}
            </h2>
            <p className="mt-6 text-xs tracking-[0.24em] text-white/80 drop-shadow-sm">#MemoryWedding</p>
          </div>
        </div>
      </div>
    </div>
  );
}
