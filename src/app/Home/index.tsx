import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconClover2 } from "@tabler/icons-react";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import ShinyText from "@/components/ui/ShinyText";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  // Mocked authentication state
  const [loggedIn, setLoggedIn] = React.useState(false);

  // Replace with real auth logic in production
  React.useEffect(() => {
    // Example: check localStorage or context for auth
    setLoggedIn(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="mx-auto mt-5 w-[95%] rounded-2xl border bg-card lg:w-[80%]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant={"ghost"} className="!p-5 active:scale-95">
            {/* Logo */}
            <IconClover2 className="!size-5" />
            <span className="text-xl font-bold tracking-tight uppercase">
              K Cloud
            </span>
          </Button>
          <nav>
            {!loggedIn ? (
              <LocalizedLink to="/login">
                <Button variant="outline">{t("home.login")}</Button>
              </LocalizedLink>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>KC</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <LocalizedLink to="/dash/account">
                    <DropdownMenuItem>{t("home.account")}</DropdownMenuItem>
                  </LocalizedLink>
                  <LocalizedLink to="/dash">
                    <DropdownMenuItem>{t("home.dashboard")}</DropdownMenuItem>
                  </LocalizedLink>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-white">
              <IconClover2 className="!size-12" />
            </div>
            <span className="text-4xl font-bold tracking-tight">Key Cloud</span>
          </div>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t("home.description")}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-8 mb-5 w-[95%] rounded-2xl border bg-card lg:w-[80%]">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 py-4 text-sm text-muted-foreground sm:flex-row">
          <span className="text-center lg:text-start">
            {t("home.developedBy")}{" "}
            {/* <a href="http://icsappsegypt.com/" target="_blank"> */}
            <ShinyText
              text={t("home.developerCompany")}
              speed={1.5}
              className="text-primary"
            />
            {/* </a> */}
            {/* <a href="https://marco5dev.me" target="_blank">
              <ShinyText
                text={t("home.developer1")}
                speed={1.5}
                className="text-primary"
              />
            </a>
            &amp;
            <a href="https://www.facebook.com/ahmeddeda.yahia" target="_blank">
              <ShinyText
                text={t("home.developer2")}
                speed={1.5}
                className="text-primary"
              />
            </a> */}
          </span>
          <span className="mt-2 sm:mt-0">
            &copy; {new Date().getFullYear()} {t("home.copyright")}
          </span>
        </div>
      </footer>
    </div>
  );
}
