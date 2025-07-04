"use client";
import { useSetDocumentId, VeltCommentTool } from "@veltdev/react";
import { MessageSquare } from "lucide-react";

export default function YourDocument() {
  useSetDocumentId("my-document-id");

  return (
    <div>
      <VeltCommentTool>
        <MessageSquare className="h-5 w-5 cursor-pointer text-amber-50 mr-3" />
      </VeltCommentTool>
    </div>
  );
}
