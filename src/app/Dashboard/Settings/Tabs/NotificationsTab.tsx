import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import type { UserSettings } from "@/types";

interface NotificationsTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

export function NotificationsTab({ settings, setSettings }: NotificationsTabProps) {
  const { t } = useTranslation('settings');

  const notificationSettings = [
    {
      key: "emailNotifications",
      label: t('Notifications.methods.email.label'),
      description: t('Notifications.methods.email.description'),
    },
    {
      key: "inAppNotifications",
      label: t('Notifications.methods.inApp.label'),
      description: t('Notifications.methods.inApp.description'),
    },
    {
      key: "smsNotifications",
      label: t('Notifications.methods.sms.label'),
      description: t('Notifications.methods.sms.description'),
    },
  ];

  const notificationTypes = [
    t('Notifications.types.taskUpdates'),
    t('Notifications.types.rentalReminders'),
    t('Notifications.types.overdueAlerts'),
    t('Notifications.types.systemUpdates'),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Notifications.title')}</CardTitle>
        <CardDescription>
          {t('Notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationSettings.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={settings[item.key as keyof UserSettings] as boolean}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, [item.key]: checked })
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>{t('Notifications.types.label')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {notificationTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type} defaultChecked />
                <Label htmlFor={type} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}