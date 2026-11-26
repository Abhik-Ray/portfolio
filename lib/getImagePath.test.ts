import { getImagePath } from "./getImagePath";

describe("getImagePath", () => {
  it("prefixes the path with the Vite base URL", () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    expect(getImagePath("/profile.jpg")).toBe(`${base}/profile.jpg`);
  });
});
