import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Download,
  FileText,
} from "lucide-react";

interface Document {
  _id: string;
  name: string;
  url: string;
  fileType: string;
  mimeType: string;
  size: number;
  tags: string[];
  createdAt: string;
}

interface PDFViewerProps {
  document: Document;
}

export const PDFViewer = ({ document }: PDFViewerProps) => {
  const { t } = useTranslation("documents");
  const [pdfError, setPdfError] = useState<boolean>(false);

  if (pdfError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border p-8 text-center max-w-md">
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{t("players.pdf.pdfPreviewUnavailable")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("players.pdf.unableToDisplayPdf")}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                const link = window.document.createElement('a');
                link.href = document.url;
                link.download = document.name;
                link.click();
              }}
              className="gap-2 w-full"
            >
              <Download className="h-4 w-4" />
              {t("players.pdf.downloadPdf")}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(document.url, '_blank')}
              className="w-full"
            >
              {t("openInNewTab")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("players.pdf.pdfDocument")}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(document.url, '_blank')}
          >
            {t("openInNewTab")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = window.document.createElement('a');
              link.href = document.url;
              link.download = document.name;
              link.click();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="w-full h-full border rounded-lg overflow-hidden">
          <iframe
            src={`${document.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full"
            title={document.name}
            style={{ minHeight: '600px' }}
            onLoad={() => setPdfError(false)}
            onError={() => {
              setPdfError(true);
              toast.error(t("players.pdf.errorLoadingPdf"), {
                description: t("players.pdf.unableToDisplayPdfInBrowser"),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
