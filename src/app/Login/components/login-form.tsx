"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Check, /* Users, */ Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApiMutation } from "@/hooks/useApi";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Country, CountryApiResponse, LoginRequest, RegisterRequest, AuthResponse, ApiError } from "@/types";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { IconClover2 } from "@tabler/icons-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation("login");
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push(t('auth.passwordTooShort'));
    }
    if (password.length > 16) {
      errors.push(t('auth.passwordTooLong'));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('auth.passwordNeedsLowercase'));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('auth.passwordNeedsUppercase'));
    }
    if (!/\d/.test(password)) {
      errors.push(t('auth.passwordNeedsNumber'));
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push(t('auth.passwordNeedsSpecial'));
    }

    return { isValid: errors.length === 0, errors };
  };

  // API mutations for different authentication endpoints
  const loginMutation = useApiMutation<AuthResponse, LoginRequest>({
    method: 'post',
    endpoint: '/auth/login',
    options: {
      onSuccess: (data) => {
        toast.dismiss('login-loading');
        if (data.success && data.token) {
          toast.success(t('auth.loginSuccess'));
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } else {
          toast.error(data.message || t('auth.invalidCredentials'));
        }
      },
      onError: (error: ApiError) => {
        toast.dismiss('login-loading');
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           t('auth.invalidCredentials');
        toast.error(errorMessage);
      }
    }
  });

  const subAdminLoginMutation = useApiMutation<AuthResponse, LoginRequest>({
    method: 'post',
    endpoint: '/auth/subadmin/login',
    options: {
      onSuccess: (data) => {
        toast.dismiss('login-loading');
        if (data.success && data.token) {
          toast.success(t('auth.subAdminLoginSuccess'));
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } else {
          toast.error(data.message || t('auth.invalidCredentials'));
        }
      },
      onError: (error: ApiError) => {
        toast.dismiss('login-loading');
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           t('auth.invalidCredentials');
        toast.error(errorMessage);
      }
    }
  });

  const registerMutation = useApiMutation<AuthResponse, RegisterRequest>({
    method: 'post',
    endpoint: '/users',
    options: {
      onSuccess: (data) => {
        toast.dismiss('register-loading');
        if (data.success && data.token) {
          toast.success(t('auth.registrationSuccess'));
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } else {
          toast.error(data.message || t('auth.registrationError'));
        }
      },
      onError: (error: ApiError) => {
        toast.dismiss('register-loading');
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           t('auth.registrationError');
        toast.error(errorMessage);
        
        // Handle specific validation errors if the backend sends them
        // Cast to any to handle potential validation errors structure
        const errorData = error.response?.data as any;
        if (errorData?.errors) {
          Object.values(errorData.errors).forEach((errorMsg: any) => {
            if (typeof errorMsg === 'string') {
              toast.error(errorMsg);
            } else if (Array.isArray(errorMsg)) {
              errorMsg.forEach((msg: string) => toast.error(msg));
            }
          });
        }
      }
    }
  });

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag"
        );
        const data: CountryApiResponse[] = await response.json();

        const formattedCountries: Country[] = data
          .filter((country: CountryApiResponse) => {
            // Exclude Israel and countries without phone codes
            return (
              country.cca2 !== "IL" &&
              country.idd?.root &&
              country.idd?.suffixes?.length > 0
            );
          })
          .map((country: CountryApiResponse) => ({
            name: country.name.common,
            code: country.cca2,
            dial: country.idd.root + (country.idd.suffixes[0] || ""),
            flag: country.flag,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);

        // Set default to Saudi Arabia if available, otherwise United States
        const defaultCountry =
          formattedCountries.find((c) => c.code === "SA") ||
          formattedCountries.find((c) => c.code === "US") ||
          formattedCountries[0];
        setSelectedCountry(defaultCountry);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        // Fallback data if API fails
        const fallbackCountries: Country[] = [
          { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
          { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
          { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
          { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
          { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
          { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
        ];
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsSubAdmin(false); // Reset sub-admin when switching modes
    // Reset form data
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: ""
    });
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial.includes(searchQuery)
    );
  }, [searchQuery, countries]);

  // Function to get flag image URL from flagcdn.com
  const getFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  };

  // Function to get phone placeholder based on country
  const getPhonePlaceholder = (countryCode: string) => {
    const placeholders: Record<string, string> = {
      'SA': '50 123 4567',
      'US': '(555) 123-4567',
      'CA': '(555) 123-4567',
      'GB': '07700 900123',
      'FR': '06 12 34 56 78',
      'DE': '0151 12345678',
      'AE': '50 123 4567',
      'EG': '010 1234 5678',
      'JO': '07 9012 3456',
      'LB': '70 123 456',
      'SY': '0944 567 890',
      'IQ': '0790 123 4567',
      'KW': '9012 3456',
      'QA': '3012 3456',
      'BH': '3612 3456',
      'OM': '9012 3456',
      'YE': '070 123 456',
      'IN': '98765 43210',
      'PK': '0300 1234567',
      'BD': '01712-345678',
      'TR': '0532 123 45 67',
      'IR': '0912 345 6789'
    };
    return placeholders[countryCode] || '123 456 7890';
  };

  // Check if search query contains Israel-related terms
  const isIsraelSearch = useMemo(() => {
    const israelTerms = ['israel', 'il', 'palestine', 'palestinian', 'gaza', 'zionist'];
    return israelTerms.some(term => 
      searchQuery.toLowerCase().includes(term.toLowerCase())
    );
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('auth.passwordMismatch'));
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        toast.error(t('auth.passwordValidationFailed'));
        passwordValidation.errors.forEach(error => toast.error(error));
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.phone || !selectedCountry) {
        toast.error(t('auth.fillAllFields'));
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t('auth.invalidEmailFormat'));
        return;
      }

      // Validate phone number (basic validation)
      if (formData.phone.length < 6) {
        toast.error(t('auth.invalidPhoneNumber'));
        return;
      }

      const registerData: RegisterRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: `${selectedCountry.dial}${formData.phone.replace(/\s+/g, '')}`,
        countryCode: selectedCountry.code
      };

      // Show loading toast for registration
      toast.loading(t('auth.creatingAccount'), { 
        id: 'register-loading',
        duration: Infinity // Keep showing until dismissed
      });
      
      registerMutation.mutate(registerData);
    } else {
      // Validate required fields
      if (!formData.email || !formData.password) {
        toast.error(t('auth.emailPasswordRequired'));
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t('auth.invalidEmailFormat'));
        return;
      }

      const loginData: LoginRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      // Show loading toast for login
      const loadingMessage = isSubAdmin ? t('auth.signingInAsSubAdmin') : t('auth.signingIn');
      toast.loading(loadingMessage, { 
        id: 'login-loading',
        duration: Infinity // Keep showing until dismissed
      });

      if (isSubAdmin) {
        subAdminLoginMutation.mutate(loginData);
      } else {
        loginMutation.mutate(loginData);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Show loading toast for Google redirect
      toast.loading(t('auth.redirectingToGoogle'), { 
        id: 'google-loading',
        duration: Infinity // Keep showing until page redirects
      });
      
      // Get the base URL from environment
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kcloud-back-end-kcloudsa.vercel.app/api/v1';
      const redirectUrl = `${baseUrl}/auth/google`;
      
      // Store current URL for redirect after OAuth
      localStorage.setItem('oauth_redirect', '/dashboard');
      
      // Small delay to show the loading toast
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
      
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.dismiss('google-loading');
      toast.error(t('auth.googleSignInError'));
    }
  };

  const isSubmitting = loginMutation.isPending || subAdminLoginMutation.isPending || registerMutation.isPending;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <LocalizedLink
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md transition-transform duration-300 hover:scale-110">
                <IconClover2 className="size-10" />
              </div>
              <span className="sr-only">K Cloud.</span>
            </LocalizedLink>
            <h1 className="text-xl font-bold transition-all duration-700 ease-out">
              {isSignUp ? t('auth.createAccount') : 
               isSubAdmin ? t('auth.subAdminLogin') :
               t('auth.welcomeBack')}
            </h1>
            
            <div className="text-center text-sm transition-all duration-500">
              {isSignUp ? t('auth.alreadyHaveAccount') : 
               t('auth.dontHaveAccount')}{" "}
              <button
                type="button"
                onClick={toggleMode}
                disabled={isSubmitting}
                className="underline underline-offset-4 transition-all duration-300 hover:text-primary hover:underline-offset-2 disabled:opacity-50"
              >
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </button>
            </div>

            {/* Sub-admin login toggle - only for sign in */}
            {/* {!isSignUp && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subadmin"
                    checked={isSubAdmin}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => setIsSubAdmin(checked === true)}
                    className="transition-all duration-300 hover:scale-110"
                  />
                  <Label
                    htmlFor="subadmin"
                    className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    {t('auth.loginAsSubAdmin')}
                  </Label>
                </div>
              </div>
            )} */}

            {/* Sub-admin description */}
            {isSubAdmin && (
              <div className="text-center text-xs text-muted-foreground max-w-md animate-in fade-in-50 slide-in-from-top-2 duration-500">
                <p>
                  {t('auth.subAdminDescription')}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              {/* Name field - only for signup */}
              <div
                className={cn(
                  "grid transition-all duration-700 ease-out",
                  isSignUp
                    ? "grid-rows-[1fr] opacity-100 translate-y-0"
                    : "grid-rows-[0fr] opacity-0 -translate-y-2"
                )}
              >
                <div className="overflow-hidden ">
                  <div className="space-y-2 pb-4 flex flex-col items-center">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-left w-full"
                    >
                      {t('auth.fullName')}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('auth.fullNamePlaceholder')}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required={isSignUp}
                      disabled={isSubmitting}
                      className="h-10 w-[98%] transition-all duration-300 focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Phone field with country selector - only for signup */}
              <div
                className={cn(
                  "grid transition-all duration-700 ease-out delay-100",
                  isSignUp
                    ? "grid-rows-[1fr] opacity-100 translate-y-0"
                    : "grid-rows-[0fr] opacity-0 -translate-y-2"
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pb-4 flex flex-col items-center">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-left w-full"
                    >
                      {t('auth.phoneNumber')}
                    </Label>
                    <div className="flex gap-2 w-[98%]">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-auto h-10 justify-between px-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                            disabled={loading || !selectedCountry}
                          >
                            {selectedCountry ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={getFlagUrl(selectedCountry.code)}
                                  alt={`${selectedCountry.name} flag`}
                                  className="w-4 h-3 object-cover rounded-sm transition-transform duration-200 hover:scale-110"
                                  onError={(e) => {
                                    // Fallback to emoji if image fails to load
                                    e.currentTarget.style.display = "none";
                                    (e.currentTarget
                                      .nextElementSibling as HTMLElement)!.style.display =
                                      "inline";
                                  }}
                                />
                                <span className="hidden">
                                  {selectedCountry.flag}
                                </span>
                                <span className="text-sm font-medium">
                                  {selectedCountry.dial}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {loading ? t('common.loading') : t('auth.selectCountry')}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 p-0 animate-in slide-in-from-top-2 fade-in-0 duration-200"
                          align="start"
                        >
                          <Command>
                            <div className="flex items-center border-b px-3">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <CommandInput
                                placeholder={t('auth.searchCountry')}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                className="flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </div>
                            <CommandList>
                              {isIsraelSearch ? (
                                <div className="p-4 text-center text-sm text-red-600 border-b">
                                  <p className="font-medium mb-2">🚫 {t('auth.countryNotSupported')}</p>
                                  <p className="text-xs leading-relaxed">
                                    {t('auth.israelMessage')}
                                  </p>
                                </div>
                              ) : (
                                <CommandEmpty>{t('auth.noCountryFound')}</CommandEmpty>
                              )}
                              <CommandGroup>
                                <ScrollArea className="h-60">
                                  {filteredCountries.map((country) => (
                                    <CommandItem
                                      key={country.code}
                                      value={`${country.name} ${country.code} ${country.dial}`}
                                      onSelect={() => {
                                        setSelectedCountry(country);
                                        setOpen(false);
                                        setSearchQuery("");
                                      }}
                                      className="flex items-center gap-2 px-2 py-1.5 transition-colors duration-200 hover:bg-accent/50"
                                    >
                                      <img
                                        src={getFlagUrl(country.code)}
                                        alt={`${country.name} flag`}
                                        className="w-5 h-4 object-cover rounded-sm transition-transform duration-200 hover:scale-110"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                          (e.currentTarget
                                            .nextElementSibling as HTMLElement)!.style.display =
                                            "inline";
                                        }}
                                      />
                                      <span className="hidden text-lg">
                                        {country.flag}
                                      </span>
                                      <div className="flex flex-1 items-center justify-between">
                                        <span className="text-sm">
                                          {country.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {country.dial}
                                        </span>
                                      </div>
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4 transition-all duration-200",
                                          selectedCountry?.code === country.code
                                            ? "opacity-100 scale-100"
                                            : "opacity-0 scale-75"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={getPhonePlaceholder(selectedCountry?.code || 'SA')}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required={isSignUp}
                        disabled={isSubmitting}
                        className="flex-1 h-10 transition-all duration-300 focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2 flex flex-col items-center">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-left w-full"
                >
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-10 w-[98%] transition-all duration-300 focus:shadow-md"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2 flex flex-col items-center">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-left w-full"
                >
                  {t('auth.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="*********"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  disabled={isSubmitting}
                  className="h-10 w-[98%] transition-all duration-300 focus:shadow-md"
                />
                {/* Password requirements - only for signup */}
                {isSignUp && formData.password && (
                  <div className="w-[98%] text-xs space-y-1">
                    <p className="text-muted-foreground mb-1">{t('auth.passwordRequirements')}</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={cn("flex items-center gap-1", 
                        formData.password.length >= 8 && formData.password.length <= 16 ? "text-green-600" : "text-red-500"
                      )}>
                        <span className="text-xs">•</span>
                        <span>{t('auth.passwordLength')}</span>
                      </div>
                      <div className={cn("flex items-center gap-1", 
                        /[a-z]/.test(formData.password) ? "text-green-600" : "text-red-500"
                      )}>
                        <span className="text-xs">•</span>
                        <span>{t('auth.passwordLowercase')}</span>
                      </div>
                      <div className={cn("flex items-center gap-1", 
                        /[A-Z]/.test(formData.password) ? "text-green-600" : "text-red-500"
                      )}>
                        <span className="text-xs">•</span>
                        <span>{t('auth.passwordUppercase')}</span>
                      </div>
                      <div className={cn("flex items-center gap-1", 
                        /\d/.test(formData.password) ? "text-green-600" : "text-red-500"
                      )}>
                        <span className="text-xs">•</span>
                        <span>{t('auth.passwordNumber')}</span>
                      </div>
                      <div className={cn("flex items-center gap-1 col-span-2", 
                        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) ? "text-green-600" : "text-red-500"
                      )}>
                        <span className="text-xs">•</span>
                        <span>{t('auth.passwordSpecial')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password field - only for signup */}
              <div
                className={cn(
                  "grid transition-all duration-700 ease-out delay-200",
                  isSignUp
                    ? "grid-rows-[1fr] opacity-100 translate-y-0"
                    : "grid-rows-[0fr] opacity-0 -translate-y-2"
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pb-4 flex flex-col items-center">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-left w-full"
                    >
                      {t('auth.confirmPassword')}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="*********"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      required={isSignUp}
                      disabled={isSubmitting}
                      className="h-10 w-[98%] transition-all duration-300 focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <span className="transition-all duration-300">
                {isSignUp ? t('auth.createAccountButton') : 
                 isSubAdmin ? t('auth.signInAsSubAdmin') :
                 t('auth.signIn')}
              </span>
            </Button>

            {/* Terms notice - only for signup */}
            {isSignUp && (
              <div className="text-center text-xs text-muted-foreground">
                {t('auth.createAccountTermsNotice')}{" "}
                <a
                  href="#"
                  className="underline underline-offset-4 transition-all duration-300 hover:text-primary hover:underline-offset-2"
                >
                  {t('auth.termsOfService')}
                </a>{" "}
                {t('common.and')}{" "}
                <a
                  href="#"
                  className="underline underline-offset-4 transition-all duration-300 hover:text-primary hover:underline-offset-2"
                >
                  {t('auth.privacyPolicy')}
                </a>
              </div>
            )}
          </div>

          <div className="relative text-center text-sm before:absolute before:inset-0 before:top-1/2 before:z-0 before:flex before:items-center before:border-t before:border-border transition-all duration-500">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              {t('common.or')}
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full h-10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg disabled:hover:scale-100"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="transition-all duration-300">
              {t('auth.continueWithGoogle')}
            </span>
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-balance text-muted-foreground transition-all duration-500">
        {!isSignUp && (
          <>
            {t('auth.bySigningIn')}{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-all duration-300 hover:text-primary hover:underline-offset-2"
            >
              {t('auth.termsOfService')}
            </a>{" "}
            {t('common.and')}{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-all duration-300 hover:text-primary hover:underline-offset-2"
            >
              {t('auth.privacyPolicy')}
            </a>
          </>
        )}
        {isSignUp && (
          <span className="animate-in fade-in-50 slide-in-from-bottom-2 duration-700 delay-400">
            {t('auth.verificationEmail')}
          </span>
        )}
      </div>
    </div>
  );
}