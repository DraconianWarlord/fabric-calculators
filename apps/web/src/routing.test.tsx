import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import App from "./App"

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe("suite calculator routing", () => {
  it("swaps nesting ↔ pillows content when navigating", async () => {
    const user = userEvent.setup()
    renderAt("/nesting")

    expect(screen.getByText("Add Panel")).toBeInTheDocument()
    expect(screen.getByText(/seam allowance/i)).toBeInTheDocument()
    expect(document.querySelector(".calc-page--nesting")).toBeTruthy()
    expect(document.querySelector(".calc-page--pillows")).toBeNull()

    const moreBtns = screen.getAllByRole("button", { name: /more/i })
    await user.click(moreBtns[0]!)
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: /pillows/i }))

    expect(await screen.findByRole("heading", { name: /pillow type/i })).toBeInTheDocument()
    expect(screen.getByText(/throw pillow inputs/i)).toBeInTheDocument()
    expect(document.querySelector(".calc-page--pillows")).toBeTruthy()
    expect(document.querySelector(".calc-page--nesting")).toBeNull()
    expect(screen.queryByText("Add Panel")).not.toBeInTheDocument()
    expect(screen.queryByText(/seam allowance/i)).not.toBeInTheDocument()
  })
})
