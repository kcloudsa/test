import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";
import { Monitor, Moon, Sun, Check, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/i18n/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { Color, ColorOption } from "@/types";

export function AppearanceTab() {
  const { t } = useTranslation('settings');
  const { theme, color, fontSize, resolvedTheme, setTheme, setColor, setFontSize } = useTheme();

  const PreviewCard = ({ isDark = false }: { isDark?: boolean }) => (
    <div
      className={cn(
        "h-24 w-full rounded-lg border-2 p-3 transition-all duration-200",
        isDark ? "border-neutral-700 bg-neutral-900" : "border-neutral-200 bg-white",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex space-x-1">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isDark ? "bg-neutral-600" : "bg-neutral-300",
            )}
          />
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isDark ? "bg-neutral-600" : "bg-neutral-300",
            )}
          />
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isDark ? "bg-neutral-600" : "bg-neutral-300",
            )}
          />
        </div>
        <div className="flex space-x-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
        </div>
      </div>
      <div
        className={cn(
          "mb-2 h-1.5 w-8 rounded",
          isDark ? "bg-neutral-700" : "bg-neutral-200",
        )}
      />
      <div className="h-2 w-12 rounded bg-primary" />
    </div>
  );

  // Updated colors list using translations
  const colorOptions: ColorOption[] = [
    { name: t('Appearance.accentColor.colors.default'), value: "default" },
    { name: t('Appearance.accentColor.colors.red'), value: "red" },
    { name: t('Appearance.accentColor.colors.rose'), value: "rose" },
    { name: t('Appearance.accentColor.colors.orange'), value: "orange" },
    { name: t('Appearance.accentColor.colors.green'), value: "green" },
    { name: t('Appearance.accentColor.colors.blue'), value: "blue" },
    { name: t('Appearance.accentColor.colors.yellow'), value: "yellow" },
    { name: t('Appearance.accentColor.colors.violet'), value: "violet" },
  ];

  return (
    <div className="space-y-6">
      {/* Theme & Color Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Appearance.themeColor.title')}</CardTitle>
          <CardDescription>
            {t('Appearance.themeColor.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('Appearance.themeMode.label')}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <div className="flex items-center space-x-2">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>{t('Appearance.themeMode.system')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>{t('Appearance.themeMode.light')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>{t('Appearance.themeMode.dark')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {theme === "system" && t('Appearance.themeMode.systemDescription')}
            </p>
          </div>

          {/* Theme Preview */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('Appearance.preview.label')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Sun className="h-3 w-3" />
                  <span className="py-0.5 text-xs font-medium">
                    {t('Appearance.preview.lightTheme')}
                  </span>
                  {resolvedTheme === "light" && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {t('Appearance.preview.active')}
                    </span>
                  )}
                </div>
                <PreviewCard isDark={false} />
                <p className="text-xs text-muted-foreground">
                  {t('Appearance.preview.lightDescription', { 
                    color: colorOptions.find((c) => c.value === color)?.name.toLowerCase() 
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Moon className="h-3 w-3" />
                  <span className="text-xs font-medium">{t('Appearance.preview.darkTheme')}</span>
                  {resolvedTheme === "dark" && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {t('Appearance.preview.active')}
                    </span>
                  )}
                </div>
                <PreviewCard isDark={true} />
                <p className="text-xs text-muted-foreground">
                  {t('Appearance.preview.darkDescription', { 
                    color: colorOptions.find((c) => c.value === color)?.name.toLowerCase() 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('Appearance.accentColor.label')}</Label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value as Color)}
                  className={cn(
                    "relative flex flex-col items-center rounded-lg border-2 p-3 transition-all duration-200 hover:scale-102",
                    color === colorOption.value
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50",
                  )}
                  title={colorOption.name}
                >
                  <div
                    className={cn(
                      "mb-2 h-6 w-6 rounded-full border-2 border-white shadow-sm",
                      colorOption.value === "default" && "bg-teal-500",
                      colorOption.value === "red" && "bg-red-500",
                      colorOption.value === "rose" && "bg-rose-500",
                      colorOption.value === "orange" && "bg-orange-500",
                      colorOption.value === "green" && "bg-green-500",
                      colorOption.value === "blue" && "bg-blue-500",
                      colorOption.value === "yellow" && "bg-yellow-500",
                      colorOption.value === "violet" && "bg-violet-500",
                    )}
                  />
                  <span className="text-xs font-medium">
                    {colorOption.name}
                  </span>
                  {color === colorOption.value && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('Appearance.accentColor.description')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language & Typography Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Appearance.languageTypography.title')}</CardTitle>
          <CardDescription>
            {t('Appearance.languageTypography.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Language Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('Appearance.language.label')}</Label>
              <LanguageSwitcher />
            </div>

            {/* Font Size Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('Appearance.fontSize.label')}</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <div className="flex items-center space-x-2">
                    <Type className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    <div className="flex w-full items-center justify-between">
                      <span>{t('Appearance.fontSize.sizes.small')}</span>
                      <span className="ml-2 text-xs text-muted-foreground">14px</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex w-full items-center justify-between">
                      <span>{t('Appearance.fontSize.sizes.medium')}</span>
                      <span className="ml-2 text-xs text-muted-foreground">16px</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="large">
                    <div className="flex w-full items-center justify-between">
                      <span>{t('Appearance.fontSize.sizes.large')}</span>
                      <span className="ml-2 text-xs text-muted-foreground">18px</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="extra-large">
                    <div className="flex w-full items-center justify-between">
                      <span>{t('Appearance.fontSize.sizes.extraLarge')}</span>
                      <span className="ml-2 text-xs text-muted-foreground">20px</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Size Preview */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('Appearance.fontPreview.label')}</Label>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">{t('Appearance.fontPreview.sampleTitle')}</h4>
                <p className="text-base text-muted-foreground">
                  {t('Appearance.fontPreview.sampleText')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('Appearance.fontPreview.sampleSmall')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Options Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Appearance.accessibility.title')}</CardTitle>
          <CardDescription>
            {t('Appearance.accessibility.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('Appearance.accessibility.highContrast.label')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('Appearance.accessibility.highContrast.description')}
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('Appearance.accessibility.reducedMotion.label')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('Appearance.accessibility.reducedMotion.description')}
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('Appearance.accessibility.focusIndicators.label')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('Appearance.accessibility.focusIndicators.description')}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}