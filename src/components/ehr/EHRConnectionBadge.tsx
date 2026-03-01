"use client";

import { useEHRStore } from "@/stores/ehr-store";
import { X, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EHRConnectionBadge() {
  const { selectedPatient, connectionStatus, disconnect, setDialogOpen } =
    useEHRStore();

  if (connectionStatus !== "connected" || !selectedPatient) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="size-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">
              Epic EHR Connected
            </span>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            <User className="size-3" />
            {selectedPatient.name}
            <span className="text-muted-foreground">
              ({selectedPatient.mrn})
            </span>
          </button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={disconnect}
        className="size-6 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
        <span className="sr-only">Disconnect</span>
      </Button>
    </div>
  );
}
