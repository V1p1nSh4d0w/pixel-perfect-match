import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/Card";
import { LockIcon } from "@/components/UpgradeButton";
import { fetchScoreHistory, type ScoreHistoryPoint } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";

export function ScoreHistory() {
  const { isPro, isLoading } = useSubscription();
  const q = useQuery({ queryKey: ["score-history"], queryFn: fetchScoreHistory, enabled: isPro });
  const [activePoint, setActivePoint] = useState<ScoreHistoryPoint | null>(null);

  if (isLoading) return null;

  if (!isPro) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 border-dashed py-10 text-center">
        <span className="text-muted-foreground"><LockIcon /></span>
        <p className="text-sm text-muted-foreground">Upgrade to Pro to see your score over time</p>
        <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade to Pro</Link>
      </Card>
    );
  }

  const points = q.data?.points ?? [];
  const total = q.data?.total ?? 0;

  if (!q.isLoading && points.length === 0) return null;

  const W = 600, H = 176, LEFT = 30, RIGHT = 24, TOP = 28, BOTTOM = 22;
  const x = (i: number) => (points.length <= 1 ? W / 2 : LEFT + (i * (W - LEFT - RIGHT)) / (points.length - 1));
  const y = (s: number) => H - BOTTOM - (s / 100) * (H - TOP - BOTTOM);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.score)}`).join(" ");
  const activeIndex = activePoint ? points.findIndex((point) => point.id === activePoint.id) : -1;
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

  return (
    <Card>
      <p className="mb-4 text-sm font-medium text-foreground">Score history</p>
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label="Score over time">
              {[0, 50, 100].map((g) => (
                <g key={g}>
                  <line x1={LEFT} x2={W - RIGHT} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth="1" />
                  <text x={2} y={y(g) + 4} className="fill-muted-foreground" fontSize="10">{g}</text>
                </g>
              ))}
              {points.length > 1 && <path d={path} fill="none" className="stroke-primary" strokeWidth="2" />}
              {points.map((p, i) => (
                <g
                  key={p.id}
                  className="cursor-default outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.score} out of 100, ${formatDate(p.created_at)}, ${p.risk_level}`}
                  onMouseEnter={() => setActivePoint(p)}
                  onMouseLeave={() => setActivePoint(null)}
                  onFocus={() => setActivePoint(p)}
                  onBlur={() => setActivePoint(null)}
                >
                  <text
                    x={x(i)}
                    y={y(p.score) - 10}
                    textAnchor="middle"
                    className="animate-score-label fill-muted-foreground"
                    fontSize="11"
                  >
                    {p.score}
                  </text>
                  <circle cx={x(i)} cy={y(p.score)} r="8" className="fill-transparent" />
                  <circle cx={x(i)} cy={y(p.score)} r="4" className="fill-primary" />
                </g>
              ))}
            </svg>
            {activePoint && activeIndex >= 0 && (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg"
                style={{ left: `${(x(activeIndex) / W) * 100}%`, top: `${(y(activePoint.score) / H) * 100}%` }}
              >
                <p className="font-medium text-foreground">{activePoint.score} / 100</p>
                <p className="mt-1 text-muted-foreground">{formatDate(activePoint.created_at)}</p>
                <p className="text-muted-foreground">{activePoint.risk_level}</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {total} assessment{total === 1 ? "" : "s"} · latest {points[points.length - 1]?.score}
          </p>
          {points.length === 1 && (
            <p className="mt-1 text-xs text-muted-foreground">Complete another assessment to see your score over time.</p>
          )}
          {total > 10 && (
            <p className="mt-1 text-xs text-muted-foreground">Showing last 10 of {total} assessments.</p>
          )}
        </>
      )}
    </Card>
  );
}
