import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Shield,
  Clock,
  BookDashed,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Member } from "@/types";

interface MembersTabProps {
  membersData: Member[] | undefined;
  membersLoading: boolean;
  onCreateMember: (member: NewMemberForm) => Promise<void>;
  onUpdateMember: (member: EditMemberForm) => Promise<void>;
  onDeleteMember: (memberId: string) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: string | null;
}

interface NewMemberForm {
  name: string;
  email: string;
  password: string;
  permissions: string[];
}

interface EditMemberForm extends Omit<NewMemberForm, "password"> {
  id: string;
  status: string;
}

interface PermissionTemplate {
  id: string;
  name: string;
  permissions: string[];
}

// Permission categories and permissions - Updated with camelCase keys
const permissionCategories = {
  "Dashboard & General": [
    "ViewDashboard",
    "ViewReports",
    "ExportData",
    "ManageSettings",
  ],
  "Contacts Management": [
    "ViewContacts",
    "AddContacts",
    "EditContacts",
    "DeleteContacts",
    "CallContacts",
    "SendEmailToContacts",
    "ImportContacts",
    "ExportContacts",
  ],
  "Rentals Management": [
    "ViewRentals",
    "CreateRentals",
    "EditRentals",
    "DeleteRentals",
    "ApproveRentals",
    "GenerateRentalContracts",
    "ManageRentalPayments",
    "ViewRentalHistory",
  ],
  "Properties Management": [
    "ViewProperties",
    "AddProperties",
    "EditProperties",
    "DeleteProperties",
    "ManagePropertyMedia",
    "SetPropertyPricing",
    "PublishProperties",
    "ArchiveProperties",
  ],
  "Tasks & Calendar": [
    "ViewTasks",
    "CreateTasks",
    "EditTasks",
    "DeleteTasks",
    "AssignTasks",
    "ViewCalendar",
    "ManageCalendarEvents",
    "SetReminders",
  ],
  "Financial Management": [
    "ViewFinancialReports",
    "ManagePayments",
    "CreateInvoices",
    "ProcessRefunds",
    "ViewTransactionHistory",
    "ManagePaymentMethods",
    "AccessFinancialAnalytics",
  ],
  "User Management": [
    "ViewMembers",
    "AddMembers",
    "EditMembers",
    "DeleteMembers",
    "ManageMemberPermissions",
    "ResetMemberPasswords",
  ],
  "Documents & Files": [
    "ViewDocuments",
    "UploadDocuments",
    "EditDocuments",
    "DeleteDocuments",
    "ShareDocuments",
    "GenerateReports",
    "AccessDocumentHistory",
  ],
};

// Permission templates - Updated with camelCase permission keys
const permissionTemplates: PermissionTemplate[] = [
  {
    id: "viewer",
    name: "Viewer Only",
    permissions: [
      "ViewDashboard",
      "ViewContacts",
      "ViewRentals",
      "ViewProperties",
      "ViewTasks",
      "ViewCalendar",
      "ViewDocuments",
    ],
  },
  {
    id: "basic-agent",
    name: "Basic Agent",
    permissions: [
      "ViewDashboard",
      "ViewContacts",
      "AddContacts",
      "EditContacts",
      "CallContacts",
      "SendEmailToContacts",
      "ViewRentals",
      "CreateRentals",
      "EditRentals",
      "ViewProperties",
      "ViewTasks",
      "CreateTasks",
      "EditTasks",
      "ViewCalendar",
      "ManageCalendarEvents",
    ],
  },
  {
    id: "senior-agent",
    name: "Senior Agent",
    permissions: [
      "ViewDashboard",
      "ViewContacts",
      "AddContacts",
      "EditContacts",
      "DeleteContacts",
      "CallContacts",
      "SendEmailToContacts",
      "ImportContacts",
      "ExportContacts",
      "ViewRentals",
      "CreateRentals",
      "EditRentals",
      "DeleteRentals",
      "ApproveRentals",
      "GenerateRentalContracts",
      "ViewProperties",
      "AddProperties",
      "EditProperties",
      "ManagePropertyMedia",
      "SetPropertyPricing",
      "ViewTasks",
      "CreateTasks",
      "EditTasks",
      "DeleteTasks",
      "AssignTasks",
      "ViewCalendar",
      "ManageCalendarEvents",
      "SetReminders",
      "ViewFinancialReports",
      "ViewDocuments",
      "UploadDocuments",
      "EditDocuments",
    ],
  },
  {
    id: "manager",
    name: "Manager",
    permissions: [
      "ViewDashboard",
      "ViewReports",
      "ExportData",
      "ViewContacts",
      "AddContacts",
      "EditContacts",
      "DeleteContacts",
      "CallContacts",
      "SendEmailToContacts",
      "ImportContacts",
      "ExportContacts",
      "ViewRentals",
      "CreateRentals",
      "EditRentals",
      "DeleteRentals",
      "ApproveRentals",
      "GenerateRentalContracts",
      "ManageRentalPayments",
      "ViewRentalHistory",
      "ViewProperties",
      "AddProperties",
      "EditProperties",
      "DeleteProperties",
      "ManagePropertyMedia",
      "SetPropertyPricing",
      "PublishProperties",
      "ArchiveProperties",
      "ViewTasks",
      "CreateTasks",
      "EditTasks",
      "DeleteTasks",
      "AssignTasks",
      "ViewCalendar",
      "ManageCalendarEvents",
      "SetReminders",
      "ViewFinancialReports",
      "ManagePayments",
      "CreateInvoices",
      "ViewTransactionHistory",
      "AccessFinancialAnalytics",
      "ViewDocuments",
      "UploadDocuments",
      "EditDocuments",
      "DeleteDocuments",
      "ShareDocuments",
      "GenerateReports",
    ],
  },
];

