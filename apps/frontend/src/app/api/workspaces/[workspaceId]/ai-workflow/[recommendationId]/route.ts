import { NextResponse, type NextRequest } from "next/server";
import { saveWorkspaceAiWorkflowApproval } from "@/lib/rankflow-api";

interface ApprovalRouteProps {
  params: Promise<{
    workspaceId: string;
    recommendationId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: ApprovalRouteProps) {
  const { workspaceId, recommendationId } = await params;
  const body = await request.json().catch(() => ({}));
  const decision = body?.decision;
  const decidedBy = body?.decidedBy;

  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "decision must be approved or rejected" }, { status: 400 });
  }

  const approval = await saveWorkspaceAiWorkflowApproval({
    workspaceId,
    recommendationId,
    decision,
    decidedBy: typeof decidedBy === "string" && decidedBy.trim() ? decidedBy : "RankFlow HOD"
  });

  return NextResponse.json(approval);
}
