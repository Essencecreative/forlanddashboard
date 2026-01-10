"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router"
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ImageIcon,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  NewspaperIcon,
  RadioIcon,
  Settings,
  Sliders,
  Users,
  Youtube,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "./ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function DashboardSidebar() {
  const { pathname } = useLocation()
  const [openMenus, setOpenMenus] = useState<string[]>(["publications", "forland-reports", "forvac-reports", "news-events"]) // Default open menus

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
  }

  const isMenuOpen = (menuId: string) => openMenus.includes(menuId)

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (path !== "/dashboard" && pathname.includes(path)) {
      return true
    }
    return false
  }

  // Helper component for truncated menu items with tooltips
  const TruncatedMenuItem = ({
    text,
    isActive,
    onClick,
  }: {
    text: string
    isActive?: boolean
    onClick?: () => void
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuSubButton isActive={isActive} onClick={onClick} className="truncate pr-2 text-xs">
            {text}
          </SidebarMenuSubButton>
        </TooltipTrigger>
        <TooltipContent side="right">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <Sidebar className="w-64 shrink-0">
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
        <img
    src="https://res.cloudinary.com/dedfrilse/image/upload/v1745827523/arcot15kf5uyb4wy3cov.png"
    alt="Logo"
    className="h-20 w-60 object-contain"
  />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/">
                  <SidebarMenuButton isActive={isActive("/")}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Home Slider Menu Item */}
              <SidebarMenuItem>
                <Link to="/home-slider">
                  <SidebarMenuButton isActive={isActive("/home-slider")}>
                    <Sliders className="h-4 w-4" />
                    <span>Home Slider</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* YouTube Videos Menu Item */}
              <SidebarMenuItem>
                <Link to="/youtube-videos">
                  <SidebarMenuButton isActive={isActive("/youtube-videos")}>
                    <Youtube className="h-4 w-4" />
                    <span>YouTube Videos</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Publications Menu with Submenu */}
              <Collapsible
                className="w-full"
                open={isMenuOpen("publications")}
                onOpenChange={() => toggleMenu("publications")}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger className="w-full" asChild>
                    <SidebarMenuButton isActive={isActive("/publications")}>
                      <BookOpen className="h-4 w-4" />
                      <span>Publications</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isMenuOpen("publications") ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <Link to="/publications?category=pfp">
                        <SidebarMenuSubButton>
                          PFP Technical Reports
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>

                    {/* FORVAC Reports Submenu */}
                    <Collapsible
                      className="w-full"
                      open={isMenuOpen("forvac-reports")}
                      onOpenChange={() => toggleMenu("forvac-reports")}
                    >
                      <SidebarMenuSubItem>
                        <CollapsibleTrigger className="w-full" asChild>
                          <SidebarMenuSubButton>
                            FORVAC Reports
                            <ChevronDown
                              className={`ml-auto h-3 w-3 shrink-0 transition-transform duration-200 ${
                                isMenuOpen("forvac-reports") ? "rotate-180" : ""
                              }`}
                            />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>
                      </SidebarMenuSubItem>
                      <CollapsibleContent>
                        <SidebarMenuSub className="border-l-0 pl-2">
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forvac&subcategory=technical">
                              <TruncatedMenuItem text="FORVAC Technical Reports" />
                            </Link>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forvac&subcategory=admin">
                              <TruncatedMenuItem text="FORVAC Administrative & Management Reports" />
                            </Link>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* FORLAND Reports Submenu */}
                    <Collapsible
                      className="w-full"
                      open={isMenuOpen("forland-reports")}
                      onOpenChange={() => toggleMenu("forland-reports")}
                    >
                      <SidebarMenuSubItem>
                        <CollapsibleTrigger className="w-full" asChild>
                          <SidebarMenuSubButton>
                            FORLAND Reports
                            <ChevronDown
                              className={`ml-auto h-3 w-3 shrink-0 transition-transform duration-200 ${
                                isMenuOpen("forland-reports") ? "rotate-180" : ""
                              }`}
                            />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>
                      </SidebarMenuSubItem>
                      <CollapsibleContent>
                        <SidebarMenuSub className="border-l-0 pl-2">
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forland&subcategory=admin">
                              <TruncatedMenuItem text="Administration and Financial Reports" />
                            </Link>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forland&subcategory=technical">
                              <TruncatedMenuItem text="Project Technical Report" />
                            </Link>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forland&subcategory=forms">
                              <TruncatedMenuItem text="Forms and Guidelines" />
                            </Link>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forland&subcategory=brochure">
                              <TruncatedMenuItem text="Brochure & Newsletters" />
                            </Link>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <Link to="/publications?category=forland&subcategory=institutional">
                              <TruncatedMenuItem text="Institutional Support" />
                            </Link>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {/* News & Events Menu with Submenu */}
              <Collapsible
                className="w-full"
                open={isMenuOpen("news-events")}
                onOpenChange={() => toggleMenu("news-events")}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger className="w-full" asChild>
                    <SidebarMenuButton isActive={isActive("/news-and-events")}>
                      <CalendarDays className="h-4 w-4" />
                      <span>News & Events</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isMenuOpen("news-events") ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <Link to="/news-and-events?category=media">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <NewspaperIcon className="h-3.5 w-3.5 text-blue-500" />
                          Media News
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <Link to="/news-and-events?category=general">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <NewspaperIcon className="h-3.5 w-3.5 text-gray-500" />
                          General News
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <Link to="/news-and-events?category=events">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-green-500" />
                          Events and Trainings
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <Link to="/news-and-events?category=radio">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <RadioIcon className="h-3.5 w-3.5 text-purple-500" />
                          Radio Programmes
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {/* Photo Gallery Menu Item */}
              <SidebarMenuItem>
                <Link to="/gallery">
                  <SidebarMenuButton isActive={isActive("/gallery")}>
                    <ImageIcon className="h-4 w-4" />
                    <span>Photo Gallery</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Gallery Categories Menu Item */}
              <SidebarMenuItem>
                <Link to="/gallery-categories">
                  <SidebarMenuButton isActive={isActive("/gallery-categories")}>
                    <Layers className="h-4 w-4" />
                    <span>Gallery Categories</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Banners Menu Item */}
              <SidebarMenuItem>
                <Link to="/banners">
                  <SidebarMenuButton isActive={isActive("/banners")}>
                    <ImageIcon className="h-4 w-4" />
                    <span>Banners</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <Collapsible
                className="w-full"
                open={isMenuOpen("opportunities")}
                onOpenChange={() => toggleMenu("opportunities")}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger className="w-full" asChild>
                    <SidebarMenuButton isActive={isActive("/news-and-events")}>
                      <Briefcase className="h-4 w-4" />
                      <span>Opportunities</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isMenuOpen("opportunities") ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <Link to="/opportunities?category=call-for-proposals">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <NewspaperIcon className="h-3.5 w-3.5 text-blue-500" />
                          Call for Proposals
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <Link to="/opportunities?category=job-vacancies">
                        <SidebarMenuSubButton className="flex items-center gap-1.5">
                          <NewspaperIcon className="h-3.5 w-3.5 text-gray-500" />
                          Job Vacancies
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
              {/* Organization Structure Menu Item */}
              <SidebarMenuItem>
                <Link to="/organization-structure">
                  <SidebarMenuButton isActive={isActive("/organization-structure")}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Organization Structure</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Team Members Menu Item */}
              <SidebarMenuItem>
                <Link to="/team">
                  <SidebarMenuButton isActive={isActive("/team")}>
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/users">
                  <SidebarMenuButton isActive={isActive("/team")}>
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Analytics Menu Item */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/settings">
                  <SidebarMenuButton isActive={isActive("/")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LifeBuoy className="h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}