const MAX_USERS = 5;

export function MembersTab({
  membersData,
  membersLoading,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  isCreating = false,
  isUpdating = false,
  isDeleting = null,
}: MembersTabProps) {
  const { t } = useTranslation("settings");

  // Add this helper function after useTranslation
  const getPermissionLabel = (permission: string) => {
    return t(`Members.permissions.items.${permission}`, { defaultValue: permission });
  };

  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: "",
    email: "",
    password: "",
    permissions: [],
  });

  const [editMember, setEditMember] = useState<EditMemberForm | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [editSelectedTemplate, setEditSelectedTemplate] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const currentUserCount = membersData?.length || 0;
  const isLimitReached = currentUserCount >= MAX_USERS;
  const remainingSlots = MAX_USERS - currentUserCount;

  const handlePermissionChange = (
    permission: string,
    checked: boolean,
    isEdit: boolean = false,
  ) => {
    if (isEdit && editMember) {
      setEditMember({
        ...editMember,
        permissions: checked
          ? [...editMember.permissions, permission]
          : editMember.permissions.filter((p) => p !== permission),
      });
    } else {
      setNewMember({
        ...newMember,
        permissions: checked
          ? [...newMember.permissions, permission]
          : newMember.permissions.filter((p) => p !== permission),
      });
    }
  };

  const handleTemplateChange = (
    templateId: string,
    isEdit: boolean = false,
  ) => {
    // Handle the "custom" case
    if (templateId === "custom") {
      if (isEdit && editMember) {
        setEditSelectedTemplate("custom");
      } else {
        setSelectedTemplate("custom");
      }
      return;
    }

    const template = permissionTemplates.find((t) => t.id === templateId);
    if (!template) return;

    if (isEdit && editMember) {
      setEditMember({
        ...editMember,
        permissions: [...template.permissions],
      });
      setEditSelectedTemplate(templateId);
    } else {
      setNewMember({
        ...newMember,
        permissions: [...template.permissions],
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleCreateMember = async () => {
    try {
      await onCreateMember(newMember);
      // Reset form on success
      setNewMember({
        name: "",
        email: "",
        password: "",
        permissions: [],
      });
      setSelectedTemplate("");
      setIsExpanded(false);

      toast.success(t("Members.messages.createSuccess"), {
        description: t("Members.messages.createSuccessDesc", {
          name: newMember.name,
        }),
      });
    } catch (error) {
      console.error("Failed to create member:", error);
      toast.error(t("Members.messages.createError"), {
        description: t("Members.messages.createErrorDesc"),
      });
    }
  };
  const handleEditMember = (member: Member) => {
    setEditMember({
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
      permissions: member.permissions || [],
    });
    setEditSelectedTemplate("");
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editMember) return;

    try {
      await onUpdateMember(editMember);
      setIsEditModalOpen(false);
      setEditMember(null);
      setEditSelectedTemplate("");

      toast.success(t("Members.messages.updateSuccess"), {
        description: t("Members.messages.updateSuccessDesc", {
          name: editMember.name,
        }),
      });
    } catch (error) {
      console.error("Failed to update member:", error);
      toast.error(t("Members.messages.updateError"), {
        description: t("Members.messages.updateErrorDesc"),
      });
    }
  };

  const handleDeleteMember = async (member: Member) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await onDeleteMember(memberToDelete.id);
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);

      toast.success(t("Members.messages.deleteSuccess"), {
        description: t("Members.messages.deleteSuccessDesc", {
          name: memberToDelete.name,
        }),
      });
    } catch (error) {
      console.error("Failed to delete member:", error);
      toast.error(t("Members.messages.deleteError"), {
        description: t("Members.messages.deleteErrorDesc"),
      });
    }
  };

  const cancelDeleteMember = () => {
    setDeleteConfirmOpen(false);
    setMemberToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Member skeleton component
  const MemberSkeleton = () => (
    <div className="rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );

  const CreateMemberCard = () => {
    const cardContent = (
      <Card className={isLimitReached ? "opacity-50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("Members.addNew.title")}</CardTitle>
              <CardDescription>
                {t("Members.addNew.description")}
              </CardDescription>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-medium ${
                  remainingSlots === 0
                    ? "text-red-600"
                    : remainingSlots <= 2
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {t("Members.addNew.usage", {
                  current: currentUserCount,
                  max: MAX_USERS,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("Members.addNew.remaining", { count: remainingSlots })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information - Always Visible */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("Members.form.name.required")}
              </Label>
              <Input
                id="name"
                placeholder={t("Members.form.name.placeholder")}
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                disabled={isLimitReached}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("Members.form.email.required")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("Members.form.email.placeholder")}
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                disabled={isLimitReached}
              />
            </div>
          </div>

          <div className="relative">
            {/* Collapsed State - Smaller Blurred Placeholder */}
            {!isExpanded && (
              <div className="relative">
                <div className="pointer-events-none h-32 space-y-4 overflow-hidden blur-sm select-none">
                  {/* Permission Templates Placeholder */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookDashed className="h-4 w-4" />
                      <Label>{t("Members.templates.label")}</Label>
                    </div>
                    <div className="h-8 rounded-md bg-muted"></div>
                  </div>

                  {/* Permissions Placeholder - Shorter */}
                  <div className="space-y-2">
                    <Label>{t("Members.permissions.label")}</Label>
                    <div className="space-y-2">
                      <h4 className="border-b pb-1 text-sm font-medium text-muted-foreground">
                        {t("Members.permissions.categories.general")}
                      </h4>
                      <div className="grid grid-cols-2 gap-1 pl-2 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded bg-muted"></div>
                            <div className="h-3 flex-1 rounded bg-muted"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show More Button - Centered over collapsed content */}
                {!isLimitReached && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={() => setIsExpanded(true)}
                      variant="secondary"
                      className="border bg-background/90 shadow-md backdrop-blur-sm hover:bg-background/95"
                    >
                      <ChevronDown className="mr-2 h-4 w-4" />
                      {t("Members.actions.showMore")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Expanded State */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isExpanded
                  ? "max-h-[2000px] translate-y-0 transform opacity-100"
                  : "max-h-0 -translate-y-4 transform overflow-hidden opacity-0"
              }`}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("Members.form.password.required")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("Members.form.password.placeholder")}
                    value={newMember.password}
                    onChange={(e) =>
                      setNewMember({ ...newMember, password: e.target.value })
                    }
                    disabled={isLimitReached}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("Members.form.password.note")}
                  </p>
                </div>

                {/* Permission Templates */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookDashed className="h-4 w-4" />
                    <Label>{t("Members.templates.label")}</Label>
                  </div>
                  <Select
                    value={selectedTemplate}
                    onValueChange={(value) => handleTemplateChange(value)}
                    disabled={isLimitReached}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Members.templates.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">
                        {t("Members.templates.custom")}
                      </SelectItem>
                      {permissionTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("Members.templates.permissionCount", {
                                count: template.permissions.length,
                              })}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions by Category */}
                <div className="space-y-4">
                  <Label>{t("Members.permissions.label")}</Label>
                  {Object.entries(permissionCategories).map(
                    ([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="border-b pb-1 text-sm font-medium text-muted-foreground">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 pl-2 md:grid-cols-3">
                          {permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={permission}
                                checked={newMember.permissions.includes(
                                  permission,
                                )}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    permission,
                                    checked as boolean,
                                  )
                                }
                                disabled={isLimitReached}
                              />
                              <Label htmlFor={permission} className="text-sm">
                                {getPermissionLabel(permission)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <Button
                  onClick={handleCreateMember}
                  disabled={
                    isLimitReached ||
                    isCreating ||
                    !newMember.name ||
                    !newMember.email ||
                    !newMember.password
                  }
                  className="w-full"
                >
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("Members.actions.create")}
                </Button>

                {/* Show Less Button - At the bottom when expanded */}
                <div className="flex justify-center border-t pt-4">
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    {t("Members.actions.showLess")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    if (isLimitReached) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">{cardContent}</div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-center">
                {t("Members.limit.reached", { max: MAX_USERS })}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
  };

  return (
    <div className="space-y-6">
      <CreateMemberCard />

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Members.current.title")}</CardTitle>
          <CardDescription>
            {t("Members.current.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <MemberSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(membersData || []).map((member: Member) => (
                <div
                  key={member.id}
                  className="rounded-lg border p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          <Badge
                            variant={
                              member.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {t("Members.current.joined", {
                                date: formatDate(
                                  member.createdAt || new Date().toISOString(),
                                ),
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {t("Members.current.lastActive", {
                                date: formatDate(
                                  member.lastActive || new Date().toISOString(),
                                ),
                              })}
                            </span>
                          </div>
                        </div>

                        {member.permissions && member.permissions.length > 0 && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {t("Members.current.permissionsLabel")}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {member.permissions
                                .slice(0, 3)
                                .map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {getPermissionLabel(permission)}
                                  </Badge>
                                ))}
                              {member.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  {t("Members.current.morePermissions", {
                                    count: member.permissions.length - 3,
                                  })}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(member)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>{t("Members.actions.edit")}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMember(member)}
                        disabled={isDeleting === member.id}
                        className="flex items-center space-x-1"
                      >
                        {isDeleting === member.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span>{t("Members.actions.remove")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {currentUserCount === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {t("Members.current.noMembers")}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Members.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("Members.edit.description")}
            </DialogDescription>
          </DialogHeader>

          {editMember && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">
                    {t("Members.form.name.label")}
                  </Label>
                  <Input
                    id="edit-name"
                    value={editMember.name}
                    onChange={(e) =>
                      setEditMember({ ...editMember, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">
                    {t("Members.form.email.label")}
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editMember.email}
                    onChange={(e) =>
                      setEditMember({ ...editMember, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Permission Templates for Edit */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookDashed className="h-4 w-4" />
                  <Label>{t("Members.templates.label")}</Label>
                </div>
                <Select
                  value={editSelectedTemplate}
                  onValueChange={(value) => handleTemplateChange(value, true)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Members.templates.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      {t("Members.templates.custom")}
                    </SelectItem>
                    {permissionTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {t("Members.templates.permissionCount", {
                              count: template.permissions.length,
                            })}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions by Category for Edit */}
              <div className="space-y-4">
                <Label>{t("Members.permissions.label")}</Label>
                {Object.entries(permissionCategories).map(
                  ([category, permissions]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="border-b pb-1 text-sm font-medium text-muted-foreground">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pl-2 md:grid-cols-3">
                        {permissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`edit-${permission}`}
                              checked={editMember.permissions.includes(
                                permission,
                              )}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission,
                                  checked as boolean,
                                  true,
                                )
                              }
                            />
                            <Label
                              htmlFor={`edit-${permission}`}
                              className="text-sm"
                            >
                              {getPermissionLabel(permission)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("Members.actions.cancel")}
            </Button>
            <Button onClick={handleUpdateMember} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Members.actions.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{t("Members.delete.title")}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t("Members.delete.confirmation", { name: memberToDelete?.name })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Members.delete.warning")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMember}>
              {t("Members.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              disabled={isDeleting === memberToDelete?.id}
            >
              {isDeleting === memberToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Members.actions.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("Members.actions.delete")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
