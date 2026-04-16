## Epic 13 — Data Portability and Backup

**Objective**
Allow users to back up and restore their app data so collection progress and play history are portable between browsers or devices.

**In scope**
- JSON export
- JSON import
- schema validation
- merge or replace restore behavior
- compatibility safeguards

**Stories**
1. **Define a versioned import/export schema for collection, preferences, history, and scores**
2. **Export app data as a downloadable JSON file**
3. **Import previously exported JSON data through the UI**
4. **Validate imported payloads and show actionable recovery errors**
5. **Offer safe restore modes for replacing or merging existing local data**
