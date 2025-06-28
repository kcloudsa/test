import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Clock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserSettings, Timezone, Currency } from "@/types";

interface GeneralTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  timezones: Timezone[];
  currencies: Currency[];
  currencySearch: string;
  setCurrencySearch: (search: string) => void;
  timezoneSearch: string;
  setTimezoneSearch: (search: string) => void;
  handleSaveSettings: () => void;
  saveSettingsMutation: { isPending: boolean };
}

export function GeneralTab({
  settings,
  setSettings,
  timezones,
  currencies,
  currencySearch,
  setCurrencySearch,
  timezoneSearch,
  setTimezoneSearch,
  handleSaveSettings,
  saveSettingsMutation,
}: GeneralTabProps) {
  const { t } = useTranslation('settings');

  const landingPages = [
    { value: "dashboard", label: t('General.startupPage.dashboard') },
    { value: "real-states", label: t('General.startupPage.properties') },
    { value: "tasks", label: "Tasks" },
    { value: "calendar", label: "Calendar" },
    { value: "contacts", label: "Contacts" },
    { value: "documents", label: "Documents" },
    { value: "reports", label: "Reports" },
    { value: "rentals", label: "Rentals" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('General.title')}</CardTitle>
          <CardDescription>
            {t('General.timezone.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-6">
            {/* Timezone */}
            <div className="space-y-2">
              <Label>{t('General.timezone.label')}</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value: string) =>
                  setSettings({ ...settings, timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('General.timezone.label')} />
                </SelectTrigger>
                <SelectContent className="w-[400px]">
                  <div className="border-b p-2">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search timezones..."
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {timezones.map((timezone: Timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{timezone.region}</span>
                            {timezone.city && (
                              <>
                                <span className="text-muted-foreground">/</span>
                                <span>{timezone.city}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{timezone.currentTime}</span>
                            <Badge variant="outline" className="text-xs">
                              {timezone.offset}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label>{t('General.currency.label')}</Label>
              <Select
                value={settings.currency}
                onValueChange={(value: string) =>
                  setSettings({ ...settings, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('General.currency.label')} />
                </SelectTrigger>
                <SelectContent>
                  <div className="border-b p-2">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search currencies..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {currencies.map((currency: Currency) => (
                      <SelectItem key={currency.key} value={currency.key}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.emoji}</span>
                          <span className="font-medium">{currency.key}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm">{currency.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <Label>{t('General.dateFormat.label')}</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value: string) =>
                  setSettings({ ...settings, dateFormat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Landing Page */}
            <div className="space-y-2">
              <Label>{t('General.startupPage.label')}</Label>
              <Select
                value={settings.landingPage}
                onValueChange={(value: string) =>
                  setSettings({ ...settings, landingPage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {landingPages.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
        >
          {saveSettingsMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}