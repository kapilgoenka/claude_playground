# Daily Challenge Project

## Business Requirements

- Create a web page. Add a Category dropdown (All, Fitness, Learning, Kindness), a Generate button and a large output box.
- Create a pool of challenges for each category holding 10 fun challenges each.
- Pick a random challenge (respecting category) and remember it for the current date.
- When I click Copy, place the challenge text on clipboard and notify the user.
- Use a cheerful gradient background, center the card and make quote text large and italic.

## Technical Details

- Implemented as a modern Next.JS app, client rendered
- The NextJS app should be created in a subdirectory `frontend`
- No persistence
- No user management for the MVP
- Use popular libraries
- As simple as possible but with an elegant UI

# Color Scheme

- Accent Yellow: `#ecad0a` - accent lines, highlights
- Blue Primary: `#209dd7` - links, key sections
- Purple Secondary: `#753991` - submit buttons, important actions
- Dark Navy: `#032147` - main headings
- Gray Text: `#888888` - supporting text, labels

# Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including `.gitignore`, and rigorous unit testing.
2. Execute the plan ensuring all criteria are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user

# Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever