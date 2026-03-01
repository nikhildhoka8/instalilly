"use client";

import { useEHRStore } from "@/stores/ehr-store";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Building2 } from "lucide-react";

export function EHRConnectorMenuItem() {
  const { connect, connectionStatus } = useEHRStore();

  const handleConnect = () => {
    connect();
  };

  return (
    <DropdownMenuItem
      onClick={handleConnect}
      disabled={connectionStatus === "connecting"}
      className="gap-2"
    >
      <Building2 className="size-4" />
      <div className="flex flex-col">
        <span className="font-medium">Connect to Epic EHR</span>
        <span className="text-xs text-muted-foreground">
          {connectionStatus === "connecting"
            ? "Connecting..."
            : "Load patient records"}
        </span>
      </div>
    </DropdownMenuItem>
  );
}
