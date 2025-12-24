"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AnalyticsDateFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [from, setFrom] = useState(searchParams.get("from") || "");
    const [to, setTo] = useState(searchParams.get("to") || "");

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (from) params.set("from", from);
        else params.delete("from");

        if (to) params.set("to", to);
        else params.delete("to");

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm mb-6">
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date();
                    setFrom(now.toISOString().split('T')[0]);
                    setTo(now.toISOString().split('T')[0]);
                }}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date();
                    const past = new Date();
                    past.setDate(now.getDate() - 7);
                    setFrom(past.toISOString().split('T')[0]);
                    setTo(now.toISOString().split('T')[0]);
                }}>7d</Button>
                <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date();
                    const past = new Date();
                    past.setDate(now.getDate() - 30);
                    setFrom(past.toISOString().split('T')[0]);
                    setTo(now.toISOString().split('T')[0]);
                }}>30d</Button>
            </div>

            <div className="flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="from">From</Label>
                    <Input
                        type="date"
                        id="from"
                        value={from ? new Date(from).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="to">To</Label>
                    <Input
                        type="date"
                        id="to"
                        value={to ? new Date(to).toISOString().split('T')[0] : ''}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <Button onClick={handleApply}>Apply</Button>
            </div>
        </div>

    );
}
