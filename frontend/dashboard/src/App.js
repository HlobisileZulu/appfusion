import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

// ── Static chart data based on your real MySQL data
const RATING_DATA = [
  { rating: "1★", count: 16, fill: "#FF3CAC" },
  { rating: "2★", count: 2,  fill: "#C4188C" },
  { rating: "3★", count: 2,  fill: "#9B59B6" },
  { rating: "4★", count: 6,  fill: "#7B2FBE" },
  { rating: "5★", count: 24, fill: "#560BAD" },
];

const PIE_DATA = [
  { name: "Positive (4-5★)", value: 30 },
  { name: "Negative (1-2★)", value: 18 },
  { name: "Neutral (3★)",    value: 2  },
];

const PIE_COLORS = ["#560BAD", "#FF3CAC", "#9B59B6"];

// ── Styles
const styles = {
  page: {
    minHeight: "100vh",
    background: "#07050F",
    color: "#F5F0FF",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb: (top, left, color, size) => ({
    position: "fixed",
    top, left,
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    filter: "blur(100px)",
    opacity: 0.25,
    pointerEvents: "none",
    zIndex: 0,
  }),
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1080,
    margin: "0 auto",
    padding: "0 24px 80px",
  },
  glass: {
    background: "rgba(255,255,255,0.045)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 0 48px",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1.3rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #FF3CAC, #B5A4F5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  badge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "7px 18px",
    borderRadius: 100,
    background: "rgba(196,24,140,0.15)",
    border: "1px solid rgba(196,24,140,0.32)",
    color: "#F0A0D8",
  },
  heroTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 800,
    letterSpacing: "-2px",
    lineHeight: 1.05,
    background: "linear-gradient(165deg, #fff 20%, rgba(255,255,255,0.42))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 16,
  },
  heroSub: {
    color: "rgba(245,240,255,0.5)",
    fontSize: "1rem",
    fontWeight: 300,
    lineHeight: 1.7,
    maxWidth: 520,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: "#B5A4F5",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    letterSpacing: "-0.8px",
    marginBottom: 6,
  },
  sectionSub: {
    color: "rgba(245,240,255,0.48)",
    fontSize: "0.9rem",
    marginBottom: 32,
    fontWeight: 300,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 48,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
    marginBottom: 32,
  },
  card: {
    padding: "28px",
    background: "rgba(255,255,255,0.045)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
  },
  chip: (bg, border, color) => ({
    display: "inline-block",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    padding: "4px 13px",
    borderRadius: 100,
    background: bg,
    border: `1px solid ${border}`,
    color: color,
    marginBottom: 12,
  }),
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: 8,
  },
  cardText: {
    fontSize: "0.85rem",
    color: "rgba(245,240,255,0.5)",
    lineHeight: 1.65,
  },
  barOuter: {
    height: 6,
    borderRadius: 6,
    background: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginTop: 10,
  },
  verdictBox: {
    padding: "36px 40px",
    background: "rgba(86,11,173,0.12)",
    border: "1px solid rgba(86,11,173,0.28)",
    borderRadius: 20,
    backdropFilter: "blur(26px)",
    WebkitBackdropFilter: "blur(26px)",
    marginBottom: 48,
  },
  tab: (active) => ({
    padding: "10px 24px",
    borderRadius: 100,
    border: active
      ? "1px solid rgba(255,60,172,0.4)"
      : "1px solid rgba(255,255,255,0.09)",
    background: active
      ? "rgba(255,60,172,0.15)"
      : "rgba(255,255,255,0.04)",
    color: active ? "#FF3CAC" : "rgba(245,240,255,0.5)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  }),
};

// ── Pain bar component
function PainBar({ score }) {
  return (
    <div style={styles.barOuter}>
      <div style={{
        height: "100%",
        width: `${score * 10}%`,
        background: "linear-gradient(90deg, #FF3CAC, #7B2FBE)",
        borderRadius: 6,
        transition: "width 1s ease",
      }} />
    </div>
  );
}

// ── Sentiment badge component
function SentimentBadge({ sentiment }) {
  const map = {
    positive: {
      bg: "rgba(0,194,100,0.15)",
      border: "rgba(0,194,100,0.3)",
      color: "#6EFFA0"
    },
    negative: {
      bg: "rgba(255,60,60,0.15)",
      border: "rgba(255,60,60,0.3)",
      color: "#FF9090"
    },
    mixed: {
      bg: "rgba(255,60,172,0.15)",
      border: "rgba(255,60,172,0.3)",
      color: "#FF99D6"
    },
  };
  const s = map[sentiment?.toLowerCase()] || map.mixed;
  return (
    <span style={styles.chip(s.bg, s.border, s.color)}>
      {sentiment}
    </span>
  );
}

// ── Main App
export default function App() {
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/Evernote_ai_report.json")
      .then(r => r.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Ambient background orbs */}
      <div style={styles.orb("-200px", "-150px", "#7B2FBE", "700px")} />
      <div style={styles.orb("20%", "auto", "#FF3CAC", "500px")} />
      <div style={styles.orb("auto", "15%", "#480CA8", "600px")} />

      <div style={styles.content}>

        {/* NAV */}
        <nav style={styles.nav}>
          <div style={styles.logo}>AppFusion</div>
          <div style={styles.badge}>App Intelligence Toolkit</div>
        </nav>

        {/* HERO */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            fontSize: "0.76rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#FF3CAC",
            fontWeight: 600,
            marginBottom: 20,
          }}>
            App Store Analysis · Powered by Groq AI
          </div>
          <h1 style={styles.heroTitle}>
            Evernote<br />
            <span style={{
              background: "linear-gradient(130deg, #FF3CAC, #7B2FBE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Intelligence Report
            </span>
          </h1>
          <p style={styles.heroSub}>
            Real App Store reviews analysed by AI to produce a full
            intelligence report — complaints, delights, feature
            backlog, and a 90-day improvement plan.
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["overview", "complaints", "delights", "backlog", "90-day plan"].map(tab => (
              <button
                key={tab}
                style={styles.tab(activeTab === tab)}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div style={{
            textAlign: "center",
            color: "rgba(245,240,255,0.4)",
            padding: 60
          }}>
            Loading report...
          </div>
        )}

        {!loading && report && (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <>
                {/* Stats row */}
                <div style={styles.grid3}>
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>Sentiment</div>
                    <SentimentBadge sentiment={report.overall_sentiment} />
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      fontFamily: "Syne"
                    }}>
                      {report.average_sentiment_score}
                      <span style={{
                        fontSize: "1rem",
                        color: "rgba(245,240,255,0.4)"
                      }}>/5.0</span>
                    </div>
                  </div>
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>Total Reviews</div>
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      fontFamily: "Syne"
                    }}>50</div>
                    <div style={styles.cardText}>
                      Evernote · US App Store
                    </div>
                  </div>
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>Polarisation</div>
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      fontFamily: "Syne"
                    }}>80%</div>
                    <div style={styles.cardText}>
                      Strong love/hate split
                    </div>
                  </div>
                </div>

                {/* Charts row */}
                <div style={styles.grid2}>
                  {/* Rating distribution bar chart */}
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>
                      Rating Distribution
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={RATING_DATA}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.06)"
                        />
                        <XAxis
                          dataKey="rating"
                          stroke="rgba(245,240,255,0.4)"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="rgba(245,240,255,0.4)"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0D0A1A",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            color: "#F5F0FF",
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {RATING_DATA.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Positive vs Negative pie chart */}
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>
                      Positive vs Negative
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={PIE_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {PIE_DATA.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#0D0A1A",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            color: "#F5F0FF",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      display: "flex",
                      gap: 16,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}>
                      {PIE_DATA.map((item, i) => (
                        <div key={i} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.75rem",
                          color: "rgba(245,240,255,0.5)",
                        }}>
                          <div style={{
                            width: 10, height: 10,
                            borderRadius: "50%",
                            background: PIE_COLORS[i],
                          }} />
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* App Intelligence Verdict */}
                <div style={styles.verdictBox}>
                  <div style={styles.sectionLabel}>
                    🎯 App Intelligence Verdict
                  </div>
                  <p style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.75,
                    color: "rgba(245,240,255,0.82)",
                    fontStyle: "italic",
                  }}>
                    "{report.acquisition_verdict}"
                  </p>
                </div>
              </>
            )}

            {/* ── COMPLAINTS TAB ── */}
            {activeTab === "complaints" && (
              <div style={{ marginBottom: 48 }}>
                <div style={styles.sectionLabel}>Top Complaints</div>
                <div style={styles.sectionTitle}>
                  What's hurting the app
                </div>
                <div style={styles.sectionSub}>
                  Ranked by user pain score from AI analysis
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                  {report.top_complaints.map((item, i) => (
                    <div key={i} style={styles.card}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10,
                      }}>
                        <div>
                          <span style={styles.chip(
                            "rgba(255,60,172,0.14)",
                            "rgba(255,60,172,0.28)",
                            "#FF99D6"
                          )}>
                            #{i + 1} Complaint
                          </span>
                          <div style={styles.cardTitle}>
                            {item.theme}
                          </div>
                          <div style={styles.cardText}>
                            {item.description}
                          </div>
                        </div>
                        <div style={{
                          textAlign: "right",
                          flexShrink: 0,
                          marginLeft: 20,
                        }}>
                          <div style={{
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            fontFamily: "Syne",
                            color: "#FF3CAC",
                          }}>
                            {item.pain_score}
                          </div>
                          <div style={{
                            fontSize: "0.7rem",
                            color: "rgba(245,240,255,0.4)",
                          }}>/ 10</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: "0.78rem",
                        color: "rgba(245,240,255,0.4)",
                        marginBottom: 8,
                      }}>
                        Frequency: {item.frequency}
                      </div>
                      <PainBar score={item.pain_score} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DELIGHTS TAB ── */}
            {activeTab === "delights" && (
              <div style={{ marginBottom: 48 }}>
                <div style={styles.sectionLabel}>Top Delights</div>
                <div style={styles.sectionTitle}>
                  What users love
                </div>
                <div style={styles.sectionSub}>
                  The strengths to preserve and build on
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                  {report.top_delights.map((item, i) => (
                    <div key={i} style={styles.card}>
                      <span style={styles.chip(
                        "rgba(0,194,100,0.14)",
                        "rgba(0,194,100,0.28)",
                        "#6EFFA0"
                      )}>
                        #{i + 1} Delight
                      </span>
                      <div style={styles.cardTitle}>{item.theme}</div>
                      <div style={styles.cardText}>
                        {item.description}
                      </div>
                      <div style={{
                        fontSize: "0.78rem",
                        color: "rgba(245,240,255,0.4)",
                        marginTop: 10,
                      }}>
                        Frequency: {item.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BACKLOG TAB ── */}
            {activeTab === "backlog" && (
              <div style={{ marginBottom: 48 }}>
                <div style={styles.sectionLabel}>Feature Backlog</div>
                <div style={styles.sectionTitle}>
                  Prioritised by user pain
                </div>
                <div style={styles.sectionSub}>
                  What to build first to improve this app
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                  {report.feature_backlog.map((item, i) => {
                    const priorityStyle = {
                      High: {
                        bg: "rgba(255,60,60,0.14)",
                        border: "rgba(255,60,60,0.28)",
                        color: "#FF9090",
                      },
                      Medium: {
                        bg: "rgba(255,200,0,0.14)",
                        border: "rgba(255,200,0,0.28)",
                        color: "#FFE066",
                      },
                      Low: {
                        bg: "rgba(0,194,100,0.14)",
                        border: "rgba(0,194,100,0.28)",
                        color: "#6EFFA0",
                      },
                    }[item.priority] || {};
                    return (
                      <div key={i} style={styles.card}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}>
                          <div style={{ flex: 1 }}>
                            <span style={styles.chip(
                              priorityStyle.bg,
                              priorityStyle.border,
                              priorityStyle.color
                            )}>
                              {item.priority} Priority
                            </span>
                            <div style={styles.cardTitle}>
                              {item.feature}
                            </div>
                            <div style={styles.cardText}>
                              {item.reason}
                            </div>
                          </div>
                          <div style={{
                            textAlign: "right",
                            marginLeft: 20,
                            flexShrink: 0,
                          }}>
                            <div style={{
                              fontSize: "1.8rem",
                              fontWeight: 800,
                              fontFamily: "Syne",
                              color: "#B5A4F5",
                            }}>
                              {item.pain_score}
                            </div>
                            <div style={{
                              fontSize: "0.7rem",
                              color: "rgba(245,240,255,0.4)",
                            }}>pain score</div>
                          </div>
                        </div>
                        <PainBar score={item.pain_score} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 90 DAY PLAN TAB ── */}
            {activeTab === "90-day plan" && (
              <div style={{ marginBottom: 48 }}>
                <div style={styles.sectionLabel}>Action Plan</div>
                <div style={styles.sectionTitle}>
                  90-Day Improvement Roadmap
                </div>
                <div style={styles.sectionSub}>
                  A prioritised plan based on real user feedback
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                  {report.ninety_day_action_plan.map((phase, i) => {
                    const colors = ["#FF3CAC", "#7B2FBE", "#B5A4F5"];
                    return (
                      <div key={i} style={styles.card}>
                        <div style={{
                          display: "flex",
                          gap: 20,
                          alignItems: "flex-start",
                        }}>
                          <div style={{
                            width: 48, height: 48,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: i === 0
                              ? "rgba(255,60,172,0.18)"
                              : i === 1
                              ? "rgba(123,47,190,0.18)"
                              : "rgba(181,164,245,0.18)",
                            border: `1px solid ${colors[i]}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Syne",
                            fontWeight: 800,
                            color: colors[i],
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: colors[i],
                              fontWeight: 700,
                              marginBottom: 4,
                            }}>
                              {phase.day_range}
                            </div>
                            <div style={styles.cardTitle}>
                              {phase.focus}
                            </div>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              marginTop: 12,
                            }}>
                              {phase.actions.map((action, j) => (
                                <div key={j} style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                }}>
                                  <div style={{
                                    color: colors[i],
                                    flexShrink: 0,
                                    marginTop: 2,
                                  }}>→</div>
                                  <div style={styles.cardText}>
                                    {action}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          padding: "40px 0 10px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(245,240,255,0.3)",
          fontSize: "0.78rem",
        }}>
          <p>
            AppFusion · App Intelligence Toolkit · Open Source 
          </p>
          <p style={{ marginTop: 8, opacity: 0.5, fontSize: "0.71rem" }}>
            Drop in any app. Get back a full intelligence report.
          </p>
        </footer>

      </div>
    </div>
  );
}