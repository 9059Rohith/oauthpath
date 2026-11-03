import type { CSSProperties } from "react";

/** Server-rendered words stay readable; one page controller adds scroll motion. */
export function ScrollHeading({
  lines,
  accentLast = false,
}: {
  lines: string[];
  accentLast?: boolean;
}) {
  return (
    <h2
      className="scroll-heading"
      aria-label={lines.join(" ")}
      data-scroll-heading
    >
      {lines.map((line, lineIndex) => (
        <span
          className={`scroll-type-line ${accentLast && lineIndex === lines.length - 1 ? "scroll-type-accent" : ""}`}
          key={lineIndex}
          aria-hidden="true"
        >
          {line.split(" ").map((word, wordIndex) => (
            <span className="scroll-word-mask" key={wordIndex}>
              <span
                className="scroll-word"
                style={
                  {
                    "--word-weight": 0.5 + ((wordIndex + lineIndex) % 4) * 0.25,
                  } as CSSProperties
                }
              >
                {word}
              </span>{" "}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
