import mysql.connector
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
from dotenv import load_dotenv

# ── Load environment variables
load_dotenv()

# ── Load reviews from database (password-safe version)
def load_reviews(app_name):
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password=os.getenv("DB_PASSWORD"),
        database="appfusion"
    )

    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT app_name, rating, review_text, review_date, author
        FROM reviews
        WHERE app_name = %s
        ORDER BY review_date ASC
    """

    cursor.execute(query, (app_name,))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    df = pd.DataFrame(rows)
    print(f"Loaded {len(df)} reviews for {app_name}")
    return df

# ── Calculate rating breakdown
def rating_breakdown(df, app_name):
    total = len(df)
    one_stars = len(df[df["rating"] == 1])
    five_stars = len(df[df["rating"] == 5])
    avg_rating = df["rating"].mean()

    print(f"\n── {app_name} Rating Breakdown ──")
    print(f"Total reviews   : {total}")
    print(f"Average rating  : {avg_rating:.2f} / 5.00")
    print(f"1-star reviews  : {one_stars} ({one_stars/total*100:.1f}%)")
    print(f"5-star reviews  : {five_stars} ({five_stars/total*100:.1f}%)")

    polarisation = ((one_stars + five_stars) / total) * 100
    print(f"Polarisation    : {polarisation:.1f}%")

    if polarisation >= 60:
        print(f"⚠️  HIGH polarisation — strong love/hate split")
    elif polarisation >= 40:
        print(f"⚡ MEDIUM polarisation — some division among users")
    else:
        print(f"✅ LOW polarisation — users are mostly aligned")

    return df.groupby("rating").size().reset_index(name="count")

# ── Paywall friction score
def paywall_friction_score(df, app_name):
    paywall_keywords = [
        "subscription", "pay", "paid", "free", "cost", "expensive",
        "price", "money", "charge", "premium", "locked", "purchase",
        "fee", "worth", "cheap", "afford", "used to be free"
    ]

    one_star_reviews = df[df["rating"] == 1]["review_text"].str.lower()
    total_one_stars = len(one_star_reviews)
    paywall_mentions = 0

    for review in one_star_reviews:
        if any(keyword in review for keyword in paywall_keywords):
            paywall_mentions += 1

    if total_one_stars > 0:
        friction_score = (paywall_mentions / total_one_stars) * 100
    else:
        friction_score = 0

    print(f"\n── {app_name} Paywall Friction ──")
    print(f"1-star reviews checked  : {total_one_stars}")
    print(f"Mention pricing/paywalls: {paywall_mentions}")
    print(f"Paywall friction score  : {friction_score:.1f}%")

    if friction_score >= 50:
        print(f"⚠️  HIGH friction — pricing is a major complaint")
    elif friction_score >= 25:
        print(f"⚡ MEDIUM friction — pricing mentioned but not dominant")
    else:
        print(f"✅ LOW friction — pricing rarely mentioned")

    return friction_score

# ── Retention curve
def retention_curve(df, app_name):
    df["review_date"] = pd.to_datetime(df["review_date"])
    df_sorted = df.sort_values("review_date")

    df_sorted = df_sorted.copy()
    df_sorted["rolling_avg"] = df_sorted["rating"].rolling(
        window=5, min_periods=1
    ).mean()

    print(f"\n── {app_name} Rating Trend ──")
    print(f"Earliest review : {df_sorted['review_date'].min().date()}")
    print(f"Latest review   : {df_sorted['review_date'].max().date()}")
    print(f"Starting avg    : {df_sorted['rolling_avg'].iloc[0]:.2f}")
    print(f"Ending avg      : {df_sorted['rolling_avg'].iloc[-1]:.2f}")

    trend = df_sorted["rolling_avg"].iloc[-1] - df_sorted["rolling_avg"].iloc[0]
    if trend < -0.5:
        print(f"📉 DECLINING — rating dropped {abs(trend):.2f} points over time")
    elif trend > 0.5:
        print(f"📈 IMPROVING — rating rose {trend:.2f} points over time")
    else:
        print(f"➡️  STABLE — rating relatively flat over time")

    return df_sorted

# ── Generate charts
def generate_charts(df, app_name):
    df["review_date"] = pd.to_datetime(df["review_date"])
    df_sorted = df.sort_values("review_date").copy()
    df_sorted["rolling_avg"] = df_sorted["rating"].rolling(
        window=5, min_periods=1
    ).mean()

    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=(
            f"{app_name} — Rating Distribution",
            f"{app_name} — Rating Trend Over Time",
            f"{app_name} — Review Volume Over Time",
            f"{app_name} — Positive vs Negative"
        ),
        specs=[
            [{"type": "bar"}, {"type": "scatter"}],
            [{"type": "bar"}, {"type": "pie"}]
        ]
    )

    # Chart 1 — Rating distribution
    rating_counts = df.groupby("rating").size().reset_index(name="count")
    colors = ["#FF3CAC", "#C4188C", "#9B59B6", "#7B2FBE", "#560BAD"]

    fig.add_trace(
        go.Bar(
            x=rating_counts["rating"],
            y=rating_counts["count"],
            marker_color=colors,
            name="Rating Count",
            showlegend=False
        ),
        row=1, col=1
    )

    # Chart 2 — Rolling average over time
    fig.add_trace(
        go.Scatter(
            x=df_sorted["review_date"],
            y=df_sorted["rolling_avg"],
            mode="lines",
            line=dict(color="#FF3CAC", width=3),
            name="Rolling Avg",
            showlegend=False
        ),
        row=1, col=2
    )

    # Chart 3 — Monthly review volume
    df_sorted["month"] = df_sorted["review_date"].dt.to_period("M").astype(str)
    monthly = df_sorted.groupby("month").size().reset_index(name="count")

    fig.add_trace(
        go.Bar(
            x=monthly["month"],
            y=monthly["count"],
            marker_color="#7B2FBE",
            name="Monthly Volume",
            showlegend=False
        ),
        row=2, col=1
    )

    # Chart 4 — Positive vs Negative pie
    positive = len(df[df["rating"] >= 4])
    negative = len(df[df["rating"] <= 2])
    neutral = len(df[df["rating"] == 3])

    fig.add_trace(
        go.Pie(
            labels=["Positive (4-5★)", "Negative (1-2★)", "Neutral (3★)"],
            values=[positive, negative, neutral],
            marker_colors=["#560BAD", "#FF3CAC", "#9B59B6"],
            showlegend=True
        ),
        row=2, col=2
    )

    # Style the dashboard
    fig.update_layout(
        title=dict(
            text=f"AppFusion — {app_name} Acquisition Audit",
            font=dict(size=20, color="#F5F0FF"),
            x=0.5
        ),
        paper_bgcolor="#07050F",
        plot_bgcolor="#07050F",
        font=dict(color="#F5F0FF"),
        height=700
    )

    fig.update_xaxes(gridcolor="rgba(255,255,255,0.07)")
    fig.update_yaxes(gridcolor="rgba(255,255,255,0.07)")

    output_path = f"analytics/{app_name}_audit.html"
    fig.write_html(output_path)
    print(f"\n✅ Chart saved to {output_path}")
    print(f"   Open it in your browser to see your dashboard!")

# ── Main
def main():
    app_name = "Evernote"

    print("=" * 45)
    print(f"  AppFusion Analytics — {app_name}")
    print("=" * 45)

    # Step 1 — Load data
    df = load_reviews(app_name)

    # Step 2 — Run analysis
    rating_breakdown(df, app_name)
    paywall_friction_score(df, app_name)
    retention_curve(df, app_name)

    # Step 3 — Generate charts
    generate_charts(df, app_name)

    print("\n" + "=" * 45)
    print("  Phase 2 Complete!")
    print("=" * 45)

if __name__ == "__main__":
    main()