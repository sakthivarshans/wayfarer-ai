import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalGuideForm } from "@/features/admin/LocalGuideForm";
import type { LocalGuide } from "@/features/admin/types";

const guide: LocalGuide = {
  id: "g1",
  name: "Amira Haddad",
  destination: "Marrakech",
  languages: ["Arabic", "French"],
  specialty: "Medina food tours",
  bio: "Grew up in the medina.",
  photoUrl: null,
  profileUrl: "https://www.toursbylocals.com/guides/amira",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "New Guide" } });
  fireEvent.change(screen.getByPlaceholderText("Destination (e.g. Marrakech)"), { target: { value: "Kyoto" } });
  fireEvent.change(screen.getByPlaceholderText("Languages, comma separated"), { target: { value: "Japanese, English" } });
  fireEvent.change(screen.getByPlaceholderText("Specialty (e.g. Medina food tours)"), { target: { value: "Temple tours" } });
  fireEvent.change(screen.getByPlaceholderText("Profile URL (ToursByLocals / Viator / Airbnb Experiences)"), {
    target: { value: "https://www.viator.com/guides/x" },
  });
}

describe("LocalGuideForm — create mode", () => {
  it("shows the create heading and an empty form", () => {
    render(<LocalGuideForm editingGuide={null} onCreate={vi.fn()} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    expect(screen.getByText("Add a local guide")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toHaveValue("");
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("rejects submission when required fields are missing", async () => {
    const onCreate = vi.fn();
    render(<LocalGuideForm editingGuide={null} onCreate={onCreate} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    fireEvent.click(screen.getByText("Add guide"));

    expect(await screen.findByText(/all required/)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("rejects submission with no languages even if other fields are filled", async () => {
    const onCreate = vi.fn();
    render(<LocalGuideForm editingGuide={null} onCreate={onCreate} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "X" } });
    fireEvent.change(screen.getByPlaceholderText("Destination (e.g. Marrakech)"), { target: { value: "Y" } });
    fireEvent.change(screen.getByPlaceholderText("Specialty (e.g. Medina food tours)"), { target: { value: "Z" } });
    fireEvent.change(screen.getByPlaceholderText("Profile URL (ToursByLocals / Viator / Airbnb Experiences)"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByText("Add guide"));

    expect(await screen.findByText(/At least one language/)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("parses comma-separated languages and submits, then clears the form", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<LocalGuideForm editingGuide={null} onCreate={onCreate} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText("Add guide"));

    await screen.findByPlaceholderText("Name");
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Guide",
        destination: "Kyoto",
        languages: ["Japanese", "English"],
        specialty: "Temple tours",
        profileUrl: "https://www.viator.com/guides/x",
      })
    );
    expect(screen.getByPlaceholderText("Name")).toHaveValue("");
  });

  it("omits bio and photoUrl entirely when left blank, rather than sending empty strings", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<LocalGuideForm editingGuide={null} onCreate={onCreate} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText("Add guide"));

    await screen.findByPlaceholderText("Name");
    const submitted = onCreate.mock.calls[0]?.[0];
    expect(submitted).not.toHaveProperty("bio");
    expect(submitted).not.toHaveProperty("photoUrl");
  });

  it("shows an error message when the create call fails", async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error("Destination is required"));
    render(<LocalGuideForm editingGuide={null} onCreate={onCreate} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText("Add guide"));

    expect(await screen.findByText("Destination is required")).toBeInTheDocument();
  });
});

describe("LocalGuideForm — edit mode", () => {
  it("pre-fills the form from the guide being edited", () => {
    render(<LocalGuideForm editingGuide={guide} onCreate={vi.fn()} onUpdate={vi.fn()} onCancelEdit={vi.fn()} />);

    expect(screen.getByText("Edit Amira Haddad")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toHaveValue("Amira Haddad");
    expect(screen.getByPlaceholderText("Languages, comma separated")).toHaveValue("Arabic, French");
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });

  it("calls onUpdate with the guide's id, not onCreate", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onCreate = vi.fn();
    render(<LocalGuideForm editingGuide={guide} onCreate={onCreate} onUpdate={onUpdate} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Specialty (e.g. Medina food tours)"), {
      target: { value: "Rooftop photography tours" },
    });
    fireEvent.click(screen.getByText("Save changes"));

    await screen.findByText("Edit Amira Haddad");
    expect(onUpdate).toHaveBeenCalledWith("g1", expect.objectContaining({ specialty: "Rooftop photography tours" }));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("calls onCancelEdit when Cancel is clicked", () => {
    const onCancelEdit = vi.fn();
    render(<LocalGuideForm editingGuide={guide} onCreate={vi.fn()} onUpdate={vi.fn()} onCancelEdit={onCancelEdit} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancelEdit).toHaveBeenCalled();
  });
});
