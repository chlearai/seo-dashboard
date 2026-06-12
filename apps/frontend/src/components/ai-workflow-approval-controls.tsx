"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AiWorkflowApprovalDecision } from "@rankflow/shared";

interface AiWorkflowApprovalControlsProps {
  workspaceId: string;
  recommendationId: string;
  approvalDecision?: AiWorkflowApprovalDecision;
  decidedBy?: string;
}

export function AiWorkflowApprovalControls({
  workspaceId,
  recommendationId,
  approvalDecision,
  decidedBy
}: AiWorkflowApprovalControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submitDecision(decision: AiWorkflowApprovalDecision) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/workspaces/${workspaceId}/ai-workflow/${recommendationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          decision,
          decidedBy: "Maya Iyer"
        })
      });

      if (!response.ok) {
        setError("Approval could not be saved");
        return;
      }

      router.refresh();
    });
  }

  if (approvalDecision) {
    return (
      <div className="approval-controls" aria-label="AI workflow approval status">
        <span className="evidence-chip">
          {approvalDecision === "approved" ? "Approved" : "Rejected"} by {decidedBy ?? "RankFlow HOD"}
        </span>
      </div>
    );
  }

  return (
    <div className="approval-controls" aria-label="AI workflow approval actions">
      <button className="button small primary" disabled={isPending} onClick={() => submitDecision("approved")} type="button">
        Approve
      </button>
      <button className="button small" disabled={isPending} onClick={() => submitDecision("rejected")} type="button">
        Reject
      </button>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}
