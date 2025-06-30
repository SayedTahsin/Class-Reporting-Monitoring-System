import { Link, useRouterState } from "@tanstack/react-router"

import { ModeToggle } from "./mode-toggle"
import UserMenu from "./user-menu"

export default function Header() {
  const location = useRouterState({ select: (s) => s.location.pathname })
  const links = [
    { to: "/", label: "Home" },
    { to: "/routine", label: "Routine" },
    { to: "/resources", label: "Resources" },
  ]

  const shouldHideLinks =
    location === "/login" ||
    location === "/verification" ||
    location === "/reset-password"

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        {
          <nav className="flex gap-4 text-lg">
            {!shouldHideLinks &&
              links.map(({ to, label }) => (
                <Link key={to} to={to}>
                  {label}
                </Link>
              ))}
          </nav>
        }
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {!shouldHideLinks && <UserMenu />}
        </div>
      </div>
      <hr />
    </div>
  )
}
