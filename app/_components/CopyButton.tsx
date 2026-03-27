"use client"

import { useState } from "react"

type CopyButtonProps = {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className="code-block__copy"
      aria-label="Copy code"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}
