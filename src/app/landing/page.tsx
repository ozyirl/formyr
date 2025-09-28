"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Powered by AI • No more boring forms
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Forms that feel like{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              conversations
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Transform boring forms into engaging AI-powered conversations. Your
            users will love filling them out, and you&apos;ll get better, richer
            responses than ever before.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="rounded-lg bg-card p-4 shadow-lg border">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float-delayed">
          <div className="rounded-lg bg-card p-4 shadow-lg border">
            <Zap className="h-6 w-6 text-primary" />
          </div>
        </div>
      </section>

      {/* Demo Chat Preview */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border bg-card/50 p-8 backdrop-blur-sm shadow-2xl">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                See it in action
              </h3>
              <p className="text-sm text-muted-foreground">
                This is what your users experience
              </p>
            </div>

            <div className="space-y-4 max-h-80 overflow-hidden">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-2xl bg-muted p-3 max-w-xs">
                  <p className="text-sm">
                    I&apos;ll help you fill out this application form!
                    Let&apos;s start with your company name - what should I put
                    down?
                  </p>
                </div>
              </div>

              {/* User Response */}
              <div className="flex gap-3 justify-end">
                <div className="rounded-2xl bg-primary p-3 max-w-xs">
                  <p className="text-sm text-primary-foreground">
                    Put down &quot;FormFlow&quot; as the company name
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Users className="h-4 w-4" />
                </div>
              </div>

              {/* AI Follow-up */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-2xl bg-muted p-3 max-w-xs">
                  <p className="text-sm">
                    Got it! FormFlow is now filled in. Next, they&apos;re asking
                    for your industry - what sector are you in?
                  </p>
                </div>
              </div>

              {/* Fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why choose conversational forms?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Traditional forms are dead. Here&apos;s why conversations win
              every time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Natural Interaction
              </h3>
              <p className="mt-2 text-muted-foreground">
                People love talking. Turn form-filling into a natural
                conversation that feels human and engaging.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Higher Completion
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get 3x more completed responses with AI that adapts, clarifies,
                and guides users naturally.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Richer Data
              </h3>
              <p className="mt-2 text-muted-foreground">
                AI conversations extract deeper insights and context that
                traditional forms miss completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 pb-24 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Stop losing users to boring forms
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Traditional forms have abysmal completion rates. Our AI-powered
                conversations change everything.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "No more abandoned forms - AI keeps users engaged",
                  "Adaptive questioning based on previous answers",
                  "Natural language processing for better data quality",
                  "Works on any device with a beautiful chat interface",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pl-8">
              <div className="rounded-2xl border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-12 bg-primary/10 rounded flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to revolutionize your forms?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of creators who&apos;ve already made the switch to
            conversational forms.
          </p>

          <div className="mt-8">
            <SignUpButton mode="modal">
              <Button size="lg" className="group">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • Setup in 2 minutes • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
