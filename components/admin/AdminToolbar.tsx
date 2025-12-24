"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface AdminToolbarProps {
    children?: React.ReactNode; // For extra filters like Dropdowns
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export function AdminToolbar({ children, placeholder = "Search...", onSearch }: AdminToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("q", query);
            // reset page on search
            params.set("page", "1");
        } else {
            params.delete("q");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end sm:items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleSearch} variant="secondary">Search</Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                {children}
            </div>
        </div>
    );
}
