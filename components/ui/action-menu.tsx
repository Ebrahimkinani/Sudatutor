import * as React from "react"
import { createPortal } from "react-dom"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionMenuProps {
    onDelete: () => void
    itemType: "chat" | "folder"
}

export function ActionMenu({ onDelete, itemType }: ActionMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is on the button
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                return
            }

            // Check if click is inside the portal menu (we need a way to identify it, or just rely on the fact that if it's not the button, we close.
            // Actually, we can just close it. If the user clicks *inside* the menu, `handleDelete` or stopPropagation should handle it.
            // Ideally we check if target is inside the menu.
            const menuElement = document.getElementById(`action-menu-${itemType}`)
            if (menuElement && menuElement.contains(event.target as Node)) {
                return
            }

            setIsOpen(false)
            setShowConfirm(false)
        }

        const handleScroll = () => {
            if (isOpen) setIsOpen(false); // Close on scroll to avoid detached menu
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            window.addEventListener("scroll", handleScroll, true)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("scroll", handleScroll, true)
        }
    }, [isOpen, itemType])

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onDelete()
        setIsOpen(false)
        setShowConfirm(false)
    }

    const toggleOpen = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            // Default to aligning left, but if it goes offscreen right, flip it?
            // User says "rest is out of the screen".
            // Let's try to align it to the right of the button if space permits, or bottom-left.
            // Simple approach: Bottom-Left of the button.
            // If the sidebar is on the right (RTL), we might want Bottom-Right.
            // Let's try aligning the RIGHT edge of the menu with the RIGHT edge of the button to keep it safely within the sidebar if possible, 
            // OR render it purely based on screen space.

            // Let's go with: Position below the button.
            // Left aligned to the button's left.
            // If (rect.left + 192 (w-48)) > window.innerWidth, shift it left.

            let left = rect.left
            if (left + 192 > window.innerWidth) {
                left = window.innerWidth - 200 // Force it inside
            }

            setPosition({
                top: rect.bottom + 4,
                left: left
            })
        }

        setIsOpen(!isOpen)
        setShowConfirm(false)
    }

    return (
        <>
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={toggleOpen}
            >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
            </Button>

            {isOpen && createPortal(
                <div
                    id={`action-menu-${itemType}`}
                    style={{
                        top: position.top,
                        left: position.left,
                        position: "fixed",
                        zIndex: 9999
                    }}
                    className="w-48 rounded-md border bg-popover p-1 shadow-md outline-none animate-in fade-in-0 zoom-in-95"
                >
                    {!showConfirm ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowConfirm(true)
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete {itemType === "chat" ? "Chat" : "Folder"}</span>
                        </button>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            <span className="text-xs font-semibold text-center text-muted-foreground pb-1">
                                Are you sure?
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs flex-1"
                                    onClick={handleDelete}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setShowConfirm(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    )
}
