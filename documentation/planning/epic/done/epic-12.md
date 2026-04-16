## Epic 12 — Score Logging and Results History

**Objective**
Capture the outcome of a played game so the app can retain meaningful score and result history instead of setup history alone.

**In scope**
- post-game score entry
- win/loss tracking
- score history persistence
- result summaries in history

**Stories**
1. **Define a post-game result model that extends the existing game record safely**
2. **Add score and outcome entry to the accepted game workflow**
3. **Persist score history alongside setup history without breaking existing saved state**
4. **Render score and outcome summaries in the History experience**
5. **Support editing or correcting a logged result after the initial save**
