import { Button } from "@/components/ui/button";
import FuzzyText from "@/components/ui/FuzzyText";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";

export default function NF() {
  const { theme } = useTheme();
  const [screenSize, setScreenSize] = useState("lg");

  // Determine if the current theme is dark
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const textColor = isDark ? "white" : "black";

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("sm");
      else if (width < 768) setScreenSize("md");
      else if (width < 1024) setScreenSize("lg");
      else setScreenSize("xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getFontSize = (isMainText: boolean) => {
    if (isMainText) {
      switch (screenSize) {
        case "sm":
          return "clamp(5rem, 14vw, 10rem)"; // smallest
        case "md":
          return "clamp(4rem, 12vw, 9rem)";
        case "lg":
          return "clamp(3rem, 10vw, 8.5rem)";
        case "xl":
          return "clamp(2rem, 8vw, 8rem)"; // biggest
        default:
          return "clamp(3rem, 10vw, 8.5rem)";
      }
    } else {
      switch (screenSize) {
        case "sm":
          return "clamp(2.5rem, 7vw, 5rem)";
        case "md":
          return "clamp(2rem, 6vw, 4.5rem)";
        case "lg":
          return "clamp(1.5rem, 5vw, 4rem)";
        case "xl":
          return "clamp(1rem, 4vw, 3.5rem)";
        default:
          return "clamp(1.5rem, 5vw, 4rem)";
      }
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full flex flex-col justify-center items-center ">
        <FuzzyText
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
          color={textColor}
          fontSize={getFontSize(true)}
        >
          404
        </FuzzyText>
        <FuzzyText
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
          color={textColor}
          fontSize={getFontSize(false)}
        >
          NOT FOUND
        </FuzzyText>
        <nav className="mt-6">
          <ul className="flex items-center gap-4">
            <li>
              <Button variant="secondary" asChild>
                <LocalizedLink to="/" className="text-primary">
                  Home
                </LocalizedLink>
              </Button>
            </li>
            <li>
              <Button variant="secondary" asChild>
                <LocalizedLink to="/dash" className="text-primary">
                  Dashboard
                </LocalizedLink>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
