"use client";

import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect } from "react";

interface RiveEmptyStateProps {
  src: string; // The URL or path to the .riv file
  stateMachineName?: string;
  className?: string;
}

export function RiveEmptyState({ src, stateMachineName = "State Machine 1", className = "w-48 h-48" }: RiveEmptyStateProps) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachineName,
    autoplay: true,
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 
        Note: If you export your own .riv file, make sure the state machine name matches.
        Often it is "State Machine 1" by default in the Rive editor.
      */}
      <RiveComponent />
    </div>
  );
}
