import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SearchBox } from "./SearchBox"

describe("SearchBox", () => {
  it("renders BigDecimal suggestions as navigable links", async () => {
    const user = userEvent.setup()
    render(<SearchBox />)

    const input = screen.getByLabelText("Search site content")
    await user.click(input)
    await user.type(input, "BigDecimal")

    const listbox = await screen.findByRole("listbox", { name: "Search suggestions" })
    const links = within(listbox).getAllByRole("link")

    expect(links.length).toBeGreaterThan(1)
    expect(links.some((link) => link.getAttribute("href") === "/java/validation/tax-calculation")).toBe(true)
    expect(links.some((link) => link.getAttribute("href") === "/java/validation/percentage-calculation")).toBe(true)
    expect(within(listbox).getAllByText("Try").length).toBeGreaterThan(0)
  })
})
