INSERT INTO public.scenarios 
(day_number, title, situation, role, objective, constraint_text, time_limit)
VALUES 

-- PHASE 1: Comfort & Natural Flow (Days 1–10)

(1, 'New Room Energy', 
'You just joined a live project kickoff call. Cameras are on. Everyone has introduced themselves and now it’s your turn. The client is listening carefully.', 
'Project Manager', 
'Speak naturally and introduce yourself in a way that sounds confident and clear.', 
'Do not over-explain your background.', 
60),

(2, 'Unexpected Spotlight', 
'In the middle of a team sync, your manager suddenly says, “Can you give us a quick update?” You were not prepared for this.', 
'Team Lead', 
'Give a clear update without sounding flustered.', 
'No filler words.', 
60),

(3, 'The Silent Pause', 
'A client asks, “So what exactly is the current status?” There is a 2-second silence before you respond.', 
'Software Engineer', 
'Explain the current status clearly and calmly.', 
'Avoid defensive tone.', 
60),

(4, 'Feature Confusion', 
'A stakeholder seems confused about what was delivered in the last sprint and says it’s not what they expected.', 
'Product Manager', 
'Clarify what was delivered and align expectations.', 
'Do not blame miscommunication.', 
90),

(5, 'Technical Wall', 
'A client asks a technical question you weren’t expecting. You understand parts of it but not fully.', 
'Consultant', 
'Respond professionally while buying time appropriately.', 
'Do not say “I don’t know.”', 
60),

(6, 'Quick Recap', 
'Your senior leader joins the call late and says, “Can someone quickly summarize what we’ve discussed so far?” Everyone looks at you.', 
'Project Manager', 
'Summarize the discussion clearly.', 
'Keep it structured and concise.', 
60),

(7, 'Minor Delay', 
'A small internal delay has occurred. The client hasn’t noticed yet but you feel it should be mentioned.', 
'Team Lead', 
'Communicate the update transparently.', 
'Do not sound apologetic for existing.', 
60),

(8, 'Process Explanation', 
'A new client asks how your development process works. They seem skeptical about timelines.', 
'Software Engineer', 
'Explain the process in a reassuring way.', 
'No jargon overload.', 
90),

(9, 'Missed Expectation', 
'A client says, “This isn’t exactly what we had in mind.” The tone is neutral but serious.', 
'Product Manager', 
'Respond calmly and explore what they expected.', 
'Avoid defensive language.', 
90),

(10, 'Weekly Wrap', 
'It’s Friday. Leadership wants a crisp 60-second summary of the week.', 
'Team Lead', 
'Deliver a clear, structured wrap-up.', 
'End with a forward-looking statement.', 
60),


-- PHASE 2: Structure & Pressure (Days 11–20)

(11, 'The Real Delay', 
'The release is officially delayed by 5 days. The client expected Friday delivery.', 
'Project Manager', 
'Explain the delay and reset expectations professionally.', 
'Offer a concrete next step.', 
90),

(12, 'Scope Expansion', 
'Two days before sprint close, the client adds a major requirement and says, “It’s a small change.”', 
'Product Manager', 
'Push back respectfully.', 
'Acknowledge their request before declining.', 
90),

(13, 'Cross-Team Dependency', 
'Another team’s delay has impacted your deliverable. The client wants accountability.', 
'Team Lead', 
'Explain the situation without blaming others.', 
'Focus on resolution.', 
90),

(14, 'Escalation Email', 
'The client has escalated a concern to your senior leadership about slow progress.', 
'Project Manager', 
'Address the concern live on call.', 
'Speak confidently and take ownership.', 
90),

(15, 'Performance Concern', 
'Your manager hints that your updates lack clarity in leadership meetings.', 
'Professional', 
'Respond and explain how you plan to improve.', 
'No defensive tone.', 
60),

(16, 'Budget Constraint', 
'Mid-project, the client says budget needs to be reduced by 20%.', 
'Consultant', 
'Respond strategically and suggest alternatives.', 
'Avoid panic language.', 
90),

(17, 'Misalignment Moment', 
'The client and your team have two different interpretations of scope.', 
'Product Manager', 
'Re-align everyone clearly.', 
'Structure your response logically.', 
90),

(18, 'Timeline Pressure', 
'The CEO asks if delivery can be moved up by one week.', 
'Team Lead', 
'Respond realistically.', 
'Do not overpromise.', 
60),

(19, 'Difficult Question', 
'A stakeholder asks, “Why wasn’t this caught earlier?”', 
'Project Manager', 
'Answer transparently.', 
'Take responsibility without self-sabotage.', 
90),

(20, 'Defending Strategy', 
'A senior leader challenges your chosen approach in front of others.', 
'Professional', 
'Defend your reasoning clearly.', 
'Stay calm and structured.', 
90),


-- PHASE 3: High Pressure Simulation (Days 21–30)

(21, 'Angry Client', 
'A client joins visibly frustrated and says the product quality is unacceptable.', 
'Project Manager', 
'Handle the situation calmly.', 
'Lower emotional temperature.', 
90),

(22, 'Crisis Call', 
'A production bug has affected live users. The leadership team is on the call.', 
'Team Lead', 
'Explain the situation and recovery plan.', 
'No speculation.', 
90),

(23, 'Public Mistake', 
'You made an incorrect assumption that impacted delivery.', 
'Professional', 
'Address it openly on call.', 
'No excuses.', 
60),

(24, 'Negotiation', 
'A client wants additional work without increasing payment.', 
'Consultant', 
'Negotiate confidently.', 
'Do not sound apologetic.', 
90),

(25, 'Team Conflict', 
'Two internal team members disagree strongly during a client call.', 
'Project Manager', 
'Regain control of the discussion.', 
'Restore structure.', 
90),

(26, 'Performance Review', 
'You are in a performance review discussing your communication skills.', 
'Professional', 
'Articulate your growth and impact.', 
'Sounds confident, not arrogant.', 
90),

(27, 'Stakeholder Escalation', 
'A senior stakeholder questions your project leadership.', 
'Project Manager', 
'Respond with authority and clarity.', 
'Avoid rambling.', 
90),

(28, 'High-Stakes Pitch', 
'You are pitching your approach to win a new client contract.', 
'Consultant', 
'Present your value clearly.', 
'Structured delivery required.', 
90),

(29, 'Difficult Transparency', 
'A major milestone will not be met this quarter.', 
'Team Lead', 
'Communicate transparently while maintaining trust.', 
'Balance honesty and confidence.', 
90),

(30, 'Executive Summary', 
'You have 2 minutes with the CEO to explain the entire project status and risks.', 
'Project Leader', 
'Deliver a powerful executive summary.', 
'Highly structured. No filler words.', 
120)

ON CONFLICT (day_number) DO UPDATE SET
  title = EXCLUDED.title,
  situation = EXCLUDED.situation,
  role = EXCLUDED.role,
  objective = EXCLUDED.objective,
  constraint_text = EXCLUDED.constraint_text,
  time_limit = EXCLUDED.time_limit;