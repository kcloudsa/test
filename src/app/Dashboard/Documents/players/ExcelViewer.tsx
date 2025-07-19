import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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

interface ExcelViewerProps {
  document: Document;
}

interface SheetData {
  name: string;
  data: any[][];
}

export const ExcelViewer = ({ document }: ExcelViewerProps) => {
  const { t } = useTranslation("documents");
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcelFile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dynamic import to avoid build-time issues
        const XLSX = await import("xlsx");

        const response = await fetch(document.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetsData: SheetData[] = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: false,
          }) as any[][];

          return {
            name,
            data: data.length > 0 ? data : [["No data available"]],
          };
        });

        setSheets(sheetsData);
        setActiveSheet(0);
      } catch (err) {
        console.error("Error loading Excel file:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load Excel file",
        );
        toast.error("Error loading Excel file", {
          description:
            "Unable to load the Excel file. You can download it to view offline.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [document.url]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the effect
    const event = new CustomEvent("excel-retry");
    window.dispatchEvent(event);
  };

  const handleOpenInGoogleSheets = () => {
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?url=${encodeURIComponent(document.url)}`;
    window.open(googleSheetsUrl, "_blank");
  };

  const handleOpenInOneDrive = () => {
    const oneDriveUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`;
    window.open(oneDriveUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t("players.excel.loadingExcelFile")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="max-w-md rounded-lg bg-card border p-8 text-center">
          <FileSpreadsheet className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h3 className="mb-2 font-semibold">
            {t("players.excel.excelPreview")}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("players.excel.unableToPreviewExcel")}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                const link = window.document.createElement("a");
                link.href = document.url;
                link.download = document.name;
                link.click();
              }}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {t("players.excel.downloadFile")}
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenInOneDrive}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {t("players.excel.openInOfficeOnline")}
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenInGoogleSheets}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {t("players.excel.openInGoogleSheets")}
            </Button>
            <Button
              variant="ghost"
              onClick={handleRetry}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("players.excel.tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="max-w-md rounded-lg bg-card border p-8 text-center">
          <FileSpreadsheet className="mx-auto mb-4 h-16 w-16 text-blue-500" />
          <h3 className="mb-2 font-semibold">
            {t("players.excel.noDataFound")}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("players.excel.excelFileEmpty")}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              const link = window.document.createElement("a");
              link.href = document.url;
              link.download = document.name;
              link.click();
            }}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            {t("players.excel.downloadFile")}
          </Button>
        </div>
      </div>
    );
  }

  const currentSheet = sheets[activeSheet];

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header with sheet tabs */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-500" />
            <span className="font-medium">
              {t("players.excel.excelSpreadsheet")}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInOneDrive}
              title="Open in Office Online"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = window.document.createElement("a");
                link.href = document.url;
                link.download = document.name;
                link.click();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sheet tabs */}
        {sheets.length > 1 && (
          <div className="flex gap-1 overflow-x-auto">
            {sheets.map((sheet, index) => (
              <Button
                key={index}
                variant={activeSheet === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSheet(index)}
                className="whitespace-nowrap"
              >
                {sheet.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Sheet content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full overflow-auto!">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Badge variant="secondary">{currentSheet.name}</Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    (
                    {t("players.excel.rows", {
                      count: currentSheet.data.length,
                    })}
                    )
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96 p-0">
                <div className="overflow-auto!">
                  <table className="w-full border-collapse">
                    <tbody>
                      {currentSheet.data.slice(0, 100).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex === 0 ? "bg-muted/50" : ""}
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="max-w-48 min-w-24 border border-border p-2 text-sm"
                            >
                              <div
                                className="truncate"
                                title={String(cell || "")}
                              >
                                {String(cell || "")}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {currentSheet.data.length > 100 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t("players.excel.showingFirstRows", {
                        shown: 100,
                        total: currentSheet.data.length,
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
