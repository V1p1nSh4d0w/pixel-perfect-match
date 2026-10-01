import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/Card";
import { LockIcon } from "@/components/UpgradeButton";
import { fetchScoreHistory } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";

export function ScoreHistory() {
  const { isPro, isLoading } = useSubscription();
  const q = useQuery({ queryKey: ["score-history"], queryFn: fetchScoreHistory, enabled: isPro });

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

  const points = q.data ?? [];
  const W = 600, H = 160, P = 24;
  const x = (i: number) => (points.length <= 1 ? W / 2 : P + (i * (W - 2 * P)) / (points.length - 1));
  const y = (s: number) => H - P - (s / 100) * (H - 2 * P);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.score)}`).join(" ");

  return (
    <Card>
      <p className="mb-4 text-sm font-medium text-foreground">Score history</p>
      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assessments yet.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label="Score over time">
            {[0, 50, 100].map((g) => (
              <g key={g}>
                <line x1={P} x2={W - P} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth="1" />
                <text x={2} y={y(g) + 4} className="fill-muted-foreground" fontSize="10">{g}</text>
              </g>
            ))}
            <path d={path} fill="none" className="stroke-primary" strokeWidth="2" />
            {points.map((p, i) => (
              <circle key={p.id} cx={x(i)} cy={y(p.score)} r="4" className="fill-primary">
                <title>{`${new Date(p.created_at).toLocaleDateString()}: ${p.score}`}</title>
              </circle>
            ))}
          </svg>
          <p className="mt-2 text-xs text-muted-foreground">
            {points.length} assessment{points.length === 1 ? "" : "s"} · latest {points[points.length - 1]!.score}
          </p>
        </>
      )}
    </Card>
  );
}
