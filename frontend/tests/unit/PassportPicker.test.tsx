import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassportPicker } from "@/features/travelEssentials/PassportPicker";

const options = [
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
];

describe("PassportPicker", () => {
  it("lists every option and reflects the current value", () => {
    render(<PassportPicker options={options} value="IN" onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveValue("IN");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange with the selected country code", () => {
    const onChange = vi.fn();
    render(<PassportPicker options={options} value="IN" onChange={onChange} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "US" } });

    expect(onChange).toHaveBeenCalledWith("US");
  });

  it("shows a placeholder option when nothing is selected yet", () => {
    render(<PassportPicker options={options} value={null} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
});
