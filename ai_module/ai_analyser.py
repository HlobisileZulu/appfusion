import pandas as pd
import json
import os
import mysql.connector
from dotenv import load_dotenv
from groq import Groq

# ── Load environment variables
load_dotenv()

# ── Configure Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
        SELECT rating, review_text
        FROM reviews
        WHERE app_name = %s
        ORDER BY rating ASC
    """

    cursor.execute(query, (app_name,))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    df = pd.DataFrame(rows)
    print(f"Loaded {len(df)} reviews for {app_name}")
    return df

# ── Format reviews into clean text for AI
def format_reviews_for_ai(df):
    reviews_text = ""
    for _, row in df.iterrows():
        reviews_text += f"[{row['rating']} star] {row['review_text']}\n\n"
    return reviews_text

# ── Send reviews to Groq for analysis
def analyse_with_groq(reviews_text, app_name):
    print(f"\nSending reviews to Groq for analysis...")
    print("Please wait — this takes about 10-20 seconds...\n")

    prompt = f"""
You are an independent app intelligence analyst. Your job
is to analyse App Store reviews for any app and produce
a structured report that any product team could act on.
You have been given {app_name} App Store reviews to analyse.

Here are the reviews:
{reviews_text}

Analyse these reviews and respond ONLY with a JSON object in exactly
this format — no extra text, no markdown, no backticks, just pure JSON:

{{
    "app_name": "{app_name}",
    "overall_sentiment": "positive/negative/mixed",
    "average_sentiment_score": 0.0,
    "top_complaints": [
        {{
            "theme": "theme name here",
            "description": "what users are saying",
            "frequency": "how many reviews mention this",
            "pain_score": 0
        }},
        {{
            "theme": "theme name here",
            "description": "what users are saying",
            "frequency": "how many reviews mention this",
            "pain_score": 0
        }},
        {{
            "theme": "theme name here",
            "description": "what users are saying",
            "frequency": "how many reviews mention this",
            "pain_score": 0
        }}
    ],
    "top_delights": [
        {{
            "theme": "theme name here",
            "description": "what users love",
            "frequency": "how many reviews mention this"
        }},
        {{
            "theme": "theme name here",
            "description": "what users love",
            "frequency": "how many reviews mention this"
        }},
        {{
            "theme": "theme name here",
            "description": "what users love",
            "frequency": "how many reviews mention this"
        }}
    ],
    "feature_backlog": [
        {{
            "feature": "feature name",
            "reason": "why users want this",
            "priority": "High",
            "pain_score": 0
        }},
        {{
            "feature": "feature name",
            "reason": "why users want this",
            "priority": "High",
            "pain_score": 0
        }},
        {{
            "feature": "feature name",
            "reason": "why users want this",
            "priority": "Medium",
            "pain_score": 0
        }},
        {{
            "feature": "feature name",
            "reason": "why users want this",
            "priority": "Medium",
            "pain_score": 0
        }},
        {{
            "feature": "feature name",
            "reason": "why users want this",
            "priority": "Low",
            "pain_score": 0
        }}
    ],
    "ninety_day_action_plan": [
        {{
            "day_range": "Days 1-30",
            "focus": "main focus area",
            "actions": ["action 1", "action 2", "action 3"]
        }},
        {{
            "day_range": "Days 31-60",
            "focus": "main focus area",
            "actions": ["action 1", "action 2", "action 3"]
        }},
        {{
            "day_range": "Days 61-90",
            "focus": "main focus area",
            "actions": ["action 1", "action 2", "action 3"]
        }}
    ],
    "acquisition_verdict": "one sentence verdict on this app's current health and biggest opportunity for improvement"
}}

Rules:
- pain_score must be a number between 1 and 10
- average_sentiment_score must be a number between 1.0 and 5.0
- top_complaints must have exactly 3 items
- top_delights must have exactly 3 items
- feature_backlog must have exactly 5 items
- respond with pure JSON only, absolutely nothing else
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    return response.choices[0].message.content

# ── Parse and display the AI response
def parse_and_display(response_text, app_name):
    print("=" * 50)
    print(f"  AppFusion AI Analysis — {app_name}")
    print("=" * 50)

    # Clean response in case AI adds anything extra
    cleaned = response_text.strip()
    if "```" in cleaned:
        parts = cleaned.split("```")
        for part in parts:
            if "{" in part:
                cleaned = part
                break
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    # Parse JSON
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"\nCould not parse response: {e}")
        print("\nRaw response:")
        print(response_text)
        return None

    # ── Overall Sentiment
    print(f"\n📊 OVERALL SENTIMENT")
    print(f"   {data['overall_sentiment'].upper()}")
    print(f"   Score: {data['average_sentiment_score']} / 5.0")

    # ── Top Complaints
    print(f"\n🔴 TOP COMPLAINTS")
    print("-" * 45)
    for i, item in enumerate(data["top_complaints"], 1):
        bars = "█" * item["pain_score"]
        print(f"\n  {i}. {item['theme'].upper()}")
        print(f"     {item['description']}")
        print(f"     Frequency  : {item['frequency']}")
        print(f"     Pain Score : {bars} {item['pain_score']}/10")

    # ── Top Delights
    print(f"\n🟢 TOP DELIGHTS")
    print("-" * 45)
    for i, item in enumerate(data["top_delights"], 1):
        print(f"\n  {i}. {item['theme'].upper()}")
        print(f"     {item['description']}")
        print(f"     Frequency  : {item['frequency']}")

    # ── Feature Backlog
    print(f"\n⚡ FEATURE BACKLOG")
    print("-" * 45)
    icons = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}
    for i, item in enumerate(data["feature_backlog"], 1):
        icon = icons.get(item["priority"], "⚪")
        print(f"\n  {i}. {item['feature']}")
        print(f"     {icon} {item['priority']} Priority")
        print(f"     {item['reason']}")
        print(f"     Pain Score : {item['pain_score']}/10")

    # ── 90 Day Plan
    print(f"\n📅 90-DAY ACTION PLAN")
    print("-" * 45)
    for phase in data["ninety_day_action_plan"]:
        print(f"\n  {phase['day_range']} — {phase['focus'].upper()}")
        for action in phase["actions"]:
            print(f"     → {action}")

    # ── Verdict
    print(f"\n🎯 APP INTELLIGENCE VERDICT")
    print("-" * 45)
    print(f"  {data['acquisition_verdict']}")

    print("\n" + "=" * 50)
    print("  Analysis Complete!")
    print("=" * 50)

    # Save full report as JSON for dashboard
    output_path = f"ai_module/{app_name}_ai_report.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"\n✅ Report saved to {output_path}")

    return data

# ── Main
def main():
    app_name = "Evernote"

    print("=" * 50)
    print(f"  AppFusion AI — Starting Analysis")
    print("=" * 50)

    # Step 1 — Load reviews from database
    df = load_reviews(app_name)

    # Step 2 — Format for AI
    reviews_text = format_reviews_for_ai(df)

    # Step 3 — Send to Groq
    response = analyse_with_groq(reviews_text, app_name)

    # Step 4 — Display results
    parse_and_display(response, app_name)

if __name__ == "__main__":
    main()