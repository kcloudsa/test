import { useTranslation } from "react-i18next";
import {
  Phone,
  Mail,
  MessageCircle,
  User,
  Calendar,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Contact, SubUser, ContactMethod } from "@/types/contact";

interface ContactDetailProps {
  contact: Contact | SubUser | null;
  isOpen: boolean;
  onClose: () => void;
  onPhoneCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onEmail: (email: string, name: string) => void;
}

const tagColors = {
  blue: "bg-blue-100 text-blue-800",
  orange: "bg-orange-100 text-orange-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
  indigo: "bg-indigo-100 text-indigo-800",
};

export function ContactDetail({
  contact,
  isOpen,
  onClose,
  onPhoneCall,
  onWhatsApp,
  onEmail,
}: ContactDetailProps) {
  const { t } = useTranslation("contacts");

  if (!contact) return null;

  const isSubUser = "superAdminID" in contact;

  // Helper function to translate database values
  const translateDbValue = (
    value: string,
    category: "roles" | "tags",
  ): string => {
    const key = `${category}.${value.toLowerCase().replace(/\s+/g, "_")}`;
    const translation = t(key);
    // If translation exists and is different from the key, use it; otherwise use original value
    return translation !== key ? translation : value;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getContactMethods = (): ContactMethod[] => {
    const methods: ContactMethod[] = [];

    if (isSubUser) {
      const subUser = contact as SubUser;
      // Email
      if (subUser.contactInfo.email.email) {
        methods.push({
          type: "email",
          value: subUser.contactInfo.email.email,
          verified: subUser.contactInfo.email.verified,
          primary: true,
        });
      }
      // Phone
      if (subUser.contactInfo.phone.phoneNumber) {
        const fullPhone = `${subUser.contactInfo.phone.countryCode}${subUser.contactInfo.phone.phoneNumber}`;
        methods.push({
          type: "phone",
          value: fullPhone,
          verified: subUser.contactInfo.phone.verified,
          primary: true,
        });
        // WhatsApp (same as phone)
        methods.push({
          type: "whatsapp",
          value: fullPhone,
          verified: subUser.contactInfo.phone.verified,
        });
      }
    } else {
      const regularContact = contact as Contact;
      // Email
      if (regularContact.user?.contactInfo.email.email) {
        methods.push({
          type: "email",
          value: regularContact.user.contactInfo.email.email,
          verified: true,
          primary: true,
        });
      }
      // Phone
      if (regularContact.phone.number) {
        const fullPhone = `${regularContact.phone.countryCode}${regularContact.phone.number}`;
        methods.push({
          type: "phone",
          value: fullPhone,
          verified: true,
          primary: true,
        });
        // WhatsApp (same as phone)
        methods.push({
          type: "whatsapp",
          value: fullPhone,
          verified: true,
        });
      }
    }

    return methods;
  };

  const contactMethods = getContactMethods();
  const displayName = contact.name.displayName;
  const avatar = isSubUser
    ? (contact as SubUser).avatar
    : (contact as Contact).user?.userInfo.profilePicture;
  const role = isSubUser
    ? translateDbValue("Sub User", "roles")
    : translateDbValue((contact as Contact).user?.role || "Contact", "roles");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
        overflow-auto p-0 
        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:animate-in
        data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
        data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] 
        max-sm:m-0 max-sm:h-[100dvh] 
        max-sm:w-[100dvw] max-sm:max-w-[100dvw] 
        max-sm:rounded-none max-sm:border-0 
        max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom
        sm:max-h-[90vh] sm:max-w-lg
        sm:rounded-lg
      "
      >
        <div className="flex h-full flex-col max-sm:h-[100dvh]">
          <DialogHeader className="flex-shrink-0 border-b border-border px-6 pt-6 pb-4">
            <DialogTitle className="text-center text-xl font-semibold sm:text-left">
              {t("detail.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 p-4">
              {/* Profile Section */}
              <div className="text-center">
                <Avatar className="mx-auto mb-4 h-24 w-24 shadow-lg ring-4 ring-background">
                  <AvatarImage src={avatar} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white">
                    {getInitials(contact.name.firstName, contact.name.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mb-2 text-2xl font-bold text-foreground">
                  {displayName}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="outline" className="font-medium capitalize">
                    {role}
                  </Badge>
                  {!isSubUser && (contact as Contact).tag && (
                    <Badge
                      className={`${tagColors[(contact as Contact).tag!.color as keyof typeof tagColors]} font-medium`}
                    >
                      {translateDbValue((contact as Contact).tag!.name, "tags")}
                    </Badge>
                  )}
                  {isSubUser && (
                    <Badge
                      variant={
                        (contact as SubUser).status === "active"
                          ? "default"
                          : (contact as SubUser).status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="font-medium"
                    >
                      {t(`status.${(contact as SubUser).status}`)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Methods */}
              {contactMethods.length > 0 && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      {t("detail.contactMethods")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contactMethods.map((method, index) => (
                      <div
                        key={`${method.type}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-border"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex items-center gap-2">
                            {method.type === "email" && (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                            {method.type === "phone" && (
                              <Phone className="h-4 w-4 text-green-600" />
                            )}
                            {method.type === "whatsapp" && (
                              <MessageCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium text-foreground capitalize">
                              {t(`contactTypes.${method.type}`)}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {method.verified && (
                              <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                            )}
                            {method.verified === false && (
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                            )}
                            <span className="truncate text-sm text-muted-foreground">
                              {method.value}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 transition-colors hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            if (method.type === "email") {
                              onEmail(method.value, displayName);
                            } else if (method.type === "phone") {
                              onPhoneCall(method.value);
                            } else if (method.type === "whatsapp") {
                              onWhatsApp(method.value);
                            }
                          }}
                        >
                          {t("actions.contact")}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Description/Bio */}
              {!isSubUser && (contact as Contact).description && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      {t("detail.description")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {(contact as Contact).description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Permissions (Sub Users only) */}
              {isSubUser && (contact as SubUser).permissions.length > 0 && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      {t("detail.permissions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(contact as SubUser).permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {permission
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("detail.additionalInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("detail.created")}
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(contact.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("detail.updated")}
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(contact.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    {isSubUser && (
                      <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t("detail.superAdmin")}
                        </span>
                        <span className="max-w-[200px] truncate font-mono text-sm font-medium">
                          {(contact as SubUser).superAdminID}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 border-t border-border bg-background/50 p-6 backdrop-blur-sm">
            <div className="flex gap-3 max-sm:flex-col">
              <Button
                variant="outline"
                className="flex-1 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {t("actions.editContact")}
              </Button>
              <Button
                variant="destructive"
                className="transition-colors hover:bg-destructive/90 max-sm:w-full sm:w-auto"
              >
                {t("actions.deleteContact")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
