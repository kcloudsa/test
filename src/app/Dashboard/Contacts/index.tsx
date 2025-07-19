import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApiQuery } from "@/hooks/useApi";
import type { Contact, SubUser, ContactFilters } from "@/types/contact";
import {
  DEFAULT_CONTACT_FILTERS,
  hasContactMethods,
  getAvailableContactMethods,
} from "@/types/contact";
import { ContactDetail } from "@/components/ContactDetail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Phone,
  Mail,
  MoreVertical,
  UserPlus,
  Filter,
  Users,
  Shield,
  Tag,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  PhoneCall,
} from "lucide-react";

const tagColors = {
  blue: "bg-blue-100 text-blue-800",
  orange: "bg-orange-100 text-orange-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
  indigo: "bg-indigo-100 text-indigo-800",
};

export default function Contacts() {
  const { t } = useTranslation("contacts");
  const [filters, setFilters] = useState<ContactFilters>(
    DEFAULT_CONTACT_FILTERS,
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedContact, setSelectedContact] = useState<
    Contact | SubUser | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError,
  } = useApiQuery<Contact[]>({
    queryKey: ["contacts"],
    endpoint: "/data/contacts.json",
    useLocalJson: true,
  });

  const {
    data: subUsers,
    isLoading: subUsersLoading,
    error: subUsersError,
  } = useApiQuery<SubUser[]>({
    queryKey: ["sub-users"],
    endpoint: "/data/sub-users.json",
    useLocalJson: true,
  });

  const isLoading = contactsLoading || subUsersLoading;
  const error = contactsError || subUsersError;

  // Combine contacts and sub-users
  const allContacts = useMemo(() => {
    const items: (Contact | SubUser)[] = [];

    if (contacts) {
      // Only include contacts that have contact methods
      const contactsWithMethods = contacts.filter(hasContactMethods);
      items.push(...contactsWithMethods);
    }

    if (subUsers) {
      // Only include sub-users that have contact methods
      const subUsersWithMethods = subUsers.filter(hasContactMethods);
      items.push(...subUsersWithMethods);
    }

    return items;
  }, [contacts, subUsers]);

  // Filter combined contacts
  const filteredContacts = useMemo(() => {
    if (!allContacts) return [];

    return allContacts.filter((item) => {
      const isSubUser = "superAdminID" in item;

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          item.name.displayName.toLowerCase().includes(searchLower) ||
          (isSubUser
            ? (item as SubUser).contactInfo.email.email
                .toLowerCase()
                .includes(searchLower) ||
              (item as SubUser).contactInfo.phone.phoneNumber.includes(
                searchLower,
              )
            : (item as Contact).description
                .toLowerCase()
                .includes(searchLower) ||
              (item as Contact).user?.contactInfo.email.email
                .toLowerCase()
                .includes(searchLower) ||
              (item as Contact).phone.number.includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Tags filter (only for contacts, not sub-users)
      if (filters.tags.length > 0 && !isSubUser) {
        const contact = item as Contact;
        if (!filters.tags.includes(contact.tag?.name || "")) {
          return false;
        }
      }

      // Contact type filter (contact vs sub-user)
      if (filters.roles.length > 0) {
        const itemType = isSubUser ? "sub-user" : "contact";
        if (!filters.roles.includes(itemType)) {
          return false;
        }
      }

      // Contact types filter
      if (filters.contactTypes.length > 0) {
        const hasEmail = isSubUser
          ? !!(item as SubUser).contactInfo.email.email
          : !!(item as Contact).user?.contactInfo.email.email;
        const hasPhone = isSubUser
          ? !!(item as SubUser).contactInfo.phone.phoneNumber
          : !!(item as Contact).phone.number;

        const contactTypes: string[] = [];
        if (hasEmail) contactTypes.push("email");
        if (hasPhone) contactTypes.push("phone", "whatsapp");

        if (!filters.contactTypes.some((type) => contactTypes.includes(type))) {
          return false;
        }
      }

      return true;
    });
  }, [allContacts, filters]);

  // Get unique values for filters
  const uniqueTags = useMemo(() => {
    if (!contacts) return [];
    return Array.from(
      new Set(
        contacts
          .map((c) => c.tag?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    );
  }, [contacts]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    if (contacts && contacts.length > 0) {
      roles.add("contact");
    }
    if (subUsers && subUsers.length > 0) {
      roles.add("sub-user");
    }
    return Array.from(roles);
  }, [contacts, subUsers]);

  const handleContactClick = (contact: Contact | SubUser) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleViewDetails = (contact: Contact | SubUser) => {
    handleContactClick(contact);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleTagFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleRoleFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      roles: prev.roles.includes(type)
        ? prev.roles.filter((r) => r !== type)
        : [...prev.roles, type],
    }));
  };

  const handleContactTypeFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      contactTypes: prev.contactTypes.includes(type)
        ? prev.contactTypes.filter((t) => t !== type)
        : [...prev.contactTypes, type],
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_CONTACT_FILTERS);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatPhoneNumber = (countryCode: string, number: string) => {
    return `${countryCode} ${number}`;
  };

  const getRoleIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Users className="h-4 w-4" />;
      case "sub-user":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatPhoneForWhatsApp = (countryCode: string, number: string) => {
    // Remove any non-numeric characters and format for WhatsApp
    const cleanNumber = number.replace(/\D/g, "");
    const cleanCountryCode = countryCode.replace(/\D/g, "");
    return `${cleanCountryCode}${cleanNumber}`;
  };

  const handlePhoneCall = (countryCode: string, number: string) => {
    const phoneNumber = `${countryCode}${number.replace(/\D/g, "")}`;
    window.open(`tel:${phoneNumber}`, "_self");
  };

  const handleWhatsApp = (countryCode: string, number: string) => {
    const whatsappNumber = formatPhoneForWhatsApp(countryCode, number);
    const message = encodeURIComponent(t("whatsappMessage"));
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  // Wrapper functions for ContactDetail component
  const handlePhoneCallFromDetail = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsAppFromDetail = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(t("whatsappMessage"));
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(t("emailSubject", { name }));
    const body = encodeURIComponent(t("emailBody", { name }));
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_self");
  };

  const getContactMethodsForDisplay = (item: Contact | SubUser) => {
    return getAvailableContactMethods(item);
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <p className="text-red-500">
            {t("errors.loading", { message: error.message })}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-center *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card w-full rounded-xl border p-3">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Tags Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Tag className="h-4 w-4" />
                    <span className="inline">{t("filters.tags")}</span>
                    {filters.tags.length > 0 && (
                      <Badge variant="secondary">{filters.tags.length}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {uniqueTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => handleTagFilter(tag)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`h-3 w-3 rounded-full ${tagColors[contacts?.find((c) => c.tag?.name === tag)?.tag?.color as keyof typeof tagColors] || "bg-gray-100"}`}
                      />
                      {tag}
                      {filters.tags.includes(tag) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Contact Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="inline">{t("filters.type")}</span>
                    {filters.roles.length > 0 && (
                      <Badge variant="secondary">{filters.roles.length}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {uniqueRoles.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleRoleFilter(type)}
                      className="flex items-center gap-2"
                    >
                      {getRoleIcon(type)}
                      <span className="capitalize">
                        {t(
                          `contactTypes.${type === "sub-user" ? "subUser" : "contact"}`,
                        )}
                      </span>
                      {filters.roles.includes(type) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Contact Methods Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="inline">{t("filters.methods")}</span>
                    {filters.contactTypes.length > 0 && (
                      <Badge variant="secondary">
                        {filters.contactTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["email", "phone", "whatsapp"].map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleContactTypeFilter(type)}
                      className="flex items-center gap-2"
                    >
                      {type === "email" && <Mail className="h-4 w-4" />}
                      {type === "phone" && <Phone className="h-4 w-4" />}
                      {type === "whatsapp" && (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      <span className="capitalize">
                        {t(`contactTypes.${type}`)}
                      </span>
                      {filters.contactTypes.includes(type) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters Button */}
              {(filters.tags.length > 0 ||
                filters.roles.length > 0 ||
                filters.contactTypes.length > 0 ||
                filters.searchTerm) && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="text-xs sm:text-sm"
                >
                  {t("filters.clear")}
                </Button>
              )}
            </div>
          </div>

          {/* Results count and view toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("results.count", {
                count: filteredContacts.length,
                total: allContacts?.length || 0,
              })}
            </p>
            <div className="flex items-center gap-4">
              <Button className="flex items-center gap-2 text-xs sm:text-sm">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("actions.addContact")}
                </span>
                <span className="sm:hidden">{t("actions.add")}</span>
              </Button>
              <Select
                value={view}
                onValueChange={(value: "grid" | "list") => setView(value)}
              >
                <SelectTrigger className="hidden w-24 sm:w-32 md:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">{t("view.grid")}</SelectItem>
                  <SelectItem value="list">{t("view.list")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Filters */}
      {(filters.tags.length > 0 ||
        filters.roles.length > 0 ||
        filters.contactTypes.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {t("filters.tags")}: {translateDbValue(tag, "tags")}
              <button
                onClick={() => handleTagFilter(tag)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.roles.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {t("filters.type")}:{" "}
              {translateDbValue(
                type === "sub-user" ? "Sub User" : "Contact",
                "roles",
              )}
              <button
                onClick={() => handleRoleFilter(type)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.contactTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {t("filters.methods")}: {t(`contactTypes.${type}`)}
              <button
                onClick={() => handleContactTypeFilter(type)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Contacts Grid/List */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredContacts.map((item) => {
            const isSubUser = "superAdminID" in item;
            const displayName = item.name.displayName;
            const avatar = isSubUser
              ? (item as SubUser).avatar
              : (item as Contact).user?.userInfo.profilePicture;
            const role = isSubUser
              ? translateDbValue("Sub User", "roles")
              : translateDbValue(
                  (item as Contact).user?.role || "Contact",
                  "roles",
                );
            const contactMethods = getContactMethodsForDisplay(item);
            const hasPhone = contactMethods.includes("phone");
            const hasEmail = contactMethods.includes("email");

            return (
              <Card
                key={item._id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => handleContactClick(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-blue-100 font-semibold text-blue-600">
                          {getInitials(item.name.firstName, item.name.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold sm:text-base">
                          {displayName}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {role}
                          </Badge>
                          {!isSubUser && (item as Contact).tag && (
                            <Badge
                              className={
                                tagColors[
                                  (item as Contact).tag!
                                    .color as keyof typeof tagColors
                                ]
                              }
                            >
                              {translateDbValue(
                                (item as Contact).tag!.name,
                                "tags",
                              )}
                            </Badge>
                          )}
                          {isSubUser && (
                            <Badge
                              variant={
                                (item as SubUser).status === "active"
                                  ? "default"
                                  : (item as SubUser).status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {t(`status.${(item as SubUser).status}`)}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getRoleIcon(isSubUser ? "sub-user" : "contact")}
                            <span className="text-xs capitalize sm:text-sm">
                              {role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("actions.viewDetails")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {!isSubUser && (
                    <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                      {(item as Contact).description}
                    </p>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    {hasPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                          {isSubUser
                            ? formatPhoneNumber(
                                (item as SubUser).contactInfo.phone.countryCode,
                                (item as SubUser).contactInfo.phone.phoneNumber,
                              )
                            : formatPhoneNumber(
                                (item as Contact).phone.countryCode,
                                (item as Contact).phone.number,
                              )}
                        </span>
                      </div>
                    )}
                    {hasEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                          {isSubUser
                            ? (item as SubUser).contactInfo.email.email
                            : (item as Contact).user?.contactInfo.email.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Available Contact Methods */}
                  <div className="flex flex-wrap gap-1">
                    {contactMethods.map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method === "email" && (
                          <Mail className="mr-1 h-3 w-3" />
                        )}
                        {method === "phone" && (
                          <Phone className="mr-1 h-3 w-3" />
                        )}
                        {method === "whatsapp" && (
                          <MessageCircle className="mr-1 h-3 w-3" />
                        )}
                        {t(`contactTypes.${method}`)}
                      </Badge>
                    ))}
                  </div>

                  {/* Conditional Action Buttons */}
                  <div className="flex items-center gap-1 border-t pt-2">
                    {hasPhone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex flex-1 items-center gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          const phone = isSubUser
                            ? `${(item as SubUser).contactInfo.phone.countryCode}${(item as SubUser).contactInfo.phone.phoneNumber}`
                            : `${(item as Contact).phone.countryCode}${(item as Contact).phone.number}`;
                          handlePhoneCall("", phone);
                        }}
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {t("actions.call")}
                        </span>
                      </Button>
                    )}
                    {hasPhone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex flex-1 items-center gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          const phone = isSubUser
                            ? `${(item as SubUser).contactInfo.phone.countryCode}${(item as SubUser).contactInfo.phone.phoneNumber}`
                            : `${(item as Contact).phone.countryCode}${(item as Contact).phone.number}`;
                          handleWhatsApp("", phone);
                        }}
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {t("actions.whatsapp")}
                        </span>
                      </Button>
                    )}
                    {hasEmail && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex flex-1 items-center gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          const email = isSubUser
                            ? (item as SubUser).contactInfo.email.email
                            : (item as Contact).user?.contactInfo.email.email ||
                              "";
                          handleEmail(email, displayName);
                        }}
                      >
                        <Mail className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {t("actions.email")}
                        </span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredContacts.map((item) => {
            const isSubUser = "superAdminID" in item;
            const displayName = item.name.displayName;
            const avatar = isSubUser
              ? (item as SubUser).avatar
              : (item as Contact).user?.userInfo.profilePicture;
            const role = isSubUser
              ? translateDbValue("Sub User", "roles")
              : translateDbValue(
                  (item as Contact).user?.role || "Contact",
                  "roles",
                );
            const contactMethods = getContactMethodsForDisplay(item);
            const hasPhone = contactMethods.includes("phone");
            const hasEmail = contactMethods.includes("email");

            return (
              <Card
                key={item._id}
                className="cursor-pointer py-0! transition-shadow hover:shadow-md"
                onClick={() => handleContactClick(item)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-4">
                      <Avatar className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-blue-100 font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                          {getInitials(item.name.firstName, item.name.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold sm:text-base">
                            {displayName}
                          </h3>
                          {!isSubUser && (item as Contact).tag && (
                            <Badge
                              className={
                                tagColors[
                                  (item as Contact).tag!
                                    .color as keyof typeof tagColors
                                ]
                              }
                            >
                              {translateDbValue(
                                (item as Contact).tag!.name,
                                "tags",
                              )}
                            </Badge>
                          )}
                          {isSubUser && (
                            <Badge
                              variant={
                                (item as SubUser).status === "active"
                                  ? "default"
                                  : (item as SubUser).status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {t(`status.${(item as SubUser).status}`)}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getRoleIcon(isSubUser ? "sub-user" : "contact")}
                            <span className="text-xs capitalize sm:text-sm">
                              {role}
                            </span>
                          </div>
                        </div>
                        {!isSubUser && (
                          <p className="mb-2 line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2 sm:text-sm">
                            {(item as Contact).description}
                          </p>
                        )}

                        {/* Contact Information - List View */}
                        <div className="mb-2 space-y-1 text-xs sm:text-sm">
                          {hasPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate text-muted-foreground">
                                {isSubUser
                                  ? formatPhoneNumber(
                                      (item as SubUser).contactInfo.phone
                                        .countryCode,
                                      (item as SubUser).contactInfo.phone
                                        .phoneNumber,
                                    )
                                  : formatPhoneNumber(
                                      (item as Contact).phone.countryCode,
                                      (item as Contact).phone.number,
                                    )}
                              </span>
                            </div>
                          )}
                          {hasEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate text-muted-foreground">
                                {isSubUser
                                  ? (item as SubUser).contactInfo.email.email
                                  : (item as Contact).user?.contactInfo.email
                                      .email}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Available Contact Methods */}
                        <div className="mb-2 flex flex-wrap gap-1 sm:mb-3">
                          {contactMethods.map((method) => (
                            <Badge
                              key={method}
                              variant="outline"
                              className="text-xs"
                            >
                              {method === "email" && (
                                <Mail className="mr-1 h-3 w-3" />
                              )}
                              {method === "phone" && (
                                <Phone className="mr-1 h-3 w-3" />
                              )}
                              {method === "whatsapp" && (
                                <MessageCircle className="mr-1 h-3 w-3" />
                              )}
                              {t(`contactTypes.${method}`)}
                            </Badge>
                          ))}
                        </div>

                        {/* Action buttons with translations */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          {hasPhone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const phone = isSubUser
                                  ? `${(item as SubUser).contactInfo.phone.countryCode}${(item as SubUser).contactInfo.phone.phoneNumber}`
                                  : `${(item as Contact).phone.countryCode}${(item as Contact).phone.number}`;
                                handlePhoneCall("", phone);
                              }}
                            >
                              <PhoneCall className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {t("actions.call")}
                              </span>
                            </Button>
                          )}
                          {hasPhone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const phone = isSubUser
                                  ? `${(item as SubUser).contactInfo.phone.countryCode}${(item as SubUser).contactInfo.phone.phoneNumber}`
                                  : `${(item as Contact).phone.countryCode}${(item as Contact).phone.number}`;
                                handleWhatsApp("", phone);
                              }}
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {t("actions.whatsapp")}
                              </span>
                            </Button>
                          )}
                          {hasEmail && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const email = isSubUser
                                  ? (item as SubUser).contactInfo.email.email
                                  : (item as Contact).user?.contactInfo.email
                                      .email || "";
                                handleEmail(email, displayName);
                              }}
                            >
                              <Mail className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {t("actions.email")}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("actions.viewDetails")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && contacts && contacts.length > 0 && (
        <Card className="p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("emptyState.noMatches.title")}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t("emptyState.noMatches.description")}
          </p>
          <Button onClick={resetFilters} variant="outline">
            {t("emptyState.noMatches.action")}
          </Button>
        </Card>
      )}

      {contacts?.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("emptyState.noContacts.title")}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t("emptyState.noContacts.description")}
          </p>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {t("emptyState.noContacts.action")}
          </Button>
        </Card>
      )}

      {/* Contact Detail Modal */}
      <ContactDetail
        contact={selectedContact}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onPhoneCall={handlePhoneCallFromDetail}
        onWhatsApp={handleWhatsAppFromDetail}
        onEmail={handleEmail}
      />
    </div>
  );
}
