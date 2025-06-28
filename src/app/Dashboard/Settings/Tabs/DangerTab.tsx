import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DangerTab() {
  const { t } = useTranslation("settings");

  return (
    <Card className="border-destructive border-2">
      <CardHeader>
        <CardTitle className="text-destructive">{t("Danger.title")}</CardTitle>
        <CardDescription>
          {t("Danger.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t("Danger.alert.description")}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-medium">{t("Danger.changePlan.title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("Danger.changePlan.description")}
              </p>
            </div>
            <Button variant="outline">{t("Danger.changePlan.button")}</Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-destructive p-4">
            <div>
              <h4 className="font-medium text-destructive">
                {t("Danger.cancel.title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("Danger.cancel.description")}
              </p>
            </div>
            <Button variant="destructive">{t("Danger.cancel.button")}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}