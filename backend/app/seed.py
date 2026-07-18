"""
Run with:  python -m app.seed
Wipes existing data and inserts several fully-fleshed sample meetings.
"""
import datetime
import os

from .database import Base, SessionLocal, engine
from . import models

TRANSCRIPTS = {
    "Q3 Product Roadmap Sync": {
        "date": datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=3),
        "participants": ["Ananya Rao", "Ben Carter", "Priya Nair"],
        "duration": 642,
        "overview": (
            "The team reviewed the Q3 roadmap, prioritizing the new onboarding flow "
            "and deferring the billing-portal rewrite to Q4. Ananya raised concerns about "
            "engineering bandwidth given the two open backend roles, and the group agreed "
            "to bring in a contractor for the analytics dashboard. Ben will finalize the "
            "onboarding spec by Friday, and Priya will share updated designs early next week."
        ),
        "topics": [
            (0, "Roadmap review & priorities"),
            (180, "Engineering bandwidth concerns"),
            (360, "Analytics dashboard contractor"),
            (520, "Next steps & owners"),
        ],
        "action_items": [
            ("Finalize onboarding flow spec", "Ben Carter", False),
            ("Share updated onboarding designs", "Priya Nair", False),
            ("Post contractor job listing for analytics dashboard", "Ananya Rao", True),
            ("Move billing-portal rewrite to Q4 planning doc", "Ananya Rao", False),
        ],
        "lines": [
            ("Ananya Rao", "00:00:00", "Alright, thanks for hopping on. Let's start with the Q3 roadmap review."),
            ("Ananya Rao", "00:00:08", "I want to lock priorities today so design and eng can move in parallel."),
            ("Ben Carter", "00:00:20", "Sounds good. From the engineering side, onboarding is the clear top item."),
            ("Ben Carter", "00:00:29", "It touches activation metrics directly, so I'd rather we nail that first."),
            ("Priya Nair", "00:00:45", "Agreed. I have three onboarding variants ready for review this week."),
            ("Ananya Rao", "00:03:00", "Good. Now, bandwidth — we still have two open backend roles."),
            ("Ananya Rao", "00:03:12", "That's going to squeeze anything beyond onboarding this quarter."),
            ("Ben Carter", "00:03:30", "Right, which is why I think the billing-portal rewrite should slip to Q4."),
            ("Priya Nair", "00:03:50", "That works for design too, we haven't started wireframes for billing yet."),
            ("Ananya Rao", "00:06:00", "Okay, what about the analytics dashboard the sales team keeps asking about?"),
            ("Ben Carter", "00:06:15", "We could bring in a contractor for that instead of pulling from the core team."),
            ("Ananya Rao", "00:06:40", "Let's do that. I'll get a job listing posted today."),
            ("Ananya Rao", "00:08:40", "To close out — Ben, can you finalize the onboarding spec by Friday?"),
            ("Ben Carter", "00:08:48", "Yep, Friday works."),
            ("Priya Nair", "00:08:55", "And I'll share the updated designs early next week once the spec is locked."),
            ("Ananya Rao", "00:09:10", "Perfect, thanks everyone. Let's regroup next Monday."),
        ],
    },
    "Customer Onboarding Call - Nimbus Retail": {
        "date": datetime.datetime.utcnow() - datetime.timedelta(days=3, hours=6),
        "participants": ["Marcus Webb", "Sarah Lin", "David Chen"],
        "duration": 1024,
        "overview": (
            "Nimbus Retail's team was walked through the platform setup, including SSO "
            "configuration and the data import pipeline. David flagged a concern about "
            "syncing their legacy inventory system, and Marcus committed to a technical "
            "deep-dive call next week. Sarah will send the onboarding checklist and API docs today."
        ),
        "topics": [
            (0, "Welcome & agenda"),
            (150, "Platform walkthrough"),
            (500, "SSO configuration"),
            (760, "Legacy inventory sync concerns"),
            (950, "Next steps"),
        ],
        "action_items": [
            ("Send onboarding checklist and API docs", "Sarah Lin", True),
            ("Schedule technical deep-dive on inventory sync", "Marcus Webb", False),
            ("Provide legacy system export sample", "David Chen", False),
        ],
        "lines": [
            ("Marcus Webb", "00:00:00", "Welcome, everyone — excited to get Nimbus Retail up and running."),
            ("Marcus Webb", "00:00:15", "Today we'll cover the platform basics, SSO, and your data import options."),
            ("Sarah Lin", "00:02:30", "I'll share my screen and walk through the dashboard first."),
            ("Sarah Lin", "00:02:45", "This is your main workspace — everything you need is in the left nav."),
            ("David Chen", "00:08:20", "Quick question — can we bulk import products from our current system?"),
            ("Marcus Webb", "00:08:35", "Yes, via CSV or API. Let's cover the API import flow next."),
            ("Sarah Lin", "00:12:40", "For SSO, you'll need your IdP metadata URL, which I can help configure live."),
            ("David Chen", "00:12:55", "Our IT team can get that to you by tomorrow."),
            ("David Chen", "00:16:00", "One concern — our legacy inventory system updates on a nightly batch."),
            ("David Chen", "00:16:10", "Will that cause sync conflicts with real-time updates on your side?"),
            ("Marcus Webb", "00:16:30", "Good catch. Let's set up a dedicated technical call to design that sync."),
            ("Marcus Webb", "00:16:45", "I'll get that scheduled for next week with our integrations engineer."),
            ("Sarah Lin", "00:15:50", "In the meantime, I'll send over the onboarding checklist and API docs today."),
            ("David Chen", "00:15:58", "And I'll pull a sample export from our legacy system for your team to review."),
            ("Marcus Webb", "00:17:00", "Great, thanks all — talk soon."),
        ],
    },
    "Engineering Standup": {
        "date": datetime.datetime.utcnow() - datetime.timedelta(hours=20),
        "participants": ["Ben Carter", "Tara Singh", "Omar Farouk"],
        "duration": 380,
        "overview": (
            "Quick daily sync. Tara finished the transcript-search indexing job and is "
            "moving on to pagination. Omar is blocked on a flaky CI test related to the "
            "audio-player component and will pair with Ben after standup. No major blockers otherwise."
        ),
        "topics": [
            (0, "Yesterday's progress"),
            (120, "Today's plan"),
            (240, "Blockers"),
        ],
        "action_items": [
            ("Pair on flaky audio-player CI test", "Ben Carter", False),
            ("Add pagination to transcript search results", "Tara Singh", False),
        ],
        "lines": [
            ("Ben Carter", "00:00:00", "Morning all, let's keep this quick. Tara, want to kick us off?"),
            ("Tara Singh", "00:00:10", "Sure — I finished the transcript-search indexing job yesterday."),
            ("Tara Singh", "00:00:20", "Today I'm adding pagination so large meetings don't overload the UI."),
            ("Omar Farouk", "00:02:00", "I'm still blocked on that flaky CI test in the audio-player component."),
            ("Omar Farouk", "00:02:12", "It passes locally every time but fails intermittently in CI."),
            ("Ben Carter", "00:02:30", "Let's pair on it right after this — might be a timing issue in the tests."),
            ("Ben Carter", "00:04:00", "Anything else blocking anyone? ... Alright, sounds good. Let's get to it."),
        ],
    },
    "Design Review - Transcript Detail Page": {
        "date": datetime.datetime.utcnow() - datetime.timedelta(days=6, hours=2),
        "participants": ["Priya Nair", "Ananya Rao", "Tara Singh"],
        "duration": 900,
        "overview": (
            "Priya presented three directions for the transcript detail page. The team "
            "converged on a two-column layout: transcript and player on the left, "
            "summary/topics/action items in a tabbed panel on the right. Ananya asked for "
            "a sticky player bar on scroll, and Tara confirmed the seek-sync feature is feasible."
        ),
        "topics": [
            (0, "Design directions overview"),
            (300, "Feedback & discussion"),
            (600, "Feasibility check with engineering"),
            (800, "Decision & next steps"),
        ],
        "action_items": [
            ("Make player bar sticky on scroll", "Priya Nair", False),
            ("Confirm transcript-click seek sync is feasible", "Tara Singh", True),
            ("Finalize tabbed panel spec (summary/topics/actions)", "Priya Nair", False),
        ],
        "lines": [
            ("Priya Nair", "00:00:00", "Thanks for joining — I'll walk through three directions for the detail page."),
            ("Priya Nair", "00:00:20", "Option A keeps transcript and summary side by side at all times."),
            ("Priya Nair", "00:02:00", "Option B uses tabs to switch between summary, topics, and action items."),
            ("Priya Nair", "00:04:30", "Option C is a full-width transcript with a collapsible side panel."),
            ("Ananya Rao", "00:05:00", "I like B — tabs keep things clean without losing the transcript focus."),
            ("Ananya Rao", "00:05:20", "Can we make the player bar sticky as you scroll through a long transcript?"),
            ("Priya Nair", "00:05:35", "Yes, that's a small addition — I'll add it to the spec."),
            ("Tara Singh", "00:10:00", "From engineering side, tabs are simple to build with what we already have."),
            ("Tara Singh", "00:10:20", "Clicking a transcript line to seek the player is also straightforward."),
            ("Ananya Rao", "00:13:20", "Great, let's go with option B then. Priya, can you finalize the spec?"),
            ("Priya Nair", "00:13:35", "Yes, I'll have the full spec ready by end of week."),
        ],
    },
}


