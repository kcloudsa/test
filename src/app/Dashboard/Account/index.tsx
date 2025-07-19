"use client";

import { useState, useEffect } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Account() {
  const { t, i18n } = useTranslation("account");
  const locale = i18n.language;
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form schema with internationalized validation messages
  const accountFormSchema = z.object({
    firstName: z.string().min(2, t("validation.firstNameMin")),
    lastName: z.string().min(2, t("validation.lastNameMin")),
    displayName: z.string().min(2, t("validation.displayNameMin")),
    gender: z.string().min(1, t("validation.genderRequired")),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    city: z.string().min(1, t("validation.cityRequired")),
    country: z.string().min(1, t("validation.countryRequired")),
    email: z.string().email(t("validation.emailInvalid")),
    countryCode: z.string().min(1, t("validation.countryCodeRequired")),
    phoneNumber: z.string().min(10, t("validation.phoneNumberMin")),
    notes: z.string().optional(),
  });

  type AccountFormValues = z.infer<typeof accountFormSchema>;

  interface UserData {
    userID: string;
    userName: {
      firstName: string;
      lastName: string;
      displayName: string;
      slug: string;
    };
    active: boolean;
    notes?: string;
    userInfo: {
      gender: string;
      nationality: string;
      address: {
        city: string;
        country: string;
      };
      profilePicture?: string;
    };
    role: string;
    contactInfo: {
      email: {
        email: string;
        verified: boolean;
        verifiedAt?: Date;
      };
      phone: {
        countryCode: string;
        phoneNumber: string;
        verified: boolean;
      };
    };
  }

  // Skeleton Loading Components
  const AccountSkeleton = () => (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <Card className="py-0!">
        <CardContent className="p-6">
          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      gender: "",
      nationality: "",
      city: "",
      country: "",
      email: "",
      countryCode: "",
      phoneNumber: "",
      notes: "",
    },
  });

  // Simulate API call to fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock user data - replace with actual API call
        const mockUserData: UserData = {
          userID: "01234567890123456789012345",
          userName: {
            firstName: "John",
            lastName: "Doe",
            displayName: "John Doe",
            slug: "john-doe",
          },
          active: true,
          notes: "Premium user since 2023",
          userInfo: {
            gender: "male",
            nationality: "Saudi",
            address: {
              city: "Riyadh",
              country: "Saudi Arabia",
            },
            profilePicture: "",
          },
          role: "user",
          contactInfo: {
            email: {
              email: "john.doe@example.com",
              verified: true,
              verifiedAt: new Date(),
            },
            phone: {
              countryCode: "+966",
              phoneNumber: "501234567",
              verified: false,
            },
          },
        };

        setUserData(mockUserData);

        // Update form with fetched data
        form.reset({
          firstName: mockUserData.userName.firstName,
          lastName: mockUserData.userName.lastName,
          displayName: mockUserData.userName.displayName,
          gender: mockUserData.userInfo.gender,
          nationality: mockUserData.userInfo.nationality,
          city: mockUserData.userInfo.address.city,
          country: mockUserData.userInfo.address.country,
          email: mockUserData.contactInfo.email.email,
          countryCode: mockUserData.contactInfo.phone.countryCode,
          phoneNumber: mockUserData.contactInfo.phone.phoneNumber,
          notes: mockUserData.notes || "",
        });
      } catch (err) {
        setError(t("errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [t]); // Remove form from dependencies to avoid re-creating schema

  const onSubmit = async (data: AccountFormValues) => {
    try {
      setIsSaving(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form submitted:", data);
      setIsEditing(false);
      // Handle form submission here
    } catch (err) {
      setError(t("errors.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (error && !userData) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              {t("errors.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="space-y-4 p-4">
      {/* Error Alert */}
      {error && userData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Overview Card */}
      <Card className="py-0!">
        <CardContent className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={userData.userInfo.profilePicture} />
              <AvatarFallback className="text-sm sm:text-lg">
                {getInitials(
                  userData.userName.firstName,
                  userData.userName.lastName,
                )}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full p-0 sm:-right-2 sm:-bottom-2 sm:h-8 sm:w-8"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold sm:text-2xl">
              {userData.userName.displayName}
            </h2>
            <p className="truncate text-sm text-muted-foreground sm:text-base">
              @{userData.userName.slug}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={userData.active ? "default" : "secondary"}
                className="text-xs"
              >
                {userData.active ? t("status.active") : t("status.inactive")}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {userData.role}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ID: {userData.userID.slice(-8)}
              </Badge>
            </div>
          </div>

          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isEditing ? t("actions.cancel") : t("actions.edit")}
          </Button>
        </CardContent>
      </Card>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid h-auto w-full grid-cols-3">
              <TabsTrigger
                value="personal"
                className="flex flex-col items-center space-y-1 p-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:p-3"
              >
                <User className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{t("tabs.personal")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex flex-col items-center space-y-1 p-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:p-3"
              >
                <Mail className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{t("tabs.contact")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex flex-col items-center space-y-1 p-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:p-3"
              >
                <Shield className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{t("tabs.security")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    {t("sections.personalInfo.title")}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t("sections.personalInfo.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({
                        field,
                      }: {
                        field: ControllerRenderProps<
                          AccountFormValues,
                          "firstName"
                        >;
                      }) => (
                        <FormItem>
                          <FormLabel>{t("fields.firstName")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({
                        field,
                      }: {
                        field: ControllerRenderProps<
                          AccountFormValues,
                          "lastName"
                        >;
                      }) => (
                        <FormItem>
                          <FormLabel>{t("fields.lastName")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        AccountFormValues,
                        "displayName"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel>{t("fields.displayName")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          {t("fields.displayNameDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({
                        field,
                      }: {
                        field: ControllerRenderProps<
                          AccountFormValues,
                          "gender"
                        >;
                      }) => (
                        <FormItem>
                          <FormLabel>{t("fields.gender")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("genderOptions.placeholder")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">
                                {t("genderOptions.male")}
                              </SelectItem>
                              <SelectItem value="female">
                                {t("genderOptions.female")}
                              </SelectItem>
                              <SelectItem value="other">
                                {t("genderOptions.other")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({
                        field,
                      }: {
                        field: ControllerRenderProps<
                          AccountFormValues,
                          "nationality"
                        >;
                      }) => (
                        <FormItem>
                          <FormLabel>{t("fields.nationality")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      <span>{t("sections.personalInfo.addressTitle")}</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({
                          field,
                        }: {
                          field: ControllerRenderProps<
                            AccountFormValues,
                            "city"
                          >;
                        }) => (
                          <FormItem>
                            <FormLabel>{t("fields.city")}</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({
                          field,
                        }: {
                          field: ControllerRenderProps<
                            AccountFormValues,
                            "country"
                          >;
                        }) => (
                          <FormItem>
                            <FormLabel>{t("fields.country")}</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<AccountFormValues, "notes">;
                    }) => (
                      <FormItem>
                        <FormLabel>{t("fields.notes")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!isEditing}
                            placeholder={t("fields.notesPlaceholder")}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    {t("sections.contactInfo.title")}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t("sections.contactInfo.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>{t("sections.contactInfo.emailTitle")}</span>
                    </h4>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({
                        field,
                      }: {
                        field: ControllerRenderProps<
                          AccountFormValues,
                          "email"
                        >;
                      }) => (
                        <FormItem>
                          <FormLabel>{t("fields.email")}</FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                {...field}
                                disabled={!isEditing}
                                type="email"
                                className="flex-1"
                              />
                              <Badge
                                variant={
                                  userData.contactInfo.email.verified
                                    ? "default"
                                    : "destructive"
                                }
                                className="self-start"
                              >
                                {userData.contactInfo.email.verified
                                  ? t("status.verified")
                                  : t("status.unverified")}
                              </Badge>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      <span>{t("sections.contactInfo.phoneTitle")}</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({
                          field,
                        }: {
                          field: ControllerRenderProps<
                            AccountFormValues,
                            "countryCode"
                          >;
                        }) => (
                          <FormItem>
                            <FormLabel>{t("fields.countryCode")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="+966"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({
                          field,
                        }: {
                          field: ControllerRenderProps<
                            AccountFormValues,
                            "phoneNumber"
                          >;
                        }) => (
                          <FormItem className="lg:col-span-2">
                            <FormLabel>{t("fields.phoneNumber")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  className="flex-1"
                                />
                                <Badge
                                  variant={
                                    userData.contactInfo.phone.verified
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="self-start"
                                >
                                  {userData.contactInfo.phone.verified
                                    ? t("status.verified")
                                    : t("status.unverified")}
                                </Badge>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    {t("sections.security.title")}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t("sections.security.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-0.5">
                      <Label>{t("sections.security.accountStatusTitle")}</Label>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {t("sections.security.accountStatusDescription")}
                      </p>
                    </div>
                    <Switch checked={userData.active} disabled={!isEditing} className={locale === "ar-SA" ? "flex-row-reverse" : ""} />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t("sections.security.passwordTitle")}
                    </h4>
                    <Button
                      variant="outline"
                      disabled={!isEditing}
                      className="w-full sm:w-auto"
                    >
                      {t("actions.changePassword")}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t("sections.security.accountInfoTitle")}
                    </h4>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>{t("fields.userID")}</Label>
                        <p className="font-mono text-xs break-all text-muted-foreground">
                          {userData.userID}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label>{t("fields.role")}</Label>
                        <p className="text-muted-foreground capitalize">
                          {userData.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isEditing && (
            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="order-2 w-full sm:order-1 sm:w-auto"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="order-1 w-full sm:order-2 sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? t("loading.saving") : t("actions.save")}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
