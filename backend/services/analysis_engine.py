"""
analysis_engine.py  (v2 — structured output)
--------------------------------------------
Generates dynamic, personalised behavioural analysis insights and structured
improvement recommendations based on the student's raw input values and the
ML prediction result.

Output format (v2):
  insights        : list[dict]  — {type, metric, text}
  recommendations : list[dict]  — {title, category, priority, why, action,
                                    impact, plan_7_days, expected_30_day}
"""

from __future__ import annotations
from typing import Tuple

# ── Thresholds ─────────────────────────────────────────────────────────────────
THRESHOLDS = {
    "daily_study_hours":             {"low": 2.0,  "high": 5.0},
    "attendance_percentage":         {"low": 60.0, "high": 85.0},
    "assignment_submission_rate":    {"low": 60.0, "high": 85.0},
    "late_submission_count":         {"low": 2,    "high": 6},
    "revision_frequency_per_week":   {"low": 1.5,  "high": 4.0},
    "lms_login_frequency_per_week":  {"low": 2.0,  "high": 7.0},
    "lms_time_spent_hours_per_week": {"low": 3.0,  "high": 10.0},
    "video_lectures_watched_per_week": {"low": 2.0, "high": 6.0},
    "practice_quiz_attempts":        {"low": 2,    "high": 8},
    "class_participation_score":     {"low": 4.0,  "high": 7.0},
    "search_skill_score":            {"low": 4.0,  "high": 7.0},
    "source_evaluation_score":       {"low": 4.0,  "high": 7.0},
    "time_management_score":         {"low": 4.0,  "high": 7.0},
    "procrastination_score":         {"low": 3.0,  "high": 6.0},  # inverted
    "stress_level":                  {"low": 3.0,  "high": 7.0},  # inverted
}


def _level(value: float, feature: str) -> str:
    t = THRESHOLDS[feature]
    if value < t["low"]:   return "low"
    if value <= t["high"]: return "medium"
    return "high"


def _insight(type_: str, metric: str, text: str) -> dict:
    return {"type": type_, "metric": metric, "text": text}


def _rec(title, category, priority, why, action, impact, plan_7_days, expected_30_day="") -> dict:
    return {
        "title": title,
        "category": category,
        "priority": priority,
        "why": why,
        "action": action,
        "impact": impact,
        "plan_7_days": plan_7_days,
        "expected_30_day": expected_30_day,
    }


def compute_learning_health_score(d: dict) -> int:
    """Compute an integer 0-100 learning health score from input features."""
    weights = [
        min(100, (d["daily_study_hours"] / 6) * 100) * 0.15,
        d["attendance_percentage"] * 0.15,
        d["assignment_submission_rate"] * 0.10,
        max(0, 100 - (d["late_submission_count"] / 20) * 100) * 0.05,
        min(100, (d["revision_frequency_per_week"] / 5) * 100) * 0.10,
        min(100, ((d["lms_login_frequency_per_week"] / 7 + d["lms_time_spent_hours_per_week"] / 10) / 2) * 100) * 0.05,
        min(100, (d["video_lectures_watched_per_week"] / 6) * 100) * 0.05,
        min(100, (d["practice_quiz_attempts"] / 8) * 100) * 0.05,
        (d["class_participation_score"] / 10) * 100 * 0.05,
        ((d["search_skill_score"] + d["source_evaluation_score"]) / 2 / 10) * 100 * 0.05,
        (d["time_management_score"] / 10) * 100 * 0.10,
        ((10 - d["procrastination_score"]) / 9) * 100 * 0.05,
        ((10 - d["stress_level"]) / 9) * 100 * 0.05,
    ]
    return round(min(100, max(0, sum(weights))))


