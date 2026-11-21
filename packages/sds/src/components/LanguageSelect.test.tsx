import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSelect } from "../language-select";

const options = [{value:"en",label:"English",flag:"🇺🇸",abbreviation:"EN"},{value:"es",label:"Español",flag:"🇪🇸",abbreviation:"ES"}];
describe("LanguageSelect", () => {
  afterEach(() => vi.restoreAllMocks());
  it("shows the current native name and exposes a disabled fieldset", () => {
    const change=vi.fn();
    render(<LanguageSelect label="App language" value="en" options={options} onValueChange={change} disabled/>);
    expect(screen.getByRole("button",{name:"App language"})).toBeDisabled();
    expect(screen.getByText("English")).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:"App language"}));
    expect(change).not.toHaveBeenCalled();
  });
  it("selects through the shared menu and closes it", () => {
    vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockReturnValue(new DOMRect(40,40,132,32));
    const change=vi.fn();
    render(<LanguageSelect label="App language" value="en" options={options} onValueChange={change}/>);
    fireEvent.click(screen.getByRole("button",{name:"App language"}));
    fireEvent.click(screen.getByRole("menuitemradio",{name:/Español/}));
    expect(change).toHaveBeenCalledWith("es");
    expect(screen.queryByRole("menuitemradio",{name:/Español/})).not.toBeInTheDocument();
  });
});
