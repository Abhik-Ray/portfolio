import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App", () => {
  it("renders the main sections", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByAltText("Abhik Ray Profile")).toBeInTheDocument();
  });
});
