import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageLayout, PageTitle } from "./page";

describe("PageLayout", () => {
  it("roots the page in notes-page and sds so the built header applies", () => {
    const { container } = render(
      <PageLayout icon="grid" title="Boards" count={12} actions={<button type="button">Upload</button>}>
        <p>Body</p>
      </PageLayout>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass("notes-page", "sds");
    expect(root?.tagName).toBe("DIV");
    expect(screen.getByRole("heading", { level: 1, name: "Boards" })).toBeInTheDocument();
    expect(container.querySelector(".page-head .count")).toHaveTextContent("12");
    expect(container.querySelector(".page-head .head-actions")).toContainElement(screen.getByRole("button", { name: "Upload" }));
  });

  it("puts tabs and toolbar in the filter band under the header", () => {
    const { container } = render(
      <PageLayout icon="grid" title="Boards" tabs={<div data-testid="tabs" />} toolbar={<div data-testid="toolbar" />}>
        <p>Body</p>
      </PageLayout>,
    );
    const band = container.querySelector(".page-head + .page-filters");
    expect(band).toContainElement(screen.getByTestId("tabs"));
    expect(band).toContainElement(screen.getByTestId("toolbar"));
  });

  it("keeps the caller's class and can be the main region", () => {
    const { container } = render(
      <PageLayout as="main" icon="grid" title="Boards" className="boards-page" header={false}>
        <p>Body</p>
      </PageLayout>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("MAIN");
    expect(root).toHaveClass("notes-page", "sds", "boards-page");
    expect(container.querySelector(".page-head")).toBeNull();
  });
});

describe("PageTitle", () => {
  it("links back through earlier pages and ends on the current one", () => {
    render(<PageTitle parent="Boards" current="Maria Garcia" onBack={() => {}} />);
    expect(screen.getByRole("button", { name: "Boards" })).toHaveClass("page-back");
    expect(screen.getByText("Maria Garcia")).toHaveClass("page-current");
  });
});