def generate_analysis(input_data: dict, ml_result: dict) -> Tuple[list, list]:
    """
    Produce structured personalised analysis insights and recommendations.

    Returns
    -------
    insights        : list[dict]   structured insight objects
    recommendations : list[dict]   structured recommendation objects
    """
    insights: list = []
    recommendations: list = []
    d = input_data

    # ── 1. Study Hours ─────────────────────────────────────────────────────────
    lvl = _level(d["daily_study_hours"], "daily_study_hours")
    if lvl == "high":
        insights.append(_insight("strength", "Study Hours",
            f"Excellent daily study commitment of {d['daily_study_hours']} hrs/day — well above the recommended average and a key predictor of academic success."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Study Hours",
            f"Moderate study time of {d['daily_study_hours']} hrs/day. Increasing to 5–6 hrs with structured sessions would significantly improve retention."))
        recommendations.append(_rec(
            title="Increase Daily Study to 5–6 Hours",
            category="Study Consistency",
            priority="High",
            why=f"Your current {d['daily_study_hours']} hrs/day is below the 5–6 hour threshold associated with strong academic performance in our model.",
            action="Divide your study time into 2 focused blocks: a morning session (2–3 hrs) and an evening review (2–3 hrs). Use Pomodoro (25 min on, 5 min off).",
            impact="Stronger retention, improved exam scores, and higher confidence score in next prediction.",
            plan_7_days="Day 1-2: Set up a fixed study timetable. Day 3-4: Follow morning block (2hrs). Day 5-6: Add evening block (2hrs). Day 7: Review adherence and adjust.",
            expected_30_day="10–15% improvement in predicted learning outcome score with consistent 5+ hr/day study."))
    else:
        insights.append(_insight("risk", "Study Hours",
            f"Critical: Only {d['daily_study_hours']} hrs/day of study severely limits learning depth and exam preparedness. This is a primary risk factor."))
        recommendations.append(_rec(
            title="Urgently Increase Daily Study Hours",
            category="Study Consistency",
            priority="High",
            why=f"At {d['daily_study_hours']} hrs/day, you are well below the minimum 4 hrs required for adequate academic coverage. This is the #1 risk factor.",
            action="Start with a minimum commitment of 3 hrs/day and scale up weekly. Remove distractions and use a study accountability partner or app.",
            impact="Any increase from this level produces the highest marginal improvement in predictive outcome.",
            plan_7_days="Day 1: Commit to 2 hrs minimum. Day 2-3: Increase to 3 hrs. Day 4-5: Reach 4 hrs. Day 6-7: Maintain 4 hrs and track with a journal.",
            expected_30_day="20–30% improvement in overall learning health score if daily hours reach 4+ within 2 weeks."))

    # ── 2. Attendance ──────────────────────────────────────────────────────────
    lvl = _level(d["attendance_percentage"], "attendance_percentage")
    if lvl == "high":
        insights.append(_insight("strength", "Attendance",
            f"Strong attendance record of {d['attendance_percentage']}% demonstrates consistent classroom engagement and responsibility."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Attendance",
            f"Attendance of {d['attendance_percentage']}% is acceptable but below the 90% target. Each missed class creates knowledge gaps that stack over time."))
        recommendations.append(_rec(
            title="Improve Attendance to ≥ 90%",
            category="Attendance Discipline",
            priority="Medium",
            why=f"At {d['attendance_percentage']}% attendance, you are missing critical in-class discussions, examples, and instructor guidance.",
            action="Treat each class as non-negotiable. Set calendar alerts, prepare the night before, and form a peer group to attend together.",
            impact="Higher attendance correlates directly with better assignment scores, better participation, and lower exam anxiety.",
            plan_7_days="Day 1: Mark all classes for the week. Day 2-7: Attend every scheduled class. Note what you would have missed by not attending.",
            expected_30_day="5–8% improvement in academic performance with 90%+ attendance over 4 weeks."))
    else:
        insights.append(_insight("risk", "Attendance",
            f"Critical attendance deficit of {d['attendance_percentage']}% is one of the strongest risk indicators detected. Immediate correction is required."))
        recommendations.append(_rec(
            title="Address Critical Attendance Deficit Immediately",
            category="Attendance Discipline",
            priority="High",
            why=f"At {d['attendance_percentage']}%, you risk academic debarment (most institutions require ≥75%) and are missing foundational content.",
            action="Contact your course coordinator. Attend every remaining class without exception. Create a morning alarm routine and a consequence system.",
            impact="Preventing further attendance decline is the single highest-impact action for your predicted risk level.",
            plan_7_days="Day 1: Review your attendance record with your department. Day 2-7: Perfect attendance. Keep a daily log.",
            expected_30_day="Risk level could drop from High to Medium within 30 days of ≥ 90% attendance."))

    # ── 3. Assignment Submission Rate ──────────────────────────────────────────
    lvl = _level(d["assignment_submission_rate"], "assignment_submission_rate")
    if lvl == "high":
        insights.append(_insight("strength", "Assignment Completion",
            f"High assignment submission rate of {d['assignment_submission_rate']}% reflects strong academic discipline and task ownership."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Assignment Completion",
            f"Assignment submission rate of {d['assignment_submission_rate']}% means some tasks are being missed, which directly hurts your grade average."))
        recommendations.append(_rec(
            title="Achieve 100% Assignment Submission",
            category="Assignment Completion",
            priority="Medium",
            why=f"A {d['assignment_submission_rate']}% submission rate means roughly {round(100 - d['assignment_submission_rate'])}% of assignments go un-submitted, costing you direct grade marks.",
            action="Use a dedicated assignment tracker (Notion, Todoist). Set an internal deadline 2 days before the real deadline as a buffer.",
            impact="Completing all assignments can improve your semester GPA by 5–12% depending on weightage.",
            plan_7_days="Day 1: List all pending assignments. Day 2-5: Complete at least 2/day. Day 6-7: Submit all and verify.",
            expected_30_day="Grade improvement in 2–3 subjects within one month of full submission compliance."))
    else:
        insights.append(_insight("risk", "Assignment Completion",
            f"Assignment submission of {d['assignment_submission_rate']}% is critically low. This significantly reduces your course grade and raises institutional flags."))
        recommendations.append(_rec(
            title="Immediately Address Assignment Backlog",
            category="Assignment Completion",
            priority="High",
            why=f"At {d['assignment_submission_rate']}% submission, over one-third of your assignments are missing, causing severe grade and attendance consequences.",
            action="Create an emergency catch-up plan. Discuss extension options with instructors. Dedicate 1 hour per day exclusively to clearing backlog.",
            impact="Even partial submission improves grades and demonstrates effort to instructors, which can impact borderline grading decisions.",
            plan_7_days="Day 1: Prioritize assignments by weight/deadline. Day 2-6: Submit one overdue assignment per day. Day 7: Plan going forward.",
            expected_30_day="Course grade improvement of 10–20% after clearing all backlog within 30 days."))

    # ── 4. Late Submissions ────────────────────────────────────────────────────
    late = d["late_submission_count"]
    if late <= THRESHOLDS["late_submission_count"]["low"]:
        insights.append(_insight("strength", "Deadline Management",
            f"Excellent punctuality with only {late} late submission(s). This reflects strong time management and reliability."))
    elif late <= THRESHOLDS["late_submission_count"]["high"]:
        insights.append(_insight("improvement", "Deadline Management",
            f"{late} late submissions this semester are reducing scores through late-penalty deductions and signaling deadline management issues."))
        recommendations.append(_rec(
            title="Reduce Late Submissions with Buffer Deadlines",
            category="Time Management",
            priority="Medium",
            why=f"With {late} late submissions, you are losing marks to penalties and creating unnecessary stress around deadlines.",
            action="Set personal 'due dates' 48 hours before official deadlines in your calendar. Use reminders 1 week, 3 days, and 1 day before.",
            impact="Eliminating late penalties can recover 5–15% of lost assignment marks.",
            plan_7_days="Day 1: Set up calendar with all remaining deadlines + personal buffers. Day 2-7: Work ahead of each buffer date.",
            expected_30_day="Zero late submissions in the next month with proper buffer scheduling in place."))
    else:
        insights.append(_insight("risk", "Deadline Management",
            f"High number of late submissions ({late}) is a significant risk indicator for time management failure and procrastination-driven patterns."))

    # ── 5. Revision Frequency ──────────────────────────────────────────────────
    lvl = _level(d["revision_frequency_per_week"], "revision_frequency_per_week")
    if lvl == "high":
        insights.append(_insight("strength", "Revision Habit",
            f"Excellent revision frequency of {d['revision_frequency_per_week']}×/week supports strong long-term memory consolidation through spaced repetition."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Revision Habit",
            f"Revision frequency of {d['revision_frequency_per_week']}×/week is moderate. Increasing to 4–5×/week using spaced repetition would dramatically improve retention."))
        recommendations.append(_rec(
            title="Adopt Spaced Repetition Strategy",
            category="Revision Strategy",
            priority="Medium",
            why=f"At {d['revision_frequency_per_week']}×/week, you are not revising frequently enough to move content into long-term memory before exams.",
            action="Use Anki or handwritten flashcards. Revise yesterday's notes each morning (10 min). Do a full week review every Sunday.",
            impact="Students using spaced repetition score 20–30% higher on recall tests over a semester.",
            plan_7_days="Day 1: Create flashcards for 1 subject. Day 2-6: 15-min morning revisions. Day 7: Full weekly review session (45 min).",
            expected_30_day="Measurable improvement in quiz scores and final exam confidence within 3 weeks."))
    else:
        insights.append(_insight("risk", "Revision Habit",
            f"Very low revision frequency ({d['revision_frequency_per_week']}×/week) leads to rapid forgetting and poor exam performance."))
        recommendations.append(_rec(
            title="Build a Daily Revision Habit",
            category="Revision Strategy",
            priority="High",
            why=f"At {d['revision_frequency_per_week']}×/week, content is almost certainly being forgotten faster than it's being learned, creating an 'invisible backlog'.",
            action="Commit to at least 20 minutes of revision daily. Start with the most recently covered topic. Don't skip more than 1 day.",
            impact="Even daily 20-minute revisions are proven to dramatically outperform cramming before exams.",
            plan_7_days="Day 1: Revise last week's most important topic. Day 2-7: Revise one topic per day. Track what you recalled and what you missed.",
            expected_30_day="Reduction in exam anxiety and 15% improvement in quiz scores within 30 days."))

    # ── 6. LMS Engagement ─────────────────────────────────────────────────────
    login_lvl = _level(d["lms_login_frequency_per_week"], "lms_login_frequency_per_week")
    time_lvl  = _level(d["lms_time_spent_hours_per_week"], "lms_time_spent_hours_per_week")

    if login_lvl == "high" and time_lvl == "high":
        insights.append(_insight("strength", "LMS Engagement",
            f"Excellent LMS usage — {d['lms_login_frequency_per_week']} logins and {d['lms_time_spent_hours_per_week']} hrs/week shows strong digital learning engagement."))
    elif login_lvl == "low" or time_lvl == "low":
        insights.append(_insight("risk", "LMS Engagement",
            f"Low LMS engagement ({d['lms_login_frequency_per_week']} logins, {d['lms_time_spent_hours_per_week']} hrs/week) — you are missing course materials, announcements, and resources."))
        recommendations.append(_rec(
            title="Log into LMS Daily and Engage with Course Content",
            category="LMS Engagement",
            priority="High",
            why=f"At {d['lms_login_frequency_per_week']} logins/week and {d['lms_time_spent_hours_per_week']} hrs, you are significantly underutilising your LMS resources.",
            action="Set a daily LMS login reminder. Download materials, check new announcements, explore supplementary resources uploaded by instructors.",
            impact="Students who engage with the LMS daily score on average 12% higher in continuous assessments.",
            plan_7_days="Day 1: Explore all course pages on LMS. Day 2-7: Log in every morning. Download materials for the day's topics.",
            expected_30_day="Full awareness of course materials and improvement in assignment scores after 30 days of daily LMS use."))
    else:
        insights.append(_insight("improvement", "LMS Engagement",
            f"Moderate LMS usage ({d['lms_login_frequency_per_week']} logins, {d['lms_time_spent_hours_per_week']} hrs/week). Increasing engagement would expose you to additional resources."))

    # ── 7. Video Lectures ──────────────────────────────────────────────────────
    lvl = _level(d["video_lectures_watched_per_week"], "video_lectures_watched_per_week")
    if lvl == "high":
        insights.append(_insight("strength", "Video Learning",
            f"Consistently watching {d['video_lectures_watched_per_week']} video lectures/week reinforces classroom learning and aids visual/auditory retention."))
    elif lvl == "low":
        insights.append(_insight("risk", "Video Learning",
            f"Only {d['video_lectures_watched_per_week']} video lectures/week — you are missing significant asynchronous learning opportunities."))
        recommendations.append(_rec(
            title="Watch All Video Lectures Systematically",
            category="LMS Engagement",
            priority="Medium",
            why=f"At {d['video_lectures_watched_per_week']}/week, you are missing recorded content that reinforces in-class lessons and fills comprehension gaps.",
            action="Allocate 1 hour per day to watch missed videos. Take timestamped notes. Review difficult sections at 0.75× speed.",
            impact="Video lecture engagement improves concept clarity and reduces last-minute exam cramming.",
            plan_7_days="Day 1: List all pending videos. Day 2-6: Watch 1–2 per day with notes. Day 7: Review all notes taken.",
            expected_30_day="Better conceptual understanding reflected in quiz scores within 2–3 weeks."))
    else:
        insights.append(_insight("improvement", "Video Learning",
            f"Moderate video lecture consumption ({d['video_lectures_watched_per_week']}/week). Watching all available recordings would close conceptual gaps."))

    # ── 8. Practice Quizzes ────────────────────────────────────────────────────
    lvl = _level(d["practice_quiz_attempts"], "practice_quiz_attempts")
    if lvl == "high":
        insights.append(_insight("strength", "Self-Testing",
            f"Active quiz practice ({d['practice_quiz_attempts']} attempts/week) is one of the most powerful study strategies, building strong exam readiness."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Self-Testing",
            f"{d['practice_quiz_attempts']} quiz attempts/week is moderate. Increasing to 8–10/week would significantly expose knowledge gaps before exams."))
        recommendations.append(_rec(
            title="Increase Practice Quiz Frequency to 8–10/Week",
            category="Quiz Practice",
            priority="Medium",
            why=f"Self-testing at {d['practice_quiz_attempts']}/week is below the optimal 8–10 attempts that research shows dramatically boosts exam performance.",
            action="Attempt 2 quizzes daily — one after studying a topic, one from a previous topic. Focus on wrong answers as revision targets.",
            impact="The 'testing effect' is one of the best-researched learning strategies, improving exam scores by 15–25%.",
            plan_7_days="Day 1: Attempt 1 quiz per studied topic. Day 2-7: Increase to 2 quizzes/day. Review each wrong answer immediately.",
            expected_30_day="Exam confidence and subject mastery improve measurably within 3 weeks of consistent practice."))
    else:
        insights.append(_insight("risk", "Self-Testing",
            f"Only {d['practice_quiz_attempts']} quiz attempts/week — almost no active self-testing. You are likely to encounter unexpected surprises in actual exams."))
        recommendations.append(_rec(
            title="Start Daily Practice Quiz Routine",
            category="Quiz Practice",
            priority="High",
            why=f"With only {d['practice_quiz_attempts']} quiz attempts/week, you have almost no feedback loop on what you know vs. what you need to review.",
            action="Begin with 1 quiz immediately after each study session, even if it takes only 10 minutes. This creates instant feedback on learning quality.",
            impact="Active recall through quizzes is proven to be more effective than re-reading by a factor of 3-4× in long-term retention.",
            plan_7_days="Day 1: Take 1 quiz on your easiest subject. Day 2-4: 1 quiz per subject per day. Day 5-7: 2 quizzes per day, mixed subjects.",
            expected_30_day="Significant improvement in periodic test scores and reduction in exam anxiety within 30 days."))

    # ── 9. Class Participation ─────────────────────────────────────────────────
    lvl = _level(d["class_participation_score"], "class_participation_score")
    if lvl == "high":
        insights.append(_insight("strength", "Class Participation",
            f"High class participation score ({d['class_participation_score']}/10) demonstrates active in-class learning that deepens comprehension and instructor relationship."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Class Participation",
            f"Average class participation ({d['class_participation_score']}/10). Engaging more actively — asking questions, responding to prompts — would accelerate understanding."))
        recommendations.append(_rec(
            title="Increase Active Classroom Engagement",
            category="Class Participation",
            priority="Low",
            why=f"At {d['class_participation_score']}/10, you are consuming rather than constructing knowledge in class. Active participation solidifies understanding.",
            action="Prepare at least 1 question per class. Volunteer to answer questions at least twice per week. Join study discussion groups.",
            impact="Active participants consistently outperform passive learners by 10–20% on conceptual assessments.",
            plan_7_days="Day 1-2: Prepare 1 question before each class. Day 3-5: Answer at least 1 instructor question per session. Day 6-7: Reflect on engagement.",
            expected_30_day="Improved instructor perception, deeper topic comprehension, and better collaborative learning outcomes."))
    else:
        insights.append(_insight("risk", "Class Participation",
            f"Low class participation ({d['class_participation_score']}/10) suggests passive or disengaged learning during class time."))

    # ── 10. Information Literacy ───────────────────────────────────────────────
    avg_info = (d["search_skill_score"] + d["source_evaluation_score"]) / 2
    if avg_info >= 7:
        insights.append(_insight("strength", "Information Literacy",
            f"Strong information literacy (search: {d['search_skill_score']}, evaluation: {d['source_evaluation_score']}/10) — you find and critically evaluate academic sources effectively."))
    elif avg_info >= 4.5:
        insights.append(_insight("improvement", "Information Literacy",
            f"Moderate information literacy (search: {d['search_skill_score']}, evaluation: {d['source_evaluation_score']}/10). Improving research skills will enhance assignment quality."))
        recommendations.append(_rec(
            title="Improve Academic Research & Source Evaluation Skills",
            category="Information Literacy",
            priority="Low",
            why=f"With search score {d['search_skill_score']} and source evaluation {d['source_evaluation_score']}/10, there are gaps in academic research skills that can affect assignment quality.",
            action="Practice searching on Google Scholar, PubMed, and IEEE Xplore. Apply the CRAAP test (Currency, Relevance, Authority, Accuracy, Purpose) to every source.",
            impact="Better information literacy leads to higher assignment grades and more credible academic writing.",
            plan_7_days="Day 1: Learn Google Scholar advanced search. Day 2-4: Find 3 credible sources for a current assignment. Day 5-7: Apply CRAAP to each.",
            expected_30_day="Noticeable improvement in essay/report quality and instructor feedback within 30 days."))
    else:
        insights.append(_insight("risk", "Information Literacy",
            f"Weak information literacy (search: {d['search_skill_score']}, evaluation: {d['source_evaluation_score']}/10) may result in using unreliable or plagiarised sources."))

    # ── 11. Time Management ────────────────────────────────────────────────────
    lvl = _level(d["time_management_score"], "time_management_score")
    if lvl == "high":
        insights.append(_insight("strength", "Time Management",
            f"Excellent time management ({d['time_management_score']}/10) — a core academic strength that prevents deadline misses and reduces stress."))
    elif lvl == "medium":
        insights.append(_insight("improvement", "Time Management",
            f"Time management rated {d['time_management_score']}/10 is adequate but could be more structured. Small improvements here compound across all other metrics."))
        recommendations.append(_rec(
            title="Implement Time-Blocking for Academic Tasks",
            category="Time Management",
            priority="Medium",
            why=f"At {d['time_management_score']}/10, your time management has room to grow. Unstructured time is often lost to low-value activities.",
            action="Use time-blocking: allocate specific 90-minute blocks for each subject, assignment, and revision. Use Google Calendar or a paper planner.",
            impact="Structured scheduling reduces wasted time by 40-50% and directly improves study output quality.",
            plan_7_days="Day 1: Design a weekly study timetable. Day 2-5: Follow it strictly. Day 6: Identify where you slipped. Day 7: Adjust and reset.",
            expected_30_day="Improvement in on-time task completion and reduced stress within 3 weeks of consistent scheduling."))
    else:
        insights.append(_insight("risk", "Time Management",
            f"Poor time management ({d['time_management_score']}/10) is creating backlogs, missed deadlines, and exponential stress as the semester progresses."))
        recommendations.append(_rec(
            title="Rebuild Time Management with a Structured Weekly Plan",
            category="Time Management",
            priority="High",
            why=f"A score of {d['time_management_score']}/10 indicates systemic time management difficulties that are cascading into all other academic areas.",
            action="Start from scratch: use a weekly planner app (Notion, Google Calendar). Block non-negotiable study hours first, then social activities. Commit 4 weeks.",
            impact="Improved time management is the highest-leverage behavioral change for academic performance.",
            plan_7_days="Day 1-2: Block next 7 days hour-by-hour. Day 3-5: Execute plan, track deviations. Day 6-7: Review plan and tighten gaps.",
            expected_30_day="Within 30 days, a well-followed schedule typically improves academic output quality by 25–35%."))

    # ── 12. Procrastination ────────────────────────────────────────────────────
    proc = d["procrastination_score"]
    if proc >= THRESHOLDS["procrastination_score"]["high"]:
        insights.append(_insight("risk", "Procrastination",
            f"High procrastination tendency ({proc}/10) is a significant barrier — it directly causes late submissions, missed study hours, and increased stress."))
        recommendations.append(_rec(
            title="Combat Procrastination with the Pomodoro System",
            category="Procrastination Control",
            priority="High",
            why=f"A procrastination score of {proc}/10 means avoidance behavior is regularly interfering with your academic tasks and deadlines.",
            action="Use the Pomodoro Technique: 25 minutes of focused work, 5-minute break, repeat. Also try 'Eat the Frog' — tackle your hardest task first thing each morning.",
            impact="Pomodoro users report completing 2× more tasks in the same time by eliminating decision fatigue and procrastination.",
            plan_7_days="Day 1: Install a Pomodoro timer app. Day 2-4: Do 4 Pomodoros per study session. Day 5-7: Track completion rate and adjust task size.",
            expected_30_day="Reduction in late submissions and study avoidance within 2 weeks. Score should improve measurably in next assessment."))
    elif proc >= THRESHOLDS["procrastination_score"]["low"]:
        insights.append(_insight("improvement", "Procrastination",
            f"Moderate procrastination levels ({proc}/10) occasionally delay tasks. Identifying personal triggers and using structured techniques can eliminate this pattern."))
        recommendations.append(_rec(
            title="Identify and Neutralize Procrastination Triggers",
            category="Procrastination Control",
            priority="Medium",
            why=f"At {proc}/10, procrastination occasionally disrupts your study flow. Over time, even moderate procrastination compounds into missed deadlines.",
            action="Journal your procrastination moments for 1 week: what triggered avoidance? (boredom, difficulty, anxiety?). Then design the study environment to remove that trigger.",
            impact="Awareness of triggers leads to 60% reduction in avoidance behavior within 2–3 weeks.",
            plan_7_days="Day 1-3: Log when you procrastinate and why. Day 4-5: Remove identified triggers. Day 6-7: Review improvements.",
            expected_30_day="More consistent task completion and reduced backlog anxiety over 1 month."))
    else:
        insights.append(_insight("strength", "Procrastination",
            f"Low procrastination score ({proc}/10) — excellent self-discipline and ability to start and complete tasks on time. This is a major behavioral strength."))

    # ── 13. Stress Level ───────────────────────────────────────────────────────
    stress = d["stress_level"]
    if stress >= THRESHOLDS["stress_level"]["high"]:
        insights.append(_insight("risk", "Stress Management",
            f"High stress levels ({stress}/10) are impairing cognitive performance, memory consolidation, and decision quality. This needs urgent attention."))
        recommendations.append(_rec(
            title="Implement a Stress Management Routine",
            category="Stress Management",
            priority="High",
            why=f"With a stress score of {stress}/10, chronic academic stress is actively degrading memory capacity, focus duration, and emotional regulation.",
            action="Daily: 10-min mindfulness/breathing exercise in the morning, short walk after study blocks, 7-8 hours of sleep, reduced caffeine. Weekly: talk to a counselor if needed.",
            impact="Stress reduction measurably improves working memory capacity and exam performance. Even 1 week of good sleep shows cognitive improvements.",
            plan_7_days="Day 1: Download a mindfulness app (Calm, Headspace). Day 2-7: 10-min session every morning before study. Log how you feel each day.",
            expected_30_day="Reduced perceived stress within 2 weeks. Longer-term: improved concentration, better sleep, and more consistent academic output."))
    elif stress >= THRESHOLDS["stress_level"]["low"]:
        insights.append(_insight("improvement", "Stress Management",
            f"Moderate stress level ({stress}/10) is manageable but should be monitored. Academic stress often peaks before exams — build resilience habits now."))
        recommendations.append(_rec(
            title="Build Pre-emptive Stress Resilience Habits",
            category="Stress Management",
            priority="Low",
            why=f"At {stress}/10, you are in a moderate stress zone. Without proactive habits, this can escalate during exam periods and disrupt performance.",
            action="Establish a consistent sleep schedule (7-8 hrs), include 20 min of physical activity 3× per week, and practice brief mindfulness before exams.",
            impact="Prevention is significantly easier and more effective than treating acute stress during exams.",
            plan_7_days="Day 1-2: Set a consistent bedtime. Day 3-5: Add 20-min walk 3 days. Day 6-7: Try a 10-min breathing exercise.",
            expected_30_day="Maintained or reduced stress levels entering examination period."))
    else:
        insights.append(_insight("strength", "Stress Management",
            f"Low stress level ({stress}/10) — excellent mental wellness management. This creates optimal cognitive conditions for learning and memory consolidation."))

    # ── Combination Insights ────────────────────────────────────────────────────
    if d["procrastination_score"] >= 6 and d["late_submission_count"] > 4:
        recommendations.append(_rec(
            title="Break the Procrastination–Late Submission Cycle",
            category="Time Management",
            priority="High",
            why="High procrastination combined with frequent late submissions creates a compounding negative cycle that is one of the strongest predictors of academic failure.",
            action="Set micro-deadlines 1 week before real deadlines. Use a shared accountability calendar with a study partner who can prompt you.",
            impact="Breaking this cycle alone can reduce your predicted risk level significantly.",
            plan_7_days="Day 1: List every assignment due in the next 3 weeks. Day 2-6: Start 1 assignment per day. Day 7: Check if you are ahead of micro-deadlines.",
            expected_30_day="Reduction from High to Medium risk level within 30 days if the cycle is broken."))

    if d["daily_study_hours"] < 2 and d["revision_frequency_per_week"] < 2:
        recommendations.append(_rec(
            title="Establish a Minimum Viable Study Routine",
            category="Study Consistency",
            priority="High",
            why="Both study hours and revision frequency are critically low. This combination creates severe knowledge gaps that compound daily.",
            action="Start with just 90 minutes of study + 20 minutes of revision per day. Do not aim for perfection — aim for consistency. Use streaks to stay motivated.",
            impact="Any consistent routine, even a minimal one, produces substantially better outcomes than sporadic intensive sessions.",
            plan_7_days="Day 1: Commit to 90 min study + 20 min revision daily. Day 2-7: Keep the streak going without exception.",
            expected_30_day="Formation of study habit by day 21; measurable improvement in quiz scores by day 30."))

    if d["lms_time_spent_hours_per_week"] < 3 and d["video_lectures_watched_per_week"] < 2:
        recommendations.append(_rec(
            title="Maximize Digital Learning Resources",
            category="LMS Engagement",
            priority="Medium",
            why="Both LMS time and video lecture consumption are minimal, indicating that a large amount of available course content is being left unused.",
            action="Block 1 hour every evening specifically for LMS activity — watch a video, review materials, or complete an online activity. This is passive but effective.",
            impact="Students who regularly engage with digital course content score on average 15% higher in continuous assessments.",
            plan_7_days="Day 1: Audit every resource available on your LMS. Day 2-7: Spend 1 hr/day on LMS content systematically.",
            expected_30_day="Full coverage of available course materials and measurable improvement in lesson comprehension."))

    # ── Overall summary insight ─────────────────────────────────────────────────
    outcome = ml_result.get("predicted_learning_outcome", "")
    risk = ml_result.get("predicted_risk_level", "")
    conf = ml_result.get("confidence_score")
    conf_str = f" — confidence: {conf * 100:.1f}%" if conf else ""
    health_score = compute_learning_health_score(d)

    overall = _insight(
        "improvement" if risk == "Medium" else ("risk" if risk == "High" else "strength"),
        "Overall Assessment",
        f"Predicted Learning Outcome: {outcome}{conf_str} | Risk Level: {risk} | "
        f"Learning Health Score: {health_score}/100. "
        f"{'Focus on the high-priority recommendations to reduce your risk level.' if risk == 'High' else 'Maintain consistency and work on improvement areas to excel further.' if risk == 'Medium' else 'Excellent profile — keep up your habits and consider mentoring peers.'}"
    )
    insights.insert(0, overall)

    if not recommendations:
        recommendations.append(_rec(
            title="Maintain Your Current Learning Habits",
            category="Study Consistency",
            priority="Low",
            why="Your overall learning profile is strong across all measured dimensions.",
            action="Continue your current routines. Seek enrichment opportunities: research projects, peer tutoring, or advanced reading.",
            impact="Maintaining excellent habits ensures consistent top-tier academic performance.",
            plan_7_days="Day 1-7: Continue current routine. Add 1 enrichment activity this week.",
            expected_30_day="Sustained or improved performance in the next assessment cycle."))

    return insights, recommendations
