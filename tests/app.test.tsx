import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("SnipVault App", () => {
  it("renders title", () => {
    render(<App />);
    expect(screen.getByText(/Snippet API for Teams/i)).toBeInTheDocument();
  });

  it("adds a snippet through the form", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Snippet title"), { target: { value: "Retry fetch" } });
    fireEvent.change(screen.getByLabelText("Snippet code"), { target: { value: "for (let i=0;i<3;i++) {}" } });
    fireEvent.change(screen.getByLabelText("Snippet tags"), { target: { value: "api,retry" } });
    fireEvent.click(screen.getByRole("button", { name: "Save snippet" }));

    expect(screen.getByText("Snippet added.")).toBeInTheDocument();
    expect(screen.getByText("Retry fetch")).toBeInTheDocument();
  });
});