def run():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        participant_cache = {}

        def get_participant(name):
            if name not in participant_cache:
                colors = ["#6C5CE7", "#00B8D9", "#FF7452", "#36B37E", "#FFAB00", "#8777D9"]
                p = models.Participant(name=name, avatar_color=colors[len(participant_cache) % len(colors)])
                db.add(p)
                db.flush()
                participant_cache[name] = p
            return participant_cache[name]

        for title, data in TRANSCRIPTS.items():
            meeting = models.Meeting(
                title=title,
                date=data["date"],
                duration_seconds=data["duration"],
            )
            db.add(meeting)
            db.flush()

            for name in data["participants"]:
                meeting.participants.append(get_participant(name))

            for i, (speaker, ts, text) in enumerate(data["lines"]):
                parts = [int(p) for p in ts.split(":")]
                h, m, s = parts
                start = float(h * 3600 + m * 60 + s)
                end = (
                    (lambda nxt: (
                        sum(int(p) * f for p, f in zip(nxt.split(":"), [3600, 60, 1]))
                        if nxt else start + 5.0
                    ))(data["lines"][i + 1][1] if i + 1 < len(data["lines"]) else None)
                )
                db.add(models.TranscriptSegment(
                    meeting_id=meeting.id,
                    speaker_name=speaker,
                    start_time=start,
                    end_time=end,
                    text=text,
                    order_index=i,
                ))

            db.add(models.Summary(meeting_id=meeting.id, overview=data["overview"]))

            for i, (ts, topic_title) in enumerate(data["topics"]):
                db.add(models.Topic(meeting_id=meeting.id, title=topic_title, timestamp=ts, order_index=i))

            for text, assignee, completed in data["action_items"]:
                db.add(models.ActionItem(
                    meeting_id=meeting.id, text=text, assignee=assignee, completed=completed
                ))

        db.commit()
        print(f"Seeded {len(TRANSCRIPTS)} meetings.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
