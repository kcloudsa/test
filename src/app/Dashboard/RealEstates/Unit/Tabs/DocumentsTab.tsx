import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DocumentsTab() {
  const { t } = useTranslation("real-estates");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          {t("documents.title")}
        </h2>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("documents.uploadDocument")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="py-6 sm:py-8 text-center text-sm sm:text-base text-muted-foreground">
            {t("documents.noDocuments")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
