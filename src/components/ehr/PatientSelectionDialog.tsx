"use client";

import { useEffect, useState, useCallback } from "react";
import { useEHRStore } from "@/stores/ehr-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { ExtendedPatient } from "@/types/ehr";

function PatientCard({
  patient,
  onSelect,
  isSelected,
}: {
  patient: ExtendedPatient;
  onSelect: (patient: ExtendedPatient) => void;
  isSelected: boolean;
}) {
  const age =
    new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <button
      onClick={() => onSelect(patient)}
      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
        isSelected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <User className="size-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{patient.mrn}</span>
              <span>•</span>
              <span>
                {age} yo {patient.gender}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="size-3" />
          DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <FileText className="size-3" />
          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
        </div>
      </div>
      {patient.conditions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {patient.conditions.slice(0, 3).map((condition, idx) => (
            <span
              key={idx}
              className="rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {condition}
            </span>
          ))}
          {patient.conditions.length > 3 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              +{patient.conditions.length - 3} more
            </span>
          )}
        </div>
      )}
      {patient.allergies.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          Allergies: {patient.allergies.join(", ")}
        </div>
      )}
    </button>
  );
}

export function PatientSelectionDialog() {
  const {
    isDialogOpen,
    setDialogOpen,
    patients,
    selectedPatient,
    selectPatient,
    searchPatients,
    searchQuery,
    setSearchQuery,
    connectionStatus,
  } = useEHRStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setIsSearching(true);
        searchPatients(localQuery).finally(() => setIsSearching(false));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, searchPatients]);

  const handleSelect = useCallback(
    (patient: ExtendedPatient) => {
      selectPatient(patient);
    },
    [selectPatient]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open && !selectedPatient) {
        // Reset if closing without selecting
        setLocalQuery("");
        setSearchQuery("");
      }
    },
    [setDialogOpen, selectedPatient, setSearchQuery]
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded bg-primary/10">
              <User className="size-4 text-primary" />
            </span>
            Select Patient
          </DialogTitle>
          <DialogDescription>
            Search and select a patient to load their EHR data into the
            conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, MRN, or date of birth..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {connectionStatus === "connecting" ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : patients.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <User className="size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {localQuery
                  ? "No patients found matching your search"
                  : "No patients available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onSelect={handleSelect}
                  isSelected={selectedPatient?.id === patient.id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
