import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ExportOption } from "@/types";

interface DataTabProps {
  exportOptions: ExportOption[];
  handleExport: (dataType: string, format: "csv" | "xlsx") => void;
  exportDataMutation: { isPending: boolean };
}

export function DataTab({ exportOptions, handleExport, exportDataMutation }: DataTabProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Data.title")}</CardTitle>
          <CardDescription>
            {t("Data.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Export Options Grid */}
            <div className="grid gap-6">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{t("Data.size", { size: option.estimatedSize })}</span>
                          {option.lastExported && (
                            <span>{t("Data.lastExported", { date: option.lastExported })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* CSV Export Button */}
                      {option.csvSupported ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(option.id, "csv")}
                          disabled={exportDataMutation.isPending}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span>{t("Data.csv")}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center space-x-2 opacity-50"
                          title={t("Data.csvNotSupported")}
                        >
                          <FileText className="h-4 w-4" />
                          <span>{t("Data.csv")}</span>
                        </Button>
                      )}

                      {/* Excel Export Button */}
                      {option.xlsxSupported ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(option.id, "xlsx")}
                          disabled={exportDataMutation.isPending}
                          className="flex items-center space-x-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>{t("Data.excel")}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center space-x-2 opacity-50"
                          title={t("Data.excelNotSupported")}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>{t("Data.excel")}</span>
                        </Button>
                      )}

                      {/* Special handling for documents */}
                      {option.id === "documents" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            console.log("Exporting documents as ZIP archive");
                          }}
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>{t("Data.zip")}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export Information */}
            <div className="rounded-lg bg-muted/30 p-4">
              <h4 className="mb-2 font-medium">{t("Data.exportInfoTitle")}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("Data.exportInfo.csv")}</p>
                <p>{t("Data.exportInfo.excel")}</p>
                <p>{t("Data.exportInfo.documents")}</p>
                <p>{t("Data.exportInfo.large")}</p>
              </div>
            </div>

            {/* Bulk Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("Data.bulkExport.title")}</CardTitle>
                <CardDescription>
                  {t("Data.bulkExport.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="flex h-16 items-center justify-center space-x-2"
                    onClick={() => {
                      const csvSupportedTypes = exportOptions
                        .filter((option) => option.csvSupported)
                        .map((option) => option.id);

                      csvSupportedTypes.forEach((type) =>
                        handleExport(type, "csv")
                      );
                    }}
                    disabled={exportDataMutation.isPending}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium">{t("Data.bulkExport.allCsv")}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("Data.bulkExport.allCompatible")}
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex h-16 items-center justify-center space-x-2"
                    onClick={() => {
                      const xlsxSupportedTypes = exportOptions
                        .filter((option) => option.xlsxSupported)
                        .map((option) => option.id);

                      xlsxSupportedTypes.forEach((type) =>
                        handleExport(type, "xlsx")
                      );
                    }}
                    disabled={exportDataMutation.isPending}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium">{t("Data.bulkExport.allExcel")}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("Data.bulkExport.allCompatible")}
                      </div>
                    </div>
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    console.log("Initiating complete system backup");
                  }}
                  disabled={exportDataMutation.isPending}
                >
                  {exportDataMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Download className="mr-2 h-4 w-4" />
                  {t("Data.bulkExport.systemBackup")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}