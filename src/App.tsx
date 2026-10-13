import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Coffee,
  Check,
  CircleCheck,
  Pause,
  Play,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CalendarDays,
  Download,
  Minus,
  Plus,
  GlassWater,
  Footprints,
  Leaf,
  LockKeyhole,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  KEY,
  dateKey,
  parseDate,
  validDate,
  loadData,
  monday,
  shift,
  weekly,
} from "@/lib/data";
import type { Entry, Data } from "@/lib/data";
import "./App.css";
const coffees = [
  ["美式", "Americano"],
  ["拿铁", "Latte"],
  ["浓缩", "Espresso"],
  ["冷萃", "Cold Brew"],
  ["卡布奇诺", "Cappuccino"],
  ["手冲", "Pour Over"],
];
const dayNames = [
  ["周一", "Mon"],
  ["周二", "Tue"],
  ["周三", "Wed"],
  ["周四", "Thu"],
  ["周五", "Fri"],
  ["周六", "Sat"],
  ["周日", "Sun"],
];
const routes = ["today", "journal", "plan"] as const;
type Route = (typeof routes)[number];
function routeNow(): Route {
  const h = location.hash.slice(1);
  return routes.includes(h as Route) ? (h as Route) : "today";
}
function CoffeeAnimation({ en }: { en: boolean }) {
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [scene, setScene] = useState(0),
    [active, setActive] = useState(0),
    [restart, setRestart] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const cb = () => setReduced(m.matches);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const time = Number(
        stage.current?.getAnimations({ subtree: true })[0]?.currentTime ?? 0,
      );
      setActive((scene + Math.floor(time / 6000)) % 3);
    }, 200);
    return () => clearInterval(id);
  }, [scene, restart]);
  const stopped = paused || reduced;
  useEffect(() => {
    const animations = stage.current?.getAnimations({ subtree: true }) || [];
    animations.forEach((a) => (stopped ? a.pause() : a.play()));
    return () => {};
  }, [stopped, scene, restart]);
  return (
    <>
      <div
        className="coffee-stage"
        key={`${scene}-${restart}`}
        ref={stage}
        aria-hidden="true"
      >
        {[0, 1, 2].map((g) => (
          <div className={`coffee-group group-${g}`} key={g}>
            {Array.from({ length: 6 }, (_, i) => {
              const kind = (i + g * 2) % 6;
              return (
                <figure
                  className={`coffee-card pos-${i}`}
                  key={i}
                  style={
                    {
                      "--delay": `${((g - scene + 3) % 3) * 6 + i * 0.09}s`,
                      "--tilt": `${[-11, 9, -7, 12, 8, -9][i]}deg`,
                      "--direction": i < 3 ? -1 : 1,
                    } as CSSProperties
                  }
                >
                  <div
                    className="coffee-photo"
                    style={{
                      backgroundPosition: `${(kind % 3) * 50}% ${Math.floor(kind / 3) * 100}%`,
                    }}
                  />
                  <figcaption>
                    {coffees[kind][1]}
                    <span>{coffees[kind][0]}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </div>
      <button
        className="motion-control"
        onClick={() => setPaused((p) => !p)}
        disabled={reduced}
        aria-label={
          en
            ? paused
              ? "Play animation"
              : "Pause animation"
            : paused
              ? "播放动画"
              : "暂停动画"
        }
      >
        {stopped ? <Play /> : <Pause />}
        <span>
          {reduced
            ? en
              ? "Reduced motion"
              : "已减少动态效果"
            : paused
              ? en
                ? "Play"
                : "播放动画"
              : en
                ? "Pause"
                : "暂停动画"}
        </span>
      </button>
      <div
        className="scene-dots"
        aria-label={en ? "Coffee scenes" : "咖啡场景"}
      >
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            aria-label={en ? `Show scene ${i + 1}` : `切换场景 ${i + 1}`}
            disabled={reduced}
            onClick={() => {
              setScene(i);
              setActive(i);
              setRestart((n) => n + 1);
              setPaused(false);
            }}
            className={active === i ? "selected" : ""}
          />
        ))}
      </div>
    </>
  );
}
export default function App() {
  const [en, setEn] = useState(() => {
    try {
      return localStorage.getItem("coffee-day.lang") === "en";
    } catch {
      return false;
    }
  });
  const t = (zh: string, eng: string) => (en ? eng : zh);
  const [route, setRoute] = useState<Route>(routeNow),
    [data, setData] = useState<Data>(loadData),
    [today, setToday] = useState(() => dateKey(new Date()));
  const now = parseDate(today),
    [month, setMonth] = useState(
      () => new Date(now.getFullYear(), now.getMonth(), 1),
    ),
    [editor, setEditor] = useState<string | null>(null);
  const [draft, setDraft] = useState<Entry>({
      status: "coffee",
      cups: 1,
      kind: 0,
      note: "",
    }),
    [formDate, setFormDate] = useState(today),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [recentPage, setRecentPage] = useState(0);
  const [plan, setPlan] = useState(data.plan),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const cb = () => setRoute(routeNow());
    window.addEventListener("hashchange", cb);
    const timer = setInterval(() => setToday(dateKey(new Date())), 30000);
    return () => {
      window.removeEventListener("hashchange", cb);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "zh-CN";
    document.title = en
      ? "Coffee Day — A little less, at your pace"
      : "Coffee Day · 今天，少喝一点也很好";
    try {
      localStorage.setItem("coffee-day.lang", en ? "en" : "zh");
    } catch {
      /* Language remains available for this session. */
    }
  }, [en]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  function persist(next: Data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      return true;
    } catch {
      setError(
        t(
          "保存失败：浏览器存储不可用或空间不足，请先导出记录。",
          "Could not save. Browser storage is unavailable or full. Please export your records.",
        ),
      );
      return false;
    }
  }
  function openEntry(date: string, status?: Entry["status"]) {
    setError("");
    setEditor(date);
    setFormDate(date);
    setDraft(
      data.entries[date] ?? {
        status: status ?? "coffee",
        cups: status === "free" ? 0 : 1,
        kind: 0,
        note: "",
      },
    );
  }
  function saveEntry(e: FormEvent) {
    e.preventDefault();
    if (!validDate(formDate) || formDate > today) {
      setError(
        t("请选择今天或过去的有效日期。", "Choose today or a valid past date."),
      );
      return;
    }
    if (
      draft.status === "coffee" &&
      (!Number.isInteger(draft.cups) || draft.cups < 1 || draft.cups > 20)
    ) {
      setError(
        t(
          "杯数请输入 1 到 20 的整数。",
          "Enter a whole number from 1 to 20 cups.",
        ),
      );
      return;
    }
    const entries = {
      ...data.entries,
      [formDate]: { ...draft, cups: draft.status === "free" ? 0 : draft.cups },
    };
    if (persist({ ...data, entries })) {
      setEditor(null);
      setToast(t("记录已保存，慢慢来就好。", "Saved. One day at a time."));
    }
  }
  function markFree() {
    if (data.entries[today]) {
      openEntry(today);
      return;
    }
    if (
      persist({
        ...data,
        entries: {
          ...data.entries,
          [today]: { status: "free", cups: 0, kind: 0, note: "" },
        },
      })
    )
      setToast(
        t("今天没喝，已为你记下。", "Your coffee-free day is recorded."),
      );
  }
  const week = weekly(data.entries, monday(now)),
    recent = Object.keys(data.entries).sort().reverse(),
    current = data.entries[today];
  const locale = en ? "en-US" : "zh-CN";
  const fullDate = (date: string) =>
    parseDate(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  function exportRecords() {
    const blob = new Blob([JSON.stringify({ version: 1, ...data }, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `coffee-day-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const startOffset = (month.getDay() + 6) % 7,
    daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = shift(monday(now), (i - 3) * 7);
    return { start, ...weekly(data.entries, start) };
  });
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        {t("跳到主要内容", "Skip to content")}
      </a>
      <header className="site-header">
        <a href="#today" className="brand">
          <Coffee strokeWidth={1.35} />
          <span>
            Coffee Day
            <span className="brand-note">A LITTLE LESS, AT YOUR PACE</span>
          </span>
        </a>
        <nav aria-label={t("主导航", "Main navigation")}>
          {routes.map((r, i) => (
            <a
              key={r}
              href={`#${r}`}
              aria-current={route === r ? "page" : undefined}
            >
              {
                [
                  ["今日", "Today"],
                  ["记录与趋势", "Journal"],
                  ["减量计划", "My plan"],
                ][i][en ? 1 : 0]
              }
            </a>
          ))}
        </nav>
        <div className="languages" aria-label="Language">
          <button
            className={!en ? "active" : ""}
            onClick={() => setEn(false)}
            lang="zh"
          >
            中文
          </button>
          <span />
          <button
            className={en ? "active" : ""}
            onClick={() => setEn(true)}
            lang="en"
          >
            EN
          </button>
        </div>
      </header>
      <main id="main" className={`view-${route}`}>
        {route === "today" && (
          <>
            <section className="hero">
              <CoffeeAnimation en={en} />
              <div className="hero-copy">
                <p className="eyebrow">{fullDate(today)}</p>
                <span className="tiny-rule" />
                <h1>
                  {t("今天，少喝一点", "A little less coffee,")}
                  <br />
                  {t("也很好。", "a little more you.")}
                </h1>
                <p className="hero-description">
                  {t(
                    "按自己的节奏，慢慢减少。",
                    "Small changes. At your own pace.",
                  )}
                </p>
                <div className="hero-actions">
                  <Button className="primary-action" onClick={markFree}>
                    <CircleCheck />
                    {current
                      ? t("修改今日记录", "Edit today’s entry")
                      : t("今天没喝", "No coffee today")}
                  </Button>
                  <Button
                    variant="outline"
                    className="secondary-action"
                    onClick={() => openEntry(today, "coffee")}
                  >
                    <Pencil />
                    {t("喝了，记一下", "Had coffee? Log it")}
                  </Button>
                </div>
                <p className="today-status">
                  {current
                    ? current.status === "free"
                      ? t("今天已记录：没喝咖啡", "Recorded: a coffee-free day")
                      : t(
                          `今天已记录：${current.cups} 杯${coffees[current.kind][0]}`,
                          `Recorded: ${current.cups} cup(s) of ${coffees[current.kind][1]}`,
                        )
                    : t(
                        "今天尚未记录 · 如实记录，比完美更重要",
                        "Not recorded yet · Honesty over perfection",
                      )}
                </p>
              </div>
              <div className="hero-caption">SLOW DOWN. SAVOR THE EVERYDAY.</div>
            </section>
            <section className="week-strip">
              <div>
                <CalendarDays />
                <span>{t("本周已记录未喝", "Coffee-free this week")}</span>
                <strong>{week.free}</strong>
                <small>{t("天", "days")}</small>
              </div>
              <div>
                <Coffee />
                <span>{t("本周目标上限", "Weekly goal")}</span>
                <strong>{data.plan.limit}</strong>
                <small>{t("杯", "cups")}</small>
              </div>
              <a href="#journal">
                {t("查看我的记录", "Explore my journal")}
                <ArrowRight />
              </a>
            </section>
            <section className="today-bottom">
              <div>
                <span className="section-kicker">01 / YOUR OWN RHYTHM</span>
                <h2>
                  {t("每个小选择，都算数。", "Every small choice counts.")}
                </h2>
                <p>
                  {t(
                    "没有打卡压力。今天喝了也没关系，记下来，明天继续。",
                    "No perfect streaks to keep. Had a coffee? Log it, and keep going.",
                  )}
                </p>
              </div>
              <a className="plan-link" href="#plan">
                <span>
                  {t("为自己定一个小目标", "Make a little room for change")}
                  <small>
                    {t("设置我的减量计划", "Create your personal plan")}
                  </small>
                </span>
                <ArrowUpRight />
              </a>
            </section>
          </>
        )}
        {route === "journal" && (
          <section className="page-content">
            <div className="page-heading">
              <span className="section-kicker">02 / THE LITTLE CHANGES</span>
              <h1>{t("看看，最近的变化。", "Look how far you’ve come.")}</h1>
              <p>
                {t(
                  "每一次记录，都是了解自己的一小步。",
                  "Every entry is a little step toward understanding yourself.",
                )}
              </p>
            </div>
            <div className="journal-grid">
              <section className="panel calendar-panel">
                <div className="panel-heading">
                  <h2>{t("我的咖啡日历", "My coffee calendar")}</h2>
                  <CalendarDays />
                </div>
                <div className="month-switch">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("上个月", "Previous month")}
                    onClick={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <h3>
                    {month.toLocaleDateString(locale, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("下个月", "Next month")}
                    disabled={dateKey(month).slice(0, 7) >= today.slice(0, 7)}
                    onClick={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
                <div className="calendar-grid">
                  {dayNames.map((d) => (
                    <span className="weekday" key={d[1]}>
                      {d[en ? 1 : 0]}
                    </span>
                  ))}
                  {Array.from({ length: startOffset }, (_, i) => (
                    <span key={`empty${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const key = dateKey(
                        new Date(month.getFullYear(), month.getMonth(), i + 1),
                      ),
                      entry = data.entries[key];
                    return (
                      <button
                        key={key}
                        disabled={key > today}
                        className={`calendar-day ${entry?.status ?? ""} ${key === today ? "is-today" : ""}`}
                        aria-label={`${key} ${entry ? (entry.status === "free" ? t("没喝", "No coffee") : t(`${entry.cups} 杯`, ` ${entry.cups} cups`)) : t("未记录", "Not recorded")}`}
                        onClick={() => openEntry(key)}
                      >
                        <span>{i + 1}</span>
                        {entry?.status === "free" ? (
                          <Check />
                        ) : entry?.status === "coffee" ? (
                          <i />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="legend">
                  <span>
                    <Check />
                    {t("没喝", "No coffee")}
                  </span>
                  <span>
                    <i />
                    {t("喝了", "Had coffee")}
                  </span>
                  <span>
                    <b />
                    {t("未记录", "Not recorded")}
                  </span>
                </div>
                <p className="panel-hint">
                  {t(
                    "点击日期补记或修改 · 未来日期不可记录",
                    "Select a date to add or edit · Future dates are disabled",
                  )}
                </p>
              </section>
              <div className="journal-right">
                <section className="panel chart-panel">
                  <div className="panel-heading">
                    <h2>{t("每周记录杯数", "Weekly cups")}</h2>
                    <span>{t("近四周", "Last 4 weeks")}</span>
                  </div>
                  <div
                    className="chart"
                    role="img"
                    aria-label={weeks
                      .map(
                        (w) =>
                          `${dateKey(w.start)}: ${w.cups} ${t("杯", "cups")}, ${w.logged} ${t("天已记录", "days recorded")}`,
                      )
                      .join("; ")}
                  >
                    {weeks.map((w, i) => (
                      <div className="chart-column" key={i}>
                        <div className="bar-area">
                          <strong>{w.logged ? w.cups : "—"}</strong>
                          <div
                            className={`bar ${i === 3 ? "current" : ""}`}
                            style={{
                              height: `${w.logged ? Math.max(4, (w.cups / Math.max(...weeks.map((v) => v.cups), 1)) * 130) : 2}px`,
                            }}
                          />
                        </div>
                        <span>
                          {w.start.toLocaleDateString(locale, {
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>
                        <small>
                          {t(`${w.logged} 天已记录`, `${w.logged} days logged`)}
                        </small>
                      </div>
                    ))}
                  </div>
                  <p className="panel-hint">
                    {t(
                      "仅统计已记录的数据；未记录不等于没喝。本周尚未结束。",
                      "Recorded entries only. Missing days are not coffee-free. This week is ongoing.",
                    )}
                  </p>
                </section>
                <section className="panel recent-panel">
                  <div className="panel-heading">
                    <h2>{t("最近记录", "Recent entries")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("导出记录", "Export records")}
                      onClick={exportRecords}
                    >
                      <Download />
                    </Button>
                  </div>
                  {recent.length === 0 ? (
                    <div className="empty-state">
                      <Coffee />
                      <p>
                        {t(
                          "你的故事，从第一条记录开始。",
                          "Your story begins with your first entry.",
                        )}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => openEntry(today)}
                      >
                        {t("添加记录", "Add an entry")}
                      </Button>
                    </div>
                  ) : (
                    recent
                      .slice(
                        Math.min(
                          recentPage,
                          Math.max(0, Math.ceil(recent.length / 3) - 1),
                        ) * 3,
                        (Math.min(
                          recentPage,
                          Math.max(0, Math.ceil(recent.length / 3) - 1),
                        ) +
                          1) *
                          3,
                      )
                      .map((key) => (
                        <button
                          className="entry-row"
                          key={key}
                          onClick={() => openEntry(key)}
                        >
                          <time>
                            {parseDate(key).toLocaleDateString(locale, {
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                          <span>
                            {data.entries[key].status === "free"
                              ? t("今天没喝", "No coffee")
                              : t(
                                  `${coffees[data.entries[key].kind][0]} · ${data.entries[key].cups} 杯`,
                                  `${coffees[data.entries[key].kind][1]} · ${data.entries[key].cups} cup(s)`,
                                )}
                          </span>
                          <Pencil />
                        </button>
                      ))
                  )}
                  {recent.length > 3 && (
                    <div className="recent-pagination">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("上一页记录", "Previous entries")}
                        disabled={recentPage === 0}
                        onClick={() => setRecentPage((p) => Math.max(0, p - 1))}
                      >
                        <ChevronLeft />
                      </Button>
                      <span>
                        {Math.min(recentPage + 1, Math.ceil(recent.length / 3))}{" "}
                        / {Math.ceil(recent.length / 3)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("下一页记录", "Next entries")}
                        disabled={
                          recentPage >= Math.ceil(recent.length / 3) - 1
                        }
                        onClick={() => setRecentPage((p) => p + 1)}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </section>
        )}
        {route === "plan" && (
          <section className="page-content">
            <div className="page-heading">
              <span className="section-kicker">03 / A GENTLER ROUTINE</span>
              <h1>{t("把节奏，交还给自己。", "Find a rhythm of your own.")}</h1>
              <p>
                {t(
                  "目标可以调整，每一次尝试都值得被记下。",
                  "Goals can change. Every little effort still counts.",
                )}
              </p>
            </div>
            <div className="plan-grid">
              <div className="plan-photo">
                <img
                  src={`${import.meta.env.BASE_URL}images/quiet-moment.jpg`}
                  alt={t(
                    "阳光下的笔记本和一杯水",
                    "A notebook and a glass of water in the sunlight",
                  )}
                />
                <div>
                  <span>A MOMENT FOR YOURSELF</span>
                  <h2>
                    {t("慢慢来，", "Take your time.")}
                    <br />
                    {t("也是一种进步。", "That’s progress, too.")}
                  </h2>
                </div>
              </div>
              <form
                className="plan-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    !Number.isInteger(plan.limit) ||
                    plan.limit < 0 ||
                    plan.limit > 50
                  ) {
                    setError(
                      t(
                        "目标请输入 0 到 50 的整数。",
                        "Choose a whole number from 0 to 50.",
                      ),
                    );
                    return;
                  }
                  if (persist({ ...data, plan })) {
                    setSaved(true);
                    setToast(
                      t(
                        "计划已保存。按自己的节奏来。",
                        "Plan saved. Go at your own pace.",
                      ),
                    );
                  }
                }}
              >
                <h2>{t("我的减量计划", "My personal plan")}</h2>
                <label>
                  {t("每周目标上限", "Weekly cup limit")}
                  <div className="stepper">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("减少目标", "Decrease goal")}
                      disabled={plan.limit <= 0}
                      onClick={() => {
                        setPlan({ ...plan, limit: plan.limit - 1 });
                        setSaved(false);
                      }}
                    >
                      <Minus />
                    </Button>
                    <Input
                      aria-label={t("目标杯数", "Target cups")}
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={Number.isNaN(plan.limit) ? "" : plan.limit}
                      onChange={(e) => {
                        setPlan({ ...plan, limit: e.target.valueAsNumber });
                        setSaved(false);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("增加目标", "Increase goal")}
                      disabled={plan.limit >= 50}
                      onClick={() => {
                        setPlan({ ...plan, limit: plan.limit + 1 });
                        setSaved(false);
                      }}
                    >
                      <Plus />
                    </Button>
                    <span>{t("杯", "cups")}</span>
                  </div>
                  <small>
                    {t(
                      "由你自己设定，随时可以调整。",
                      "Your goal, your choice. Adjust it anytime.",
                    )}
                  </small>
                </label>
                <label htmlFor="reason">
                  {t("想少喝的原因", "My reason for cutting back")}
                </label>
                <Textarea
                  id="reason"
                  value={plan.reason}
                  maxLength={300}
                  placeholder={t(
                    "写给自己的一句话……",
                    "A little note to yourself…",
                  )}
                  onChange={(e) => {
                    setPlan({ ...plan, reason: e.target.value });
                    setSaved(false);
                  }}
                />
                <fieldset>
                  <legend>
                    {t("计划不喝的日子", "Planned coffee-free days")}
                  </legend>
                  <div className="day-toggles">
                    {dayNames.map((d, i) => (
                      <Button
                        type="button"
                        key={i}
                        variant={plan.days.includes(i) ? "default" : "outline"}
                        aria-pressed={plan.days.includes(i)}
                        onClick={() => {
                          setPlan({
                            ...plan,
                            days: plan.days.includes(i)
                              ? plan.days.filter((x) => x !== i)
                              : [...plan.days, i],
                          });
                          setSaved(false);
                        }}
                      >
                        {d[en ? 1 : 0]}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <Button type="submit" className="save-plan">
                  <Check />
                  {saved ? t("已保存", "Saved") : t("保存计划", "Save my plan")}
                </Button>
                <div className="alternatives">
                  <p>
                    {t(
                      "想喝咖啡时，也可以试试",
                      "When you want a coffee, try a little pause",
                    )}
                  </p>
                  <div>
                    {[
                      [GlassWater, t("喝点水", "Drink water")],
                      [Footprints, t("走一走", "Take a walk")],
                      [Leaf, t("休息片刻", "Take a break")],
                    ].map(([Icon, label], i) => {
                      const I = Icon as typeof GlassWater;
                      return (
                        <span key={i}>
                          <I />
                          {label as string}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
      <footer>
        <span className="footer-brand">
          <Coffee />
          Coffee Day <i>·</i>{" "}
          {t("少一点，也很好。", "A little less is enough.")}
        </span>
        <span>
          <LockKeyhole />
          {t("记录仅保存在此浏览器", "Saved only in this browser")}
        </span>
        <button onClick={exportRecords}>
          {t("导出记录", "Export records")}
          <Download />
        </button>
      </footer>
      {error && !editor && (
        <div className="error-banner" role="alert">
          {error}
          <button
            aria-label={t("关闭", "Dismiss")}
            onClick={() => setError("")}
          >
            <X />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CircleCheck />
          {toast}
        </div>
      )}
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open) {
            setEditor(null);
            setError("");
          }
        }}
      >
        <DialogContent className="entry-dialog" closeLabel={t("关闭", "Close")}>
          <DialogHeader>
            <DialogTitle>
              {t("留下一天的记录", "A little note for today")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "喝了或没喝，都值得如实记录。保存会更新所选日期的记录。",
                "Coffee or no coffee, just be honest. Saving updates the selected date.",
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEntry}>
            <label htmlFor="entry-date">{t("日期", "Date")}</label>
            <Input
              id="entry-date"
              type="date"
              value={formDate}
              max={today}
              required
              onChange={(e) => {
                setFormDate(e.target.value);
                const entry = data.entries[e.target.value];
                if (entry) setDraft(entry);
              }}
            />
            <div className="status-options">
              <Button
                type="button"
                variant={draft.status === "free" ? "default" : "outline"}
                onClick={() => setDraft({ ...draft, status: "free", cups: 0 })}
              >
                <Check />
                {t("没喝咖啡", "No coffee")}
              </Button>
              <Button
                type="button"
                variant={draft.status === "coffee" ? "default" : "outline"}
                onClick={() =>
                  setDraft({
                    ...draft,
                    status: "coffee",
                    cups: Math.max(1, draft.cups),
                  })
                }
              >
                <Coffee />
                {t("喝了咖啡", "Had coffee")}
              </Button>
            </div>
            {draft.status === "coffee" && (
              <div className="coffee-fields">
                <label htmlFor="kind">
                  {t("咖啡种类", "Coffee type")}
                  <select
                    id="kind"
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft({ ...draft, kind: Number(e.target.value) })
                    }
                  >
                    {coffees.map((c, i) => (
                      <option value={i} key={i}>
                        {c[en ? 1 : 0]}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="cups">
                  {t("杯数", "Cups")}
                  <Input
                    id="cups"
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={Number.isNaN(draft.cups) ? "" : draft.cups}
                    onChange={(e) =>
                      setDraft({ ...draft, cups: e.target.valueAsNumber })
                    }
                  />
                </label>
              </div>
            )}
            <label htmlFor="note">
              {t("给自己的一句话（可选）", "A note to yourself (optional)")}
            </label>
            <Textarea
              id="note"
              value={draft.note}
              maxLength={500}
              placeholder={t("今天感觉怎么样？", "How did today feel?")}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              {data.entries[formDate] && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const entries = { ...data.entries };
                    delete entries[formDate];
                    if (persist({ ...data, entries })) {
                      setEditor(null);
                      setToast(t("已恢复为未记录", "Reset to not recorded"));
                    }
                  }}
                >
                  {t("恢复未记录", "Reset entry")}
                </Button>
              )}
              <Button type="submit">
                <Check />
                {t("保存记录", "Save entry")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
