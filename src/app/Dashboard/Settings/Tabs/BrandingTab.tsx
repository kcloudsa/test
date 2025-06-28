import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Palette,
  Globe,
  Mail,
  FileText,
  Crown,
  Eye,
  Download,
  Copy,
  Check,
  Info,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";
import type { UserSettings } from "@/types";
import { useTranslation } from "react-i18next";

interface BrandingTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isOrganization?: boolean;
}

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export function BrandingTab({
  settings,
  setSettings,
  isOrganization = false,
}: BrandingTabProps) {
  const { t, i18n } = useTranslation("settings");
  const locale = i18n.language;
  const [activePreview, setActivePreview] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [colorTheme, setColorTheme] = useState<ColorTheme>({
    primary: "#0f172a",
    secondary: "#64748b",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#1e293b",
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "logo") {
          setLogoPreview(result);
        } else {
          setFaviconPreview(result);
        }
        toast.success(
          type === "logo"
            ? t("Branding.logo.logoUploaded")
            : t("Branding.logo.faviconUploaded")
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const copyCustomUrl = () => {
    const url = `https://${settings.subdomain || "yourcompany"}.k-cloud.com`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success(t("Branding.customDomain.copySuccess"));
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const generatePreviewUrl = () => {
    return `https://${settings.subdomain || "yourcompany"}.k-cloud.com`;
  };

  if (isOrganization) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50" />
        <CardContent className="relative flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 p-4">
            <Crown className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="mb-2 text-2xl font-semibold">{t("Branding.org.title")}</h3>
          <p className="mb-6 max-w-md text-white/50">
            {t("Branding.org.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Crown className="mr-2 h-4 w-4" />
              {t("Branding.org.contactSales")}
            </Button>
            <Button variant="outline">
              {t("Branding.org.learnMore")}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle>{t("Branding.title")}</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  {t("Branding.org.premium")}
                </Badge>
              </div>
              <CardDescription>
                {t("Branding.description")}
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  {t("Branding.preview.button")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-8xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{t("Branding.preview.title")}</DialogTitle>
                  <DialogDescription>
                    {t("Branding.preview.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Device Selector */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={
                        activePreview === "desktop" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActivePreview("desktop")}
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      {t("Branding.preview.desktop")}
                    </Button>
                    <Button
                      variant={
                        activePreview === "tablet" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActivePreview("tablet")}
                    >
                      <Tablet className="mr-2 h-4 w-4" />
                      {t("Branding.preview.tablet")}
                    </Button>
                    <Button
                      variant={
                        activePreview === "mobile" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActivePreview("mobile")}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      {t("Branding.preview.mobile")}
                    </Button>
                  </div>

                  {/* Preview Frame */}
                  <div className="flex justify-center">
                    <div
                      className={`overflow-hidden rounded-lg border transition-all duration-300 ${
                        activePreview === "desktop"
                          ? "h-96 w-full"
                          : activePreview === "tablet"
                            ? "h-96 w-96"
                            : "h-96 w-64"
                      }`}
                      style={{
                        backgroundColor: colorTheme.background,
                        color: colorTheme.text,
                      }}
                    >
                      <div
                        className="flex h-16 items-center border-b px-4"
                        style={{ backgroundColor: colorTheme.primary }}
                      >
                        {logoPreview && (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="mr-3 h-8 w-auto"
                          />
                        )}
                        <div className="font-semibold text-white">
                          {settings.companyName || "Your Company"}
                        </div>
                      </div>
                      <div className="space-y-4 p-4">
                        <div
                          className="rounded-lg p-4"
                          style={{ backgroundColor: colorTheme.accent + "10" }}
                        >
                          <h3
                            style={{ color: colorTheme.accent }}
                            className="mb-2 font-semibold"
                          >
                            {t("Branding.preview.welcome")}
                          </h3>
                          <p className="text-sm opacity-80">
                            {t("Branding.preview.customerView")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Domain & URL Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>{t("Branding.customDomain.title")}</span>
          </CardTitle>
          <CardDescription>
            {t("Branding.customDomain.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("Branding.customDomain.subdomain")}</Label>
              <div className={`flex ${locale === "ar-SA" ? "flex-row-reverse" : ""}`}>
                <Input
                  placeholder={t("Branding.customDomain.subdomainPlaceholder")}
                  value={settings.subdomain || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, subdomain: e.target.value })
                  }
                  className="rounded-r-none"
                />
                <span className="flex w-32 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                  .k-cloud.com
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Branding.customDomain.urlHelp")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("Branding.customDomain.domain")}</Label>
              <Input
                placeholder={t("Branding.customDomain.domainPlaceholder")}
                value={settings.customDomain || ""}
                onChange={(e) =>
                  setSettings({ ...settings, customDomain: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("Branding.customDomain.domainHelp")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-lg bg-muted/50 p-3">
            <div className="flex-1">
              <span className="text-sm font-medium">{t("Branding.customDomain.platformUrl")}</span>
              <span className="text-sm text-muted-foreground">
                {generatePreviewUrl()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={copyCustomUrl}>
              {copiedUrl ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logo & Visual Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>{t("Branding.logo.title")}</span>
          </CardTitle>
          <CardDescription>
            {t("Branding.logo.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>{t("Branding.logo.companyLogo")}</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                {logoPreview ? (
                  <div className="space-y-4">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="mx-auto max-h-16"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("logo-upload")?.click()
                      }
                    >
                      {t("Branding.logo.changeLogo")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("logo-upload")?.click()
                        }
                      >
                        {t("Branding.logo.uploadLogo")}
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("Branding.logo.logoHelp")}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="hidden"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-4">
              <Label>{t("Branding.logo.favicon")}</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                {faviconPreview ? (
                  <div className="space-y-4">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="mx-auto h-8 w-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("favicon-upload")?.click()
                      }
                    >
                      {t("Branding.logo.changeFavicon")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("favicon-upload")?.click()
                        }
                      >
                        {t("Branding.logo.uploadFavicon")}
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("Branding.logo.faviconHelp")}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "favicon")}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>{t("Branding.colorTheme.title")}</span>
          </CardTitle>
          <CardDescription>
            {t("Branding.colorTheme.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label className="text-sm">{t("Branding.colorTheme.primary")}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorTheme.primary}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, primary: e.target.value })
                  }
                  className="h-10 w-12 rounded border"
                />
                <Input
                  value={colorTheme.primary}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, primary: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("Branding.colorTheme.secondary")}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorTheme.secondary}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, secondary: e.target.value })
                  }
                  className="h-10 w-12 rounded border"
                />
                <Input
                  value={colorTheme.secondary}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, secondary: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("Branding.colorTheme.accent")}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorTheme.accent}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, accent: e.target.value })
                  }
                  className="h-10 w-12 rounded border"
                />
                <Input
                  value={colorTheme.accent}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, accent: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("Branding.colorTheme.background")}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorTheme.background}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, background: e.target.value })
                  }
                  className="h-10 w-12 rounded border"
                />
                <Input
                  value={colorTheme.background}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, background: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("Branding.colorTheme.text")}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorTheme.text}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, text: e.target.value })
                  }
                  className="h-10 w-12 rounded border"
                />
                <Input
                  value={colorTheme.text}
                  onChange={(e) =>
                    setColorTheme({ ...colorTheme, text: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>{t("Branding.colorTheme.presets")}</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                {
                  name: t("Branding.colorTheme.presetNames.professionalBlue"),
                  colors: [
                    "#1e40af",
                    "#64748b",
                    "#3b82f6",
                    "#ffffff",
                    "#1e293b",
                  ],
                },
                {
                  name: t("Branding.colorTheme.presetNames.corporateGreen"),
                  colors: [
                    "#166534",
                    "#6b7280",
                    "#10b981",
                    "#ffffff",
                    "#1f2937",
                  ],
                },
                {
                  name: t("Branding.colorTheme.presetNames.elegantPurple"),
                  colors: [
                    "#7c3aed",
                    "#8b5cf6",
                    "#a855f7",
                    "#ffffff",
                    "#1e1b4b",
                  ],
                },
                {
                  name: t("Branding.colorTheme.presetNames.modernOrange"),
                  colors: [
                    "#ea580c",
                    "#f97316",
                    "#fb923c",
                    "#ffffff",
                    "#431407",
                  ],
                },
            ].map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex h-auto flex-col items-start space-y-2 p-3"
                  onClick={() =>
                    setColorTheme({
                      primary: preset.colors[0],
                      secondary: preset.colors[1],
                      accent: preset.colors[2],
                      background: preset.colors[3],
                      text: preset.colors[4],
                    })
                  }
                >
                  <div className="flex space-x-1">
                    {preset.colors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>{t("Branding.email.title")}</span>
          </CardTitle>
          <CardDescription>
            {t("Branding.email.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("Branding.email.header")}</Label>
              <Textarea
                placeholder={t("Branding.email.headerPlaceholder")}
                rows={3}
                value={settings.emailHeader || ""}
                onChange={(e) =>
                  setSettings({ ...settings, emailHeader: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Branding.email.footer")}</Label>
              <Textarea
                placeholder={t("Branding.email.footerPlaceholder")}
                rows={3}
                value={settings.emailFooter || ""}
                onChange={(e) =>
                  setSettings({ ...settings, emailFooter: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>{t("Branding.email.customization")}</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t("Branding.email.customLogo")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("Branding.email.customLogoDesc")}
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t("Branding.email.brandColors")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("Branding.email.brandColorsDesc")}
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{t("Branding.document.title")}</span>
          </CardTitle>
          <CardDescription>
            {t("Branding.document.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("Branding.document.address")}</Label>
              <Textarea
                placeholder={t("Branding.document.addressPlaceholder")}
                rows={3}
                value={settings.companyAddress || ""}
                onChange={(e) =>
                  setSettings({ ...settings, companyAddress: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Branding.document.legal")}</Label>
              <Textarea
                placeholder={t("Branding.document.legalPlaceholder")}
                rows={3}
                value={settings.legalInfo || ""}
                onChange={(e) =>
                  setSettings({ ...settings, legalInfo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>{t("Branding.document.settings")}</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t("Branding.document.watermark")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("Branding.document.watermarkDesc")}
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t("Branding.document.customTerms")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("Branding.document.customTermsDesc")}
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Branding.advanced.title")}</CardTitle>
          <CardDescription>
            {t("Branding.advanced.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("Branding.advanced.customCss")}</Label>
              <Textarea
                placeholder={t("Branding.advanced.customCssPlaceholder")}
                rows={4}
                className="font-mono text-sm"
                value={settings.customCSS || ""}
                onChange={(e) =>
                  setSettings({ ...settings, customCSS: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("Branding.advanced.customCssHelp")}
              </p>
            </div>

            <div className="space-y-4">
              <Label>{t("Branding.advanced.platformSettings")}</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Branding.advanced.hidePoweredBy")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("Branding.advanced.hidePoweredByDesc")}
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Branding.advanced.customLoading")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("Branding.advanced.customLoadingDesc")}
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Branding.advanced.whiteLabel")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("Branding.advanced.whiteLabelDesc")}
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                {t("Branding.save.info")}
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t("Branding.save.export")}
              </Button>
              <Button
                onClick={() =>
                  toast.success(t("Branding.save.saveSuccess"))
                }
              >
                {t("Branding.save.save")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
