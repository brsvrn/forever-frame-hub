import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, CheckCircle, FileVideo, FileImage } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { storage } from "@/lib/storage-adapter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GuestUploadFormProps {
  theme: ThemeConfig;
  invitationId: string;
  children?: React.ReactNode;
}

const MAX_FILES_PER_UPLOAD = 20;
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function GuestUploadForm({ theme, invitationId, children }: GuestUploadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [guestName, setGuestName] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > MAX_FILES_PER_UPLOAD) {
        setFiles([]);
        setErrorMessage(`Tek seferde en fazla ${MAX_FILES_PER_UPLOAD} dosya yükleyebilirsiniz.`);
        return;
      }

      const invalidFile = selectedFiles.find(
        (file) => !ALLOWED_MIME_TYPES.has(file.type) || file.size > MAX_FILE_SIZE_BYTES,
      );
      if (invalidFile) {
        setFiles([]);
        setErrorMessage(`${invalidFile.name} desteklenmiyor veya 100 MB sınırını aşıyor.`);
        return;
      }

      setErrorMessage("");
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      let completed = 0;
      setErrorMessage("");

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${invitationId}/${crypto.randomUUID()}-${safeName}`;
        const { url, error } = await storage.uploadFile("guest-uploads", path, file);

        if (error) {
          console.error("Storage Error:", error);
          setErrorMessage(
            `Dosya yüklenemedi: ${error.message || "depolama yetkisi kontrol edilemedi"}.`,
          );
          continue;
        }

        if (url) {
          // 2. Save metadata to database (only existing columns)
          const uploadRecord = {
            invitation_id: invitationId,
            guest_name: guestName || "İsimsiz Misafir",
            note: note || null,
            file_url: url,
            file_path: path,
            file_type: file.type,
            file_size: file.size,
            status: "active",
          };
          let { error: dbError } = await supabase.from("guest_uploads").insert(uploadRecord);

          // Older installations do not have file_path yet. Keep uploads working
          // and let gallery deletion derive the path from file_url in that case.
          if (dbError?.message.includes("file_path")) {
            const legacyRecord = {
              invitation_id: uploadRecord.invitation_id,
              guest_name: uploadRecord.guest_name,
              note: uploadRecord.note,
              file_url: uploadRecord.file_url,
              file_type: uploadRecord.file_type,
              file_size: uploadRecord.file_size,
              status: uploadRecord.status,
            };
            const legacyInsert = await supabase
              .from("guest_uploads")
              .insert(legacyRecord as unknown as typeof uploadRecord);
            dbError = legacyInsert.error;

            if (dbError?.message.includes("note")) {
              const minimalLegacyRecord = {
                invitation_id: uploadRecord.invitation_id,
                guest_name: uploadRecord.guest_name,
                file_url: uploadRecord.file_url,
                file_type: uploadRecord.file_type,
                file_size: uploadRecord.file_size,
                status: uploadRecord.status,
              };
              const minimalInsert = await supabase
                .from("guest_uploads")
                .insert(minimalLegacyRecord as unknown as typeof uploadRecord);
              dbError = minimalInsert.error;
            }
          }

          if (dbError) {
            console.error("DB Insert Error:", dbError);
            await storage.deleteFile("guest-uploads", path);
            setErrorMessage(`Veritabanı hatası: ${dbError.message}`);
          } else {
            completed++;
          }
        }

        setProgress(Math.round((completed / files.length) * 100));
      }

      setUploading(false);

      if (completed > 0) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFiles([]);
          setGuestName("");
          setNote("");
          setProgress(0);
          setErrorMessage("");
        }, 3000);
      }
    } catch (err: any) {
      setErrorMessage("Beklenmeyen bir hata oluştu: " + (err?.message || "Bilinmiyor"));
      setUploading(false);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 ${theme.styles.buttons.primary}`}
        >
          <Camera className="w-5 h-5" />
          <span>Fotoğraf & Video Yükle</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg p-6 rounded-3xl overflow-hidden relative ${theme.styles.cards.wrapper} text-white`}
            >
              <button
                onClick={() => !uploading && setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 pt-2">
                <h3 className={`text-2xl mb-2 ${theme.styles.typography.display}`}>
                  Anılarını Paylaş
                </h3>
                <p className="text-sm text-white/70">
                  Orijinal kalitede fotoğraflarınızı ve videolarınızı yükleyebilirsiniz.
                </p>
              </div>

              {!success ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 opacity-80">
                      Adınız Soyadınız (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Örn: Ayşe Yılmaz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 opacity-80">
                      Notunuz (Opsiyonel)
                    </label>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value.slice(0, 500))}
                      disabled={uploading}
                      rows={3}
                      className="w-full resize-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Çifte kısa bir not bırakın"
                    />
                  </div>

                  {errorMessage && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm leading-relaxed">
                      {errorMessage}
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-white/40 transition-colors cursor-pointer"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />

                    {files.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/50" />
                        <span className="text-sm font-medium">Dosya Seç veya Sürükle</span>
                        <span className="text-xs text-white/50">
                          Fotoğraf ve Video (Sıkıştırma yapılmaz)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2 flex-wrap justify-center">
                          {files.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs"
                            >
                              {f.type.startsWith("video/") ? (
                                <FileVideo className="w-3 h-3" />
                              ) : (
                                <FileImage className="w-3 h-3" />
                              )}
                              <span className="truncate max-w-[100px]">{f.name}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-white/70 mt-2">
                          {files.length} dosya seçildi
                        </span>
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <div className="w-full bg-white/10 rounded-full h-2 mt-4 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading}
                    className={`w-full py-4 mt-2 rounded-xl font-medium transition-all ${
                      files.length === 0 || uploading
                        ? "opacity-50 cursor-not-allowed bg-white/10"
                        : theme.styles.buttons.primary
                    }`}
                  >
                    {uploading ? `Yükleniyor... %${progress}` : "Yüklemeyi Başlat"}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 space-y-4"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                  <h4 className="text-xl font-medium">Harika!</h4>
                  <p className="text-center text-white/70 text-sm">
                    Anılarınız başarıyla kaydedildi. Hiçbir kalite kaybı yaşanmadan çifte
                    ulaştırılacak.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
