"use client";

import { useEffect, useRef, useState } from "react";
import { Rocket, FolderOpen, LayoutGrid, MessageSquare, ClipboardCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onStart: () => void;
  onProjects?: () => void;
  onContinue?: () => void;
  hasProject: boolean;
  projectTitle?: string;
  projectCount?: number;
}

const TRAIL_SIZES = [26, 20, 15, 11, 8];

function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dots, setDots] = useState(() =>
    TRAIL_SIZES.map(() => ({ x: -100, y: -100 })),
  );

  const targetRef = useRef({ x: -100, y: -100 });
  const dotsRef = useRef(TRAIL_SIZES.map(() => ({ x: -100, y: -100 })));
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches);
    };

    updateEnabled();
    finePointer.addEventListener("change", updateEnabled);
    reducedMotion.addEventListener("change", updateEnabled);

    return () => {
      finePointer.removeEventListener("change", updateEnabled);
      reducedMotion.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    let frameId = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      setVisible(true);

      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 140);
    };

    const onPointerLeave = () => setVisible(false);

    const tick = () => {
      const nextDots = dotsRef.current;
      const target = targetRef.current;

      nextDots[0].x += (target.x - nextDots[0].x) * 0.28;
      nextDots[0].y += (target.y - nextDots[0].y) * 0.28;

      for (let i = 1; i < nextDots.length; i += 1) {
        nextDots[i].x += (nextDots[i - 1].x - nextDots[i].x) * 0.35;
        nextDots[i].y += (nextDots[i - 1].y - nextDots[i].y) * 0.35;
      }

      setDots(nextDots.map((dot) => ({ ...dot })));
      frameId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.cancelAnimationFrame(frameId);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] hidden sm:block">
      {dots.map((dot, index) => {
        const size = TRAIL_SIZES[index];
        const opacity = visible ? 0.38 - index * 0.06 : 0;

        return (
          <span
            key={size}
            className="absolute rounded-full bg-primary transition-opacity duration-200 ease-out"
            style={{
              width: size,
              height: size,
              opacity,
              transform: `translate3d(${dot.x - size / 2}px, ${dot.y - size / 2}px, 0)`,
              filter: index === 0 ? "blur(1.5px)" : "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
}

export function WelcomeScreen({
  onStart,
  onProjects,
  onContinue,
  hasProject,
  projectTitle,
  projectCount,
}: WelcomeScreenProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 bg-background py-20">
      <CursorTrail />

      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute -right-16 bottom-8 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center"
      >
        {/* Interactive Rocket Icon */}
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-2xl transition-colors hover:bg-primary/10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Rocket className="h-12 w-12 text-primary transition-transform group-hover:-translate-y-2 group-hover:translate-x-1" />
          </motion.div>
          <div className="absolute inset-0 rounded-3xl bg-primary/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
        </motion.div>

        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-6xl font-extrabold tracking-tighter sm:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            ShipIt
          </h1>
          <p className="text-pretty text-xl font-medium text-muted-foreground sm:text-2xl">
            Turn AI Plans into Actionable Boards
          </p>
        </div>

         <p className="max-w-lg text-pretty text-lg text-muted-foreground/80 leading-relaxed">
          The bridge between a LLM prompt and a finished product. 
          Paste your plan and watch it become a task board in seconds.
        </p>

        {/* --- HOW IT WORKS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
          {[
            {
              icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
              title: "1. Prompt AI",
              desc: "Ask your favorite LLM to build a development plan."
            },
            {
              icon: <Zap className="h-5 w-5 text-amber-500" />,
              title: "2. Paste Prompt",
              desc: "Copy the output and paste it into ShipIt."
            },
            {
              icon: <ClipboardCheck className="h-5 w-5 text-emerald-500" />,
              title: "3. Execute",
              desc: "Track tasks and finish your project faster."
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-start p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-md text-left transition-colors hover:border-primary/30"
            >
              <div className="mb-3 p-2 rounded-lg bg-background border border-border">
                {step.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        {/* --- END HOW IT WORKS --- */}

        <div className="mt-4 flex flex-col items-center gap-4 w-full sm:w-auto">
          <Button 
            size="lg" 
            onClick={onStart} 
            className="group relative h-14 gap-3 px-12 text-lg font-semibold shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)] transition-all hover:scale-105"
          >
            <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            Start New Project
          </Button>

          <div className="flex flex-wrap justify-center gap-3">
            {hasProject && onContinue && (
              <Button
                variant="outline"
                onClick={onContinue}
                className="gap-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5"
              >
                <FolderOpen className="h-4 w-4" />
                Resume: {projectTitle || "Last Project"}
              </Button>
            )}

            {hasProject && onProjects && (
              <Button
                variant="ghost"
                onClick={onProjects}
                className="gap-2 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              >
                <LayoutGrid className="h-4 w-4" />
                Library ({projectCount})
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}