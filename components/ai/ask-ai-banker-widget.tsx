"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, MessageSquare, Sparkles } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AIBankerChatInterface } from "@/components/ai/ai-banker-chat-interface"

interface AskAIBankerWidgetProps {
  questions: string[]
  title?: string
  description?: string
}

export function AskAIBankerWidget({
  questions,
  title = "Ask AI Banker",
  description = "Get instant answers about your finances",
}: AskAIBankerWidgetProps) {
  const [open, setOpen] = useState(false)
  const [initialQuestion, setInitialQuestion] = useState("")

  const handleQuestionClick = (question: string) => {
    setInitialQuestion(question)
    setOpen(true)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {/* Sheet Trigger Button (Icon only) */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setInitialQuestion("")}>
                <MessageSquare className="h-5 w-5 text-primary" />
              </Button>
            </SheetTrigger>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((question) => (
              <Button
                key={question}
                variant="secondary"
                size="sm"
                className="text-xs h-auto py-2 px-3 bg-background/50 hover:bg-background"
                onClick={() => handleQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <SheetContent className="sm:max-w-md w-[400px] p-0 flex flex-col">
        <SheetTitle className="sr-only">AI Banker Chat</SheetTitle>
        <SheetDescription className="sr-only">Chat with the AI Banker</SheetDescription>
        <AIBankerChatInterface embedded={false} initialMessage={initialQuestion} />
      </SheetContent>
    </Sheet>
  )
}

export function AskAIButton({ 
  initialQuestion, 
  children,
  className
}: { 
  initialQuestion?: string
  children?: React.ReactNode 
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className={className}>
            <Sparkles className="h-4 w-4 text-primary" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-[400px] p-0 flex flex-col">
        <SheetTitle className="sr-only">AI Banker Chat</SheetTitle>
        <SheetDescription className="sr-only">Chat with the AI Banker</SheetDescription>
        <AIBankerChatInterface embedded={false} initialMessage={initialQuestion} />
      </SheetContent>
    </Sheet>
  )
}
