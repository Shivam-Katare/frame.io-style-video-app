'use client'
import {  useSetDocumentId, VeltCommentTool } from '@veltdev/react';

export default function YourDocument() {

  useSetDocumentId('my-document-id')

  return (
    <div>
      <VeltCommentTool/>
    </div>
    
  );
}