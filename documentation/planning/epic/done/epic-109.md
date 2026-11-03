## Epic 109 — Display Hero Team Affiliations in the Collection Card Browser

**Objective**
In the Heroes list of the Collection card browser, show each hero’s team name after the hero’s name, in parentheses, in italics, and in a smaller text size than the hero’s name. Show a team name only when one is available in the data; do not display an empty value or invent a team.

**In scope**
- Display each hero’s available team name after their name in the Collection card-browser Heroes list, formatted in parentheses, italics, and a smaller text size than the main text
- Omit the team name when no team is available in the data
- Preserve the existing card-browser behavior and presentation for all non-Hero categories
- Do not change the display logic for History

**Stories**
1. **Expose each hero’s existing team affiliation to the Collection Heroes list**
2. **Display each hero’s team name in the specified format**
3. **Handle heroes without a team and preserve other category displays**

**Acceptance Criteria**
- Story 1: Each hero entry in the Collection card-browser Heroes list has access to that hero’s existing team-affiliation value.
- Story 2: For each listed hero with a team name available in the data, display the name after the hero’s name, enclosed in parentheses, in italics, and in a smaller text size than the hero’s name.
- Story 3: For a listed hero with no team available in the data, omit the team name without displaying an empty value or inventing one. The Masterminds, Villain Groups, Henchman Groups, and Schemes lists retain their existing content and presentation, and History display logic remains unchanged.
