import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocalGuideProfileCard } from "@/features/localGuides/LocalGuideProfileCard";
import type { LocalGuide } from "@/features/localGuides/types";

const baseGuide: LocalGuide = {
  id: "g1",
  name: "Amira Haddad",
  destination: "Marrakech",
  languages: ["Arabic", "French", "English"],
  specialty: "Medina food tours",
  bio: "Grew up exploring the medina's back alleys.",
  photoUrl: null,
  profileUrl: "https://www.toursbylocals.com/guides/amira",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("LocalGuideProfileCard", () => {
  it("shows the name, specialty, languages, and bio", () => {
    render(<LocalGuideProfileCard guide={baseGuide} />);

    expect(screen.getByText("Amira Haddad")).toBeInTheDocument();
    expect(screen.getByText("Medina food tours")).toBeInTheDocument();
    expect(screen.getByText("Arabic, French, English")).toBeInTheDocument();
    expect(screen.getByText(baseGuide.bio as string)).toBeInTheDocument();
  });

  it("shows initials from the guide's first and last name when there's no photo", () => {
    render(<LocalGuideProfileCard guide={baseGuide} />);
    expect(screen.getByText("AH")).toBeInTheDocument();
  });

  it("falls back gracefully for a single-word name", () => {
    render(<LocalGuideProfileCard guide={{ ...baseGuide, name: "Madonna" }} />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders an actual photo instead of initials when photoUrl is set", () => {
    const { container } = render(
      <LocalGuideProfileCard guide={{ ...baseGuide, photoUrl: "https://example.com/amira.jpg" }} />
    );

    // alt="" is deliberate (the name is already shown as text next to it),
    // which correctly removes it from the accessibility tree — so query
    // the DOM directly rather than by role.
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/amira.jpg");
    expect(screen.queryByText("AH")).not.toBeInTheDocument();
  });

  it("omits the bio paragraph entirely when there isn't one", () => {
    render(<LocalGuideProfileCard guide={{ ...baseGuide, bio: null }} />);
    expect(screen.queryByText(/medina's back alleys/)).not.toBeInTheDocument();
  });

  it("opens the profile link safely in a new tab", () => {
    render(<LocalGuideProfileCard guide={baseGuide} />);

    const link = screen.getByRole("link", { name: /View profile/ });
    expect(link).toHaveAttribute("href", baseGuide.profileUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });
});
