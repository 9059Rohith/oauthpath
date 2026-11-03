"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { guides, findSeed } from "@/lib/catalog";
export function AppSearch({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const matches = value.trim()
    ? guides
        .filter((g) =>
          `${g.name} ${g.domain}`.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 4)
    : [];
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  function submit(query = value) {
    const seed = findSeed(query);
    if (query.trim())
      router.push(
        seed
          ? `/guide/${seed.slug}`
          : `/generate?q=${encodeURIComponent(query.trim())}`,
      );
  }
  return (
    <div className={`search-wrap ${compact ? "compact" : ""}`}>
      <form
        className="app-search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(active >= 0 && matches[active] ? matches[active].name : value);
        }}
      >
        <Search size={22} />
        <label className="sr-only" htmlFor="app-search">
          Search an app or paste its website
        </label>
        <input
          ref={input}
          id="app-search"
          role="combobox"
          autoComplete="off"
          aria-expanded={focused && matches.length > 0}
          aria-controls="search-options"
          aria-activedescendant={active >= 0 ? `option-${active}` : undefined}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setActive(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setFocused(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive(Math.min(active + 1, matches.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(Math.max(active - 1, -1));
            }
          }}
          placeholder="Search an app or paste its website"
          maxLength={180}
        />
        <kbd>/</kbd>
        <button aria-label="Find OAuth guide" type="submit">
          <ArrowRight size={23} />
        </button>
      </form>
      {focused && matches.length > 0 && (
        <ul className="search-options" id="search-options" role="listbox">
          {matches.map((g, i) => (
            <li
              key={g.slug}
              role="option"
              id={`option-${i}`}
              aria-selected={i === active}
              onMouseDown={() => submit(g.name)}
              className={i === active ? "active" : ""}
            >
              <span>{g.name}</span>
              <span>
                {g.difficulty} <ArrowUpRightSmall />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
function ArrowUpRightSmall() {
  return <ArrowRight size={14} />;
}
