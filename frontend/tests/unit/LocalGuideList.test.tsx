import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalGuideList } from "@/features/admin/LocalGuideList";
import type { LocalGuide } from "@/features/admin/types";

const guides: LocalGuide[] = [
  {
    id: "g1",
    name: "Amira Haddad",
    destination: "Marrakech",
    languages: ["Arabic", "French"],
    specialty: "Medina food tours",
    bio: null,
    photoUrl: null,
    profileUrl: "https://www.toursbylocals.com/guides/amira",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "g2",
    name: "Kenji Sato",
    destination: "Kyoto",
    languages: ["Japanese", "English"],
    specialty: "Temple tours",
    bio: null,
    photoUrl: null,
    profileUrl: "https://www.viator.com/guides/kenji",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("LocalGuideList", () => {
  it("shows an empty state when there are no guides", () => {
    render(<LocalGuideList guides={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No local guides yet/)).toBeInTheDocument();
  });

  it("lists every guide with their destination and specialty", () => {
    render(<LocalGuideList guides={guides} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Amira Haddad")).toBeInTheDocument();
    expect(screen.getByText("Kenji Sato")).toBeInTheDocument();
    expect(screen.getByText(/Marrakech.*Medina food tours/)).toBeInTheDocument();
  });

  it("calls onEdit with the correct guide", () => {
    const onEdit = vi.fn();
    render(<LocalGuideList guides={guides} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getAllByText("Edit")[1] as HTMLElement);

    expect(onEdit).toHaveBeenCalledWith(guides[1]);
  });

  it("calls onDelete with the correct guide id and shows a deleting state", async () => {
    let resolveDelete: () => void = () => {};
    const onDelete = vi.fn().mockReturnValue(new Promise<void>((resolve) => (resolveDelete = resolve)));
    render(<LocalGuideList guides={guides} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByText("Delete")[0] as HTMLElement);

    expect(onDelete).toHaveBeenCalledWith("g1");
    expect(await screen.findByText("Deleting…")).toBeInTheDocument();

    resolveDelete();
    await waitFor(() => expect(screen.queryByText("Deleting…")).not.toBeInTheDocument());
  });
});
